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

- `POST /api/v1/auth/register` — Registers new user account (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
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

### 4.1 List / Search / Filter Products
- **Endpoint:** `GET /api/v1/products` (and `/api/products`)
- **Access:** Authenticated (`ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` allowed)
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
  - `search` (searches `name`, `sku`, `category`)
  - `category` (exact string match)
  - `warehouseLocation` (exact location match)
  - `lowStock` (`true` returns products where `currentStock <= minimumStock`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "prod_101",
        "name": "Laptop Stand Ergonomic",
        "sku": "LAP-STAND-001",
        "category": "Electronics",
        "unitPrice": 1850.00,
        "currentStock": 25,
        "minimumStock": 5,
        "warehouseLocation": "Delhi Main Warehouse - Shelf B1"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
  ```

### 4.2 Get Product Detail
- **Endpoint:** `GET /api/v1/products/:id` (and `/api/products/:id`)
- **Access:** Authenticated (`ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` allowed)
- **Success Response (`200 OK`):** Returns single product object.
- **Failure Response (`404 Not Found`):** `{ "success": false, "message": "Product not found" }`

### 4.3 Create Product
- **Endpoint:** `POST /api/v1/products` (and `/api/products`)
- **Access:** `ADMIN`, `WAREHOUSE` (`SALES` & `ACCOUNTS` return `403 Forbidden`)
- **Request Body:**
  ```json
  {
    "name": "Laptop Stand Ergonomic",
    "sku": "LAP-STAND-001",
    "category": "Electronics",
    "unitPrice": 1850.00,
    "currentStock": 25,
    "minimumStock": 5,
    "warehouseLocation": "Delhi Main Warehouse - Shelf B1"
  }
  ```
- **Success Response (`201 Created`):** Returns created product record.
- **Duplicate SKU Collision (`409 Conflict`):** `{ "success": false, "message": "Product SKU already exists" }`

### 4.4 Update Product Metadata (Excludes Stock Edits)
- **Endpoint:** `PUT /api/v1/products/:id` (and `/api/products/:id`)
- **Access:** `ADMIN`, `WAREHOUSE` (`SALES` & `ACCOUNTS` return `403 Forbidden`)
- **Restriction:** Direct modification of `currentStock` via update endpoint is restricted to preserve inventory integrity. Stock movements are managed via Phase 6 Inventory module.
- **Success Response (`200 OK`):** Returns updated product record.

---

## 5. Inventory Endpoints (Phase 6 - Planned)

- `GET /api/v1/inventory/movements`
- `POST /api/v1/inventory/movements`

---

## 6. Sales Challan Endpoints (Phase 7 & 8 - Planned)

- `GET /api/v1/challans`
- `POST /api/v1/challans`
- `POST /api/v1/challans/:id/confirm`
