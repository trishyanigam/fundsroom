# Mini ERP + CRM Operations Portal

## Project Overview

The **Mini ERP + CRM Operations Portal** is a full-stack case study application built for a wholesale and distribution enterprise. The system manages core operations including customer relationships (CRM), product cataloging, inventory stock movement tracking, and sales challan voucher management with atomic transactional stock logic.

The portal enforces role-based access control (RBAC) across four distinct internal enterprise roles: **ADMIN**, **SALES**, **WAREHOUSE**, and **ACCOUNTS**.

---

## Current Status

**PHASE 7 - Sales Challan Management Module Complete**

Sales Challan REST APIs, payload validation, auto-generated unique challan numbers (`CH-YYYY-XXXXXX`), historical product price & SKU snapshot preservation, zero stock mutation on draft operations, role-based authorization (`ADMIN` & `SALES` full draft access; `WAREHOUSE` & `ACCOUNTS` read-only), React Sales Challan List, Form, & Detail pages, and Postman collection are fully implemented and verified.

*(Note: Sales Challan confirmation and transactional stock deduction will be implemented in Phase 8).*

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js
- **Database ORM:** Prisma ORM
- **Database Engine:** PostgreSQL
- **Security:** JSON Web Tokens (`jsonwebtoken`), Bcrypt (`bcryptjs`)

### Frontend
- **Framework:** React (v18)
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

---

## Implemented Modules

### 1. Customer CRM Module (Phase 4)
- **APIs:** `POST /api/v1/customers`, `GET /api/v1/customers`, `GET /api/v1/customers/:id`, `PUT /api/v1/customers/:id`
- **Features:** Customer registration, multi-field search (`customerName`, `businessName`, `mobile`, `email`), status filters (`LEAD`, `ACTIVE`, `INACTIVE`), customer type filters (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), follow-up dates & notes timeline.
- **RBAC:** `ADMIN` & `SALES` (Full CRUD), `ACCOUNTS` (Read-only), `WAREHOUSE` (Restricted `403`).

### 2. Product Management Module (Phase 5)
- **APIs:** `POST /api/v1/products`, `GET /api/v1/products`, `GET /api/v1/products/:id`, `PUT /api/v1/products/:id`
- **Features:** Catalog SKU management, unique SKU collision prevention (`409 Conflict`), category & warehouse bin location filters, low-stock filter alerts (`currentStock <= minimumStock`), stock update immunity.
- **RBAC:** `ADMIN` & `WAREHOUSE` (Full CRUD), `SALES` & `ACCOUNTS` (Read-only).

### 3. Inventory & Stock Movements Module (Phase 6)
- **APIs:** `POST /api/v1/inventory/movements`, `GET /api/v1/inventory/movements`, `GET /api/v1/inventory/movements/:id`
- **Features:** Transactional Stock IN (+) and Stock OUT (-) logged within Prisma interactive transactions (`prisma.$transaction`), negative stock rejection (`409 Conflict`), immutable audit history, authenticated JWT `createdById` attribution.
- **RBAC:** `ADMIN` & `WAREHOUSE` (Create & View), `SALES` & `ACCOUNTS` (Audit Log Read-Only).

### 4. Sales Challan Management Module (Phase 7)
- **APIs:** `POST /api/v1/challans`, `GET /api/v1/challans`, `GET /api/v1/challans/:id`, `PUT /api/v1/challans/:id`, `PUT /api/v1/challans/:id/cancel`
- **Features:** Auto-generated unique challan numbers (`CH-YYYY-XXXXXX`), historical product snapshot preservation (`productName`, `sku`, `unitPrice`), server-side `totalQuantity` summation, editing and cancelling draft vouchers with zero stock mutation.
- **RBAC:** `ADMIN` & `SALES` (Draft Create, Edit & Cancel), `WAREHOUSE` & `ACCOUNTS` (Read-Only).

---

## Development Demo Accounts

The database seed script generates 4 pre-configured role test accounts with hashed passwords:

| Role | Demo Email | Development Password | Allowed Scope |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@erp.local` | `AdminPass123!` | Full System Access Across All Modules |
| **`SALES`** | `sales@erp.local` | `SalesPass123!` | Customer CRM, Products View, Sales Challans (Draft & Edit) |
| **`WAREHOUSE`** | `warehouse@erp.local` | `WarehousePass123!` | Product Catalog (CRUD), Stock Movements (IN/OUT), Challans View |
| **`ACCOUNTS`** | `accounts@erp.local` | `AccountsPass123!` | Read-Only Audit across All Modules |

---

## Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/trishyanigam/fundsroom.git
cd Fundsroom
```

### 2. Install Dependencies & Setup DB
```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev

# Frontend (in new terminal)
cd ../frontend
npm install
npm run dev
```
- Backend REST API: `http://localhost:5000`
- Frontend UI: `http://localhost:5173`
