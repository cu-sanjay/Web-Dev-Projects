const { jsPDF } = window.jspdf;

document.getElementById("addItemBtn").addEventListener("click", addItem);
document.getElementById("exportPDFBtn").addEventListener("click", exportPDF);

function addItem() {
  const tbody = document.querySelector("#itemsTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input type="text" class="desc"></td>
    <td><input type="number" class="qty" value="1"></td>
    <td><input type="number" class="price" value="0"></td>
    <td class="total">0</td>
    <td><button class="removeBtn">Remove</button></td>
  `;

  tbody.appendChild(row);

  row.querySelector(".qty").addEventListener("input", updateTotals);
  row.querySelector(".price").addEventListener("input", updateTotals);
  row.querySelector(".removeBtn").addEventListener("click", () => {
    row.remove();
    updateTotals();
  });
}

function updateTotals() {
  let subtotal = 0;
  document.querySelectorAll("#itemsTable tbody tr").forEach(row => {
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;
    const total = qty * price;
    row.querySelector(".total").textContent = total.toFixed(2);
    subtotal += total;
  });

  const tax = subtotal * 0.10;
  const grandTotal = subtotal + tax;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("tax").textContent = tax.toFixed(2);
  document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
}

function exportPDF() {
  const clientName = document.getElementById("clientName").value;
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const invoiceDate = document.getElementById("invoiceDate").value;
  const subtotal = document.getElementById("subtotal").textContent;
  const tax = document.getElementById("tax").textContent;
  const grandTotal = document.getElementById("grandTotal").textContent;

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Invoice #${invoiceNumber}`, 10, 10);
  doc.text(`Client: ${clientName}`, 10, 20);
  doc.text(`Date: ${invoiceDate}`, 10, 30);

  let y = 50;
  document.querySelectorAll("#itemsTable tbody tr").forEach(row => {
    const desc = row.querySelector(".desc").value;
    const qty = row.querySelector(".qty").value;
    const price = row.querySelector(".price").value;
    const total = row.querySelector(".total").textContent;
    doc.text(`${desc} | ${qty} x ${price} = ${total}`, 10, y);
    y += 10;
  });

  doc.text(`Subtotal: ${subtotal}`, 10, y + 10);
  doc.text(`Tax: ${tax}`, 10, y + 20);
  doc.text(`Grand Total: ${grandTotal}`, 10, y + 30);

  doc.save(`invoice-${invoiceNumber}.pdf`);
}
