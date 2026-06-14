'use strict';
const fs   = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, 'Projects');
const THUMBS_DIR   = path.join(__dirname, 'assets', 'thumbs');
const JSON_PATH    = path.join(__dirname, 'projects.json');

if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function trunc(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function wrapLines(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length <= maxChars) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w.length > maxChars ? w.slice(0, maxChars - 1) + '…' : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

function initials(nameOrSlug) {
  return (nameOrSlug || 'OS')
    .split(/[\s_-]+/).filter(Boolean).slice(0, 2)
    .map(w => (w[0] || '').toUpperCase()).join('') || 'OS';
}

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// ── Color schemes (tag-mapped) ────────────────────────────────────────────────

const SCHEMES = [
  { bg1:'#1a0d2e', bg2:'#0d0718', accent:'#a78bfa', sym:'#7c3aed', dim:'#4c1d95', chrome:'#130926' }, // 0 purple
  { bg1:'#0a1e0a', bg2:'#040f04', accent:'#4ade80', sym:'#16a34a', dim:'#14532d', chrome:'#071407' }, // 1 green
  { bg1:'#0a1829', bg2:'#050f1a', accent:'#60a5fa', sym:'#2563eb', dim:'#1e3a5f', chrome:'#070d1a' }, // 2 blue
  { bg1:'#041e1e', bg2:'#021212', accent:'#2dd4bf', sym:'#0d9488', dim:'#0d4040', chrome:'#031414' }, // 3 teal
  { bg1:'#1e0a1e', bg2:'#120612', accent:'#f0abfc', sym:'#c026d3', dim:'#701a75', chrome:'#150815' }, // 4 pink
  { bg1:'#1e0808', bg2:'#120404', accent:'#fca5a5', sym:'#dc2626', dim:'#7f1d1d', chrome:'#150606' }, // 5 red
  { bg1:'#1e1600', bg2:'#120e00', accent:'#fcd34d', sym:'#d97706', dim:'#78350f', chrome:'#150f00' }, // 6 gold
  { bg1:'#1e0c00', bg2:'#120700', accent:'#fb923c', sym:'#ea580c', dim:'#7c2d12', chrome:'#150800' }, // 7 orange
  { bg1:'#0c0a1e', bg2:'#06051a', accent:'#a5b4fc', sym:'#6366f1', dim:'#3730a3', chrome:'#080715' }, // 8 indigo
  { bg1:'#1a1400', bg2:'#110d00', accent:'#fbbf24', sym:'#f59e0b', dim:'#78350f', chrome:'#130f00' }, // 9 amber
  { bg1:'#1a100a', bg2:'#100806', accent:'#d4915a', sym:'#b86a2b', dim:'#7c3810', chrome:'#130a06' }, // 10 brand
];

const TAG_MAP = {
  game:0, puzzle:0, 'escape-room':0, logic:0, memory:0, arcade:0, chess:0, 'mini-game':0,
  productivity:1, dashboard:1, resume:1, invoice:1, habit:1, 'to-do':1, notes:1, planner:1,
  utility:2, tool:2, localstorage:2, responsive:2, 'local-storage':2,
  api:3, weather:3, news:3, fetch:3,
  canvas:4, drawing:4, 'pixel-art':4, art:4, paint:4, whiteboard:4,
  audio:5, music:5, piano:5, synthesizer:5,
  education:6, interview:6, blog:6, learning:6, typing:6,
  html:7,
  css:8,
  javascript:9, 'vanilla-js':9, js:9,
};

function pickScheme(tags, slug) {
  for (const t of (tags || [])) {
    const k = (t || '').toLowerCase().replace(/\s+/g, '-');
    if (TAG_MAP[k] !== undefined) return SCHEMES[TAG_MAP[k]];
  }
  return SCHEMES[hashCode(slug) % SCHEMES.length];
}

// ── Pill renderer ─────────────────────────────────────────────────────────────

function pills(tags, x0, y, accent, limit = 3) {
  let x = x0, svg = '';
  const list = (tags.length ? tags : ['HTML', 'CSS', 'JS']).slice(0, limit);
  for (let i = 0; i < list.length; i++) {
    const label = list[i].toUpperCase();
    const w = label.length * 6.4 + 20;
    svg += `<rect x="${x|0}" y="${y}" width="${w|0}" height="21" rx="10.5" fill="${i===0 ? accent : 'rgba(255,255,255,0.1)'}" opacity="${i===0 ? '0.25' : '1'}"/>`;
    svg += `<text x="${(x + w/2)|0}" y="${y + 14}" text-anchor="middle" fill="${i===0 ? accent : 'rgba(255,255,255,0.45)'}" font-size="9.5" font-weight="700" font-family="system-ui,sans-serif" letter-spacing="0.7">${label}</text>`;
    x += w + 7;
  }
  return svg;
}

// ── STYLE A — Dark Sidebar ────────────────────────────────────────────────────
// Left dark panel with author + metadata, right screenshot with accent tint

function styleSidebar(slug, authorName, tags, sc, b64) {
  const ini  = initials(authorName || slug);
  const auth = trunc(authorName || 'OpenStudio', 20);
  const lines = wrapLines(slug, 16);
  const titleFz  = lines.length > 1 ? 28 : 34;
  const titleY1  = lines.length > 1 ? 178 : 195;
  const titleSVG = lines.map((l, i) =>
    `<text x="26" y="${titleY1 + i * (titleFz + 6)}" fill="#fff" font-size="${titleFz}" font-weight="900" font-family="system-ui,sans-serif" letter-spacing="-0.5">${l}</text>`
  ).join('\n  ');
  const pillSVG = pills(tags, 26, 350, sc.accent);

  return `<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="cl"><rect width="800" height="500"/></clipPath>
    <linearGradient id="sbar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sc.accent}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${sc.sym}" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#cl)">
    <!-- Right: screenshot -->
    <image href="data:image/jpeg;base64,${b64}" x="258" y="0" width="542" height="500" preserveAspectRatio="xMidYMid slice"/>
    <rect x="258" y="0" width="542" height="500" fill="${sc.accent}" opacity="0.18"/>
    <rect x="258" y="0" width="542" height="500" fill="rgba(0,0,0,0.35)"/>
    <!-- Left: dark sidebar -->
    <rect x="0" y="0" width="258" height="500" fill="rgba(9,11,18,0.97)"/>
    <rect x="0" y="0" width="3" height="500" fill="url(#sbar)"/>
    <line x1="258" y1="0" x2="258" y2="500" stroke="${sc.accent}" stroke-width="1.5" opacity="0.55"/>
    <!-- Author circle -->
    <circle cx="50" cy="66" r="26" fill="${sc.accent}" opacity="0.1"/>
    <circle cx="50" cy="66" r="20" fill="${sc.accent}" opacity="0.18"/>
    <text x="50" y="73" text-anchor="middle" fill="${sc.accent}" font-size="14" font-weight="800" font-family="system-ui,sans-serif">${ini}</text>
    <!-- Author label + name -->
    <text x="86" y="55" fill="rgba(255,255,255,0.38)" font-size="8" font-weight="700" font-family="system-ui,sans-serif" letter-spacing="1.8">DEVELOPER</text>
    <text x="86" y="74" fill="rgba(255,255,255,0.88)" font-size="13.5" font-weight="600" font-family="system-ui,sans-serif">${auth}</text>
    <!-- Divider -->
    <rect x="26" y="106" width="210" height="1" fill="rgba(255,255,255,0.07)"/>
    <!-- Project label -->
    <text x="26" y="145" fill="${sc.accent}" font-size="8.5" font-weight="800" font-family="system-ui,sans-serif" letter-spacing="2.2">PROJECT</text>
    <!-- Title -->
    ${titleSVG}
    <!-- Divider -->
    <rect x="26" y="326" width="210" height="1" fill="rgba(255,255,255,0.07)"/>
    <!-- Stack label -->
    <text x="26" y="348" fill="rgba(255,255,255,0.35)" font-size="8.5" font-weight="700" font-family="system-ui,sans-serif" letter-spacing="1.8">STACK</text>
    <!-- Tag pills -->
    ${pillSVG}
    <!-- Watermark -->
    <text x="26" y="488" fill="rgba(255,255,255,0.15)" font-size="8.5" font-weight="700" font-family="system-ui,sans-serif" letter-spacing="1">✦ OPENSTUDIO</text>
  </g>
</svg>`;
}

// ── STYLE B — Floating Terminal HUD ──────────────────────────────────────────
// Screenshot fills frame, centered frosted-glass terminal card on top

function styleHUD(slug, authorName, tags, sc, b64) {
  const ini  = initials(authorName || slug);
  const auth = trunc(authorName || 'OpenStudio', 26);
  const lines   = wrapLines(slug, 18);
  const titleFz = lines.length > 1 ? 36 : 44;
  const titleY1 = 222;
  const titleSVG = lines.map((l, i) =>
    `<text x="150" y="${titleY1 + i * (titleFz + 4)}" fill="#fff" font-size="${titleFz}" font-weight="900" font-family="system-ui,sans-serif" letter-spacing="-1">${l}</text>`
  ).join('\n  ');
  const authorY = titleY1 + lines.length * (titleFz + 4) + 12;
  const pillY   = authorY + 26;
  const pillSVG = pills(tags, 150, pillY, sc.accent);

  return `<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="cl"><rect width="800" height="500"/></clipPath>
  </defs>
  <g clip-path="url(#cl)">
    <!-- Screenshot background -->
    <image href="data:image/jpeg;base64,${b64}" x="0" y="0" width="800" height="500" preserveAspectRatio="xMidYMid slice"/>
    <!-- Dark overlay -->
    <rect width="800" height="500" fill="rgba(6,8,18,0.60)"/>
    <!-- Frosted card -->
    <rect x="98" y="88" width="604" height="324" rx="14" fill="rgba(12,15,28,0.90)" stroke="rgba(255,255,255,0.10)" stroke-width="1.5"/>
    <!-- Card top accent line -->
    <rect x="98" y="88" width="604" height="3" rx="1.5" fill="${sc.accent}" opacity="0.85"/>
    <!-- Title bar stripe -->
    <rect x="98" y="91" width="604" height="40" rx="14" fill="rgba(255,255,255,0.04)"/>
    <rect x="98" y="117" width="604" height="14" fill="rgba(255,255,255,0.04)"/>
    <!-- Traffic lights -->
    <circle cx="130" cy="112" r="6.5" fill="#FF5F56"/>
    <circle cx="153" cy="112" r="6.5" fill="#FFBD2E"/>
    <circle cx="176" cy="112" r="6.5" fill="#27C93F"/>
    <!-- Tab filename -->
    <text x="204" y="117" fill="rgba(255,255,255,0.32)" font-size="11" font-family="monospace">${toSlug(slug)}.html</text>
    <!-- Card separator -->
    <rect x="98" y="131" width="604" height="1" fill="rgba(255,255,255,0.07)"/>
    <!-- <title> monospace tag -->
    <text x="150" y="178" fill="${sc.accent}" font-size="12" font-family="monospace" font-weight="700">&lt;title&gt;</text>
    <!-- Project title -->
    ${titleSVG}
    <!-- Author -->
    <text x="150" y="${authorY}" fill="rgba(255,255,255,0.45)" font-size="13" font-family="system-ui,sans-serif">by <tspan fill="rgba(255,255,255,0.85)" font-weight="600">${auth}</tspan></text>
    <!-- Tag pills -->
    ${pillSVG}
    <!-- Initials badge (bottom-right of card) -->
    <circle cx="664" cy="376" r="20" fill="${sc.accent}" opacity="0.12"/>
    <circle cx="664" cy="376" r="15" fill="${sc.accent}" opacity="0.22"/>
    <text x="664" y="382" text-anchor="middle" fill="${sc.accent}" font-size="12" font-weight="800" font-family="system-ui,sans-serif">${ini}</text>
    <!-- Watermark -->
    <text x="700" y="490" text-anchor="end" fill="rgba(255,255,255,0.15)" font-size="9" font-weight="700" font-family="system-ui,sans-serif" letter-spacing="1">✦ OPENSTUDIO</text>
  </g>
</svg>`;
}

// ── STYLE C — Cinema Bottom Strip ────────────────────────────────────────────
// Screenshot fills top 72 %, thick dark cinematic band at bottom with credits

function styleCinema(slug, authorName, tags, sc, b64) {
  const ini     = initials(authorName || slug);
  const auth    = trunc(authorName || 'OpenStudio', 30);
  const display = trunc(slug, 26);
  const nameFz  = display.length > 22 ? 26 : display.length > 16 ? 32 : 38;
  const pillSVG = pills(tags, 32, 466, sc.accent);

  return `<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="cl"><rect width="800" height="500"/></clipPath>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="42%" stop-color="transparent"/>
      <stop offset="100%" stop-color="rgba(8,10,18,0.98)"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${sc.accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${sc.sym}" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <g clip-path="url(#cl)">
    <!-- Full screenshot -->
    <image href="data:image/jpeg;base64,${b64}" x="0" y="0" width="800" height="500" preserveAspectRatio="xMidYMid slice"/>
    <!-- Cinema fade gradient -->
    <rect width="800" height="500" fill="url(#fade)"/>
    <!-- Solid bottom strip -->
    <rect y="356" width="800" height="144" fill="rgba(8,10,18,0.97)"/>
    <!-- Accent bar -->
    <rect y="356" width="800" height="3" fill="url(#bar)"/>
    <!-- Top-left badge -->
    <rect x="22" y="22" width="110" height="26" rx="13" fill="rgba(0,0,0,0.50)"/>
    <text x="77" y="40" text-anchor="middle" fill="${sc.accent}" font-size="9.5" font-weight="700" font-family="system-ui,sans-serif" letter-spacing="0.8">✦ OPENSTUDIO</text>
    <!-- Author initials (right) -->
    <circle cx="752" cy="382" r="22" fill="${sc.accent}" opacity="0.14"/>
    <circle cx="752" cy="382" r="16" fill="${sc.accent}" opacity="0.22"/>
    <text x="752" y="389" text-anchor="middle" fill="${sc.accent}" font-size="13" font-weight="800" font-family="system-ui,sans-serif">${ini}</text>
    <!-- Project title -->
    <text x="32" y="${362 + nameFz}" fill="#fff" font-size="${nameFz}" font-weight="900" font-family="system-ui,sans-serif" letter-spacing="-0.5">${display}</text>
    <!-- Author credit -->
    <text x="32" y="${362 + nameFz + 28}" fill="rgba(255,255,255,0.48)" font-size="13.5" font-weight="400" font-family="system-ui,sans-serif">by <tspan fill="rgba(255,255,255,0.82)" font-weight="600">${auth}</tspan></text>
    <!-- Tag pills -->
    ${pillSVG}
  </g>
</svg>`;
}

// ── STYLE D — Premium Code Window (pure SVG, no screenshot) ──────────────────
// Immersive dark editor aesthetic with colour-coded code bars

function styleCodeWindow(slug, authorName, tags, sc) {
  const rand   = seededRand(hashCode(slug));
  const ini    = initials(authorName || slug);
  const auth   = trunc(authorName || 'OpenStudio', 28);
  const display = trunc(slug, 22);
  const tag1   = (tags[0] || 'WEB').toUpperCase();
  const tag2   = (tags[1] || 'HTML').toUpperCase();
  const tag3   = (tags[2] || 'JS').toUpperCase();
  const pillSVG = pills([tag1, tag2, tag3], 110, 462, sc.accent);

  const codeLines = [];
  const lineY0 = 84, lineH = 12, gutter = 56, maxW = 700;
  for (let i = 0; i < 17; i++) {
    const y = lineY0 + i * (lineH + 5.5);
    if (y > 332) break;
    const indent = Math.floor(rand() * 3) * 22;
    const w      = Math.floor(rand() * (maxW - indent - 90)) + 90;
    const isHL   = (i === 3 || i === 7 || i === 11 || i === 14) && rand() > 0.28;
    const color  = isHL ? sc.accent : `rgba(255,255,255,${(0.05 + rand() * 0.08).toFixed(3)})`;
    const op     = isHL ? '0.50' : '1';
    codeLines.push(
      `<text x="${gutter - 10}" y="${y + 10}" text-anchor="end" fill="rgba(255,255,255,0.12)" font-size="9" font-family="monospace">${i + 1}</text>`,
      `<rect x="${gutter + indent}" y="${y}" width="${w}" height="${lineH}" rx="2.5" fill="${color}" opacity="${op}"/>`,
    );
    if (rand() > 0.48) {
      const w2 = (rand() * 56 + 26) | 0;
      const x2 = gutter + indent + w + 14;
      if (x2 + w2 < gutter + maxW) {
        codeLines.push(`<rect x="${x2}" y="${y}" width="${w2}" height="${lineH}" rx="2.5" fill="${isHL ? sc.sym : 'rgba(255,255,255,0.04)'}" opacity="0.52"/>`);
      }
    }
  }

  return `<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${sc.bg1}"/>
      <stop offset="100%" stop-color="${sc.bg2}"/>
    </linearGradient>
    <linearGradient id="abar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${sc.accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${sc.sym}" stop-opacity="0.55"/>
    </linearGradient>
    <clipPath id="cl"><rect width="800" height="500"/></clipPath>
    <filter id="glow"><feGaussianBlur stdDeviation="38" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <g clip-path="url(#cl)">
    <!-- Background gradient -->
    <rect width="800" height="500" fill="url(#bg)"/>
    <!-- Ambient glow -->
    <ellipse cx="400" cy="210" rx="300" ry="190" fill="${sc.accent}" opacity="0.04" filter="url(#glow)"/>
    <!-- Editor window shadow -->
    <rect x="28" y="36" width="744" height="356" rx="14" fill="rgba(0,0,0,0.5)"/>
    <!-- Editor window -->
    <rect x="30" y="30" width="740" height="354" rx="12" fill="rgba(0,0,0,0.40)"/>
    <!-- Title bar -->
    <rect x="30" y="30" width="740" height="40" rx="12" fill="${sc.chrome}"/>
    <rect x="30" y="56" width="740" height="14" fill="${sc.chrome}"/>
    <!-- Traffic lights -->
    <circle cx="62"  cy="50" r="7" fill="#FF5F57" opacity="0.95"/>
    <circle cx="89"  cy="50" r="7" fill="#FEBC2E" opacity="0.95"/>
    <circle cx="116" cy="50" r="7" fill="#28C840" opacity="0.95"/>
    <!-- Filename tab -->
    <rect x="142" y="36" width="178" height="28" rx="6" fill="rgba(255,255,255,0.07)"/>
    <text x="162" y="54" fill="rgba(255,255,255,0.48)" font-size="11" font-family="monospace">${toSlug(slug)}.html</text>
    <!-- Gutter -->
    <rect x="30" y="70" width="48" height="314" fill="rgba(0,0,0,0.22)"/>
    <!-- Code bars -->
    ${codeLines.join('\n    ')}
    <!-- Ghost watermark title -->
    <text x="400" y="300" text-anchor="middle" fill="rgba(255,255,255,0.035)" font-size="56" font-weight="900" font-family="system-ui,sans-serif" letter-spacing="-2">${display}</text>
    <!-- Bottom info bar -->
    <rect y="394" width="800" height="106" fill="rgba(0,0,0,0.60)"/>
    <rect y="394" width="800" height="3" fill="url(#abar)"/>
    <!-- Author initials rings -->
    <circle cx="66" cy="446" r="28" fill="${sc.accent}" opacity="0.08"/>
    <circle cx="66" cy="446" r="22" fill="${sc.accent}" opacity="0.14"/>
    <circle cx="66" cy="446" r="16" fill="${sc.accent}" opacity="0.20"/>
    <text x="66" y="452" text-anchor="middle" fill="${sc.accent}" font-size="14" font-weight="800" font-family="system-ui,sans-serif">${ini}</text>
    <!-- Project name -->
    <text x="106" y="430" fill="rgba(255,255,255,0.92)" font-size="18.5" font-weight="800" font-family="system-ui,sans-serif" letter-spacing="-0.4">${slug}</text>
    <!-- Author credit -->
    <text x="106" y="452" fill="rgba(255,255,255,0.42)" font-size="12.5" font-weight="400" font-family="system-ui,sans-serif">by <tspan fill="rgba(255,255,255,0.72)" font-weight="600">${auth}</tspan></text>
    <!-- Tag pills -->
    ${pillSVG}
    <!-- Watermark -->
    <text x="776" y="492" text-anchor="end" fill="rgba(255,255,255,0.16)" font-size="9" font-weight="700" font-family="system-ui,sans-serif" letter-spacing="1">✦ OPENSTUDIO</text>
  </g>
</svg>`;
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

function generatePremiumSVG(slug, authorName, tags, base64Bg) {
  const sc   = pickScheme(tags, slug);
  const seed = hashCode(slug);

  if (!base64Bg) return styleCodeWindow(slug, authorName, tags, sc);

  const styleIdx = seed % 3;
  if (styleIdx === 0) return styleSidebar(slug, authorName, tags, sc, base64Bg);
  if (styleIdx === 1) return styleHUD(slug, authorName, tags, sc, base64Bg);
  return styleCinema(slug, authorName, tags, sc, base64Bg);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  if (!fs.existsSync(JSON_PATH)) {
    console.error('❌  projects.json not found');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  let skipped = 0, copied = 0, screenshotted = 0, generated = 0;

  // ── Pass 1: skip existing / copy user SVGs (fast, no browser) ──
  let needsBrowser = false;
  const queue = [];

  for (const p of data.projects) {
    const slug       = p.slug || p.title || 'Project';
    const cleanSlug  = toSlug(slug);
    const svgName    = `${cleanSlug}.svg`;
    const svgPath    = path.join(THUMBS_DIR, svgName);
    const folderPath = path.join(PROJECTS_DIR, p.title || slug);

    // 1. Skip if thumbnail already exists
    if (fs.existsSync(svgPath)) {
      p.thumbnail = `assets/thumbs/${svgName}`;
      skipped++;
      continue;
    }

    // 2. Copy contributor's own SVG from their project folder
    let userSvg = null;
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      userSvg = files.find(f => /\.svg$/i.test(f));
    }
    if (userSvg) {
      fs.copyFileSync(path.join(folderPath, userSvg), svgPath);
      p.thumbnail = `assets/thumbs/${svgName}`;
      copied++;
      console.log(`📦  Copied contributor SVG: ${slug}`);
      continue;
    }

    // 3. Queue for generation — check for index.html
    const indexPath = path.join(folderPath, 'index.html');
    const hasIndex  = fs.existsSync(indexPath);
    if (hasIndex) needsBrowser = true;
    queue.push({ p, slug, svgPath, svgName, indexPath, hasIndex });
  }

  // ── Pass 2: launch Puppeteer only if ≥1 project has index.html ──
  let browser = null;
  if (needsBrowser) {
    try {
      const puppeteer = require('puppeteer');
      console.log('\n🚀  Launching headless browser for UI screenshots…');

      const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH ||
        process.env.CHROME_PATH ||
        undefined;

      browser = await puppeteer.launch({
        headless: 'new',
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
        ],
      });
    } catch (err) {
      console.log(`⚠️   Browser unavailable (${err.message.split('\n')[0]}) — falling back to pure SVG generation.`);
    }
  }

  // ── Pass 3: screenshot + generate SVG ──
  for (const { p, slug, svgPath, svgName, indexPath, hasIndex } of queue) {
    const authorName = (typeof p.author === 'string' ? p.author : p.author?.name) || '';
    const tags       = Array.isArray(p.tags) ? p.tags : [];
    let base64Bg     = '';

    if (hasIndex && browser) {
      try {
        process.stdout.write(`📸  Snapping ${slug}… `);
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(`file://${path.resolve(indexPath)}`, { waitUntil: 'networkidle2', timeout: 12_000 });
        await new Promise(r => setTimeout(r, 500));
        const buf = await page.screenshot({ type: 'jpeg', quality: 22, clip: { x: 0, y: 0, width: 1280, height: 720 } });
        base64Bg = buf.toString('base64');
        await page.close();
        screenshotted++;
        console.log('✓');
      } catch (err) {
        console.log(`skipped (${err.message.split('\n')[0]})`);
      }
    }

    const svg = generatePremiumSVG(slug, authorName, tags, base64Bg);
    fs.writeFileSync(svgPath, svg, 'utf8');
    p.thumbnail = `assets/thumbs/${svgName}`;

    if (!base64Bg) {
      generated++;
      console.log(`🎨  Generated code-window SVG: ${slug}`);
    }
  }

  if (browser) await browser.close();

  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

  console.log('\n🎉  Thumbnail generation complete!');
  console.log(`  ⏭️   Skipped (already exist):   ${skipped}`);
  console.log(`  📦  Copied (contributor SVGs): ${copied}`);
  console.log(`  📸  Screenshot + overlay:      ${screenshotted}`);
  console.log(`  🎨  Pure code-window SVGs:     ${generated}`);
  console.log(`  📝  projects.json updated`);
})();
