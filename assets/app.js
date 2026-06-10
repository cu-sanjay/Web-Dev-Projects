const grid = document.getElementById("grid");
const tpl = document.getElementById("card-template");
const search = document.getElementById("search");
const shuffleBtn = document.getElementById("shuffle-btn");
const themeToggle = document.getElementById("theme-toggle");
const sortSelect = document.getElementById("sort-select");
const tagbar = document.getElementById("tagbar");
const empty = document.getElementById("empty");
const topnavLinks = Array.from(document.querySelectorAll('.topnav a[href^="#"]'));
const pageSections = Array.from(document.querySelectorAll('main section[id]'));
const statCount = document.getElementById("stat-count");
const statUpdated = document.getElementById("stat-updated");
const tagModalOverlay = document.getElementById("tag-modal-overlay");
const tagModalCloseBtn = document.getElementById("tag-modal-close");
const tagModalSearchInput = document.getElementById("tag-modal-search");
const tagModalCloud = document.getElementById("tag-modal-cloud");
const hofTrack = document.getElementById("hof-track");
const hofHint = document.getElementById("hof-hint");
const hofContribCount = document.getElementById("hof-contributor-count");

const state = {
  all: [],
  filtered: [],
  activeTag: null,
  query: "",
  sortBy: "default",
  onlyBookmarks: false,
  authorFilter: null,
};

/* ── GitHub Profile Cache ──────────────────────────── */
const ghProfileCache = new Map();

