# Mini ERP + CRM Operations Portal

A full-stack, enterprise-grade Operations Portal featuring Customer Relationship Management (CRM), Inventory Tracking, Product Catalog Management, Sales Challan Creation, Transactional Stock Deduction, Role-Based Access Control (RBAC), and an Executive Dashboard.

---

## 1. Overview

The **Mini ERP + CRM Operations Portal** provides a centralized system for managing business sales operations, customer relationships, inventory stock movements, and delivery challans. Built with TypeScript, React, Express, Prisma ORM, and PostgreSQL, it ensures strict transactional data integrity and multi-role security across 4 organizational roles (`ADMIN`, `SALES`, `WAREHOUSE`, and `ACCOUNTS`).

---

## 2. Features

- **JWT Authentication & RBAC**: Role-based access control protecting routes and actions across 4 distinct roles.
- **Customer CRM**: Complete customer lifecycle management (create, list, search, filter, update).
- **Product Management**: SKU tracking, pricing, unit management, image cataloging, and low-stock threshold alerts.
- **Inventory & Stock Movements**: Real-time `IN` (restock) and `OUT` (dispatch) audit logging with automatic stock balance updates and negative stock prevention.
- **Sales Challans**: Sales delivery challan creation (`DRAFT`), itemized line items, unit prices, editing, and cancellation.
- **Transactional Stock Deduction**: Atomic ACIS-compliant challan confirmation via Prisma transactions (`prisma.$transaction`). Verifies stock availability, deducts inventory balances, generates `OUT` movements, and transitions status to `CONFIRMED`.
- **Executive Admin Dashboard**: Real-time aggregate KPIs (customers, total products, low-stock items, total revenue, challan counts) with quick role action shortcuts.

---

## 3. Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL.
- **ORM**: Prisma ORM v5.
- **Authentication**: JSON Web Tokens (JWT), Bcrypt password hashing.

---

## 4. Architecture

### Request Pipeline

```
React SPA
  │
  ▼ (HTTP REST API / Axios)
Express.js API Server
  │
  ▼
JWT Auth Middleware ──► Role Guard Middleware (RBAC)
  │
  ▼
Controllers ──► Services ──► Prisma ORM ──► PostgreSQL Database
```

### Key Architectural Concepts

- **Role-Based Authorization**: Middleware intercepts incoming requests, verifying user roles against authorized route masks before execution.
- **Atomic Challan Confirmation**: Stock deduction and challan status changes are executed inside a single interactive database transaction. If inventory is insufficient for any line item, the entire transaction rolls back cleanly without partial updates.

---

## 5. Local Setup Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL database server running locally on port `5432`

### Step 1: Clone Repository
```bash
git clone https://github.com/trishyanigam/fundsroom.git
cd fundsroom
```

### Step 2: Backend Installation & Setup
```bash
cd backend
npm install
```

Create `backend/.env` file (refer to `backend/.env.example`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_erp_db?schema=public"
PORT=5000
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

Run Prisma Database Migrations and Seed Demo Users:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Start Backend Server:
```bash
npm run dev
```
Backend API will be running on `http://localhost:5000/api`.

### Step 3: Frontend Installation & Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start Frontend Development Server:
```bash
npm run dev
```
Frontend App will be running on `http://localhost:5173`.

---

## 6. Environment Variables

### Backend (`backend/.env.example`)
| Key | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mini_erp_db` |
| `PORT` | Listening server port | `5000` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration timeframe | `24h` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `CORS_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173,http://localhost:3000` |

### Frontend (`frontend/.env.example`)
| Key | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | REST API base URL | `http://localhost:5000/api` |

---

## 7. Test Credentials (DEMO Accounts)

> [!IMPORTANT]
> The following demo test accounts are automatically pre-seeded in the database for evaluation and review.

| Role | Demo Email | Default Password | Access Level Summary |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@erp.local` | `AdminPass123!` | Full un-restricted system access across all modules. |
| **`SALES`** | `sales@erp.local` | `SalesPass123!` | Customer CRM, Products view, Sales Challan Creation & Confirmation. |
| **`WAREHOUSE`** | `warehouse@erp.local` | `WarehousePass123!` | Product catalog management, Inventory IN/OUT manual movements, Challan view. |
| **`ACCOUNTS`** | `accounts@erp.local` | `AccountsPass123!` | Read-only audit access across Customers, Products, Inventory, Challans, and Financial Metrics. |

---

## 8. API Documentation & Postman Collection

- **Unified Postman Collection**: Located at `postman/Mini_ERP_CRM_Portal.postman_collection.json`.
- **API Documentation**: Detailed request schemas, endpoints, and HTTP status codes are in `docs/API_DOCUMENTATION.md`.

---

## 9. Cloud Deployment Guide

### Database Deployment (e.g., Neon / Supabase)
1. Provision a PostgreSQL database instance on Neon or Supabase.
2. Obtain the production `DATABASE_URL` connection string.
3. Apply migrations using Prisma deployment mode:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed demo accounts:
   ```bash
   npx prisma db seed
   ```

### Backend Deployment (e.g., Render / Railway)
1. Create a Web Service pointing to the `backend/` directory.
2. Configure Build Command: `npm install && npm run build`
3. Configure Start Command: `npm start`
4. Set Environment Variables:
   - `DATABASE_URL` = `<PRODUCTION_POSTGRESQL_URL>`
   - `JWT_SECRET` = `<STRONG_RANDOM_SECRET>`
   - `JWT_EXPIRES_IN` = `24h`
   - `FRONTEND_URL` = `<DEPLOYED_FRONTEND_URL>`
   - `NODE_ENV` = `production`

### Frontend Deployment (e.g., Vercel / Netlify)
1. Create a Project pointing to the `frontend/` directory.
2. Configure Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variables:
   - `VITE_API_URL` = `<DEPLOYED_BACKEND_API_URL>`

---

## 10. Live & Testing URLs

- **Local Frontend**: `http://localhost:5173`
- **Local Backend API**: `http://localhost:5000/api`
- **Local Health Endpoint**: `http://localhost:5000/api/health`
- **Live Frontend**: `[Configured upon deployment]`
- **Live Backend API**: `[Configured upon deployment]`

---

## 11. Known Limitations

- **Single JWT Expiration**: Uses single stateless JWT tokens without automatic refresh token rotation.
- **Database Search**: Customer and product search uses PostgreSQL `ILIKE` pattern matching.
- **Challan Output**: Delivery challans feature print-ready DOM CSS styling; server-side PDF binary generation is not included.
- **Image Hosting**: Product image references use URL strings rather than S3 binary uploads.
- **Notifications**: System alerts surface on the web interface; email/SMS webhooks are omitted.

(See `docs/LIMITATIONS.md` for complete technical scope details).

---

## 12. Final Submission Checklist

- [x] GitHub Repository Link (`https://github.com/trishyanigam/fundsroom`)
- [x] Complete REST API Source Code (`backend/`)
- [x] Complete React SPA Source Code (`frontend/`)
- [x] Database Schema & Prisma Migrations (`backend/prisma/`)
- [x] 4 Seeded Demo Test Accounts (`docs/TEST_CREDENTIALS.md`)
- [x] Unified Postman Collection (`postman/Mini_ERP_CRM_Portal.postman_collection.json`)
- [x] Technical API Documentation (`docs/API_DOCUMENTATION.md`)
- [x] Architecture Blueprint & Diagrams (`docs/ARCHITECTURE.md`)
- [x] Known Limitations (`docs/LIMITATIONS.md`)
- [x] Submission Deliverables Checklist (`docs/SUBMISSION_CHECKLIST.md`)
