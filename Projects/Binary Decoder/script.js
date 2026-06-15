// function for decode the message:
function binaryTranslator(str) {
  let translatedMessage = '';

  str.split(' ').forEach(binaryTranslator => {
    let numericCharacterRepresentation = parseInt(binaryTranslator, 2);
    let letter = String.fromCharCode(numericCharacterRepresentation);
    translatedMessage += letter;
  })
  return translatedMessage;
}


// Get binary message and decode it using 'binaryTranslator()' function:
function enteredMessage(event) {
event.preventDefault();
var binaryMessage = document.getElementById('binary-message').value;
var decode = binaryTranslator(binaryMessage);
document.getElementById('decoded-message').innerHTML = decode;
}

var btn = document.getElementById('submit');
btn.addEventListener('click', enteredMessage);