function getCachedProfile(username) {
  if (ghProfileCache.has(username)) return ghProfileCache.get(username);
  try {
    const stored = localStorage.getItem(`gh_profile_${username}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed._ts < 3_600_000) {
        ghProfileCache.set(username, parsed);
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return null;
}

function setCachedProfile(username, data) {
  data._ts = Date.now();
  ghProfileCache.set(username, data);
  try { localStorage.setItem(`gh_profile_${username}`, JSON.stringify(data)); } catch { /* ignore */ }
}

async function fetchGitHubProfile(username) {
  const cached = getCachedProfile(username);
  if (cached) return cached;
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) return null;
    const data = await res.json();
    const profile = {
      name: data.name || username,
      login: data.login,
      avatar_url: data.avatar_url,
      bio: data.bio || "",
      location: data.location || "",
      public_repos: data.public_repos || 0,
      followers: data.followers || 0,
      html_url: data.html_url,
    };
    setCachedProfile(username, profile);
    return profile;
  } catch { return null; }
}

/* ── Hover Card ─────────────────────────────────────── */
let hoverTimeout = null;
let dismissTimeout = null;
let activeHoverCard = null;
let hoverCardLocked = false; // true when mouse is inside card

function getLocalContributions(githubUsername) {
  return state.all.filter(
    p => p.author?.github?.toLowerCase() === githubUsername.toLowerCase()
  );
}

function createHoverCard(profile, localProjects, githubUsername) {
  const card = document.createElement("div");
  card.className = "hover-card";

  const localList = localProjects.slice(0, 4)
    .map(p => `<li class="hover-card__project">${p.title}</li>`).join("");
  const moreCount = localProjects.length > 4
    ? `<li class="hover-card__project hover-card__more">+${localProjects.length - 4} more</li>` : "";

  card.innerHTML = `
    <div class="hover-card__header">
      <img class="hover-card__avatar" src="${profile.avatar_url}" alt="${profile.name}" width="44" height="44" loading="lazy" />
      <div class="hover-card__identity">
        <strong class="hover-card__name">${profile.name}</strong>
        <span class="hover-card__login">@${profile.login}</span>
      </div>
    </div>
    ${profile.bio ? `<p class="hover-card__bio">${profile.bio}</p>` : ""}
    ${profile.location ? `<p class="hover-card__location">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      ${profile.location}
    </p>` : ""}
    <div class="hover-card__stats">
      <div class="hover-card__stat">
        <span class="hover-card__stat-value">${profile.public_repos}</span>
        <span class="hover-card__stat-label">Repos</span>
      </div>
      <div class="hover-card__stat">
        <span class="hover-card__stat-value">${profile.followers}</span>
        <span class="hover-card__stat-label">Followers</span>
      </div>
      <div class="hover-card__stat">
        <span class="hover-card__stat-value">${localProjects.length}</span>
        <span class="hover-card__stat-label">Here</span>
      </div>
    </div>
    ${localProjects.length > 0 ? `
      <div class="hover-card__contributions">
        <span class="hover-card__contrib-label">Projects in OpenStudio</span>
        <ul class="hover-card__project-list">${localList}${moreCount}</ul>
      </div>
    ` : ""}
    <div class="hover-card__actions">
      <a class="btn btn--ghost btn--sm hover-card__gh-link" href="${profile.html_url}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 .3a12 12 0 00-3.79 23.4c.6.1.82-.26.82-.58v-2.16c-3.34.73-4.04-1.61-4.04-1.61a3.18 3.18 0 00-1.33-1.76c-1.09-.74.08-.73.08-.73a2.52 2.52 0 011.84 1.24 2.56 2.56 0 003.5 1 2.56 2.56 0 01.76-1.6c-2.67-.3-5.47-1.33-5.47-5.93a4.64 4.64 0 011.24-3.22 4.3 4.3 0 01.12-3.18s1-.32 3.3 1.23a11.38 11.38 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23a4.3 4.3 0 01.12 3.18 4.64 4.64 0 011.24 3.22c0 4.61-2.81 5.63-5.48 5.92a2.87 2.87 0 01.82 2.23v3.29c0 .32.21.7.82.58A12 12 0 0012 .3z"/></svg>
        Profile
      </a>
      <button class="btn btn--primary btn--sm hover-card__filter-btn" type="button" data-github="${githubUsername}">
        All Projects
      </button>
    </div>
  `;

  card.querySelector(".hover-card__filter-btn").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    filterByAuthor(e.currentTarget.dataset.github);
    dismissHoverCard(true);
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  card.addEventListener("mouseenter", () => {
    hoverCardLocked = true;
    if (dismissTimeout) { clearTimeout(dismissTimeout); dismissTimeout = null; }
  });
  card.addEventListener("mouseleave", () => {
    hoverCardLocked = false;
    scheduleDismiss();
  });

  return card;
}

function positionHoverCard(card, anchorEl) {
  document.body.appendChild(card);
  const anchorRect = anchorEl.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = anchorRect.bottom + 8;
  let left = anchorRect.left + (anchorRect.width / 2) - (cardRect.width / 2);

  if (left < 8) left = 8;
  if (left + cardRect.width > vw - 8) left = vw - cardRect.width - 8;
  if (top + cardRect.height > vh - 8) top = anchorRect.top - cardRect.height - 8;

  card.style.position = "fixed";
  card.style.top = `${top}px`;
  card.style.left = `${left}px`;
}

function scheduleDismiss() {
  if (dismissTimeout) clearTimeout(dismissTimeout);
  dismissTimeout = setTimeout(() => {
    if (!hoverCardLocked) dismissHoverCard(true);
  }, 200);
}

function dismissHoverCard(immediate = false) {
  if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
  if (dismissTimeout) { clearTimeout(dismissTimeout); dismissTimeout = null; }
  if (!activeHoverCard) return;
  activeHoverCard.classList.remove("is-visible");
  const el = activeHoverCard;
  activeHoverCard = null;
  hoverCardLocked = false;
  if (immediate) {
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 200);
  } else {
    if (el.parentNode) el.parentNode.removeChild(el);
  }
}

function showHoverCard(anchorEl, githubUsername) {
  if (hoverTimeout) { clearTimeout(hoverTimeout); hoverTimeout = null; }
  if (activeHoverCard) dismissHoverCard(false);

  hoverTimeout = setTimeout(async () => {
    hoverCardLocked = false;
    const localProjects = getLocalContributions(githubUsername);
    const fetchedProfile = await fetchGitHubProfile(githubUsername);
    const profile = fetchedProfile || {
      name: anchorEl.textContent.replace(/^by\s+/i, "").trim(),
      login: githubUsername,
      avatar_url: `https://github.com/${githubUsername}.png`,
      bio: "",
      location: "",
      public_repos: "—",
      followers: "—",
      html_url: `https://github.com/${githubUsername}`,
    };

    // Don't show if mouse is no longer over anchor
    const card = createHoverCard(profile, localProjects, githubUsername);
    activeHoverCard = card;
    positionHoverCard(card, anchorEl);
    requestAnimationFrame(() => card.classList.add("is-visible"));
  }, 350);
}

