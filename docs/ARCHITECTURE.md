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

### 2.5 Sales Challan Pipeline (`POST /api/v1/challans`)

```
Challan UI (`ChallanFormPage.tsx`)
   │
   ▼ (HTTP Header: Authorization Bearer JWT)
Challan REST API (`POST /api/v1/challans`)
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
Challan Validator (`challanValidator.ts`) ── Direct CONFIRMED Attempt or Invalid Payload ──► Return HTTP 400 Bad Request
   │
   ▼
Challan Service (`challanService.ts`)
   │
   ▼
Prisma Interactive Transaction (`prisma.$transaction`)
   ├── 1. Verify Customer & Product existence
   ├── 2. Capture Product Snapshot (`productName`, `sku`, `unitPrice`)
   ├── 3. Auto-Generate Unique Challan Number (`CH-YYYY-XXXXXX`)
   ├── 4. Server-Side Summation of `totalQuantity`
   └── 5. Create Challan (status = DRAFT) & ChallanItem records
   │
   ▼ (ZERO STOCK MUTATION: Product.currentStock remains 100% untouched)
PostgreSQL Database
```

---

## 3. Backend Layered Architecture

1. **Routes (`/src/routes`)**: Maps URI paths (`/api/v1/challans`) and attaches `authenticateToken` / `authorizeRoles` middlewares.
2. **Middleware (`/src/middleware`)**: `authMiddleware.ts` (JWT token verify) and `roleMiddleware.ts` (RBAC rules).
3. **Controllers (`/src/controllers`)**: HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`).
4. **Services (`/src/services`)**: Business logic, product snapshot capture, challan number generation, and Prisma transactions.
5. **Data Layer (`/src/db` / Prisma)**: Type-safe database persistence.
