# Backend & Frontend System Architecture

This document defines the architectural blueprint, authentication flow, role-based access control, and layer responsibilities for the **Mini ERP + CRM Operations Portal**.

---

## 1. System Overview & Technology Stack

The application uses a decoupled, full-stack architecture comprising a Node.js/Express REST API backend and a single-page React frontend.

---

## 2. Module Execution Pipelines

### 2.1 User Login Pipeline (`POST /api/v1/auth/login`)
`Client -> Routes -> Auth Controller -> Service -> Bcrypt -> JWT -> Return HTTP 200 OK`

### 2.2 Customer CRM Pipeline (`POST /api/v1/customers`)
`Customer UI -> Axios -> Customer API -> Auth/RBAC -> Controller -> Service -> Prisma ORM -> PostgreSQL`

### 2.3 Product Management Pipeline (`POST /api/v1/products`)
`Product UI -> Axios -> Product API -> Auth/RBAC -> Controller -> Service (SKU Check) -> Prisma ORM -> PostgreSQL`

### 2.4 Inventory & Stock Movements Pipeline (`POST /api/v1/inventory/movements`)
`Inventory UI -> Axios -> Inventory API -> Auth/RBAC -> Controller -> Service -> Prisma Transaction -> PostgreSQL`

### 2.5 Sales Challan Confirmation Pipeline (`PUT /api/v1/challans/:id/confirm`)

```
Challan Detail UI (`ChallanDetailPage.tsx`) ──► User Confirms Modal
   │
   ▼ (HTTP Header: Authorization Bearer JWT)
Confirmation REST API (`PUT /api/v1/challans/:id/confirm`)
   │
   ▼
Auth Middleware (`authenticateToken`) ── Invalid JWT ──► Return HTTP 401 Unauthorized
   │
   ▼
RBAC Middleware (`authorizeRoles("ADMIN", "SALES")`) ── Unauthorized Role ──► Return HTTP 403 Forbidden
   │
   ▼
Challan Controller (`challanController.ts`)
   │
   ▼
Challan Service (`confirmChallanService`)
   │
   ▼
Prisma Interactive Transaction (`prisma.$transaction`)
   ├── 1. Check Challan status == DRAFT (Return 409 Conflict if CONFIRMED or CANCELLED)
   ├── 2. Pre-Check stock for ALL items (If ANY item stock < qty -> ABORT & ROLLBACK -> 409 Conflict)
   ├── 3. Decrement Product.currentStock for all items (Row-level conditional update)
   ├── 4. Create OUT StockMovement audit records (createdById = req.user.id)
   └── 5. Update Challan.status = CONFIRMED
   │
   ▼
PostgreSQL Database (Committed Atomically)
```

---

## 3. Concurrency & Locking Strategy

- **Interactive Transaction Isolation**: Confirmation operations execute inside `prisma.$transaction(async (tx) => { ... })`.
- **Atomic Conditional Updates**: Stock decrement operations use `updateMany` with condition `currentStock: { gte: item.quantity }`. If `updateMany.count === 0` (indicating stock was modified concurrently by another thread), the transaction throws an error and rolls back cleanly.
