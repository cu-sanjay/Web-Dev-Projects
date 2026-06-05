const testSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Success is not final, failure is not fatal.",
  "Your time is limited, so don’t waste it living someone else’s life."
];

let startTime, endTime, testText;

document.getElementById("start-btn").addEventListener("click", () => {
  testText = testSentences[Math.floor(Math.random() * testSentences.length)];
  document.getElementById("test-text").innerText = testText;
  document.getElementById("input-area").value = "";
  document.getElementById("input-area").disabled = false;
  document.getElementById("input-area").focus();
  startTime = new Date();
});

document.getElementById("input-area").addEventListener("input", () => {
  const input = document.getElementById("input-area").value;
  if (input === testText) {
    endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000 / 60; // minutes
    const wordCount = testText.split(" ").length;
    const wpm = Math.round(wordCount / timeTaken);

    // Accuracy
    let correctChars = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === testText[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / testText.length) * 100);

    document.getElementById("wpm").innerText = `Speed: ${wpm} WPM`;
    document.getElementById("accuracy").innerText = `Accuracy: ${accuracy}%`;
    document.getElementById("input-area").disabled = true;
  }
});
