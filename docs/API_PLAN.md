# REST API Specifications & Blueprint

This document defines the RESTful API endpoints, HTTP request/response payloads, query parameters, authentication headers, error codes, and validation rules for the **Mini ERP + CRM Operations Portal**.

---

## 1. Global API Standards

- **Base URL:** `/api/v1` (also mounted at `/api` for convenience)
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`

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

- `POST /api/v1/products` — Create product record.
- `GET /api/v1/products` — List/search/filter products.
- `GET /api/v1/products/:id` — Get product profile by ID.
- `PUT /api/v1/products/:id` — Update product metadata.

---

## 5. Inventory & Stock Movement Endpoints (Phase 6 - Implemented ✅)

- `POST /api/v1/inventory/movements` — Transactional Stock IN (+) or Stock OUT (-) movement.
- `GET /api/v1/inventory/movements` — List/filter stock movement audit log.

---

## 6. Sales Challan Endpoints (Phase 7 & 8 - Implemented ✅)

- `POST /api/v1/challans` — Create draft challan.
- `GET /api/v1/challans` — List/search/filter sales challans.
- `GET /api/v1/challans/:id` — Get sales challan details.
- `PUT /api/v1/challans/:id` — Update draft challan items.
- `PUT /api/v1/challans/:id/cancel` — Cancel draft challan (`DRAFT` -> `CANCELLED`).
- `PUT /api/v1/challans/:id/confirm` — Transactional Challan Confirmation (`DRAFT` -> `CONFIRMED`).

---

## 7. Admin Dashboard Summary Endpoint (Phase 9 - Implemented ✅)

- **Endpoint:** `GET /api/v1/dashboard/summary` (and `/api/dashboard/summary`)
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS` allowed)
- **Response Payload (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "totalCustomers": 125,
      "totalProducts": 48,
      "lowStockProducts": 7,
      "totalChallans": 34,
      "recentChallans": [
        {
          "id": "challan_uuid",
          "challanNumber": "CH-2026-000012",
          "customerName": "ABC Traders",
          "businessName": "ABC Distribution Pvt Ltd",
          "status": "CONFIRMED",
          "totalQuantity": 10,
          "createdAt": "2026-08-08T12:00:00Z"
        }
      ],
      "lowStockItems": [
        {
          "id": "prod_uuid",
          "name": "Mouse",
          "sku": "MSE001",
          "category": "Electronics",
          "currentStock": 2,
          "minimumStock": 5,
          "warehouseLocation": "Bin A2"
        }
      ]
    }
  }
  ```
