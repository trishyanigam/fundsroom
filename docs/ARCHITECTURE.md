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

### 2.5 Admin Dashboard Analytics Pipeline (`GET /api/v1/dashboard/summary`)

```
Dashboard UI (`DashboardPage.tsx`)
   │
   ▼ (HTTP Header: Authorization Bearer JWT)
Dashboard REST API (`GET /api/v1/dashboard/summary`)
   │
   ▼
Auth Middleware (`authenticateToken`)
   │
   ▼
Dashboard Controller (`dashboardController.ts`)
   │
   ▼
Dashboard Service (`dashboardService.ts`)
   │
   ▼ (Concurrent Prisma Queries via Promise.all)
PostgreSQL Database
```
