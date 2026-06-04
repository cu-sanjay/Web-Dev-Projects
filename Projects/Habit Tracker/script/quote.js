const FALLBACK_QUOTES = [
  { text: "Small daily improvements are the key to long-term success.", author: "Unknown" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "The only bad workout is the one that did not happen.", author: "Unknown" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Unknown" }
];

function todayKey() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function readCachedQuote() {
  try {
    const cached = JSON.parse(localStorage.getItem("dailyQuote"));
    if (cached && cached.date === todayKey()) return cached;
  } catch {
    return null;
  }
  return null;
}

function cacheQuote(quote) {
  localStorage.setItem(
    "dailyQuote",
    JSON.stringify({ date: todayKey(), text: quote.text, author: quote.author })
  );
}

function fallbackQuote() {
  const dayIndex = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return FALLBACK_QUOTES[dayIndex % FALLBACK_QUOTES.length];
}

function fetchZenQuoteToday() {
  return new Promise((resolve, reject) => {
    const callbackName = `zenQuote_${Date.now()}`;

    window[callbackName] = (data) => {
      cleanup();
      if (!Array.isArray(data) || !data[0]) {
        reject(new Error("Invalid quote response"));
        return;
      }
      resolve({ text: data[0].q, author: data[0].a });
    };

    const script = document.createElement("script");
    script.src = `https://zenquotes.io/api/today?callback=${callbackName}`;

    function cleanup() {
      delete window[callbackName];
      script.remove();
    }

    script.onerror = () => {
      cleanup();
      reject(new Error("Quote request failed"));
    };

    document.body.appendChild(script);
  });
}

async function fetchAffirmationQuote() {
  const response = await fetch("https://www.affirmations.dev/");
  if (!response.ok) throw new Error("Affirmation request failed");

  const data = await response.json();
  if (!data.affirmation) throw new Error("Invalid affirmation response");

  return { text: data.affirmation, author: "Daily Affirmation" };
}

async function fetchDailyQuote() {
  try {
    return await fetchZenQuoteToday();
  } catch {
    try {
      return await fetchAffirmationQuote();
    } catch {
      return fallbackQuote();
    }
  }
}

function renderQuote(element, quote) {
  element.textContent = "";
  element.classList.remove("is-loading");

  const quoteText = document.createElement("span");
  quoteText.className = "quote-text";
  quoteText.textContent = `"${quote.text}"`;

  const quoteAuthor = document.createElement("span");
  quoteAuthor.className = "quote-author";
  quoteAuthor.textContent = ` — ${quote.author}`;

  element.append(quoteText, quoteAuthor);
}

async function loadDailyQuote() {
  const element = document.getElementById("dailyQuote");
  if (!element) return;

  const fallback = element.dataset.fallback || element.textContent;
  const cached = readCachedQuote();

  if (cached) {
    renderQuote(element, cached);
    return;
  }

  element.classList.add("is-loading");
  element.textContent = "Loading today's motivation…";

  try {
    const quote = await fetchDailyQuote();
    cacheQuote(quote);
    renderQuote(element, quote);
  } catch {
    element.classList.remove("is-loading");
    element.textContent = fallback;
  }
}

loadDailyQuote();
