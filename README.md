# Mini ERP + CRM Operations Portal

## Project Overview

The **Mini ERP + CRM Operations Portal** is a full-stack case study application built for a wholesale and distribution enterprise. The system manages core operations including customer relationships (CRM), product cataloging, inventory stock movement tracking, and sales challan voucher management with atomic transactional stock logic.

The portal enforces role-based access control (RBAC) across four distinct internal enterprise roles: **ADMIN**, **SALES**, **WAREHOUSE**, and **ACCOUNTS**.

---

## Current Status

**PHASE 4 - Customer CRM Module Complete**

Customer CRM backend REST APIs, payload validation, search/filtering/pagination, role-based authorization (`ADMIN` & `SALES` full CRUD, `ACCOUNTS` read-only, `WAREHOUSE` forbidden), React Customer List & Detail pages, and Postman test collection are fully implemented and verified.

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

## Customer CRM Module Features (Phase 4)

- **Create Customer (`POST /api/v1/customers`):** Register new wholesale buyers, retail clients, or distributors with business info, contact details, optional GST number, address, status, follow-up date, and notes.
- **Search & Filtering (`GET /api/v1/customers`):** Real-time multi-field search (`customerName`, `businessName`, `mobile`, `email`), status filters (`LEAD`, `ACTIVE`, `INACTIVE`), customer type filters (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), and page limit controls.
- **Customer Details (`GET /api/v1/customers/:id`):** Full profile overview displaying contact info, GST, address, and interaction notes.
- **Update Customer (`PUT /api/v1/customers/:id`):** Edit profile details, change status, and update follow-up notes & dates.
- **Role-Based Access Control (RBAC):**
  - **`ADMIN` & `SALES`**: Full access to Create, Read, Update, Search, and Edit notes.
  - **`ACCOUNTS`**: Read-only access to view and search customer profiles (Mutating endpoints return `403 Forbidden`).
  - **`WAREHOUSE`**: Customer module navigation and APIs are completely restricted (`403 Forbidden`).

---

## Development Demo Accounts

The database seed script generates 4 pre-configured role test accounts with hashed passwords:

| Role | Demo Email | Development Password | Allowed Scope |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@erp.local` | `AdminPass123!` | Full System Access |
| **`SALES`** | `sales@erp.local` | `SalesPass123!` | Customer CRM, Products View, Challans (Draft & Confirm) |
| **`WAREHOUSE`** | `warehouse@erp.local` | `WarehousePass123!` | Product Catalog (CRUD), Stock Movements, View Confirmed Challans |
| **`ACCOUNTS`** | `accounts@erp.local` | `AccountsPass123!` | Read-Only Audit across All Modules |

---

## Project Structure

```
mini-erp-crm/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL schema (User, Customer, Product, StockMovement, Challan, ChallanItem)
│   │   └── seed.ts               # Database seed script
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts # Auth endpoints
│   │   │   └── customerController.ts # Customer CRM endpoints
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts # Bearer JWT token verification
│   │   │   └── roleMiddleware.ts # RBAC authorization
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── customerRoutes.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── customerService.ts # Customer Prisma queries, search & pagination
│   │   ├── validators/
│   │   │   ├── authValidator.ts
│   │   │   └── customerValidator.ts # Customer payload validator
│   │   └── server.ts             # Express server & endpoint mounting
│   ├── .env                      # Local environment settings
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── CustomerFormModal.tsx # Reusable Add & Edit Customer Modal
│   │   ├── pages/
│   │   │   ├── CustomerListPage.tsx  # Customer Directory with Search, Filter & Pagination
│   │   │   └── CustomerDetailPage.tsx# Customer Detail Profile & Notes View
│   │   ├── services/
│   │   │   ├── api.ts            # Axios base client
│   │   │   └── customerService.ts# Customer API client calls
│   │   ├── App.tsx               # Main application shell & router
│   │   └── main.tsx
│   ├── .env
│   └── package.json
│
├── docs/                     # Design & architecture specifications
├── postman/                  # Postman collections
└── README.md
```

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
