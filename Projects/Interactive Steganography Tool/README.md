# 🔐 Interactive Steganography Tool

An interactive web-based steganography tool that allows users to hide secret messages inside images and retrieve them later using Least Significant Bit (LSB) encoding.

## 🚀 Features

- Upload images from your device
- Hide secret text messages inside images
- Download encoded images
- Decode hidden messages from encoded images
- Responsive and modern UI
- Built entirely with HTML, CSS, and JavaScript

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Canvas API

## 📖 How It Works

### Encoding
1. Upload an image.
2. Enter a secret message.
3. Click **Encode Message**.
4. Download the encoded image.

### Decoding
1. Upload an encoded image.
2. Click **Decode Message**.
3. View the hidden message.

## 🧠 Steganography Technique

This project uses the **Least Significant Bit (LSB)** technique.

- Each character is converted into binary.
- Binary bits are stored in the least significant bits of image pixels.
- The visual appearance of the image remains almost unchanged.
- Hidden data can later be extracted and reconstructed into text.

## 📂 Project Structure

```
Interactive Steganography Tool/
│
├── index.html
├── style.css
├── script.js
├── README.md
└── project.json
```

## 👨‍💻 Author

**Simran Singh**

GitHub: https://github.com/simransingh-dev

---
Made with ❤️ using HTML, CSS and JavaScript.