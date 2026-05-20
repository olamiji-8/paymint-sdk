# PayMint SDK

**Payment + Invoicing for Nigerian Developers**

The simplest way to collect payments and send professional invoices — built on top of Paystack, without the complexity.

## Installation

```bash
npm install paymint
```

## Quick Start

```javascript
const PayMint = require('paymint');

const pay = new PayMint({ apiKey: 'your-api-key' });
```

---

## 1. Collect a Payment

```javascript
const charge = await pay.charge({
  amount: 500000,           // ₦5,000 in kobo
  email: 'ada@email.com',
  name: 'Ada Okafor',
});

console.log(charge.payment_url); // send user here to pay

// After payment, verify it
const result = await pay.verify(charge.reference);
console.log(result.status); // 'success'
```

---

## 2. Create & Send an Invoice

```javascript
const invoice = await pay.invoice.create({
  customer: {
    name: 'Ada Okafor',
    email: 'ada@email.com',
  },
  items: [
    { name: 'Website Design', amount: 15000000, qty: 1 },  // ₦150,000
    { name: 'Logo Design',    amount:  5000000, qty: 1 },  // ₦50,000
  ],
  dueDate: '2026-06-01',
  note: 'Thank you for your business!',
});

console.log(invoice.invoiceNumber);  // INV-0001
console.log(invoice.paymentUrl);     // link to send to client
console.log(invoice.pdfUrl);         // downloadable PDF
// ✅ Email with PDF automatically sent to ada@email.com
```

---

## 3. Manage Invoices

```javascript
// Check invoice status
const inv = await pay.invoice.get('INV-0001');
console.log(inv.status); // 'unpaid' | 'paid' | 'cancelled'

// List all invoices
const { invoices } = await pay.invoice.list({ status: 'unpaid' });

// Send a payment reminder
await pay.invoice.remind('INV-0001');
// ✅ Reminder email sent to client

// Mark as paid manually (e.g. cash payment)
await pay.invoice.markPaid('INV-0001');

// Cancel an invoice
await pay.invoice.cancel('INV-0001');

// Get PDF download URL
const { pdfUrl } = await pay.invoice.pdf('INV-0001');
```

---

## 4. Check Your Balance & Transactions

```javascript
const bal = await pay.balance();
console.log(bal.balance_naira); // ₦182,400

const { transactions } = await pay.transactions({ page: 1, limit: 20 });
```

---

## API Reference

### `new PayMint(config)`
| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `apiKey` | ✅ | — | Your PayMint API key |
| `currency` | ❌ | `NGN` | Payment currency |
| `onSuccess` | ❌ | — | Callback on successful payment |
| `onError` | ❌ | — | Callback on error |

### `pay.charge({ amount, email, name })`
Initialize a payment. Amount in **kobo** (₦1 = 100 kobo).
Returns `{ payment_url, reference, amount, fee, total }`

### `pay.verify(reference)`
Verify a payment after the user pays.

### `pay.invoice.create({ customer, items, dueDate, note, sendEmail })`
Create an invoice + payment link + PDF. Emails it to the customer automatically.

### `pay.invoice.get(invoiceNumber)`
Get invoice details by number.

### `pay.invoice.list({ page, limit, status })`
List invoices. Filter by status: `unpaid`, `paid`, `cancelled`.

### `pay.invoice.remind(invoiceNumber)`
Send a payment reminder email to the customer.

### `pay.invoice.markPaid(invoiceNumber)`
Mark an invoice as paid manually.

### `pay.invoice.cancel(invoiceNumber)`
Cancel/void an invoice.

### `pay.invoice.pdf(invoiceNumber)`
Get the PDF download URL.

---

## What Makes PayMint Different

| Feature | Raw Paystack | PayMint |
|---|---|---|
| Simple charge | ✅ | ✅ |
| Invoice creation | ❌ | ✅ |
| Auto PDF generation | ❌ | ✅ |
| Auto email invoice | ❌ | ✅ |
| Payment reminder | ❌ | ✅ |
| Simple API | ❌ | ✅ |

---

## Get Your API Key

Sign up at **paymint.dev** (coming soon)

## License
MIT
