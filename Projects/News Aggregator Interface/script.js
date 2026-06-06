const sampleNews = [
  { title: "AI breakthrough in 2026", category: "technology" },
  { title: "India wins cricket series", category: "sports" },
  { title: "Stock market hits record high", category: "business" },
  { title: "New blockbuster movie released", category: "entertainment" }
];

const trendingTopics = ["AI", "Cricket", "Stock Market", "Movies"];
const bookmarks = [];

document.addEventListener("DOMContentLoaded", () => {
  renderTrending();
  renderNews(sampleNews);

  document.querySelectorAll(".categoryBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;
      const filtered = sampleNews.filter(n => n.category === category);
      renderNews(filtered);
    });
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    const filtered = sampleNews.filter(n => n.title.toLowerCase().includes(query));
    renderNews(filtered);
  });
});

function renderTrending() {
  const container = document.getElementById("trendingTopics");
  container.innerHTML = trendingTopics.map(t => `<span class="topic">${t}</span>`).join(" ");
}

function renderNews(newsArray) {
  const container = document.getElementById("newsCards");
  container.innerHTML = "";
  newsArray.forEach(news => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <h3>${news.title}</h3>
      <p>Category: ${news.category}</p>
      <button class="bookmarkBtn">Bookmark</button>
    `;
    card.querySelector(".bookmarkBtn").addEventListener("click", () => {
      bookmarks.push(news);
      alert(`Bookmarked: ${news.title}`);
    });
    container.appendChild(card);
  });
}

function renderBookmarks() {
  const container = document.getElementById("bookmarkList");
  container.innerHTML = bookmarks.map(b => `<p>${b.title} (${b.category})</p>`).join("");
}

function renderNews(newsArray) {
  const container = document.getElementById("newsCards");
  container.innerHTML = "";
  newsArray.forEach(news => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.innerHTML = `
      <h3>${news.title}</h3>
      <p>Category: ${news.category}</p>
      <button class="bookmarkBtn">Bookmark</button>
    `;
    card.querySelector(".bookmarkBtn").addEventListener("click", () => {
      bookmarks.push(news);
      renderBookmarks();
    });
    container.appendChild(card);
  });
}
