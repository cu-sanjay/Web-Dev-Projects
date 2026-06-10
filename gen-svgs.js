const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('projects.json', 'utf8'));

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
  return Math.abs(h);
}

const SCHEMES = [
  { bg1:'#1a0d2e', bg2:'#0d0718', accent:'#a78bfa', dim:'#4c1d95', chrome:'#130926', sym:'#7c3aed' }, // purple – game
  { bg1:'#0a1e0a', bg2:'#040f04', accent:'#4ade80', dim:'#14532d', chrome:'#071407', sym:'#16a34a' }, // green – productivity
  { bg1:'#0a1829', bg2:'#050f1a', accent:'#60a5fa', dim:'#1e3a5f', chrome:'#070d1a', sym:'#2563eb' }, // blue – utility
  { bg1:'#041e1e', bg2:'#021212', accent:'#2dd4bf', dim:'#0d4040', chrome:'#031414', sym:'#0d9488' }, // teal – api/weather
  { bg1:'#1e0a1e', bg2:'#120612', accent:'#f0abfc', dim:'#701a75', chrome:'#150815', sym:'#c026d3' }, // pink – canvas/art
  { bg1:'#1e0808', bg2:'#120404', accent:'#fca5a5', dim:'#7f1d1d', chrome:'#150606', sym:'#dc2626' }, // red – audio
  { bg1:'#1e1600', bg2:'#120e00', accent:'#fcd34d', dim:'#78350f', chrome:'#150f00', sym:'#d97706' }, // gold – education
  { bg1:'#1e0c00', bg2:'#120700', accent:'#fb923c', dim:'#7c2d12', chrome:'#150800', sym:'#ea580c' }, // orange – html
  { bg1:'#0c0a1e', bg2:'#06051a', accent:'#a5b4fc', dim:'#3730a3', chrome:'#080715', sym:'#6366f1' }, // indigo – css
  { bg1:'#1a1400', bg2:'#110d00', accent:'#fbbf24', dim:'#78350f', chrome:'#130f00', sym:'#f59e0b' }, // amber – js
  { bg1:'#1a100a', bg2:'#100806', accent:'#d4915a', dim:'#7c3810', chrome:'#130a06', sym:'#b86a2b' }, // brand – default
];

const TAG_SCHEME = {
  game:0, puzzle:0, 'escape-room':0, logic:0, memory:0, 'mini-game':0, arcade:0, board:0, chess:0,
  productivity:1, dashboard:1, resume:1, invoice:1, 'habit':1, 'to-do':1, notes:1, planner:1,
  utility:2, tool:2, localstorage:2, responsive:2, 'real-estate':2, 'local-storage':2,
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
    if (TAG_SCHEME[k] !== undefined) return SCHEMES[TAG_SCHEME[k]];
  }
  return SCHEMES[hashCode(slug) % SCHEMES.length];
}

