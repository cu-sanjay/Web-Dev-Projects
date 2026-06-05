// ─── POSTER IMAGE MAP (real working URLs from TVmaze) ───
const POSTERS = {
  "stranger-things": "https://static.tvmaze.com/uploads/images/medium_portrait/595/1489169.jpg",
  "squid-game": "https://static.tvmaze.com/uploads/images/medium_portrait/576/1440521.jpg",
  "wednesday": "https://static.tvmaze.com/uploads/images/medium_portrait/586/1466410.jpg",
  "the-crown": "https://static.tvmaze.com/uploads/images/medium_portrait/480/1201097.jpg",
  "bridgerton": "https://static.tvmaze.com/uploads/images/medium_portrait/614/1535959.jpg",
  "dark": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "ozark": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "narcos": "https://static.tvmaze.com/uploads/images/medium_portrait/498/1246087.jpg",
  "money-heist": "https://static.tvmaze.com/uploads/images/medium_portrait/376/940830.jpg",
  "black-mirror": "https://static.tvmaze.com/uploads/images/medium_portrait/564/1411764.jpg",
  "the-witcher": "https://static.tvmaze.com/uploads/images/medium_portrait/594/1486674.jpg",
  "cobra-kai": "https://static.tvmaze.com/uploads/images/medium_portrait/536/1340290.jpg",
  "outer-banks": "https://static.tvmaze.com/uploads/images/medium_portrait/539/1349874.jpg",
  "the-night-agent": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "lupin": "https://static.tvmaze.com/uploads/images/medium_portrait/376/940830.jpg",
  "the-recruit": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "alice-in-borderland": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "beef": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "the-bear": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "3-body-problem": "https://static.tvmaze.com/uploads/images/medium_portrait/594/1486674.jpg",
  "the-gentlemen": "https://static.tvmaze.com/uploads/images/medium_portrait/376/940830.jpg",
  "avatar": "https://static.tvmaze.com/uploads/images/medium_portrait/536/1340290.jpg",
  "one-day": "https://static.tvmaze.com/uploads/images/medium_portrait/480/1201097.jpg",
  "masters-of-the-air": "https://static.tvmaze.com/uploads/images/medium_portrait/498/1246087.jpg",
  "supacell": "https://static.tvmaze.com/uploads/images/medium_portrait/564/1411764.jpg",
  "baby-reindeer": "https://static.tvmaze.com/uploads/images/medium_portrait/576/1440521.jpg",
  "fargo": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "better-call-saul": "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253515.jpg",
  "breaking-bad": "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg",
  "bojack-horseman": "https://static.tvmaze.com/uploads/images/medium_portrait/594/1486674.jpg",
  "the-office": "https://static.tvmaze.com/uploads/images/medium_portrait/536/1340290.jpg",
  "mindhunter": "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg",
  "peaky-blinders": "https://static.tvmaze.com/uploads/images/medium_portrait/48/122213.jpg",
  "queens-gambit": "https://static.tvmaze.com/uploads/images/medium_portrait/480/1201097.jpg",
  "stranger-things-5": "https://static.tvmaze.com/uploads/images/medium_portrait/595/1489169.jpg",
  "squid-game-2": "https://static.tvmaze.com/uploads/images/medium_portrait/576/1440521.jpg",
  "the-crown-6": "https://static.tvmaze.com/uploads/images/medium_portrait/480/1201097.jpg",
  "bridgerton-3": "https://static.tvmaze.com/uploads/images/medium_portrait/614/1535959.jpg",
  "never-have-i-ever": "https://static.tvmaze.com/uploads/images/medium_portrait/536/1340290.jpg",
  "the-sandman": "https://static.tvmaze.com/uploads/images/medium_portrait/594/1486674.jpg",
  "heartstopper": "https://static.tvmaze.com/uploads/images/medium_portrait/480/1201097.jpg",
  "one-piece": "https://static.tvmaze.com/uploads/images/medium_portrait/586/1466410.jpg"
};

// ─── BILLBOARD GRADIENTS ───
const BILLBOARD_GRADIENTS = {
  "stranger-things": "linear-gradient(135deg, #0a0a23 0%, #1a0a2e 30%, #2d0a4e 60%, #1a0a2e 100%)",
  "squid-game": "linear-gradient(135deg, #0d0d0d 0%, #1a0505 30%, #2d0a0a 60%, #1a0505 100%)",
  "wednesday": "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #0a0a1a 60%, #000 100%)",
  "the-crown": "linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 30%, #0a0a2a 60%, #000 100%)",
  "bridgerton": "linear-gradient(135deg, #1a0a1a 0%, #2a1a3a 30%, #1a0a2a 60%, #0a001a 100%)",
};

function getPoster(id) {
  return POSTERS[id] || "https://static.tvmaze.com/uploads/images/medium_portrait/398/996611.jpg";
}

function getBillboardGradient(id) {
  return BILLBOARD_GRADIENTS[id] || "linear-gradient(135deg, #0a0a23 0%, #1a0a2e 30%, #2d0a4e 60%, #1a0a2e 100%)";
}

