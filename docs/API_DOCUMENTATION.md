# Mini ERP + CRM Operations Portal — REST API Documentation

## Overview & Base URLs

- **Local API Base URL**: `http://localhost:5000/api` (or `http://localhost:5000/api/v1`)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (for protected endpoints)

---

## Authentication & Authorization

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Authentication**: None (Public)
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "API is healthy"
}
```

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "email": "admin@erp.local",
  "password": "AdminPass123!"
}
```
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm...1",
      "name": "System Administrator",
      "email": "admin@erp.local",
      "role": "ADMIN",
      "createdAt": "2026-08-09T14:00:00.000Z"
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing email or password
  - `401 Unauthorized`: Invalid credentials

### 3. Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Authentication**: Bearer JWT (All authenticated roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`)
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm...1",
    "name": "System Administrator",
    "email": "admin@erp.local",
    "role": "ADMIN",
    "createdAt": "2026-08-09T14:00:00.000Z"
  }
}
```

---

## Customer CRM Endpoints

### 1. Create Customer
- **Endpoint**: `POST /api/customers`
- **Authentication**: `ADMIN`, `SALES`
- **Forbidden**: `WAREHOUSE`, `ACCOUNTS` (403 Forbidden)
- **Request Body**:
```json
{
  "name": "Acme Global Corp",
  "email": "contact@acmeglobal.com",
  "phone": "+1-555-0199",
  "company": "Acme Global Inc.",
  "address": "742 Evergreen Terrace",
  "city": "Metropolis",
  "state": "NY",
  "pincode": "10001",
  "gstin": "27AAAAA0000A1Z5"
}
```
- **Success Response**: `201 Created`

### 2. List & Search Customers
- **Endpoint**: `GET /api/customers?search=Acme&page=1&limit=10`
- **Authentication**: `ADMIN`, `SALES`, `ACCOUNTS`
- **Forbidden**: `WAREHOUSE` (403 Forbidden)
- **Query Params**:
  - `search` (optional): Filter by name, email, phone, company
  - `page` (optional): Default `1`
  - `limit` (optional): Default `10`
- **Success Response**: `200 OK`

### 3. Get Customer By ID
- **Endpoint**: `GET /api/customers/:id`
- **Authentication**: `ADMIN`, `SALES`, `ACCOUNTS`
- **Forbidden**: `WAREHOUSE` (403 Forbidden)

### 4. Update Customer
- **Endpoint**: `PUT /api/customers/:id`
- **Authentication**: `ADMIN`, `SALES`
- **Forbidden**: `WAREHOUSE`, `ACCOUNTS` (403 Forbidden)

---

## Product Catalog Endpoints

### 1. Create Product
- **Endpoint**: `POST /api/products`
- **Authentication**: `ADMIN`
- **Forbidden**: `SALES`, `WAREHOUSE`, `ACCOUNTS` (403 Forbidden)
- **Request Body**:
```json
{
  "sku": "PROD-1001",
  "name": "Industrial Server Rack 42U",
  "description": "Heavy duty cabinet",
  "price": 1250.00,
  "unit": "PCS",
  "initialStock": 50,
  "minStockLevel": 10,
  "imageUrl": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
}
```

### 2. List / Search / Filter Products
- **Endpoint**: `GET /api/products?search=Server&lowStock=true&page=1&limit=10`
- **Authentication**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`
- **Query Params**:
  - `search`: Filter by name, SKU, description
  - `lowStock`: Set to `true` to filter products where `currentStock <= minStockLevel`

### 3. Get Product By ID
- **Endpoint**: `GET /api/products/:id`
- **Authentication**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

### 4. Update Product
- **Endpoint**: `PUT /api/products/:id`
- **Authentication**: `ADMIN`

---

## Inventory & Stock Movement Endpoints

### 1. Create Stock Movement (IN / OUT)
- **Endpoint**: `POST /api/inventory/movements`
- **Authentication**: `ADMIN`, `WAREHOUSE`
- **Forbidden**: `SALES`, `ACCOUNTS` (403 Forbidden)
- **Request Body**:
```json
{
  "productId": "cm...prod1",
  "type": "IN",
  "quantity": 25,
  "notes": "Factory replenishment shipment"
}
```
- **Validation**:
  - `type` must be `"IN"` or `"OUT"`.
  - For `"OUT"`, if `quantity > currentStock`, returns `400 Bad Request` (`INSUFFICIENT_STOCK`).

### 2. List Stock Movements
- **Endpoint**: `GET /api/inventory/movements?productId=...&type=IN&page=1&limit=10`
- **Authentication**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

### 3. Get Movement By ID
- **Endpoint**: `GET /api/inventory/movements/:id`
- **Authentication**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

---

## Sales Challan Endpoints

### 1. Create Draft Challan
- **Endpoint**: `POST /api/challans`
- **Authentication**: `ADMIN`, `SALES`
- **Forbidden**: `WAREHOUSE`, `ACCOUNTS` (403 Forbidden)
- **Request Body**:
```json
{
  "customerId": "cm...cust1",
  "notes": "Urgent sales delivery",
  "items": [
    {
      "productId": "cm...prod1",
      "quantity": 2,
      "unitPrice": 1250.00
    }
  ]
}
```
- **Output**: Returns new Challan object with `status: "DRAFT"`.

### 2. List Challans
- **Endpoint**: `GET /api/challans?status=DRAFT&customerId=...&page=1&limit=10`
- **Authentication**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

### 3. Get Challan By ID
- **Endpoint**: `GET /api/challans/:id`
- **Authentication**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`

### 4. Update Draft Challan
- **Endpoint**: `PUT /api/challans/:id`
- **Authentication**: `ADMIN`, `SALES`
- **Restriction**: Challans with `CONFIRMED` or `CANCELLED` status return `400 Bad Request` (`IMMUTABLE_CHALLAN`).

### 5. Cancel Draft Challan
- **Endpoint**: `POST /api/challans/:id/cancel`
- **Authentication**: `ADMIN`, `SALES`

### 6. Confirm Challan (Transactional Stock Deduction)
- **Endpoint**: `POST /api/challans/:id/confirm`
- **Authentication**: `ADMIN`, `SALES`
- **Transaction Flow**:
  1. Validates `status == DRAFT`.
  2. For every item, checks `product.currentStock >= item.quantity`.
  3. If stock insufficient for any item, throws `400 Bad Request` (`INSUFFICIENT_STOCK`) and rolls back transaction.
  4. Deducts stock from each Product record (`currentStock = currentStock - quantity`).
  5. Creates `StockMovement` records with `type: "OUT"`, referencing `challanId`.
  6. Updates `Challan` status to `"CONFIRMED"`.
  7. Returns updated Challan with nested items and stock movements.

---

## Dashboard Endpoints

### 1. Get Summary Metrics
- **Endpoint**: `GET /api/dashboard/summary`
- **Authentication**: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "totalCustomers": 12,
    "totalProducts": 28,
    "lowStockCount": 3,
    "totalChallans": 15,
    "draftChallansCount": 4,
    "confirmedChallansCount": 10,
    "cancelledChallansCount": 1,
    "totalSalesValue": 45890.50,
    "recentChallans": [],
    "lowStockProducts": []
  }
}
```
