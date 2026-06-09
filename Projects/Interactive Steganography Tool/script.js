// Tab Switching Elements Layout References
const tabEncodeBtn = document.getElementById('tabEncodeBtn');
const tabDecodeBtn = document.getElementById('tabDecodeBtn');
const encodePanel = document.getElementById('encodePanel');
const decodePanel = document.getElementById('decodePanel');

// Operational File Handler Elements
const encodeUpload = document.getElementById('encodeUpload');
const decodeUpload = document.getElementById('decodeUpload');
const secretMessage = document.getElementById('secretMessage');
const processEncodeBtn = document.getElementById('processEncodeBtn');
const processDecodeBtn = document.getElementById('processDecodeBtn');

// Visual Pipeline Elements
const encodePreviewImg = document.getElementById('encodePreviewImg');
const encodePlaceholderText = document.getElementById('encodePlaceholderText');
const downloadBtn = document.getElementById('downloadBtn');
const decodedMessageOutput = document.getElementById('decodedMessageOutput');
const canvas = document.getElementById('processingCanvas');
const ctx = canvas.getContext('2d');

let encodeSourceImageLoaded = false;
let decodeSourceImageLoaded = false;

// --- Tab Setup Management Bindings ---
tabEncodeBtn.addEventListener('click', () => {
  tabEncodeBtn.classList.add('active');
  tabDecodeBtn.classList.remove('active');
  encodePanel.classList.add('active');
  decodePanel.classList.remove('active');
});

tabDecodeBtn.addEventListener('click', () => {
  tabDecodeBtn.classList.add('active');
  tabEncodeBtn.classList.remove('active');
  decodePanel.classList.add('active');
  encodePanel.classList.remove('active');
});

// --- Upload Image Preview Hooks ---
encodeUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    encodePreviewImg.src = event.target.result;
    encodePreviewImg.classList.remove('hidden');
    encodePlaceholderText.classList.add('hidden');
    encodeSourceImageLoaded = true;
    downloadBtn.classList.add('hidden'); // Clear legacy outputs if present
  };
  reader.readAsDataURL(file);
});

decodeUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    decodeSourceImageLoaded = true;
  }
});

// --- STEGANOGRAPHY ALGORITHMIC CORE FUNCTIONS ---

/**
 * Converts a string into an array of binary bits, adding a zero byte delimiter at the end
 * @param {string} str - Text to convert
 * @returns {number[]} Array of binary bits (0s and 1s)
 */
function stringToBits(str) {
  const bits = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Unroll 8 bits per character character byte length map array loop
    for (let bit = 7; bit >= 0; bit--) {
      bits.push((code >> bit) & 1);
    }
  }
  // Inject 8 sequential null bit terminators to signify ending point marker safely
  for (let i = 0; i < 8; i++) {
    bits.push(0);
  }
  return bits;
}

/**
 * Sweeps pixel array segments to resolve binary strings back into text
 */
function bitsToString(bits) {
  let str = '';
  for (let i = 0; i < bits.length; i += 8) {
    let charCode = 0;
    for (let bit = 0; bit < 8; bit++) {
      if (i + bit >= bits.length) break;
      charCode = (charCode << 1) | bits[i + bit];
    }
    if (charCode === 0) break; // Break loop when null-terminator sequence matches
    str += String.fromCharCode(charCode);
  }
  return str;
}

// --- Trigger Encode Logic Run ---
processEncodeBtn.addEventListener('click', () => {
  const textPayload = secretMessage.value;
  if (!encodeSourceImageLoaded) {
    alert('Please upload a source file first.');
    return;
  }
  if (!textPayload) {
    alert('Please enter a secret message payload text to obscure.');
    return;
  }

  const img = new Image();
  img.src = encodePreviewImg.src;
  img.onload = () => {
    canvas.width = img.currentTarget ? img.currentTarget.width : img.width;
    canvas.height = img.currentTarget ? img.currentTarget.height : img.height;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelArray = imgData.data;
    const binaryBits = stringToBits(textPayload);

    // Guard constraint parameter boundaries validation check
    if (binaryBits.length > (pixelArray.length * 3) / 4) {
      alert('The payload text message is too large for the uploaded image dimension scale thresholds.');
      return;
    }

    let bitIndex = 0;
    // Iterate through individual pixel channels (RGB, omitting alpha tracking segments)
    for (let i = 0; i < pixelArray.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        if (bitIndex >= binaryBits.length) break;

        // Clear the lowest bit, then bitwise OR with our secret message bit
        pixelArray[i + channel] = (pixelArray[i + channel] & 0xFE) | binaryBits[bitIndex];
        bitIndex++;
      }
      if (bitIndex >= binaryBits.length) break;
    }

    // Paint payload arrays back down into canvas frame
    ctx.putImageData(imgData, 0, 0);

    // Export payload into downloadable element targets parameters
    const encodedDataUrl = canvas.toDataURL('image/png');
    downloadBtn.href = encodedDataUrl;
    downloadBtn.download = 'encoded-secret-image.png';
    downloadBtn.classList.remove('hidden');
    alert('Success! Message hidden smoothly. Click Download to retrieve your image.');
  };
});

// --- Trigger Extract Decode Logic Run ---
processDecodeBtn.getElementById = processDecodeBtn.addEventListener('click', () => {
  if (!decodeSourceImageLoaded) {
    alert('Please choose an encoded stego image file target to parse.');
    return;
  }

  const file = decodeUpload.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      canvas.width = img.currentTarget ? img.currentTarget.width : img.width;
      canvas.height = img.currentTarget ? img.currentTarget.height : img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixelArray = imgData.data;
      const extractedBits = [];

      let nullByteStreak = 0;
      let currentByteBits = 0;

      // Extract trailing bit indicators down sequentially
      for (let i = 0; i < pixelArray.length; i += 4) {
        for (let channel = 0; channel < 3; channel++) {
          const bit = pixelArray[i + channel] & 1;
          extractedBits.push(bit);

          currentByteBits++;
          if (bit === 0) {
            nullByteStreak++;
          } else {
            nullByteStreak = 0; // Break sequence loop streak if a 1 occurs
          }

          // If we read a full byte (8 bits) and found 8 zeros in a row, stop extracting
          if (currentByteBits === 8) {
            if (nullByteStreak >= 8) {
              break;
            }
            currentByteBits = 0;
          }
        }
        if (nullByteStreak >= 8) break;
      }

      const decodedText = bitsToString(extractedBits);
      if (decodedText.trim().length === 0) {
        decodedMessageOutput.value = "Failed to extract text. Either the image has no hidden message, or it was re-compressed by a secondary host.";
      } else {
        decodedMessageOutput.value = decodedText;
      }
    };
  };
  reader.readAsDataURL(file);
});