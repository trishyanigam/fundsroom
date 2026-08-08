# Mini ERP + CRM Operations Portal

## Project Overview

The **Mini ERP + CRM Operations Portal** is a full-stack case study application built for a wholesale and distribution enterprise. The system manages core operations including customer relationships (CRM), product cataloging, inventory stock movement tracking, and sales challan voucher management with atomic transactional stock logic.

The portal enforces role-based access control (RBAC) across four distinct internal enterprise roles: **ADMIN**, **SALES**, **WAREHOUSE**, and **ACCOUNTS**.

---

## Current Status

**PHASE 3 - Authentication + JWT + Role-Based Access Control (RBAC) Complete**

Stateless JWT authentication, bcrypt password hashing, Express request type extensions, authentication middleware (`authenticateToken`), authorization middleware (`authorizeRoles`), `/login`, `/me`, and role test endpoints are fully implemented and tested.

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

## Authentication & Role-Based Access Control (Phase 3)

### Security Standards
- **Password Security:** All passwords are hashed using `bcrypt` (10 salt rounds) before storage. Plaintext passwords and password hashes are never returned in API responses or logs.
- **Stateless Tokens:** Authentication uses signed JSON Web Tokens (JWT) passed in the `Authorization: Bearer <token>` HTTP header.
- **Configurable Secret & Expiration:** `JWT_SECRET` and `JWT_EXPIRES_IN` (default `24h`) are read from environment variables.

### HTTP Response Standards
- **`HTTP 401 Unauthorized`**: Authentication missing, malformed Bearer header, invalid signature, or expired token.
- **`HTTP 403 Forbidden`**: User is authenticated, but their role lacks required permissions for the endpoint.

### Development Demo Accounts

The database seed script generates 4 pre-configured role test accounts with hashed passwords:

| Role | Demo Email | Development Password | Allowed Scope |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@erp.local` | `AdminPass123!` | Full System Access |
| **`SALES`** | `sales@erp.local` | `SalesPass123!` | Customer CRM, Products View, Challans (Draft & Confirm) |
| **`WAREHOUSE`** | `warehouse@erp.local` | `WarehousePass123!` | Product Catalog (CRUD), Stock Movements, View Confirmed Challans |
| **`ACCOUNTS`** | `accounts@erp.local` | `AccountsPass123!` | Read-Only Audit across All Modules |

> [!WARNING]
> Development credentials are strictly for local testing and demonstration. Real production passwords must be managed securely via environment variables (`ADMIN_SEED_PASSWORD`, etc.) and never committed to source control.

---

## Project Structure

```
mini-erp-crm/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL schema (User, Customer, Product, StockMovement, Challan, ChallanItem)
│   │   └── seed.ts               # Database seed script for 4 role accounts
│   ├── src/
│   │   ├── config/               # Configuration helpers
│   │   ├── controllers/
│   │   │   └── authController.ts # Login, me, and RBAC test controllers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts # Bearer JWT token verification middleware
│   │   │   └── roleMiddleware.ts # RBAC authorization middleware
│   │   ├── routes/
│   │   │   └── authRoutes.ts     # Auth endpoints (/login, /me, /test/*)
│   │   ├── services/
│   │   │   └── authService.ts    # Authentication business logic
│   │   ├── types/
│   │   │   └── express.d.ts      # Express Request type declaration (req.user)
│   │   ├── utils/
│   │   │   ├── jwt.ts            # JWT sign & verify functions
│   │   │   └── password.ts       # Bcrypt hash & compare functions
│   │   ├── validators/
│   │   │   └── authValidator.ts  # Login payload validator
│   │   └── server.ts             # Express server & endpoint mounting
│   ├── .env                      # Local environment settings
│   ├── .env.example              # Environment variable template
│   ├── package.json              # Backend dependencies & scripts
│   └── tsconfig.json             # Backend TypeScript configuration
│
├── frontend/                 # React + Vite TypeScript SPA
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts            # Axios API client (`api.ts`)
│   │   ├── App.tsx               # Main application shell
│   │   ├── main.tsx              # React DOM entrypoint
│   │   └── vite-env.d.ts         # Vite environment types
│   ├── .env.example              # Frontend environment placeholders
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite configuration
│
├── docs/                     # Comprehensive design & architecture specifications
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── ROLE_PERMISSIONS.md
│   ├── BUSINESS_FLOWS.md
│   ├── API_PLAN.md
│   ├── FRONTEND_PLAN.md
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── ASSUMPTIONS.md
│   ├── EDGE_CASES.md
│   └── SUBMISSION_CHECKLIST.md
│
├── postman/                  # Postman collection
│   └── Mini_ERP_CRM_Phase3_Auth.postman_collection.json
│
├── .gitignore                # Root Git ignore rules
└── README.md                 # Project documentation overview
```

---

## Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/trishyanigam/fundsroom.git
cd Fundsroom
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables
- **Backend:** Create `backend/.env` from `backend/.env.example`:
  ```bash
  cp backend/.env.example backend/.env
  ```
  Set `JWT_SECRET` to a secure secret key.

### 4. Seed Development Role Accounts
From the `backend` directory:
```bash
npm run prisma:seed
```
This populates the database with the 4 demo role accounts (`admin@erp.local`, `sales@erp.local`, `warehouse@erp.local`, `accounts@erp.local`).

### 5. Start Backend Server
From the `backend` directory:
```bash
npm run dev
```
Backend API will start on `http://localhost:5000`.

### 6. Start Frontend Server
From the `frontend` directory:
```bash
npm run dev
```
Frontend will start on `http://localhost:5173`.
