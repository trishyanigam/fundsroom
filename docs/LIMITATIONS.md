# Known Limitations & System Boundaries

This document outlines the current operational boundaries, architectural constraints, and technical scope of the **Mini ERP + CRM Operations Portal**.

---

## 1. Authentication & Security Scope

- **Single JWT Expiration Model**: The platform currently uses single-token JWT authentication without refresh token rotation. Users must re-authenticate once token expires.
- **Session Revocation**: JWT tokens are stateless; revoking a token before expiration requires server-side blacklist mechanisms which are not yet implemented.

---

## 2. Search & Indexing

- **Basic ILIKE Database Search**: Customer and Product searching utilizes PostgreSQL `ILIKE` pattern matching over standard columns (`name`, `sku`, `company`, `email`). Advanced full-text search engines (e.g. PostgreSQL `tsvector`/`tsquery`, Elasticsearch) are not implemented.

---

## 3. Storage & Media

- **Image URL Storage**: Product images are stored as remote HTTP URL references. Direct binary cloud uploads (e.g. AWS S3, Cloudinary) are omitted to minimize external infrastructure setup.

---

## 4. Exports & Document Generation

- **Browser-Native Challan Printing**: Delivery challans and receipts are rendered using optimized DOM CSS print stylesheets (`@media print`). Server-side PDF binary stream generation (e.g. PDFKit, Puppeteer) is not integrated.

---

## 5. Communications & Notifications

- **No Automated Email / SMS Service**: Stock alert thresholds and delivery challan confirmations do not emit transactional emails or webhooks (e.g. SendGrid, Twilio). Notifications are surfaced in real-time on the web portal.

---

## 6. Analytics & Financial Reporting

- **Summary Dashboard Focus**: The dashboard aggregates current operational totals (revenue, low-stock counts, customer stats). Multi-year comparative trend graphs, tax ledger exports, and custom date range filters are out of current scope.
