const imageInput = document.getElementById("imageInput");
const secretMessage = document.getElementById("secretMessage");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const downloadLink = document.getElementById("downloadLink");
const output = document.getElementById("output");

let imageLoaded = false;

imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();

        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);
            imageLoaded = true;

            output.innerHTML = "✅ Image loaded successfully.";
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

function textToBinary(text) {
    return text
        .split("")
        .map(char =>
            char.charCodeAt(0)
                .toString(2)
                .padStart(8, "0"))
        .join("");
}

function binaryToText(binary) {
    let text = "";

    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.slice(i, i + 8);

        if (byte.length < 8) break;

        text += String.fromCharCode(parseInt(byte, 2));
    }

    return text;
}

encodeBtn.addEventListener("click", () => {

    if (!imageLoaded) {
        alert("Please upload an image first.");
        return;
    }

    const message = secretMessage.value;

    if (!message) {
        alert("Enter a secret message.");
        return;
    }

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const data = imageData.data;

    const binaryMessage =
        textToBinary(message) + "1111111111111110";

    if (binaryMessage.length > data.length / 4) {
        alert("Message is too long for this image.");
        return;
    }

    for (let i = 0; i < binaryMessage.length; i++) {
        data[i * 4] =
            (data[i * 4] & 254) |
            Number(binaryMessage[i]);
    }

    ctx.putImageData(imageData, 0, 0);

    const imageURL = canvas.toDataURL("image/png");

    downloadLink.href = imageURL;
    downloadLink.style.display = "block";

    output.innerHTML =
        "✅ Message encoded successfully. Download the image.";
});

decodeBtn.addEventListener("click", () => {

    if (!imageLoaded) {
        alert("Please upload an encoded image.");
        return;
    }

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const data = imageData.data;

    let binary = "";

    for (let i = 0; i < data.length; i += 4) {
        binary += (data[i] & 1);
    }

    const delimiter =
        "1111111111111110";

    const endIndex =
        binary.indexOf(delimiter);

    if (endIndex === -1) {
        output.innerHTML =
            "❌ No hidden message found.";
        return;
    }

    const hiddenBinary =
        binary.substring(0, endIndex);

    const decodedMessage =
        binaryToText(hiddenBinary);

    output.innerHTML =
        `<strong>Decoded Message:</strong><br>${decodedMessage}`;
});