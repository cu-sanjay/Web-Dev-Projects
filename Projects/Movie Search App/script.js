const API_KEY = 'a9852b8';
const SEARCH_URL = `https://www.omdbapi.com/?s=QUERY&type=&apikey=${API_KEY}`;
const DETAIL_URL = `https://www.omdbapi.com/?i=IMDBID&plot=full&apikey=${API_KEY}`;
const PLACEHOLDER_POSTER = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="%231e293b" width="300" height="450"/><text fill="%2364748b" font-family="system-ui" font-size="18" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No Poster</text></svg>';

const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const resultsGrid = document.getElementById('resultsGrid');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const modal = document.getElementById('modal');
const modalLoading = document.getElementById('modalLoading');

function showLoading() {
  loading.classList.remove('hidden');
  resultsGrid.innerHTML = '';
  error.classList.add('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

function showError(message) {
  error.textContent = message;
  error.classList.remove('hidden');
  resultsGrid.innerHTML = '';
  hideLoading();
}

function createMovieCard({ Title, Year, Poster, Type, imdbID }) {
  const card = document.createElement('article');
  card.className = 'movie-card';
  card.dataset.imdbId = imdbID;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details for ${Title}`);

  card.innerHTML = `
    <img class="card-poster" src="${Poster !== 'N/A' ? Poster : PLACEHOLDER_POSTER}" alt="${Title} poster" loading="lazy" />
    <div class="card-info">
      <h3 class="card-title" title="${Title}">${Title}</h3>
      <div class="card-meta">
        <span class="card-year">${Year}</span>
        <span class="card-type">${Type}</span>
      </div>
    </div>
  `;

  return card;
}

async function searchMovies(query) {
  if (!query.trim()) {
    showError('Please enter a movie title to search.');
    return;
  }

  showLoading();

  try {
    const url = SEARCH_URL.replace('QUERY', encodeURIComponent(query));
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.Response === 'False') {
      showError(data.Error === 'Movie not found!' ? 'No movies found. Try a different search.' : data.Error);
      return;
    }

    resultsGrid.innerHTML = data.Search.map(movie => createMovieCard(movie).outerHTML).join('');
    hideLoading();
  } catch (err) {
    showError('Failed to fetch movies. Please check your connection and try again.');
  }
}

async function openMovieDetails(imdbID) {
  modal.classList.remove('hidden');
  modalLoading.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  try {
    const url = DETAIL_URL.replace('IMDBID', imdbID);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    if (data.Response === 'False') {
      throw new Error(data.Error);
    }

    populateModal(data);
    modalLoading.classList.add('hidden');
  } catch (err) {
    modalLoading.innerHTML = `<p style="color: var(--text-secondary); padding: 2rem; text-align: center;">Failed to load details.</p>`;
  }
}

function populateModal(data) {
  const { Title, Year, Poster, Type, Genre, Director, Actors, Plot, imdbRating } = data;

  document.getElementById('modalPoster').src = Poster !== 'N/A' ? Poster : PLACEHOLDER_POSTER;
  document.getElementById('modalPoster').alt = `${Title} poster`;
  document.getElementById('modalTitle').textContent = Title;
  document.getElementById('modalYear').textContent = Year;
  document.getElementById('modalType').textContent = Type;
  document.getElementById('modalGenre').textContent = Genre;
  document.getElementById('modalDirector').textContent = Director;
  document.getElementById('modalActors').textContent = Actors;
  document.getElementById('modalPlot').textContent = Plot;

  const ratingHTML = imdbRating && imdbRating !== 'N/A'
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg><span>${imdbRating}/10</span>`
    : '<span>Rating unavailable</span>';
  document.getElementById('modalRating').innerHTML = ratingHTML;
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  modalLoading.classList.remove('hidden');
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  searchMovies(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchMovies(searchInput.value);
  }
});

resultsGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.movie-card');
  if (card && card.dataset.imdbId) {
    openMovieDetails(card.dataset.imdbId);
  }
});

resultsGrid.addEventListener('keydown', (e) => {
  const card = e.target.closest('.movie-card');
  if (card && card.dataset.imdbId && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    openMovieDetails(card.dataset.imdbId);
  }
});

modal.querySelector('.modal-close').addEventListener('click', closeModal);

modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
