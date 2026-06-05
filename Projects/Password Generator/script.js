const display = document.getElementById('password-display');
const copyBtn = document.getElementById('copy-btn');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');

const uppercaseCc = document.getElementById('uppercase');
const lowercaseCc = document.getElementById('lowercase');
const numbersCc = document.getElementById('numbers');
const symbolsCc = document.getElementById('symbols');
const generateBtn = document.getElementById('generate-btn');

const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// Update length label dynamically
lengthSlider.addEventListener('input', (e) => {
    lengthVal.textContent = e.target.value;
});

// Main Generation Function
function generatePassword() {
    let allowedChars = '';
    if (uppercaseCc.checked) allowedChars += charSets.uppercase;
    if (lowercaseCc.checked) allowedChars += charSets.lowercase;
    if (numbersCc.checked) allowedChars += charSets.numbers;
    if (symbolsCc.checked) allowedChars += charSets.symbols;

    if (allowedChars === '') {
        display.value = 'Select at least 1 option!';
        return;
    }

    let password = '';
    const length = parseInt(lengthSlider.value);
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allowedChars.length);
        password += allowedChars[randomIndex];
    }

    display.value = password;
}

// Copy to Clipboard Functionality
async function copyToClipboard() {
    const password = display.value;
    if (!password || password === 'Select at least 1 option!' || password === 'Password Copied! ✅') return;

    try {
        await navigator.clipboard.writeText(password);
        const originalText = display.value;
        display.value = 'Password Copied! ✅';
        setTimeout(() => {
            display.value = originalText;
        }, 1500);
    } catch (err) {
        alert('Failed to copy password.');
    }
}

// Event Listeners
generateBtn.addEventListener('click', generatePassword);
copyBtn.addEventListener('click', copyToClipboard);

// Auto-generate one on initial load
generatePassword();