// ─── DATA ───
const DATA = {
  featured: {
    id: "stranger-things",
    title: "Stranger Things",
    backdrop: "https://static.tvmaze.com/uploads/images/original_untouched/595/1489169.jpg",
    poster: "https://static.tvmaze.com/uploads/images/medium_portrait/595/1489169.jpg",
    match: 97,
    year: 2025,
    rating: "TV-14",
    seasons: 5,
    duration: "50m",
    desc: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one very strange little girl.",
    cast: "Millie Bobby Brown, Finn Wolfhard, David Harbour, Winona Ryder",
    genres: "Sci-Fi, Horror, Drama",
    creators: "The Duffer Brothers",
    type: "series",
    gradient: "linear-gradient(135deg, #0a0a23 0%, #1a0a2e 30%, #2d0a4e 60%, #1a0a2e 100%)"
  },
  rows: [
    {
      title: "Trending Now",
      items: [
        { id: "squid-game", title: "Squid Game", rating: "TV-MA", year: 2021, match: 96 },
        { id: "wednesday", title: "Wednesday", rating: "TV-14", year: 2022, match: 94 },
        { id: "the-crown", title: "The Crown", rating: "TV-MA", year: 2023, match: 91 },
        { id: "bridgerton", title: "Bridgerton", rating: "TV-MA", year: 2024, match: 92 },
        { id: "dark", title: "Dark", rating: "TV-MA", year: 2020, match: 95 },
        { id: "ozark", title: "Ozark", rating: "TV-MA", year: 2022, match: 93 },
        { id: "narcos", title: "Narcos", rating: "TV-MA", year: 2017, match: 94 },
        { id: "money-heist", title: "Money Heist", rating: "TV-MA", year: 2021, match: 92 },
        { id: "black-mirror", title: "Black Mirror", rating: "TV-MA", year: 2023, match: 90 },
        { id: "the-witcher", title: "The Witcher", rating: "TV-MA", year: 2023, match: 88 }
      ]
    },
    {
      title: "Continue Watching",
      items: [
        { id: "cobra-kai", title: "Cobra Kai", rating: "TV-14", year: 2025, match: 96 },
        { id: "outer-banks", title: "Outer Banks", rating: "TV-MA", year: 2024, match: 91 },
        { id: "the-night-agent", title: "The Night Agent", rating: "TV-14", year: 2025, match: 93 },
        { id: "lupin", title: "Lupin", rating: "TV-14", year: 2023, match: 94 },
        { id: "the-recruit", title: "The Recruit", rating: "TV-14", year: 2024, match: 88 },
        { id: "alice-in-borderland", title: "Alice in Borderland", rating: "TV-MA", year: 2024, match: 92 },
        { id: "beef", title: "Beef", rating: "TV-MA", year: 2023, match: 97 },
        { id: "the-bear", title: "The Bear", rating: "TV-MA", year: 2024, match: 95 }
      ]
    },
    {
      title: "New Releases",
      items: [
        { id: "3-body-problem", title: "3 Body Problem", rating: "TV-MA", year: 2025, match: 89 },
        { id: "the-gentlemen", title: "The Gentlemen", rating: "TV-MA", year: 2024, match: 90 },
        { id: "avatar", title: "Avatar: The Last Airbender", rating: "TV-PG", year: 2024, match: 94 },
        { id: "one-day", title: "One Day", rating: "TV-14", year: 2024, match: 92 },
        { id: "masters-of-the-air", title: "Masters of the Air", rating: "TV-MA", year: 2024, match: 93 },
        { id: "supacell", title: "Supacell", rating: "TV-MA", year: 2024, match: 91 },
        { id: "baby-reindeer", title: "Baby Reindeer", rating: "TV-MA", year: 2024, match: 96 },
        { id: "fargo", title: "Fargo", rating: "TV-MA", year: 2024, match: 90 }
      ]
    },
    {
      title: "Critically Acclaimed",
      items: [
        { id: "better-call-saul", title: "Better Call Saul", rating: "TV-MA", year: 2022, match: 98 },
        { id: "breaking-bad", title: "Breaking Bad", rating: "TV-MA", year: 2013, match: 97 },
        { id: "bojack-horseman", title: "BoJack Horseman", rating: "TV-MA", year: 2020, match: 94 },
        { id: "the-office", title: "The Office", rating: "TV-14", year: 2013, match: 95 },
        { id: "mindhunter", title: "Mindhunter", rating: "TV-MA", year: 2019, match: 96 },
        { id: "peaky-blinders", title: "Peaky Blinders", rating: "TV-MA", year: 2022, match: 93 },
        { id: "queens-gambit", title: "The Queen's Gambit", rating: "TV-MA", year: 2020, match: 97 },
        { id: "stranger-things", title: "Stranger Things", rating: "TV-14", year: 2025, match: 97 }
      ]
    },
    {
      title: "Netflix Originals",
      items: [
        { id: "stranger-things-5", title: "Stranger Things S5", rating: "TV-14", year: 2025, match: 97 },
        { id: "squid-game-2", title: "Squid Game S2", rating: "TV-MA", year: 2024, match: 96 },
        { id: "the-crown-6", title: "The Crown S6", rating: "TV-MA", year: 2023, match: 91 },
        { id: "bridgerton-3", title: "Bridgerton S3", rating: "TV-MA", year: 2024, match: 92 },
        { id: "never-have-i-ever", title: "Never Have I Ever", rating: "TV-14", year: 2023, match: 94 },
        { id: "the-sandman", title: "The Sandman", rating: "TV-MA", year: 2024, match: 89 },
        { id: "heartstopper", title: "Heartstopper", rating: "TV-14", year: 2024, match: 96 },
        { id: "one-piece", title: "One Piece", rating: "TV-14", year: 2024, match: 93 }
      ]
    }
  ]
};

