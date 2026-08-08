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

## 2. Authentication & Authorization Flow

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
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "...", "user": { "id": "...", "name": "...", "email": "...", "role": "SALES" } }
}
```

### 2.2 Protected Route & RBAC Authorization Pipeline

```
Client (HTTP Request with Header: Authorization: Bearer <JWT>)
   │
   ▼
Routes Layer
   │
   ▼
Auth Middleware (`authenticateToken`)
   │
   ├─► Verify Header ("Bearer <token>") ─── Missing/Malformed ──► Return HTTP 401 Unauthorized
   ├─► Verify Signature & Expiration (`verifyToken`) ─── Invalid/Expired ──► Return HTTP 401 Unauthorized
   └─► Attach Payload to `req.user`
          │
          ▼
Role Middleware (`authorizeRoles("ADMIN", "SALES")`)
   │
   ├─► Check `req.user.role` against permitted roles
   └─► Role Not Permitted ─── Forbidden ──► Return HTTP 403 Forbidden
          │
          ▼ (Role Authorized)
Controller Layer (HTTP payload parsing)
   │
   ▼
Service Layer (Business Logic & Transactions)
   │
   ▼
Prisma ORM & PostgreSQL
```

---

## 3. Backend Layered Architecture

The backend follows a clean, decoupled 5-tier architecture:

1. **Routes (`/src/routes`)**: Maps URI paths (`/api/v1/auth`) to controllers and attaches `authenticateToken` / `authorizeRoles` middlewares.
2. **Middleware (`/src/middleware`)**: 
   - `authMiddleware.ts`: Validates Bearer token and attaches `req.user`.
   - `roleMiddleware.ts`: Enforces RBAC permissions per route.
3. **Controllers (`/src/controllers`)**: Standard HTTP status codes (`200`, `400`, `401`, `403`, `500`) and JSON response formatting.
4. **Services (`/src/services`)**: Business logic, password verification, JWT generation, and Prisma database queries.
5. **Data Layer (`/src/db` / Prisma)**: Manages type-safe queries and schema constraints.
