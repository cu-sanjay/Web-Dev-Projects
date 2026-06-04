const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don’t let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", author: "Vince Lombardi" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs" },
  { text: "If you can dream it, you can do it.", author: "Walt Disney" }
];

function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
}

function showQuote() {
  const quote = getRandomQuote();
  document.getElementById("quote").innerText = `"${quote.text}"`;
  document.getElementById("author").innerText = `- ${quote.author}`;
}
