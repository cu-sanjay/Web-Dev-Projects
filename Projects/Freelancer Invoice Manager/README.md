# Freelancer Invoice Manager

A premium, interactive invoice manager and financial dashboard designed for freelancers. Keep track of clients, draft professional invoices, log payments, view earnings trends, and download print-ready PDF invoices using native browser capabilities.

## 🚀 Features

- **Financial Analytics Dashboard**: KPI cards displaying total billed, paid, pending, and overdue amounts, plus interactive charts visualising monthly income.
- **Client Profiles Manager**: Store client names, email addresses, physical addresses, tax rules, and billing currencies. Keep contact lists organized and ready for invoicing.
- **Dual-Pane Invoice Editor**: Create invoices with custom reference numbers, terms, line items, and taxes while viewing a live, high-fidelity print-preview rendering.
- **Dynamic Invoice Line Items**: Add hours, flat rates, or physical items with automatic subtotal, tax adjustment, and grand total calculations.
- **Payment Logging**: Log full or partial payments for invoices, tracking paid-to-date values, invoice status changes, and transaction dates.
- **Native Print-to-PDF Engine**: Premium, borderless print-styles tailored specifically for client receipt sheets. Open print previews to easily download vector PDFs.
- **Data Export & Import**: Full data portability. Export all invoices, clients, settings, and mock databases as a single JSON file or import a saved session.
- **Modern Responsive Design**: A high-end dark/light theme experience optimized for both desktops and mobile screens.

## 📂 Project Structure

```
Freelancer Invoice Manager/
├── README.md         # Project documentation
├── project.json      # Metadata descriptor
├── index.html        # App interface markup
├── style.css         # Styling system & print stylesheet
├── script.js         # State machine, storage, & UI controllers
└── thumbnail.svg     # Project branding visual
```

## 🛠️ How to Use

1. Open `index.html` in any web browser.
2. The application automatically initializes with high-fidelity seed data if your local environment is empty.
3. Manage clients via the **Clients** tab, edit defaults, or view invoice history.
4. Go to **Invoices** and click **Create Invoice** to open the builder. Add items and watch calculations refresh in real time.
5. Click **Print / PDF** to save the invoice.
6. Toggle light and dark settings in the **Settings** panel or backup your files.
