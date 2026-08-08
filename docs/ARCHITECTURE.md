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

```
Client (JSON Body: email, password)
   │
   ▼
Routes Layer (`authRoutes.ts`)
   │
   ▼
Auth Controller (`authController.ts`)
   │
   ▼
Validator (`validateLoginInput`) ─── Invalid Format ──► Return HTTP 400 Bad Request
   │ (Valid Format)
   ▼
Auth Service (`authService.ts`)
   │
   ├─► Prisma ORM (`prisma.user.findUnique`)
   │      │
   │      └─► PostgreSQL DB (Fetch user record by email)
   │
   ├─► Bcrypt Verification (`comparePassword`) ─── Invalid Match ──► Return HTTP 401 Unauthorized
   │
   └─► JWT Signing (`generateToken`)
          │
          ▼
Return HTTP 200 OK
```

### 2.2 Customer CRM Pipeline (Phase 4 Implemented)

```
Customer UI (`CustomerListPage.tsx` / `CustomerDetailPage.tsx`)
   │
   ▼
Axios Service (`frontend/src/services/customerService.ts`)
   │
   ▼ (HTTP Header: Authorization Bearer JWT)
Customer REST API (`GET /api/v1/customers` or `POST /api/v1/customers`)
   │
   ▼
Auth Middleware (`authenticateToken`) ── Invalid JWT ──► Return HTTP 401 Unauthorized
   │
   ▼
RBAC Middleware (`authorizeRoles("ADMIN", "SALES")`) ── Unauthorized Role ──► Return HTTP 403 Forbidden
   │
   ▼
Customer Controller (`customerController.ts`)
   │
   ▼
Customer Validator (`customerValidator.ts`) ── Validation Failure ──► Return HTTP 400 Bad Request
   │
   ▼
Customer Service (`customerService.ts`)
   │
   ▼
Prisma ORM (`prisma.customer`)
   │
   ▼
PostgreSQL Database
```

---

## 3. Backend Layered Architecture

The backend follows a clean, decoupled 5-tier architecture:

1. **Routes (`/src/routes`)**: Maps URI paths (`/api/v1/customers`) to controllers and attaches `authenticateToken` / `authorizeRoles` middlewares.
2. **Middleware (`/src/middleware`)**: 
   - `authMiddleware.ts`: Validates Bearer token and attaches `req.user`.
   - `roleMiddleware.ts`: Enforces RBAC permissions per route.
3. **Controllers (`/src/controllers`)**: Standard HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`) and JSON response formatting.
4. **Services (`/src/services`)**: Business logic, query filtering, pagination math, and Prisma database operations.
5. **Data Layer (`/src/db` / Prisma)**: Manages type-safe queries and schema constraints.
