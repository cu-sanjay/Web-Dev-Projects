// Showcase page bootstrap. Reads projects.json and renders the grid.

const grid = document.getElementById("grid");
const tpl = document.getElementById("card-template");
const search = document.getElementById("search");
const shuffleBtn = document.getElementById("shuffle-btn");
const themeToggle = document.getElementById("theme-toggle");
const sortSelect = document.getElementById("sort-select");
const tagbar = document.getElementById("tagbar");
const empty = document.getElementById("empty");

const statCount = document.getElementById("stat-count");
const statUpdated = document.getElementById("stat-updated");

const state = { all: [], filtered: [], activeTag: null, query: "", sortBy: "default", onlyBookmarks: false };

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem("bookmarked_projects")) || [];
  } catch {
    return [];
  }
}

function toggleBookmark(slug) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(slug);
  if (idx > -1) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(slug);
  }
  localStorage.setItem("bookmarked_projects", JSON.stringify(bookmarks));
  return bookmarks;
}

const PALETTES = [
  ["#efe1cf", "#b86a2b"],
  ["#e5ded0", "#1c1c1e"],
  ["#dfe7df", "#2e6b3e"],
  ["#ece4d8", "#7a4a1c"],
  ["#e9e5dc", "#3a3a3c"],
  ["#f0e6d2", "#a8541b"],
];

function paletteFor(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

function initialsOf(title) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function placeholderThumb(project) {
  const [bg, ink] = paletteFor(project.slug);
  const text = initialsOf(project.title);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
  <rect width="320" height="200" fill="${bg}"/>
  <g fill="none" stroke="${ink}" stroke-opacity="0.12" stroke-width="1">
    <path d="M0 150 L320 60"/>
    <path d="M0 170 L320 80"/>
    <path d="M0 190 L320 100"/>
  </g>
  <text x="50%" y="54%" text-anchor="middle" font-family="-apple-system, SF Pro Display, Inter, sans-serif" font-weight="700" font-size="68" fill="${ink}" letter-spacing="-2">${text}</text>
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function render() {
  const q = state.query.trim().toLowerCase();
  const bookmarks = getBookmarks();
  const list = state.all.filter((p) => {
    if (state.onlyBookmarks && !bookmarks.includes(p.slug)) return false;
    if (state.activeTag && !p.tags.includes(state.activeTag)) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.author?.name || "").toLowerCase().includes(q) ||
      (p.author?.github || "").toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
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

  for (const p of list) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.slug = p.slug;
    const bookmarkBtn = node.querySelector(".card__bookmark-btn");
    const media = node.querySelector(".card__media");
    const thumb = node.querySelector(".card__thumb");
    const title = node.querySelector(".card__title");
    const desc = node.querySelector(".card__desc");
    const tags = node.querySelector(".card__tags");
    const author = node.querySelector(".card__author");
    const open = node.querySelector(".card__open");
    const source = node.querySelector(".card__source");

    if (bookmarks.includes(p.slug)) {
      bookmarkBtn.classList.add("is-bookmarked");
    }

    bookmarkBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleBookmark(p.slug);
      bookmarkBtn.classList.toggle("is-bookmarked");
      if (state.onlyBookmarks) {
        render();
      }
    });

    media.href = p.entry;
    thumb.style.backgroundImage = `url("${p.thumbnail || placeholderThumb(p)}")`;
    title.textContent = p.title;
    desc.textContent = p.description;
    for (const t of p.tags) {
      const li = document.createElement("li");
      li.textContent = t;
      tags.appendChild(li);
    }
    if (p.author) {
      author.textContent = "by " + p.author.name;
      author.href = `https://github.com/${p.author.github}`;
    } else {
      author.remove();
    }
    open.href = p.entry;
    source.href = `https://github.com/cu-sanjay/Web-Dev-Projects/tree/main/${p.folder}`;
    grid.appendChild(node);
  }
}

function renderTagbar() {
  const counts = new Map();
  for (const p of state.all) for (const t of p.tags) counts.set(t, (counts.get(t) || 0) + 1);
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

  tagbar.replaceChildren();
  
  // All button
  const all = document.createElement("button");
  all.type = "button";
  all.textContent = "All";
  all.setAttribute("aria-pressed", state.activeTag === null && !state.onlyBookmarks);
  all.addEventListener("click", () => {
    state.activeTag = null;
    state.onlyBookmarks = false;
    renderTagbar();
    render();
  });
  tagbar.appendChild(all);

  // Favorites button
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="12" height="12" fill="${state.onlyBookmarks ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 6px;">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>Favorites
  `;
  favBtn.setAttribute("aria-pressed", state.onlyBookmarks);
  favBtn.addEventListener("click", () => {
    state.onlyBookmarks = !state.onlyBookmarks;
    renderTagbar();
    render();
  });
  tagbar.appendChild(favBtn);

  for (const [tag] of tags) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = tag;
    b.setAttribute("aria-pressed", state.activeTag === tag);
    b.addEventListener("click", () => {
      state.activeTag = state.activeTag === tag ? null : tag;
      renderTagbar();
      render();
    });
    tagbar.appendChild(b);
  }
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return "—"; }
}

async function boot() {
  try {
    const res = await fetch("projects.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    state.all = data.projects || [];
    statCount.textContent = state.all.length;
    statUpdated.textContent = data.generatedAt ? formatDate(data.generatedAt) : "—";
  } catch (err) {
    statCount.textContent = "—";
    statUpdated.textContent = "—";
    console.warn("projects.json not available yet.", err);
  }
  renderTagbar();
  render();
}

search.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    const activeProjects = state.filtered && state.filtered.length ? state.filtered : state.all;
    if (!activeProjects.length) return;

    const randomProject = activeProjects[Math.floor(Math.random() * activeProjects.length)];
    const cardEl = grid.querySelector(`[data-slug="${randomProject.slug}"]`);
    
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      
      cardEl.classList.add("card--highlight");
      setTimeout(() => {
        cardEl.classList.remove("card--highlight");
      }, 2000);
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", newTheme === "dark" ? "#0b0c10" : "#f5f1ea");
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    render();
  });
}

boot();

