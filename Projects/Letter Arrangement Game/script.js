const words = [
"javascript",
"computer",
"developer",
"keyboard",
"internet",
"algorithm",
"database",
"science",
"programming",
"education"
];

let currentWord="";
let score=0;
let time=30;
let timer;

const scrambledWord=document.getElementById("scrambledWord");
const scoreEl=document.getElementById("score");
const timeEl=document.getElementById("time");
const hintEl=document.getElementById("hint");
const msg=document.getElementById("message");
const progress=document.getElementById("progressBar");

const highScore=localStorage.getItem("highscore")||0;
document.getElementById("highScore").innerText=highScore;

function scramble(word){
return word.split('').sort(()=>Math.random()-0.5).join('');
}

function nextWord(){
currentWord=words[Math.floor(Math.random()*words.length)];
scrambledWord.textContent=scramble(currentWord);
hintEl.textContent="";
document.getElementById("userInput").value="";
}

function checkAnswer(){
const answer=document.getElementById("userInput").value.trim().toLowerCase();

if(answer===currentWord){
score+=10;
scoreEl.textContent=score;
msg.textContent="✅ Correct!";
msg.style.color="lightgreen";

if(score>highScore){
localStorage.setItem("highscore",score);
document.getElementById("highScore").textContent=score;
}

nextWord();
}
else{
msg.textContent="❌ Wrong!";
msg.style.color="salmon";
}
}

function showHint(){
hintEl.textContent="Hint: Starts with '"+currentWord[0].toUpperCase()+"'";
}

function startTimer(){
timer=setInterval(()=>{
time--;
timeEl.textContent=time;
progress.style.width=(time/30)*100+"%";

if(time<=0){
clearInterval(timer);
alert("Game Over! Score: "+score);
location.reload();
}
},1000);
}

document.getElementById("themeBtn").onclick=()=>{
document.body.classList.toggle("dark");
};

nextWord();
startTimer();