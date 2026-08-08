# Development Roadmap & Execution Phases

This document outlines the sequential 15-phase implementation plan for building and deploying the **Mini ERP + CRM Operations Portal**.

---

## Roadmap Status Summary

```
[✅ PHASE 0] ──► [✅ PHASE 1] ──► [✅ PHASE 2] ──► [✅ PHASE 3] ──► [⏳ PHASE 4] ──► [🔒 PHASE 5]
 Arch &           Setup &          Database         Auth &           Customer         Product
 Planning         Git Init         + Prisma         RBAC             CRM              Catalog
                                                                                        │
[🔒 PHASE 14] ◄─ [🔒 PHASE 13] ◄─ [🔒 PHASE 12] ◄─ [🔒 PHASE 11] ◄─ [🔒 PHASE 10] ◄─ [🔒 PHASE 9]  ◄─ [🔒 PHASE 8] ◄─ [🔒 PHASE 7] ◄─ [🔒 PHASE 6]
 Final Audit      Docs &           Deployment       Testing &        Frontend-        React UI &       Atomic Stock     Sales            Inventory
                  Submission                        Postman          Backend Int      Dashboard        Confirmation     Challans         Movements
```

---

## Detailed Phase Breakdown

### PHASE 0: Architecture & System Planning (COMPLETED ✅)
- **Deliverables:** Architectural specifications, ERD, database design, REST API blueprints, RBAC permission matrix, business process flowcharts, edge-case documentation, submission checklist, and `README.md`.
- **Status:** Fully completed.

### PHASE 1: Project Setup & Repository Initialization (COMPLETED ✅)
- **Deliverables:** Initialized Git repository, established monorepo directory layout (`/backend`, `/frontend`, `/docs`, `/postman`), configured TypeScript Express REST API with `GET /api/health` endpoint, configured Vite React TypeScript frontend shell with Tailwind CSS and Axios client, set up `.gitignore` and `.env.example` templates.
- **Status:** Fully completed & verified.

### PHASE 2: Database Design, PostgreSQL & Prisma ORM (COMPLETED ✅)
- **Deliverables:** Configured `backend/prisma/schema.prisma` with all 6 core models (`User`, `Customer`, `Product`, `StockMovement`, `Challan`, `ChallanItem`), enums (`Role`, `CustomerType`, `CustomerStatus`, `MovementType`, `ChallanStatus`), product snapshot preserve fields, and restrictive deletion rules (`onDelete: Restrict`). Generated Prisma Client v5 (`npx prisma generate`). Set up dev seed script (`prisma/seed.ts`).
- **Status:** Fully completed & verified.

### PHASE 3: Authentication, JWT & RBAC Middleware (COMPLETED ✅)
- **Deliverables:** Implemented password hashing with bcrypt, JWT token signing/verification (`jwt.ts`), `authenticateToken` middleware, `authorizeRoles` RBAC middleware, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, development RBAC test endpoints (`/test/admin`, `/test/sales`, `/test/warehouse`, `/test/accounts`), 4 seeded role demo accounts, unit test suite, and Postman collection.
- **Status:** Fully completed & verified.

### PHASE 4: Customer CRM Module Development (NEXT ⏳)
- **Deliverables:** Implement CRUD REST endpoints for Customer entity (`GET`, `POST`, `PUT`), filter/search logic, and follow-up notes endpoint (`POST /customers/:id/notes`).
- **Status:** Scheduled next.

### PHASE 5: Product Management Module (LOCKED 🔒)
- **Deliverables:** Implement Product REST endpoints (`GET`, `POST`, `PUT`), unique SKU validation, minimum stock alert calculation, and warehouse location management.

### PHASE 6: Inventory & Stock Movement Tracking (LOCKED 🔒)
- **Deliverables:** Implement manual stock movement endpoint (`POST /inventory/movements`), movement audit log list endpoint (`GET /inventory/movements`), and stock validation rules.

### PHASE 7: Sales Challan Core Management (LOCKED 🔒)
- **Deliverables:** Implement Challan listing, detail retrieval, and draft challan creation endpoint (`POST /challans`) with historical product snapshot resolution (`productName`, `sku`, `unitPrice`). Verify zero stock mutation on `DRAFT`.

### PHASE 8: Challan Confirmation & Transactional Stock Logic (LOCKED 🔒)
- **Deliverables:** Implement `POST /challans/:id/confirm` endpoint wrapped in Prisma interactive transaction (`prisma.$transaction`). Verify multi-item atomic stock verification, stock reduction, automated `OUT` stock movement creation, and rollback behavior on insufficient stock.

### PHASE 9: React Dashboard & UI Components (LOCKED 🔒)
- **Deliverables:** Initialize Vite React TypeScript project with Tailwind CSS, build layout frames (`AppLayout`, `Sidebar`, `Header`), metrics dashboard cards, and modular UI components (`DataTable`, `Modal`, `Badge`).

### PHASE 10: Frontend & Backend Integration (LOCKED 🔒)
- **Deliverables:** Set up Axios API client with bearer token interceptor, integrate `AuthContext`, connect React forms & tables with backend REST APIs across Customer CRM, Product Catalog, Inventory, and Sales Challans.

### PHASE 11: Validation, Testing & Postman Collection (LOCKED 🔒)
- **Deliverables:** Add payload validation (Zod schemas), build comprehensive Postman Collection covering all endpoints and role permissions, perform multi-product transaction edge-case testing.

### PHASE 12: Deployment & Cloud Configuration (LOCKED 🔒)
- **Deliverables:** Deploy PostgreSQL database to Neon / Supabase, deploy Express backend API to Render, deploy Vite React frontend to Vercel, configure environment variables across cloud providers.

### PHASE 13: Final Documentation & Setup Guide Update (LOCKED 🔒)
- **Deliverables:** Update `README.md` and `docs/SUBMISSION_CHECKLIST.md` with live production URLs, active multi-role test account credentials, local setup instructions, and Postman import guide.

### PHASE 14: Final Submission Audit (LOCKED 🔒)
- **Deliverables:** End-to-end verification of all submission criteria, verifying live deployment links, test credentials, RBAC matrix, and Git commit history.
