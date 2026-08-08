# Backend & Frontend System Architecture

This document defines the architectural blueprint for the **Mini ERP + CRM Operations Portal**.

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
|  PostgreSQL Database (Hosted on Neon / Supabase)                     |
+-----------------------------------------------------------------------+
```

---

## 2. Backend Layered Architecture

The backend follows a clean, decoupled 5-tier architecture to promote separation of concerns, testability, and maintainability.

```
Client Request
      │
      ▼
+-----------------------+
|      Routes Layer     | Mapping URI paths & HTTP methods to controllers
+-----------------------+
      │
      ▼
+-----------------------+
|   Middleware Layer    | JWT Verification, RBAC Permission Check, Validation
+-----------------------+
      │
      ▼
+-----------------------+
|   Controller Layer    | HTTP request extraction, status codes, response formatting
+-----------------------+
      │
      ▼
+-----------------------+
|     Service Layer     | Business logic, validation rules, DB transactions
+-----------------------+
      │
      ▼
+-----------------------+
|  Data Layer (Prisma)  | Type-safe queries, schema enforcement, ORM operations
+-----------------------+
      │
      ▼
   PostgreSQL
```

### Layer Responsibilities

1. **Routes (`/src/routes`)**
   - Pure routing definitions (`express.Router()`).
   - Attaches relevant validation schemas and auth/RBAC middleware to endpoints.
   - Maps HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) to specific controller methods.

2. **Middleware (`/src/middleware`)**
   - `authenticate.ts`: Validates JWT token from the `Authorization: Bearer <token>` header, decodes payload, and attaches `req.user`.
   - `authorize.ts`: Enforces role-based permissions (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) against the target endpoint.
   - `validate.ts`: Validates incoming payload (`req.body`, `req.params`, `req.query`) using Zod or Joi schemas before hitting the controller.
   - `errorHandler.ts`: Global error handler that traps thrown exceptions, formats standardized JSON error responses, and prevents internal stack trace leaks.

3. **Controllers (`/src/controllers`)**
   - Responsible strictly for HTTP protocol handling.
   - Extracts data from `req.body`, `req.params`, and `req.query`.
   - Delegates business execution to the Service layer.
   - Formats API responses (`res.status(200).json(...)`, `res.status(201).json(...)`).

4. **Services (`/src/services`)**
   - Contains 100% of core business logic.
   - Controls complex operations, such as checking stock availability and wrapping multi-step stock mutations inside Prisma interactive transactions (`prisma.$transaction`).
   - Throws domain-specific application errors (`NotFoundError`, `BadRequestError`, `InsufficientStockError`).

5. **Data Layer (`/src/db` / Prisma)**
   - Manages connections to PostgreSQL via Prisma Client.
   - Encapsulates database models, relationships, and queries.

---

## 3. Frontend Architecture

The frontend is structured as a single-page application (SPA) using React, TypeScript, and Vite.

```
src/
├── api/             # Axios instance, endpoints, HTTP request functions
├── assets/          # Static images, icons, and styling assets
├── components/      # Reusable UI components (Buttons, Inputs, Modals, Tables)
├── context/         # AuthContext (user session, login/logout, tokens)
├── hooks/           # Custom React hooks (useAuth, useFetch, useDebounce)
├── layouts/         # AppLayout, AuthLayout, Sidebar, Navbar
├── pages/           # Page view components (Dashboard, Customers, Challans)
├── routes/          # AppRouter, ProtectedRoute, RoleGuard
├── types/           # TypeScript interfaces, DTOs, Enums
└── utils/           # Helper functions (currency formatting, date formatters)
```

### Key Frontend Patterns

- **Authentication State & Storage:** JWT token is stored securely in `localStorage` or `sessionStorage` and managed globally via `AuthContext`.
- **Axios HTTP Client Interceptor:** Automatically attaches `Authorization: Bearer <token>` to outbound requests and handles `401 Unauthorized` errors by redirecting to `/login`.
- **Route Guarding:** 
  - `ProtectedRoute`: Redirects unauthenticated users to `/login`.
  - `RoleGuard`: Restricts page visibility based on the logged-in user's role (e.g., hiding `/challans/new` from `WAREHOUSE` role).

---

## 4. Cross-Cutting Concerns

### Error Handling Standard

All backend errors follow a unified API response structure:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Product SKU-1002 has insufficient stock. Available: 5, Requested: 12",
    "details": [
      {
        "productId": "prod_123",
        "sku": "SKU-1002",
        "requested": 12,
        "available": 5
      }
    ]
  },
  "timestamp": "2026-08-08T15:30:00Z"
}
```

### Logging & Environment Configuration

- **Configuration:** Managed via `dotenv` loading environment variables (`PORT`, `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`).
- **Logging:** Structured logging for HTTP requests using `morgan` and application error logging via `winston` or `pino`.
