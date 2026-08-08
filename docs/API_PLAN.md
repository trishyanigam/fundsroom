# REST API Specifications & Blueprint

This document defines the RESTful API endpoints, HTTP request/response payloads, query parameters, authentication headers, error codes, and validation rules for the **Mini ERP + CRM Operations Portal**.

---

## 1. Global API Standards

- **Base URL:** `/api/v1` (also mounted at `/api` for convenience)
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Pagination Format:** Standard `page` (default: 1) and `limit` (default: 10, max: 100) query parameters.

---

## 2. Authentication Endpoints (Phase 3 - Implemented ✅)

- `POST /api/v1/auth/register` — Registers new user account.
- `POST /api/v1/auth/login` — User login & JWT generation.
- `GET /api/v1/auth/me` — Get current user profile.

---

## 3. Customer CRM Endpoints (Phase 4 - Implemented ✅)

- `POST /api/v1/customers` — Create customer record.
- `GET /api/v1/customers` — List/search/filter customers (`page`, `limit`, `search`, `status`, `customerType`).
- `GET /api/v1/customers/:id` — Get customer profile by ID.
- `PUT /api/v1/customers/:id` — Update customer profile and follow-up notes.

---

## 4. Product Catalog Endpoints (Phase 5 - Implemented ✅)

- `POST /api/v1/products` — Create product record (Unique SKU enforced, `409 Conflict`).
- `GET /api/v1/products` — List/search/filter products (`page`, `limit`, `search`, `category`, `warehouseLocation`, `lowStock`).
- `GET /api/v1/products/:id` — Get product profile by ID.
- `PUT /api/v1/products/:id` — Update product metadata (Insulates `currentStock` from direct editing).

---

## 5. Inventory & Stock Movement Endpoints (Phase 6 - Implemented ✅)

- `POST /api/v1/inventory/movements` — Transactional Stock IN (+) or Stock OUT (-) movement.
- `GET /api/v1/inventory/movements` — List/filter stock movement audit log.
- `GET /api/v1/inventory/movements/:id` — Get single stock movement record.

---

## 6. Sales Challan Endpoints (Phase 7 & 8 - Implemented ✅)

- `POST /api/v1/challans` — Create draft challan (Auto-generated `CH-YYYY-XXXXXX`, product snapshots).
- `GET /api/v1/challans` — List/search/filter sales challans (`page`, `limit`, `search`, `status`, `customerId`).
- `GET /api/v1/challans/:id` — Get sales challan details with historical snapshots.
- `PUT /api/v1/challans/:id` — Update draft challan items.
- `PUT /api/v1/challans/:id/cancel` — Cancel draft challan (`DRAFT` -> `CANCELLED`).
- `PUT /api/v1/challans/:id/confirm` — **Confirm Sales Challan (`DRAFT` -> `CONFIRMED`)**. Transactionally verifies stock for all items, deducts `Product.currentStock`, creates `OUT` `StockMovement` logs (`reason: "Sales Challan CH-YYYY-XXXXXX"`), and updates status. Rolls back cleanly if ANY item has insufficient stock (`409 Conflict`).
