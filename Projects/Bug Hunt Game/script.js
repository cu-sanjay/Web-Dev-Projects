const questions = [
  {
    language: "JavaScript",
    level: "Easy",
    question: "Find the bug in JavaScript:",
    code: `function add(a, b) {
  return a + b
}`,
    options: [
      "Missing semicolon",
      "Wrong function name",
      "No bug",
      "Syntax error"
    ],
    answer: "Missing semicolon"
  },
  {
    language: "JavaScript",
    level: "Medium",
    question: "Find the bug in JavaScript:",
    code: `let x = 10;
if(x = 5) {
  console.log("Equal");
}`,
    options: [
      "Assignment instead of comparison",
      "Missing variable",
      "No bug",
      "Wrong console syntax"
    ],
    answer: "Assignment instead of comparison"
  },
  {
    language: "Python",
    level: "Easy",
    question: "Find the bug in Python:",
    code: `def add(a, b):
    return a + b`,
    options: [
      "Missing colon",
      "Indentation error",
      "No bug",
      "Wrong function name"
    ],
    answer: "No bug"
  },
  {
    language: "C",
    level: "Hard",
    question: "Find the bug in C:",
    code: `#include <stdio.h>

int main() {
  printf("Hello World")
  return 0;
}`,
    options: [
      "Missing semicolon after printf",
      "Wrong header file",
      "Missing main return type",
      "No bug"
    ],
    answer: "Missing semicolon after printf"
  }
];

let current = 0;

function loadQuestion() {
  const q = questions[current];
    document.getElementById("language").innerText = "Language: " + q.language;
    document.getElementById("level").innerText = "Level: " + q.level;

  document.getElementById("question").innerHTML = `
    <b>Language:</b> ${q.language} | <b>Level:</b> ${q.level}<br><br>
    ${q.question}
  `;

  document.getElementById("code-block").innerText = q.code;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.classList.add("option-btn");

    btn.onclick = () => checkAnswer(opt);

    optionsDiv.appendChild(btn);
  });

  document.getElementById("result").innerText = "";
}

function checkAnswer(selected) {
  const correct = questions[current].answer;
  const result = document.getElementById("result");

  if (selected === correct) {
    result.innerText = "✅ Correct!";
    result.style.color = "lightgreen";
  } else {
    result.innerText = "❌ Wrong!";
    result.style.color = "red";
  }
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    alert("🎉 All levels completed!");
    current = 0;
  }
  loadQuestion();
}

loadQuestion();