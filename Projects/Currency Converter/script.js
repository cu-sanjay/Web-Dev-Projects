const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");
const output = document.getElementById("output");

const currencies = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  INR: "🇮🇳",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CAD: "🇨🇦"
};

function populateCurrencies() {
  Object.keys(currencies).forEach(code => {
    const option1 = document.createElement("option");
    option1.value = code;
    option1.textContent = code;
    fromCurrency.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = code;
    option2.textContent = code;
    toCurrency.appendChild(option2);
  });
  fromCurrency.value = "USD";
  toCurrency.value = "INR";
  updateFlags();
}

function updateFlags() {
  fromFlag.textContent = currencies[fromCurrency.value];
  toFlag.textContent = currencies[toCurrency.value];
}

fromCurrency.addEventListener("change", updateFlags);
toCurrency.addEventListener("change", updateFlags);

async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  if (!amount || amount <= 0) {
    alert("Please enter a valid amount!");
    return;
  }

  const apiUrl = `https://api.exchangerate.host/convert?from=${fromCurrency.value}&to=${toCurrency.value}&amount=${amount}`;
  const res = await fetch(apiUrl);
  const data = await res.json();

  output.textContent = `Converted Amount: ${data.result.toFixed(2)} ${toCurrency.value}`;
}

function swapCurrencies() {
  const temp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;
  updateFlags();
}

populateCurrencies();