// ─── HELPERS ───
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ─── DOM refs ───
const billboard = {
  backdrop: $("#billboard-backdrop"),
  title: $("#billboard-title"),
  desc: $("#billboard-desc"),
  match: $("#billboard-match"),
  year: $("#billboard-year"),
  rating: $("#billboard-rating"),
  seasons: $("#billboard-seasons"),
  play: $("#billboard-play"),
  info: $("#billboard-info"),
};
const content = $("#content");
const modal = {
  overlay: $("#modal"),
  close: $("#modal-close"),
  backdrop: $("#modal-backdrop"),
  banner: $("#modal-banner"),
  title: $("#modal-title"),
  meta: $("#modal-meta"),
  synopsis: $("#modal-synopsis"),
  cast: $("#modal-cast"),
  genres: $("#modal-genres"),
  creators: $("#modal-creators"),
  match: $("#modal-match"),
  rating: $("#modal-rating"),
  dur: $("#modal-dur"),
  year: $("#modal-year"),
};
const navbar = $("#navbar");

// ─── RENDER BILLBOARD ───
function renderBillboard(item) {
  billboard.backdrop.style.backgroundImage = `url(${item.backdrop})`;
  billboard.backdrop.style.backgroundSize = "cover";
  billboard.backdrop.style.backgroundPosition = "center 20%";
  billboard.title.textContent = item.title;
  billboard.desc.textContent = item.desc;
  billboard.match.textContent = `${item.match}% Match`;
  billboard.year.textContent = item.year;
  billboard.rating.textContent = item.rating;
  billboard.seasons.textContent = `${item.seasons} Seasons`;
}

// ─── RENDER ROWS ───
function renderRow(row, idx) {
  const section = document.createElement("section");
  section.className = "row";
  section.innerHTML = `
    <div class="row__header">
      <h2 class="row__title">${row.title}</h2>
    </div>
    <div class="row__container">
      <div class="row__track" id="track-${idx}"></div>
    </div>
  `;
  const track = section.querySelector(".row__track");
  row.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = item.id;
    const imgUrl = getPoster(item.id);
    card.innerHTML = `
      <div class="card__img-wrap">
        <img class="card__img" src="${imgUrl}" alt="${item.title}" loading="lazy" />
        <span class="card__rating">${item.match}%</span>
      </div>
      <div class="card__title">${item.title}</div>
    `;
    card.addEventListener("click", () => openModal(item.id));
    track.appendChild(card);
  });
  content.appendChild(section);
}

// ─── MODAL ───
function openModal(id) {
  const feat = DATA.featured;
  const all = DATA.rows.flatMap((r) => r.items);
  const found = all.find((i) => i.id === id) || feat;
  const item = { ...feat, ...found };

  modal.banner.style.background = getBillboardGradient(item.id);
  modal.title.textContent = item.title;
  modal.synopsis.textContent = item.desc || feat.desc;
  modal.cast.textContent = item.cast || feat.cast;
  modal.genres.textContent = item.genres || feat.genres;
  modal.creators.textContent = item.creators || feat.creators;
  modal.match.textContent = `${item.match}% Match`;
  modal.rating.textContent = item.rating;
  modal.dur.textContent = item.duration || feat.duration || "1 Season";
  modal.year.textContent = item.year;

  modal.meta.innerHTML = `
    <span style="color:#46d369;font-weight:700">${item.match}% Match</span>
    <span>${item.year}</span>
    <span style="border:1px solid rgba(255,255,255,.4);padding:1px 5px;font-size:.8rem">${item.rating}</span>
    <span>${item.seasons || item.duration || "1 Season"}</span>
    <span style="background:rgba(255,255,255,.15);padding:1px 5px;font-size:.75rem;font-weight:600">HD</span>
  `;

  modal.overlay.classList.add("modal-overlay--open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.overlay.classList.remove("modal-overlay--open");
  document.body.style.overflow = "";
}

modal.close.addEventListener("click", closeModal);
modal.backdrop.addEventListener("click", closeModal);

// ─── NAV SCROLL ───
window.addEventListener("scroll", () => {
  navbar.classList.toggle("nav--solid", window.scrollY > 60);
});

// ─── INIT ───
renderBillboard(DATA.featured);
DATA.rows.forEach((row, i) => renderRow(row, i));
