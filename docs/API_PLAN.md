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

### 5.1 Create Stock Movement (IN or OUT)
- **Endpoint:** `POST /api/v1/inventory/movements` (and `/api/inventory/movements`)
- **Access:** `ADMIN`, `WAREHOUSE` (`SALES` & `ACCOUNTS` return `403 Forbidden`)
- **Transaction Guarantee:** Executed within interactive Prisma Transaction (`prisma.$transaction`). Atomically adjusts `Product.currentStock` and creates `StockMovement`.
- **Negative Stock Protection:** For `OUT` movements, if `currentStock < quantity`, returns `409 Conflict` (or `400 Bad Request`) and rolls back the transaction.
- **Created By Attrib:** `createdById` bound to authenticated JWT user ID.
- **Request Body:**
  ```json
  {
    "productId": "prod_101",
    "quantity": 50,
    "movementType": "IN",
    "reason": "New stock shipment received from vendor"
  }
  ```
- **Success Response (`201 Created`):** Returns created stock movement record.

### 5.2 Get Stock Movements Audit Log
- **Endpoint:** `GET /api/v1/inventory/movements` (and `/api/inventory/movements`)
- **Access:** Authenticated (`ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` allowed)
- **Query Params:** `page`, `limit`, `productId`, `movementType` (`IN`/`OUT`), `fromDate`, `toDate`.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "mov_101",
        "productId": "prod_101",
        "quantity": 50,
        "movementType": "IN",
        "reason": "New stock shipment received from vendor",
        "createdAt": "2026-08-08T12:00:00.000Z",
        "product": { "name": "Laptop Stand Ergonomic", "sku": "LAP-STAND-001" },
        "createdBy": { "name": "Warehouse Admin", "email": "warehouse@erp.local" }
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
  ```

### 5.3 Get Stock Movement Detail
- **Endpoint:** `GET /api/v1/inventory/movements/:id` (and `/api/inventory/movements/:id`)
- **Access:** Authenticated (`ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` allowed)
- **Success Response (`200 OK`):** Returns single movement audit record.

*(Note: Stock Movements are immutable audit records. No PUT or DELETE endpoints exist.)*

---

## 6. Sales Challan Endpoints (Phase 7 & 8 - Planned)

- `GET /api/v1/challans`
- `POST /api/v1/challans`
- `POST /api/v1/challans/:id/confirm`
