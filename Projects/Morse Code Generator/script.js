const MORSE = {
A:".-", B:"-...", C:"-.-.", D:"-..",
E:".", F:"..-.", G:"--.", H:"....",
I:"..", J:".---", K:"-.-", L:".-..",
M:"--", N:"-.", O:"---", P:".--.",
Q:"--.-", R:".-.", S:"...", T:"-",
U:"..-", V:"...-", W:".--", X:"-..-",
Y:"-.--", Z:"--..",
0:"-----", 1:".----", 2:"..---",
3:"...--", 4:"....-", 5:".....",
6:"-....", 7:"--...", 8:"---..",
9:"----.",
" ":"/"
};

const REVERSE = {};

for(const key in MORSE){
    REVERSE[MORSE[key]] = key;
}

const textInput = document.getElementById("textInput");
const morseOutput = document.getElementById("morseOutput");

const morseInput = document.getElementById("morseInput");
const textOutput = document.getElementById("textOutput");

const challengeCode = document.getElementById("challengeCode");
const challengeAnswer = document.getElementById("challengeAnswer");
const challengeResult = document.getElementById("challengeResult");

let currentAnswer = "";

document.getElementById("convertBtn")
.addEventListener("click", () => {

    const text = textInput.value.toUpperCase();

    let result = [];

    for(const char of text){
        if(MORSE[char]){
            result.push(MORSE[char]);
        }
    }

    morseOutput.textContent = result.join(" ");
});

document.getElementById("decodeBtn")
.addEventListener("click", () => {

    const code = morseInput.value.trim();

    const words = code.split(" / ");

    let decodedWords = words.map(word => {

        return word
            .split(" ")
            .map(letter => REVERSE[letter] || "")
            .join("");

    });

    textOutput.textContent =
        decodedWords.join(" ");
});

document.getElementById("copyBtn")
.addEventListener("click", () => {

    navigator.clipboard.writeText(
        morseOutput.textContent
    );

    alert("Copied!");
});

async function beep(duration){

    const audioCtx =
        new(window.AudioContext ||
              window.webkitAudioContext)();

    const osc =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.frequency.value = 600;

    osc.start();

    gain.gain.setValueAtTime(
        0.2,
        audioCtx.currentTime
    );

    await new Promise(resolve =>
        setTimeout(resolve, duration)
    );

    osc.stop();

    audioCtx.close();
}

document.getElementById("playBtn")
.addEventListener("click", async () => {

    const code =
        morseOutput.textContent;

    for(const symbol of code){

        if(symbol === "."){
            await beep(120);
        }

        else if(symbol === "-"){
            await beep(360);
        }

        await new Promise(r =>
            setTimeout(r,120)
        );
    }
});

const challengeWords = [
    "HELLO",
    "WORLD",
    "MORSE",
    "CODE",
    "JAVASCRIPT",
    "SIGNAL",
    "MESSAGE",
    "BROWSER",
    "LEARN",
    "CHALLENGE"
];

function generateChallenge(){

    currentAnswer =
        challengeWords[
            Math.floor(
                Math.random() *
                challengeWords.length
            )
        ];

    challengeCode.textContent =
        currentAnswer
        .split("")
        .map(ch => MORSE[ch])
        .join(" ");

    challengeAnswer.value = "";
    challengeResult.textContent = "";
}

document.getElementById("submitChallenge")
.addEventListener("click", () => {

    const answer =
        challengeAnswer.value
        .trim()
        .toUpperCase();

    if(answer === currentAnswer){

        challengeResult.textContent =
            "✅ Correct!";

    } else {

        challengeResult.textContent =
            `❌ Wrong! Correct Answer: ${currentAnswer}`;
    }
});

document.getElementById("newChallenge")
.addEventListener("click",
    generateChallenge
);

generateChallenge();