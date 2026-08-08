# REST API Specifications & Blueprint

This document defines the RESTful API endpoints, HTTP request/response payloads, query parameters, authentication headers, error codes, and validation rules for the **Mini ERP + CRM Operations Portal**.

---

## 1. Global API Standards

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`
- **Pagination Format:** Standard `page` (default: 1) and `limit` (default: 10, max: 100) query parameters.
- **Success Response Structure:**
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
  }
  ```

---

## 2. Authentication Endpoints

### 2.1 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "sales@distro.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "usr_99812",
        "name": "Alex Vance",
        "email": "sales@distro.com",
        "role": "SALES"
      }
    }
  }
  ```

### 2.2 Current User Profile
- **Endpoint:** `GET /api/v1/auth/me`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_99812",
      "name": "Alex Vance",
      "email": "sales@distro.com",
      "role": "SALES"
    }
  }
  ```

---

## 3. Customer CRM Endpoints

### 3.1 List / Search Customers
- **Endpoint:** `GET /api/v1/customers`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Query Params:** `search`, `status` (`LEAD`, `ACTIVE`, `INACTIVE`), `customerType` (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), `page`, `limit`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cust_102",
        "customerName": "Acme Retail Ltd",
        "mobile": "+919876543210",
        "email": "contact@acmeretail.com",
        "businessName": "Acme Group",
        "gstNumber": "27AAACA12341ZV",
        "customerType": "WHOLESALE",
        "status": "ACTIVE",
        "followUpDate": "2026-08-15T00:00:00.000Z"
      }
    ],
    "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
  }
  ```

### 3.2 Get Customer Detail
- **Endpoint:** `GET /api/v1/customers/:id`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

### 3.3 Create Customer
- **Endpoint:** `POST /api/v1/customers`
- **Access:** `ADMIN`, `SALES`
- **Request Body:**
  ```json
  {
    "customerName": "Apex Logistics",
    "mobile": "+919123456789",
    "email": "info@apexlogistics.com",
    "businessName": "Apex Logistics Private Limited",
    "gstNumber": "07AAAAA0000A1Z5",
    "customerType": "DISTRIBUTOR",
    "address": "42 Commercial Belt, Sector 18, Gurugram, HR",
    "status": "LEAD",
    "followUpDate": "2026-08-20T10:00:00.000Z",
    "notes": "Initial contact made at trade expo."
  }
  ```

### 3.4 Edit Customer
- **Endpoint:** `PUT /api/v1/customers/:id`
- **Access:** `ADMIN`, `SALES`

### 3.5 Add Follow-up Notes
- **Endpoint:** `POST /api/v1/customers/:id/notes`
- **Access:** `ADMIN`, `SALES`
- **Request Body:**
  ```json
  {
    "notes": "Discussed bulk pricing tier for Q4 orders.",
    "followUpDate": "2026-09-01T14:30:00.000Z"
  }
  ```

---

## 4. Product Catalog Endpoints

### 4.1 List Products
- **Endpoint:** `GET /api/v1/products`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Query Params:** `search`, `category`, `lowStock` (`true`/`false`), `page`, `limit`

### 4.2 Get Product Detail
- **Endpoint:** `GET /api/v1/products/:id`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

### 4.3 Create Product
- **Endpoint:** `POST /api/v1/products`
- **Access:** `ADMIN`, `WAREHOUSE`
- **Request Body:**
  ```json
  {
    "productName": "Industrial Fastener M8",
    "sku": "FAST-M8-001",
    "category": "Hardware",
    "unitPrice": 45.50,
    "currentStock": 500,
    "minStockAlert": 50,
    "warehouseLocation": "Aisle 4, Rack B2"
  }
  ```

### 4.4 Edit Product
- **Endpoint:** `PUT /api/v1/products/:id`
- **Access:** `ADMIN`, `WAREHOUSE`

---

## 5. Inventory & Stock Movement Endpoints

### 5.1 List Stock Movements Log
- **Endpoint:** `GET /api/v1/inventory/movements`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Query Params:** `productId`, `movementType` (`IN`, `OUT`), `startDate`, `endDate`, `page`, `limit`

### 5.2 Create Manual Stock Movement
- **Endpoint:** `POST /api/v1/inventory/movements`
- **Access:** `ADMIN`, `WAREHOUSE`
- **Request Body:**
  ```json
  {
    "productId": "prod_4581",
    "quantityChanged": 100,
    "movementType": "IN",
    "reason": "Supplier shipment received invoice #INV-8891"
  }
  ```

---

## 6. Sales Challan Endpoints

### 6.1 List Challans
- **Endpoint:** `GET /api/v1/challans`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Query Params:** `status` (`DRAFT`, `CONFIRMED`, `CANCELLED`), `customerId`, `search`, `page`, `limit`

### 6.2 Get Challan Detail
- **Endpoint:** `GET /api/v1/challans/:id`
- **Access:** Authenticated (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)

### 6.3 Create Draft Challan
- **Endpoint:** `POST /api/v1/challans`
- **Access:** `ADMIN`, `SALES`
- **Request Body:**
  ```json
  {
    "customerId": "cust_102",
    "items": [
      {
        "productId": "prod_4581",
        "quantity": 10
      },
      {
        "productId": "prod_9920",
        "quantity": 5
      }
    ]
  }
  ```
- **Backend Note:** Resolves product snapshot details (`productName`, `sku`, `unitPrice`) from current catalog and saves Challan in `DRAFT` status with **ZERO stock deduction**.

### 6.4 Confirm Challan (Atomic Stock Deduction)
- **Endpoint:** `POST /api/v1/challans/:id/confirm`
- **Access:** `ADMIN`, `SALES`
- **Request Body:** Empty `{}`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "chal_8810",
      "challanNumber": "CH-20260808-0001",
      "status": "CONFIRMED",
      "confirmedAt": "2026-08-08T15:45:00.000Z"
    }
  }
  ```
- **Failure Response (400 Bad Request - Insufficient Stock):**
  ```json
  {
    "success": false,
    "error": {
      "code": "INSUFFICIENT_STOCK",
      "message": "Cannot confirm challan. Stock insufficient for one or more items.",
      "details": [
        {
          "sku": "FAST-M8-001",
          "productName": "Industrial Fastener M8",
          "requested": 500,
          "available": 120
        }
      ]
    }
  }
  ```

### 6.5 Cancel Challan
- **Endpoint:** `POST /api/v1/challans/:id/cancel`
- **Access:** `ADMIN`, `SALES`
