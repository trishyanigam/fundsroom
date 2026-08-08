# REST API Specifications & Blueprint

This document defines the RESTful API endpoints, HTTP request/response payloads, query parameters, authentication headers, error codes, and validation rules for the **Mini ERP + CRM Operations Portal**.

---

## 1. Global API Standards

- **Base URL:** `/api/v1` (also mounted at `/api` for convenience)
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Pagination Format:** Standard `page` (default: 1) and `limit` (default: 10, max: 100) query parameters.
- **Success Response Structure:**
  ```json
  {
    "success": true,
    "message": "Operation description",
    "data": { ... },
    "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
  }
  ```

---

## 2. Authentication Endpoints (Phase 3 - Implemented ✅)

- `POST /api/v1/auth/register` — Registers new user account (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).
- `POST /api/v1/auth/login` — User login & JWT generation.
- `GET /api/v1/auth/me` — Get current user profile.
- `GET /api/v1/auth/test/admin`, `/sales`, `/warehouse`, `/accounts` — RBAC test routes.

---

## 3. Customer CRM Endpoints (Phase 4 - Implemented ✅)

### 3.1 List / Search / Filter Customers
- **Endpoint:** `GET /api/v1/customers` (and `/api/customers`)
- **Access:** Authenticated (`ADMIN`, `SALES`, `ACCOUNTS` allowed; `WAREHOUSE` forbidden)
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
  - `search` (searches `customerName`, `businessName`, `mobile`, `email`)
  - `status` (`LEAD`, `ACTIVE`, `INACTIVE`)
  - `customerType` (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cust_102",
        "customerName": "Rahul Sharma",
        "mobile": "9876543210",
        "email": "rahul@example.com",
        "businessName": "Sharma Traders",
        "gstNumber": "27AAACA12341ZV",
        "customerType": "WHOLESALE",
        "address": "Delhi",
        "status": "ACTIVE",
        "followUpDate": "2026-08-15T00:00:00.000Z",
        "notes": "Interested in bulk order"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
  ```

### 3.2 Get Customer Detail
- **Endpoint:** `GET /api/v1/customers/:id` (and `/api/customers/:id`)
- **Access:** Authenticated (`ADMIN`, `SALES`, `ACCOUNTS` allowed; `WAREHOUSE` forbidden)
- **Success Response (`200 OK`):** Returns single customer object.
- **Failure Response (`404 Not Found`):** `{ "success": false, "error": { "code": "NOT_FOUND", "message": "Customer not found." } }`

### 3.3 Create Customer
- **Endpoint:** `POST /api/v1/customers` (and `/api/customers`)
- **Access:** `ADMIN`, `SALES` (`ACCOUNTS` & `WAREHOUSE` return `403 Forbidden`)
- **Request Body:**
  ```json
  {
    "customerName": "Rahul Sharma",
    "mobile": "9876543210",
    "email": "rahul@example.com",
    "businessName": "Sharma Traders",
    "gstNumber": "GST123456",
    "customerType": "WHOLESALE",
    "address": "Delhi",
    "status": "ACTIVE",
    "followUpDate": "2026-08-15",
    "notes": "Interested in bulk order"
  }
  ```
- **Success Response (`201 Created`):** Returns created customer record.

### 3.4 Edit Customer (Includes Notes & Follow-up Date)
- **Endpoint:** `PUT /api/v1/customers/:id` (and `/api/customers/:id`)
- **Access:** `ADMIN`, `SALES` (`ACCOUNTS` & `WAREHOUSE` return `403 Forbidden`)
- **Success Response (`200 OK`):** Returns updated customer record.

---

## 4. Product Catalog Endpoints (Phase 5 - Planned)

- `GET /api/v1/products`
- `POST /api/v1/products`
- `PUT /api/v1/products/:id`

---

## 5. Inventory Endpoints (Phase 6 - Planned)

- `GET /api/v1/inventory/movements`
- `POST /api/v1/inventory/movements`

---

## 6. Sales Challan Endpoints (Phase 7 & 8 - Planned)

- `GET /api/v1/challans`
- `POST /api/v1/challans`
- `POST /api/v1/challans/:id/confirm`
- `POST /api/v1/challans/:id/cancel`
