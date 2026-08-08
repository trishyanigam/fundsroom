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
- `GET /api/v1/auth/test/admin`, `/sales`, `/warehouse`, `/accounts` — RBAC test routes.

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

## 6. Sales Challan Endpoints (Phase 7 - Implemented ✅)

### 6.1 Create Draft Sales Challan
- **Endpoint:** `POST /api/v1/challans` (and `/api/challans`)
- **Access:** `ADMIN`, `SALES` (`WAREHOUSE` & `ACCOUNTS` return `403 Forbidden`)
- **Auto-Generated Challan Number:** Formatted as `CH-YYYY-XXXXXX` (e.g. `CH-2026-000001`).
- **Product Snapshot Preservation:** Reads and stores current `productName`, `sku`, and `unitPrice` into `ChallanItem`.
- **Zero Stock Mutation Guarantee:** Draft creation does NOT alter `Product.currentStock` or create `StockMovement` logs.
- **Request Body:**
  ```json
  {
    "customerId": "cust_101",
    "items": [
      { "productId": "prod_101", "quantity": 2 },
      { "productId": "prod_102", "quantity": 5 }
    ],
    "status": "DRAFT"
  }
  ```
- **Success Response (`201 Created`):** Returns created draft challan record.

### 6.2 Get Sales Challans List
- **Endpoint:** `GET /api/v1/challans` (and `/api/challans`)
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` allowed)
- **Query Params:** `page`, `limit`, `search` (challanNumber or customerName), `status` (`DRAFT`, `CONFIRMED`, `CANCELLED`), `customerId`.

### 6.3 Get Sales Challan Detail
- **Endpoint:** `GET /api/v1/challans/:id` (and `/api/challans/:id`)
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` allowed)

### 6.4 Update Draft Sales Challan
- **Endpoint:** `PUT /api/v1/challans/:id` (and `/api/challans/:id`)
- **Access:** `ADMIN`, `SALES`
- **Restriction:** Edits permitted on `DRAFT` status only. Attempting to edit `CONFIRMED` or `CANCELLED` challans returns `409 Conflict`. Zero stock mutation.

### 6.5 Cancel Draft Sales Challan
- **Endpoint:** `PUT /api/v1/challans/:id/cancel` (and `/api/challans/:id/cancel`)
- **Access:** `ADMIN`, `SALES`
- **Behavior:** Transitions status from `DRAFT` to `CANCELLED`. Zero stock mutation.

---

## 7. Sales Challan Confirmation Endpoints (Phase 8 - Planned)

- `POST /api/v1/challans/:id/confirm` — Confirmation, stock deduction, and automatic OUT movement generation.