/* ── Bookmarks ──────────────────────────────────────── */
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem("bookmarked_projects")) || []; }
  catch { return []; }
}

function toggleBookmark(slug) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(slug);
  if (idx > -1) bookmarks.splice(idx, 1);
  else bookmarks.push(slug);
  localStorage.setItem("bookmarked_projects", JSON.stringify(bookmarks));
  return bookmarks;
}

/* ── Placeholder Thumbnails ─────────────────────────── */
const PALETTES = [
  ["#efe1cf", "#b86a2b"],
  ["#e5ded0", "#1c1c1e"],
  ["#dfe7df", "#2e6b3e"],
  ["#ece4d8", "#7a4a1c"],
  ["#e9e5dc", "#3a3a3c"],
  ["#f0e6d2", "#a8541b"],
  ["#e8e0f0", "#4a3070"],
  ["#e0eae8", "#1a5c50"],
];

function paletteFor(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

function initialsOf(title) {
  return title.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function placeholderThumb(project) {
  const [bg, ink] = paletteFor(project.slug);
  const text = initialsOf(project.title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="${bg}"/><g fill="none" stroke="${ink}" stroke-opacity="0.1" stroke-width="1"><path d="M0 140 L320 50"/><path d="M0 165 L320 75"/><path d="M0 190 L320 100"/><path d="M0 190 L320 10"/></g><text x="50%" y="54%" text-anchor="middle" font-family="-apple-system,SF Pro Display,Inter,sans-serif" font-weight="700" font-size="72" fill="${ink}" opacity="0.6" letter-spacing="-2">${text}</text></svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ── Author filter helper ───────────────────────────── */
function filterByAuthor(github) {
  state.authorFilter = github;
  state.activeTag = null;
  state.query = "";
  if (search) search.value = "";
  renderTagbar();
  render();
}

/* ── Render ─────────────────────────────────────────── */
function render() {
  const q = state.query.trim().toLowerCase();
  const bookmarks = getBookmarks();

  const list = state.all.filter(p => {
    if (state.onlyBookmarks && !bookmarks.includes(p.slug)) return false;
    if (state.authorFilter) {
      return p.author?.github?.toLowerCase() === state.authorFilter.toLowerCase();
    }
    if (state.activeTag) {
      const tags = p.tags.map(t => t.toLowerCase());
      if (!tags.includes(state.activeTag.toLowerCase())) return false;
    }
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.author?.name || "").toLowerCase().includes(q) ||
      (p.author?.github || "").toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  state.filtered = list;

  if (state.sortBy === "newest") {
    list.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  } else if (state.sortBy === "oldest") {
    list.sort((a, b) => new Date(a.addedAt || 0) - new Date(b.addedAt || 0));
  } else if (state.sortBy === "alpha") {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  grid.replaceChildren();

  if (!list.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const bookmarksSet = new Set(bookmarks);

  for (const p of list) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.slug = p.slug;

    const bookmarkBtn = node.querySelector(".card__bookmark-btn");
    const media = node.querySelector(".card__media");
    const thumb = node.querySelector(".card__thumb");
    const title = node.querySelector(".card__title");
    const desc = node.querySelector(".card__desc");
    const tagsEl = node.querySelector(".card__tags");
    const author = node.querySelector(".card__author");
    const open = node.querySelector(".card__open");
    const source = node.querySelector(".card__source");
    const previewBtn = node.querySelector(".card__preview");

    // Bookmark
    if (bookmarksSet.has(p.slug)) bookmarkBtn.classList.add("is-bookmarked");
    bookmarkBtn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      toggleBookmark(p.slug);
      bookmarkBtn.classList.toggle("is-bookmarked");
      if (state.onlyBookmarks) render();
    });

    // Media
    media.href = p.entry;
    thumb.style.backgroundImage = `url("${p.thumbnail || placeholderThumb(p)}")`;

    // Content
    title.textContent = p.title;
    desc.textContent = p.description;

    // Tags (limit display to 4)
    const displayTags = p.tags.slice(0, 4);
    for (const t of displayTags) {
      const li = document.createElement("li");
      li.textContent = t;
      tagsEl.appendChild(li);
    }

    // Author
    if (p.author) {
      author.textContent = "by " + p.author.name;
      author.href = `https://github.com/${p.author.github}`;
      author.target = "_blank";
      author.rel = "noopener";
      author.dataset.github = p.author.github;

      author.addEventListener("mouseenter", () => {
        showHoverCard(author, p.author.github);
      });
      author.addEventListener("mouseleave", () => {
        scheduleDismiss();
      });
    } else {
      author.remove();
    }

    // Links
    open.href = p.entry;
    source.href = `https://github.com/cu-sanjay/OpenStudio/tree/main/${p.folder}`;

    // Preview
    if (previewBtn) {
      previewBtn.addEventListener("click", () => openPreviewDrawer(p));
    }

    grid.appendChild(node);
  }
}

/* ── Tagbar ─────────────────────────────────────────── */
function renderTagbar() {
  const counts = new Map();
  for (const p of state.all) {
    for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
  }
  const topTags = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

  tagbar.replaceChildren();

  // All
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.textContent = "All";
  allBtn.setAttribute("aria-pressed", !state.activeTag && !state.authorFilter && !state.onlyBookmarks);
  allBtn.addEventListener("click", () => {
    state.activeTag = null;
    state.authorFilter = null;
    state.onlyBookmarks = false;
    renderTagbar();
    render();
  });
  tagbar.appendChild(allBtn);

  // Active author chip
  if (state.authorFilter) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "author-filter-chip";
    chip.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> @${state.authorFilter} <span class="chip-close">&times;</span>`;
    chip.setAttribute("aria-pressed", "true");
    chip.addEventListener("click", () => {
      state.authorFilter = null;
      renderTagbar();
      render();
    });
    tagbar.appendChild(chip);
  }

  // Favorites
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="${state.onlyBookmarks ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2.2" style="vertical-align:middle;margin-right:5px"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>Favorites`;
  favBtn.setAttribute("aria-pressed", String(state.onlyBookmarks));
  favBtn.addEventListener("click", () => {
    state.onlyBookmarks = !state.onlyBookmarks;
    state.authorFilter = null;
    state.activeTag = null;
    renderTagbar();
    render();
  });
  tagbar.appendChild(favBtn);

  // Tag buttons
  for (const [tag] of topTags) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = tag;
    b.setAttribute("aria-pressed", String(state.activeTag === tag));
    b.addEventListener("click", () => {
      state.activeTag = state.activeTag === tag ? null : tag;
      state.authorFilter = null;
      state.onlyBookmarks = false;
      renderTagbar();
      render();
    });
    tagbar.appendChild(b);
  }

  // Explore all tags
  const exploreBtn = document.createElement("button");
  exploreBtn.type = "button";
  exploreBtn.className = "btn-explore-tags tagbar-btn";
  exploreBtn.innerHTML = `Explore All Tags <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
  exploreBtn.addEventListener("click", openTagModal);
  tagbar.appendChild(exploreBtn);
}

/* ── Tag Modal ──────────────────────────────────────── */
function openTagModal() {
  if (!tagModalOverlay) return;
  if (tagModalSearchInput) tagModalSearchInput.value = "";
  renderTagCloud("");
  tagModalOverlay.classList.add("is-open");
  if (tagModalSearchInput) tagModalSearchInput.focus();
}

function closeTagModal() {
  if (!tagModalOverlay) return;
  tagModalOverlay.classList.remove("is-open");
}

if (tagModalCloseBtn) tagModalCloseBtn.addEventListener("click", closeTagModal);
if (tagModalOverlay) {
  tagModalOverlay.addEventListener("click", e => {
    if (e.target === tagModalOverlay) closeTagModal();
  });
}
if (tagModalSearchInput) {
  tagModalSearchInput.addEventListener("input", e => renderTagCloud(e.target.value));
}

function renderTagCloud(query) {
  if (!tagModalCloud) return;
  const counts = new Map();
  for (const p of state.all) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);

  let allTags = [...counts.entries()];
  if (query) {
    const q = query.trim().toLowerCase();
    allTags = allTags.filter(([tag]) => tag.toLowerCase().includes(q));
  }

  if (!allTags.length) {
    tagModalCloud.innerHTML = `<p style="color:var(--muted);padding:1rem;">No tags found.</p>`;
    return;
  }

  const counts2 = allTags.map(t => t[1]);
  const min = Math.min(...counts2);
  const max = Math.max(...counts2);

  tagModalCloud.replaceChildren();
  allTags.sort((a, b) => a[0].localeCompare(b[0]));

  for (const [tag, count] of allTags) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-cloud-item";
    if (state.activeTag === tag) btn.classList.add("is-active");
    btn.textContent = `${tag} (${count})`;
    let size = 0.8;
    if (max > min) size = 0.8 + ((count - min) / (max - min)) * 0.7;
    btn.style.fontSize = `${size}rem`;
    btn.addEventListener("click", () => {
      state.activeTag = tag;
      state.onlyBookmarks = false;
      state.authorFilter = null;
      closeTagModal();
      renderTagbar();
      render();
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    tagModalCloud.appendChild(btn);
  }
}

/* ── Hall of Fame ───────────────────────────────────── */
async function renderHallOfFame() {
  if (!hofTrack) return;

  // Build contributor map from state.all
  const contribMap = new Map();
  for (const p of state.all) {
    if (!p.author?.github) continue;
    const gh = p.author.github;
    // Skip invalid values (full URLs, empty)
    if (!gh || gh.startsWith("http") || gh.includes("/")) continue;
    if (!contribMap.has(gh)) {
      contribMap.set(gh, { github: gh, name: p.author.name || gh, count: 0 });
    }
    contribMap.get(gh).count++;
  }

  // Sort by contribution count descending
  const contributors = [...contribMap.values()]
    .sort((a, b) => b.count - a.count);

  // Remove loading indicator
  const loading = document.getElementById("hof-loading");
  if (loading) loading.remove();

  // Update hint bar
  if (hofContribCount) hofContribCount.textContent = contributors.length;
  if (hofHint) hofHint.hidden = false;

  // Gradient stop sets per rank
  const GRAD = {
    1: ["#f5d060","#c8992a","#f0e890","#9a7020","#ffeaa0","#c49030"],
    2: ["#d0d5da","#9ea3a8","#e8edf2","#8a9098","#f5f8fb","#a8b0b8"],
    3: ["#d4864a","#a05a24","#e8a878","#7a4010","#f5c090","#b07040"],
  };
  const GRAD_DEF = ["#c87834","#8a4a18","#d49060","#6a3810","#e0b080","#9a6030"];

  for (let i = 0; i < contributors.length; i++) {
    const contrib = contributors[i];
    const rank = i + 1;
    const isTop3 = rank <= 3;
    const orbSz = isTop3 ? 100 : 84;
    const avSz  = isTop3 ? 82 : 68;
    const sw    = isTop3 ? 4 : 3;
    const da    = isTop3 ? "12 6" : "8 5";
    const spd   = rank === 1 ? 7 : rank === 2 ? 8.5 : rank === 3 ? 10 : 14;
    const cx    = orbSz / 2;
    const r     = orbSz / 2 - (sw / 2 + 1.5);
    const uid   = `hg${i}`;
    const stops = (GRAD[rank] || GRAD_DEF)
      .map((c, j, arr) => `<stop offset="${(j/(arr.length-1)*100).toFixed(0)}%" stop-color="${c}"/>`)
      .join("");
    const displayName = (contrib.name || contrib.github).split(" ")[0] || contrib.github;

    const wrap = document.createElement("div");
    wrap.className = "hof-orb-wrap";
    wrap.dataset.github = contrib.github;
    wrap.innerHTML = `
      <div class="hof-orb" data-rank="${rank}">
        <svg class="hof-ring-svg" viewBox="0 0 ${orbSz} ${orbSz}" style="animation:hofRingSpin ${spd}s linear infinite">
          <defs>
            <linearGradient id="${uid}" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>
          </defs>
          <circle cx="${cx}" cy="${cx}" r="${r}" fill="none"
            stroke="url(#${uid})" stroke-width="${sw}"
            stroke-dasharray="${da}" stroke-linecap="round"/>
        </svg>
        <div class="hof-avatar-wrap">
          <img class="hof-avatar"
            src="https://github.com/${contrib.github}.png?size=90"
            alt="${contrib.name}"
            loading="lazy"
            onerror="this.src='https://avatars.githubusercontent.com/u/0?v=4'"/>
        </div>
        <span class="hof-count">${contrib.count}</span>
      </div>
      <span class="hof-name">${displayName}</span>
    `;

    wrap.addEventListener("click", () => {
      if (state.authorFilter === contrib.github) {
        state.authorFilter = null;
        renderTagbar();
        render();
        hofTrack.querySelectorAll(".hof-orb").forEach(o => o.classList.remove("is-active"));
      } else {
        filterByAuthor(contrib.github);
        hofTrack.querySelectorAll(".hof-orb").forEach(o => o.classList.remove("is-active"));
        wrap.querySelector(".hof-orb")?.classList.add("is-active");
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    hofTrack.appendChild(wrap);
  }
}

/* ── Preview Drawer ─────────────────────────────────── */
const previewDrawer = document.getElementById("preview-drawer");
const previewBackdrop = document.querySelector(".preview-drawer__backdrop");
const previewCloseBtn = document.getElementById("preview-close");
const previewTitle = document.getElementById("preview-title");
const previewAuthor = document.getElementById("preview-author");
const previewExternal = document.getElementById("preview-external");
const previewIframeWrapper = document.getElementById("preview-iframe-wrapper");
const previewIframe = document.getElementById("preview-iframe");
const previewSpinner = document.getElementById("preview-spinner");
const switcherBtns = document.querySelectorAll(".preview-switcher-btn");

function openPreviewDrawer(project) {
  if (!previewDrawer) return;
  if (previewTitle) previewTitle.textContent = project.title;
  if (previewAuthor) {
    if (project.author) {
      previewAuthor.textContent = "by " + project.author.name;
      previewAuthor.hidden = false;
    } else {
      previewAuthor.hidden = true;
    }
  }
  if (previewExternal) previewExternal.href = project.entry;
  if (previewSpinner) previewSpinner.classList.remove("is-hidden");
  if (previewIframe) previewIframe.src = project.entry;
  previewDrawer.classList.add("is-open");
  previewDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePreviewDrawer() {
  if (!previewDrawer) return;
  previewDrawer.classList.remove("is-open");
  previewDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setTimeout(() => { if (previewIframe) previewIframe.src = "about:blank"; }, 340);
}

if (previewDrawer) {
  if (previewIframe) {
    previewIframe.addEventListener("load", () => {
      if (previewIframe.src !== "about:blank" && previewIframe.src !== window.location.href) {
        if (previewSpinner) previewSpinner.classList.add("is-hidden");
      }
    });
  }
  if (previewCloseBtn) previewCloseBtn.addEventListener("click", closePreviewDrawer);
  if (previewBackdrop) previewBackdrop.addEventListener("click", closePreviewDrawer);

  switcherBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      switcherBtns.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      if (previewIframeWrapper) {
        previewIframeWrapper.className = `preview-drawer__iframe-wrapper device--${btn.dataset.device}`;
      }
    });
  });
}

/* ── Theme ──────────────────────────────────────────── */
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", next === "dark" ? "#0b0c10" : "#f5f1ea");
  });
}

/* ── Cursor Toggle ──────────────────────────────────── */
const cursorToggleBtn = document.getElementById("cursor-toggle");
if (cursorToggleBtn) {
  cursorToggleBtn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-cursor") || "cat";
    const next = cur === "cat" ? "default" : "cat";
    document.documentElement.setAttribute("data-cursor", next);
    localStorage.setItem("cursor", next);
  });
}

/* ── Sort ───────────────────────────────────────────── */
if (sortSelect) {
  sortSelect.addEventListener("change", e => {
    state.sortBy = e.target.value;
    render();
  });
}

/* ── Search ─────────────────────────────────────────── */
if (search) {
  search.addEventListener("input", e => {
    state.query = e.target.value;
    state.authorFilter = null;
    render();
  });
}

/* ── Shuffle ────────────────────────────────────────── */
if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    const pool = state.filtered.length ? state.filtered : state.all;
    if (!pool.length) return;
    const p = pool[Math.floor(Math.random() * pool.length)];
    const cardEl = grid.querySelector(`[data-slug="${p.slug}"]`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      cardEl.classList.add("card--highlight");
      setTimeout(() => cardEl.classList.remove("card--highlight"), 2100);
    }
  });
}

/* ── Keyboard shortcuts ─────────────────────────────── */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (tagModalOverlay?.classList.contains("is-open")) closeTagModal();
    if (previewDrawer?.classList.contains("is-open")) closePreviewDrawer();
    if (activeHoverCard) dismissHoverCard(true);
  }
});

/* ── Navbar scroll sync ─────────────────────────────── */
function updateActiveNavbarLink(targetHash) {
  const hash = typeof targetHash === "string" ? targetHash : window.location.hash || "#projects";
  topnavLinks.forEach(link => {
    const isActive = link.getAttribute("href") === hash;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function syncNavbarOnScroll() {
  const offset = window.scrollY + window.innerHeight * 0.3;
  let currentHash = "#projects";
  pageSections.forEach(section => {
    if (offset >= section.offsetTop) currentHash = `#${section.id}`;
  });
  updateActiveNavbarLink(currentHash);
}

window.addEventListener("hashchange", updateActiveNavbarLink);
window.addEventListener("scroll", () => requestAnimationFrame(syncNavbarOnScroll), { passive: true });
topnavLinks.forEach(link => link.addEventListener("click", () => setTimeout(updateActiveNavbarLink, 0)));
updateActiveNavbarLink();

// Dismiss hover card on scroll/click outside
document.addEventListener("scroll", () => { if (!hoverCardLocked) dismissHoverCard(true); }, { passive: true, capture: true });
document.addEventListener("click", e => {
  if (activeHoverCard && !activeHoverCard.contains(e.target)) dismissHoverCard(true);
});

/* ── Boot ───────────────────────────────────────────── */
function formatDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
}

async function boot() {
  try {
    const res = await fetch("projects.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    state.all = data.projects || [];
    if (statCount) statCount.textContent = state.all.length;
    if (statUpdated) statUpdated.textContent = data.generatedAt ? formatDate(data.generatedAt) : "—";
  } catch (err) {
    if (statCount) statCount.textContent = "—";
    if (statUpdated) statUpdated.textContent = "—";
    console.warn("projects.json not available.", err);
  }

  renderTagbar();
  render();
  renderHallOfFame();
}

boot();
