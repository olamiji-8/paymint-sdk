'use strict';
const https = require('https');

class PayMint {
  constructor(config = {}) {
    if (!config.apiKey) throw new Error('[PayMint] apiKey is required.');
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://backend-q9dq.onrender.com';
    this.currency = config.currency || 'NGN';
    this.onSuccess = config.onSuccess || null;
    this.onError = config.onError || null;
    this.invoice = new InvoiceModule(this);
  }

  async charge({ amount, email, name, metadata = {} }) {
    if (!amount || !email) throw new Error('[PayMint] amount and email are required');
    return this._post('/v1/charge/initialize', { amount, email, name, currency: this.currency, metadata });
  }

  async verify(reference) {
    if (!reference) throw new Error('[PayMint] reference is required');
    const result = await this._get(`/v1/charge/verify/${reference}`);
    if (this.onSuccess && result.status === 'success') this.onSuccess(result);
    return result;
  }

  async transactions({ page = 1, limit = 20 } = {}) {
    return this._get(`/v1/transactions?page=${page}&limit=${limit}`);
  }

  async balance() { return this._get('/v1/balance'); }

  _post(path, body) { return this._request('POST', path, body); }
  _get(path) { return this._request('GET', path); }

  _request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const bodyStr = body ? JSON.stringify(body) : null;
      const options = {
        hostname: url.hostname, port: url.port || 443,
        path: url.pathname + url.search, method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-PayMint-Version': '2.0.0',
          ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        },
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) reject(new Error(parsed.message || 'Request failed'));
            else resolve(parsed);
          } catch { reject(new Error('Invalid JSON response')); }
        });
      });
      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }
}

class InvoiceModule {
  constructor(sdk) { this.sdk = sdk; }
  async create({ customer, items, dueDate, note = '', sendEmail = true }) {
    if (!customer?.email) throw new Error('[PayMint] customer.email is required');
    if (!items?.length) throw new Error('[PayMint] items array is required');
    return this.sdk._post('/v1/invoices', { customer, items, dueDate, note, sendEmail });
  }
  async get(invoiceNumber) { return this.sdk._get(`/v1/invoices/${invoiceNumber}`); }
  async list({ page = 1, limit = 20, status } = {}) {
    const qs = new URLSearchParams({ page, limit, ...(status ? { status } : {}) });
    return this.sdk._get(`/v1/invoices?${qs}`);
  }
  async remind(invoiceNumber) { return this.sdk._post(`/v1/invoices/${invoiceNumber}/remind`, {}); }
  async markPaid(invoiceNumber) { return this.sdk._post(`/v1/invoices/${invoiceNumber}/mark-paid`, {}); }
  async cancel(invoiceNumber) { return this.sdk._post(`/v1/invoices/${invoiceNumber}/cancel`, {}); }
  async pdf(invoiceNumber) { return this.sdk._get(`/v1/invoices/${invoiceNumber}/pdf`); }
}

module.exports = PayMint;
