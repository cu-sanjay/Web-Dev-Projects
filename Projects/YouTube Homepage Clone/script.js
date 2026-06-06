const videos = [
  { title: "Top Music Hits 2026", category: "Music", thumbnail: "assets/music1.jpg", channel: "Channel A" },
  { title: "Epic Gaming Stream", category: "Gaming", thumbnail: "assets/game1.jpg", channel: "Channel B" },
  { title: "Breaking News Today", category: "News", thumbnail: "assets/news1.jpg", channel: "Channel C" },
  { title: "Relaxing Jazz Playlist", category: "Music", thumbnail: "assets/music2.jpg", channel: "Channel D" },
  { title: "Pro Gamer Tips", category: "Gaming", thumbnail: "assets/game2.jpg", channel: "Channel E" }
];

const videoGrid = document.getElementById("videoGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const filterButtons = document.querySelectorAll(".filters button");

function renderVideos(list) {
  videoGrid.innerHTML = list.map(v => `
    <div class="video-card">
      <img src="${v.thumbnail}" alt="${v.title}">
      <h3>${v.title}</h3>
      <p>${v.channel}</p>
    </div>
  `).join("");
}

renderVideos(videos);

// Search functionality
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = videos.filter(v => v.title.toLowerCase().includes(query));
  renderVideos(filtered);
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  renderVideos(videos);
});

// Filter functionality
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filters button.active").classList.remove("active");
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    const filtered = filter === "All" ? videos : videos.filter(v => v.category === filter);
    renderVideos(filtered);
  });
});