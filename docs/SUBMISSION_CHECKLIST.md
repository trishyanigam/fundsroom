# Submission Audit Checklist

This checklist tracks all required submission artifacts for the **Mini ERP + CRM Operations Portal**.

> [!NOTE]
> **Phase 2 Audit Status:** PostgreSQL Prisma database schema definitions, all 6 models, 5 enums, indexes, snapshot preservation rules, and Prisma Client generation are 100% completed. Live deployment URLs and active test credentials will be populated upon completing Phase 12 (Deployment) and Phase 13 (Documentation Audit).

---

## Submission Items Audit Table

| # | Submission Item | Required Specification | Status | Value / Placeholder |
| :-: | :--- | :--- | :-: | :--- |
| **1** | **GitHub Repository** | Public / accessible Git repo with meaningful commit history | ⏳ In Progress (Phase 1 Init) | `[Local Git Repository Initialized]` |
| **2** | **Live Frontend URL** | Deployed React frontend application on Vercel | ⏳ Pending Phase 12 | `[Pending Production Deployment in Phase 12]` |
| **3** | **Live Backend API URL** | Deployed Node.js Express REST API on Render | ⏳ Pending Phase 12 | `[Pending Production Deployment in Phase 12]` |
| **4** | **Test Credentials** | Active login accounts for all 4 roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) | ⏳ Pending Phase 3/12 | `[Pending Auth Implementation & DB Seeding]` |
| **5** | **API Documentation / Postman** | Comprehensive API specification and downloadable Postman collection | ⏳ In Progress (Specs Done) | Specs: `docs/API_PLAN.md`<br>Collection: `[Pending Export in Phase 11]` |
| **6** | **README & Setup Guide** | Comprehensive `README.md` with overview, architecture, local setup & cloud deployment guide | ✅ Phase 0 & 1 Complete | Root `README.md` created & updated |
| **7** | **Architecture & DB Blueprint** | Detailed explanation of backend, frontend, database schema, & snapshot rules | ✅ Phase 0 & 2 Complete | `docs/ARCHITECTURE.md`<br>`docs/DATABASE_DESIGN.md` |
| **8** | **Known Limitations** | Documented technical boundaries, assumptions, and future enhancements | ✅ Phase 0 Complete | `docs/ASSUMPTIONS.md`<br>`docs/EDGE_CASES.md` |

---

## Test Credentials Template (For Phase 3/12 Completion)

*The following table will be populated with active credentials following database seeding in Phase 3/12:*

```markdown
| Role | Email | Password | Allowed Access Summary |
| :--- | :--- | :--- | :--- |
| **ADMIN** | admin@distro.com | [Set in Phase 3] | Full System Access |
| **SALES** | sales@distro.com | [Set in Phase 3] | CRM, View Products, Challans (Draft & Confirm) |
| **WAREHOUSE** | warehouse@distro.com | [Set in Phase 3] | Products, Stock Movements, View Confirmed Challans |
| **ACCOUNTS** | accounts@distro.com | [Set in Phase 3] | Read-Only Audit across All Modules |
```
