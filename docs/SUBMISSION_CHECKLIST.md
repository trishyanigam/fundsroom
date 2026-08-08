# Submission Audit Checklist

This checklist tracks all required submission artifacts for the **Mini ERP + CRM Operations Portal**.

> [!NOTE]
> **Phase 7 Audit Status:** Sales Challan REST APIs, payload validation, auto-generated unique challan numbers (`CH-YYYY-XXXXXX`), historical product price & SKU snapshot preservation, zero stock mutation on draft operations, role-based authorization (`ADMIN` & `SALES` full draft access; `WAREHOUSE` & `ACCOUNTS` read-only), React Sales Challan List, Form, & Detail pages, and Postman requests are 100% completed and tested.

---

## Submission Items Audit Table

| # | Submission Item | Required Specification | Status | Value / Placeholder |
| :-: | :--- | :--- | :-: | :--- |
| **1** | **GitHub Repository** | Public / accessible Git repo with meaningful commit history | ✅ Phase 1 Complete | [https://github.com/trishyanigam/fundsroom.git](https://github.com/trishyanigam/fundsroom.git) |
| **2** | **Live Frontend URL** | Deployed React frontend application on Vercel | ⏳ Pending Phase 12 | `[Pending Production Deployment in Phase 12]` |
| **3** | **Live Backend API URL** | Deployed Node.js Express REST API on Render | ⏳ Pending Phase 12 | `[Pending Production Deployment in Phase 12]` |
| **4** | **Test Credentials** | Active login accounts for all 4 roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) | ✅ Phase 3 Complete (Dev Accounts Seeded) | Demo accounts seeded in DB<br>(See table below for dev credentials) |
| **5** | **API Documentation / Postman** | Comprehensive API specification and downloadable Postman collection | ✅ Phase 7 Complete (Auth, CRM, Product, Inventory & Challan Collections Ready) | Specs: `docs/API_PLAN.md`<br>Collection: `postman/Mini_ERP_CRM_Phase7_Challans.postman_collection.json` |
| **6** | **README & Setup Guide** | Comprehensive `README.md` with overview, architecture, local setup & cloud deployment guide | ✅ Phase 0-7 Complete | Root `README.md` created & updated |
| **7** | **Architecture & DB Blueprint** | Detailed explanation of backend, frontend, database schema, RBAC, & snapshot rules | ✅ Phase 0-7 Complete | `docs/ARCHITECTURE.md`<br>`docs/DATABASE_DESIGN.md`<br>`docs/ROLE_PERMISSIONS.md` |
| **8** | **Known Limitations** | Documented technical boundaries, assumptions, and future enhancements | ✅ Phase 0 Complete | `docs/ASSUMPTIONS.md`<br>`docs/EDGE_CASES.md` |

---

## Development Test Credentials (Phase 3 Implemented)

| Role | Demo Email | Default Development Password | Allowed Access Summary |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@erp.local` | `AdminPass123!` | Full System Access Across All Modules |
| **`SALES`** | `sales@erp.local` | `SalesPass123!` | Customer CRM, Products View, Sales Challans (Draft & Edit) |
| **`WAREHOUSE`** | `warehouse@erp.local` | `WarehousePass123!` | Product Catalog (CRUD), Stock Movements, Challans View |
| **`ACCOUNTS`** | `accounts@erp.local` | `AccountsPass123!` | Read-Only Audit across All Modules |
