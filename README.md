# Mini ERP + CRM Operations Portal

## Project Overview

The **Mini ERP + CRM Operations Portal** is a full-stack case study application built for a wholesale and distribution enterprise. The system manages core operations including customer relationships (CRM), product cataloging, inventory stock movement tracking, and sales challan voucher management with atomic transactional stock logic.

The portal enforces role-based access control (RBAC) across four distinct internal enterprise roles: **ADMIN**, **SALES**, **WAREHOUSE**, and **ACCOUNTS**.

---

## Current Status

**PHASE 1 - Project Setup & Foundation Complete**

The project infrastructure, monorepo directory layout, TypeScript Express REST API server, Vite React frontend, and environment templates are fully configured and verified. Core business models, database migrations, and CRUD endpoints will be introduced in subsequent phases.

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js
- **ORM:** Prisma ORM
- **Database Engine:** PostgreSQL

### Frontend
- **Framework:** React (v18)
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios

---

## Project Structure

```
mini-erp-crm/
│
├── backend/                  # Node.js + Express TypeScript REST API
│   ├── prisma/               # Prisma schema & PostgreSQL datasource configuration
│   ├── src/
│   │   ├── config/           # App configuration files
│   │   ├── controllers/      # Route controllers (Phase 3+)
│   │   ├── middleware/       # Auth & RBAC middleware (Phase 3+)
│   │   ├── routes/           # REST API route definitions
│   │   ├── services/         # Core business logic & transactions
│   │   ├── validators/       # Request payload schemas
│   │   ├── utils/            # Shared backend utilities
│   │   └── server.ts         # Express server & health check entrypoint
│   ├── .env.example          # Environment variable placeholders
│   ├── package.json          # Backend dependencies & scripts
│   └── tsconfig.json         # Backend TypeScript configuration
│
├── frontend/                 # React + Vite TypeScript SPA
│   ├── src/
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # Auth & App state contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Page frame layouts
│   │   ├── pages/            # Application views (Phase 9+)
│   │   ├── services/         # Axios API client (`api.ts`)
│   │   ├── utils/            # UI helper functions
│   │   ├── App.tsx           # Main application shell
│   │   ├── main.tsx          # React DOM entrypoint
│   │   └── index.css         # Tailwind CSS directives
│   ├── .env.example          # Frontend environment placeholders
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── vite.config.ts        # Vite build configuration
│
├── docs/                     # Comprehensive Phase 0 design specifications
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
├── postman/                  # API collections placeholder
├── .gitignore                # Root Git ignore rule set
└── README.md                 # Project documentation overview
```

---

## Local Setup Instructions

Follow these steps to set up and run the application locally:

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Fundsroom
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables
- **Backend:** Create `backend/.env` from `backend/.env.example`:
  ```bash
  cp backend/.env.example backend/.env
  ```
- **Frontend:** Create `frontend/.env` from `frontend/.env.example`:
  ```bash
  cp frontend/.env.example frontend/.env
  ```

### 5. Start the Backend Server
From the `backend` directory:
```bash
npm run dev
```
The backend REST API server will start on `http://localhost:5000`.  
Verify health check: `GET http://localhost:5000/api/health`

### 6. Start the Frontend Development Server
From the `frontend` directory in a new terminal window:
```bash
npm run dev
```
The React frontend application will open on `http://localhost:5173`.

---

## Environment Variables

Environment variable templates (`.env.example`) are maintained to document expected variables without exposing secrets:
- `backend/.env.example`: Defines `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL`.
- `frontend/.env.example`: Defines `VITE_API_URL`.

*Local `.env` files are ignored by Git and must never be committed.*

---

## Current Phase & Scope Limit

> [!IMPORTANT]
> **Current Status:** `PHASE 1 - Project Setup`
> Business logic, authentication controllers, database migrations, customer CRM endpoints, product catalog APIs, and sales challan transactional confirmation are **NOT YET IMPLEMENTED**. These features will be built systematically starting in Phase 2.