function seededRand(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateSVG(slug, authorName, tags) {
  const sc = pickScheme(tags, slug);
  const rand = seededRand(hashCode(slug));
  const initials = (authorName || slug).split(/[\s-_]+/).filter(Boolean).slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '').join('') || '??';
  const tag1 = (tags && tags[0]) ? tags[0].toUpperCase() : 'WEB';
  const tag2 = (tags && tags[1]) ? tags[1].toUpperCase() : 'HTML';
  const tag3 = (tags && tags[2]) ? tags[2].toUpperCase() : 'JS';

  // Generate code lines
  const codeLines = [];
  const lineY0 = 82;
  const lineH = 13;
  const gutter = 60;
  const maxW = 700;
  let lineNum = 1;
  for (let i = 0; i < 16; i++) {
    const y = lineY0 + i * (lineH + 5);
    if (y > 320) break;
    const indent = Math.floor(rand() * 3) * 20;
    const w = Math.floor(rand() * (maxW - indent - 80)) + 80;
    // Highlight 1-2 specific lines
    const isHighlight = (i === 3 || i === 7 || i === 11) && rand() > 0.3;
    const color = isHighlight ? sc.accent : `rgba(255,255,255,${0.06 + rand() * 0.08})`;
    const opacity = isHighlight ? '0.55' : '1';
    const lnColor = `rgba(255,255,255,0.15)`;
    
    // Line number
    codeLines.push(`<text x="${gutter - 8}" y="${y + 10}" text-anchor="end" fill="${lnColor}" font-size="10" font-family="monospace">${lineNum}</text>`);
    // Code bar
    codeLines.push(`<rect x="${gutter + indent}" y="${y}" width="${w}" height="${lineH}" rx="2" fill="${color}" opacity="${opacity}"/>`);
    // Sometimes add a second fragment on same line
    if (rand() > 0.55) {
      const w2 = Math.floor(rand() * 80) + 30;
      const x2 = gutter + indent + w + 12;
      if (x2 + w2 < gutter + maxW) {
        const fragColor = isHighlight ? sc.sym : `rgba(255,255,255,${0.04 + rand() * 0.05})`;
        codeLines.push(`<rect x="${x2}" y="${y}" width="${w2}" height="${lineH}" rx="2" fill="${fragColor}" opacity="0.6"/>`);
      }
    }
    lineNum++;
  }

  const displayName =
    slug.length > 18
      ? slug.slice(0, 18) + '...'
      : slug;

  return `<svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${sc.bg1}"/>
      <stop offset="100%" stop-color="${sc.bg2}"/>
    </linearGradient>
    <linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${sc.accent}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${sc.sym}" stop-opacity="0.7"/>
    </linearGradient>
    <clipPath id="clip"><rect width="800" height="500" rx="0"/></clipPath>
    <filter id="softText">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  </defs>

  <rect width="800" height="500" fill="url(#g)" clip-path="url(#clip)"/>

  <ellipse cx="400" cy="220" rx="280" ry="160" fill="${sc.accent}" opacity="0.08"/>

  <rect x="32" y="32" width="736" height="348" rx="12" fill="rgba(0,0,0,0.45)"/>

  <rect x="32" y="32" width="736" height="38" rx="12" fill="${sc.chrome}"/>
  <rect x="32" y="56" width="736" height="14" fill="${sc.chrome}"/>

  <circle cx="62"  cy="51" r="7" fill="#ff5f57" opacity="0.95"/>
  <circle cx="88"  cy="51" r="7" fill="#febc2e" opacity="0.95"/>
  <circle cx="114" cy="51" r="7" fill="#28c840" opacity="0.95"/>

  <rect x="140" y="38" width="160" height="26" rx="5" fill="rgba(255,255,255,0.07)"/>
  <text x="160" y="55" fill="rgba(255,255,255,0.55)" font-size="11" font-family="monospace">${slug.toLowerCase().replace(/\s+/g,'-')}.html</text>

  <rect x="32" y="70" width="52" height="310" fill="rgba(0,0,0,0.2)"/>

  ${codeLines.join('\n  ')}

  <text
    x="400"
    y="295"
    text-anchor="middle"
    fill="rgba(248,250,252,0.22)"
    font-size="52"
    font-weight="900"
    font-family="system-ui,sans-serif"
    letter-spacing="-2"
  >
    ${displayName}
  </text>

  <text
    x="400"
    y="295"
    text-anchor="middle"
    fill="rgba(255,255,255,0.06)"
    font-size="52"
    font-weight="900"
    font-family="system-ui,sans-serif"
    letter-spacing="-2"
    filter="url(#softText)"
  >
    ${displayName}
  </text>

  <rect x="0" y="400" width="800" height="100" fill="rgba(0,0,0,0.55)"/>

  <rect x="0" y="400" width="800" height="3" fill="url(#bar)"/>

  <circle cx="72" cy="450" r="28" fill="${sc.accent}" opacity="0.18"/>
  <circle cx="72" cy="450" r="22" fill="${sc.accent}" opacity="0.22"/>
  <text x="72" y="456" text-anchor="middle" fill="${sc.accent}" font-size="15" font-weight="800" font-family="system-ui,sans-serif">${initials}</text>

  <text x="112" y="440" fill="rgba(255,255,255,0.92)" font-size="17" font-weight="800" font-family="system-ui,sans-serif" letter-spacing="-0.5">${slug}</text>

  <rect x="112" y="455" width="${tag1.length * 7 + 16}" height="20" rx="10" fill="${sc.accent}" opacity="0.22"/>
  <text x="${112 + (tag1.length * 7 + 16) / 2}" y="469" text-anchor="middle" fill="${sc.accent}" font-size="10" font-weight="700" font-family="system-ui,sans-serif">${tag1}</text>

  <rect x="${112 + tag1.length * 7 + 22}" y="455" width="${tag2.length * 7 + 16}" height="20" rx="10" fill="rgba(255,255,255,0.08)"/>
  <text x="${112 + tag1.length * 7 + 22 + (tag2.length * 7 + 16) / 2}" y="469" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="10" font-weight="600" font-family="system-ui,sans-serif">${tag2}</text>

  <rect x="${112 + (tag1.length + tag2.length) * 7 + 44}" y="455" width="${tag3.length * 7 + 16}" height="20" rx="10" fill="rgba(255,255,255,0.06)"/>
  <text x="${112 + (tag1.length + tag2.length) * 7 + 44 + (tag3.length * 7 + 16) / 2}" y="469" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="10" font-weight="600" font-family="system-ui,sans-serif">${tag3}</text>
</svg>`;
}

let generated = 0;
let updated = 0;

for (const p of data.projects) {
  if (p.thumbnail) continue; // already has one

  const slug = p.slug || p.title || 'Project';
  const authorName = (typeof p.author === 'string' ? p.author : p.author?.name) || '';
  const tags = Array.isArray(p.tags) ? p.tags : [];

  const svgContent = generateSVG(slug, authorName, tags);
  const fileName = slug.replace(/[<>:"/\\|?*]/g, '_') + '.svg';
  const outPath = path.join('assets', 'thumbs', fileName);
  fs.writeFileSync(outPath, svgContent, 'utf8');
  
  p.thumbnail = `assets/thumbs/${fileName}`;
  generated++;
  updated++;
}

fs.writeFileSync('projects.json', JSON.stringify(data, null, 2), 'utf8');
console.log(`✅ Generated ${generated} SVG thumbnails → assets/thumbs/`);
console.log(`✅ Updated projects.json with ${updated} new thumbnail paths`);