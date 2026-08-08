# Backend & Frontend System Architecture

This document defines the architectural blueprint, authentication flow, role-based access control, and layer responsibilities for the **Mini ERP + CRM Operations Portal**.

---

## 1. System Overview & Technology Stack

The application uses a decoupled, full-stack architecture comprising a Node.js/Express REST API backend and a single-page React frontend.

```
+-----------------------------------------------------------------------+
|                            CLIENT SIDE                                |
|  React (TypeScript) + Vite + Tailwind CSS                              |
|  - Axios API Client (with Bearer Token Interceptor)                   |
|  - Auth State / Context & Role-Based UI Rendering                      |
+-----------------------------------------------------------------------+
                                  │
                                  │ HTTP / HTTPS (REST API, JSON)
                                  ▼
+-----------------------------------------------------------------------+
|                            BACKEND SIDE                               |
|  Node.js + Express (TypeScript)                                       |
|  - JWT Authentication Middleware & RBAC Authorization Middleware      |
|  - Express Controllers & Service Layer (Business Logic & Transactions)|
|  - Prisma ORM Data Layer                                              |
+-----------------------------------------------------------------------+
                                  │
                                  │ PostgreSQL Wire Protocol
                                  ▼
+-----------------------------------------------------------------------+
|                            DATABASE                                   |
|  PostgreSQL Database (Hosted on Neon / Supabase / Local)             |
+-----------------------------------------------------------------------+
```

---

## 2. Module Execution Pipelines

### 2.1 User Login Pipeline (`POST /api/v1/auth/login`)
`Client -> Routes -> Auth Controller -> Service -> Bcrypt -> JWT -> Return HTTP 200 OK`

### 2.2 Customer CRM Pipeline (`POST /api/v1/customers`)
`Customer UI -> Axios -> Customer API -> Auth/RBAC -> Controller -> Service -> Prisma ORM -> PostgreSQL`

### 2.3 Product Management Pipeline (`POST /api/v1/products`)
`Product UI -> Axios -> Product API -> Auth/RBAC -> Controller -> Service (SKU Check) -> Prisma ORM -> PostgreSQL`

### 2.4 Inventory & Stock Movements Pipeline (`POST /api/v1/inventory/movements`)

```
Inventory UI (`InventoryPage.tsx` / `MovementFormModal.tsx`)
   │
   ▼ (HTTP Header: Authorization Bearer JWT)
Inventory REST API (`POST /api/v1/inventory/movements`)
   │
   ▼
Auth Middleware (`authenticateToken`) ── Invalid JWT ──► Return HTTP 401 Unauthorized
   │
   ▼
RBAC Middleware (`authorizeRoles("ADMIN", "WAREHOUSE")`) ── Unauthorized Role ──► Return HTTP 403 Forbidden
   │
   ▼
Inventory Controller (`inventoryController.ts`)
   │
   ▼
Inventory Validator (`inventoryValidator.ts`) ── Invalid Payload ──► Return HTTP 400 Bad Request
   │
   ▼
Inventory Service (`inventoryService.ts`)
   │
   ▼
Prisma Interactive Transaction (`prisma.$transaction`)
   ├── 1. Check Product existence & stock availability (If OUT & Stock < Qty -> Rollback -> HTTP 409)
   ├── 2. Atomic Stock Update (`Product.currentStock` +/- quantity)
   └── 3. Create StockMovement Audit Record (`createdById = req.user.id`)
   │
   ▼
PostgreSQL Database (Committed Atomically)
```

---

## 3. Backend Layered Architecture

1. **Routes (`/src/routes`)**: Maps URI paths (`/api/v1/inventory/movements`) and attaches `authenticateToken` / `authorizeRoles` middlewares.
2. **Middleware (`/src/middleware`)**: `authMiddleware.ts` (JWT token verify) and `roleMiddleware.ts` (RBAC rules).
3. **Controllers (`/src/controllers`)**: HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`).
4. **Services (`/src/services`)**: Business logic, Prisma interactive transactions, and audit log queries.
5. **Data Layer (`/src/db` / Prisma)**: Type-safe database persistence.
