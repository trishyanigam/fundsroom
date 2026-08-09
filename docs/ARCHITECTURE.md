# System Architecture Documentation

This document provides a comprehensive technical overview of the **Mini ERP + CRM Operations Portal** software architecture, component pipeline, security model, and transactional database mechanics.

---

## 1. High-Level Request Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      React SPA Frontend                     │
│               (Vite, Tailwind CSS, Lucide Icons)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST Requests (Axios)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express.js REST API Server                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Authentication Middleware                   │
│                    (JWT Token Validation)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Role Guard Middleware                      │
│             (RBAC: ADMIN, SALES, WAREHOUSE, ACCOUNTS)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Controller Layer                      │
│            (Request Parsing & HTTP Response Mapping)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Service Layer                        │
│            (Business Logic & Transaction Handling)          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         Prisma ORM                          │
│               (Database Query & Type Safety)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                     │
│     (Tables: User, Customer, Product, StockMovement,        │
│              Challan, ChallanItem)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Security Architecture

### 2.1 JWT Authentication
- Passwords are encrypted using **bcrypt** with a salt factor of 10 (`bcrypt.hash(password, 10)`).
- Upon successful login, the server issues a signed **JSON Web Token (JWT)** containing `userId`, `email`, and `role`.
- Incoming protected API calls submit `Authorization: Bearer <token>` headers.
- The `authenticateToken` middleware decodes and verifies the signature using `process.env.JWT_SECRET`. Password hashes and sensitive fields are stripped from user responses.

### 2.2 Role-Based Access Control (RBAC)
Role authorization is enforced at the route level via `requireRole([...allowedRoles])`.

| Feature Area | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Manage Customers (CRUD)** | ✅ | ✅ | ❌ | Read Only |
| **Manage Products (CRUD)** | ✅ | Read Only | Read Only | Read Only |
| **Manage Inventory (IN/OUT)** | ✅ | ❌ | ✅ | Read Only |
| **Create & Update Draft Challan** | ✅ | ✅ | ❌ | ❌ |
| **Confirm Challan (Stock Deduction)**| ✅ | ✅ | ❌ | ❌ |
| **View Challan List & Detail** | ✅ | ✅ | ✅ | ✅ |

Forbidden attempts return standard JSON response:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied. Insufficient permissions for role WAREHOUSE"
  }
}
```

---

## 3. Key Domain Services & Transaction Mechanics

### 3.1 Customer CRM Service
Handles complete customer lifecycle (Create, List, Search, Update). Provides real-time case-insensitive keyword filtering across `name`, `email`, `company`, `phone`, and `city`.

### 3.2 Product Management Service
Manages product SKU uniqueness, pricing, and stock monitoring. Offers low-stock threshold queries (`currentStock <= minStockLevel`) and prevents duplicate SKU collisions.

### 3.3 Inventory Stock Movement Service
Executes manual inventory balance adjustments (`IN` or `OUT`).
- `IN`: Increases `product.currentStock` by quantity.
- `OUT`: Verifies `currentStock >= quantity` before deducting balance. If stock is insufficient, rejects operation with `INSUFFICIENT_STOCK`.

### 3.4 Transactional Challan Confirmation
Challan confirmation is an atomic ACID operation implemented via Prisma Interactive Transactions (`prisma.$transaction`).

**Workflow**:
1. Lock and fetch Challan with nested items.
2. Verify status is strictly `DRAFT`.
3. For every line item, verify product exists and `currentStock >= requestedQuantity`.
4. If stock is insufficient for any item:
   - Abort transaction.
   - Throw `400 Bad Request` (`INSUFFICIENT_STOCK`).
   - Leave product stock, challan status, and movement history untouched.
5. Deduct stock from each `Product` record (`currentStock = currentStock - quantity`).
6. Create corresponding `StockMovement` audit records (`type: "OUT"`, referencing `challanId`).
7. Update `Challan` status to `CONFIRMED`.

### 3.5 Dashboard Aggregation Service
Executes concurrent database aggregate queries (`Promise.all`) to compute total customers, active products, low-stock items count, draft/confirmed/cancelled challan counts, and total sales revenue without blocking server event loops.
