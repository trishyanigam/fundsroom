# Submission Audit Checklist

This checklist tracks all required submission artifacts for the **Mini ERP + CRM Operations Portal**.

> [!NOTE]
> **Phase 1 Audit Status:** Project setup, monorepo architecture, Express health server, Vite React app shell, `.gitignore`, and environment templates are fully completed. Live deployment URLs and active test credentials will be populated upon completing Phase 12 (Deployment) and Phase 13 (Documentation Audit).

---

## Submission Items Audit Table

| # | Submission Item | Required Specification | Status | Value / Placeholder |
| :-: | :--- | :--- | :-: | :--- |
| **1** | **GitHub Repository** | Public / accessible Git repo with meaningful commit history | ⏳ In Progress (Phase 1 Init) | `[Local Git Repository Initialized]` |
| **2** | **Live Frontend URL** | Deployed React frontend application on Vercel | ⏳ Pending Phase 12 | `[Pending Production Deployment in Phase 12]` |
| **3** | **Live Backend API URL** | Deployed Node.js Express REST API on Render | ⏳ Pending Phase 12 | `[Pending Production Deployment in Phase 12]` |
| **4** | **Test Credentials** | Active login accounts for all 4 roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) | ⏳ Pending Phase 2/12 | `[Pending Database Seeding & Deployment]` |
| **5** | **API Documentation / Postman** | Comprehensive API specification and downloadable Postman collection | ⏳ In Progress (Specs Done) | Specs: `docs/API_PLAN.md`<br>Collection: `[Pending Export in Phase 11]` |
| **6** | **README & Setup Guide** | Comprehensive `README.md` with overview, architecture, local setup & cloud deployment guide | ✅ Phase 0 & 1 Complete | Root `README.md` created & updated |
| **7** | **Architecture Blueprint** | Detailed explanation of layered backend, frontend, RBAC, & atomic transactional stock logic | ✅ Phase 0 Complete | `docs/ARCHITECTURE.md`<br>`docs/BUSINESS_FLOWS.md` |
| **8** | **Known Limitations** | Documented technical boundaries, assumptions, and future enhancements | ✅ Phase 0 Complete | `docs/ASSUMPTIONS.md`<br>`docs/EDGE_CASES.md` |

---

## Test Credentials Template (For Phase 12 Completion)

*The following table will be populated with active credentials following database seeding in Phase 2/12:*

```markdown
| Role | Email | Password | Allowed Access Summary |
| :--- | :--- | :--- | :--- |
| **ADMIN** | admin@distro.com | [Set in Phase 2] | Full System Access |
| **SALES** | sales@distro.com | [Set in Phase 2] | CRM, View Products, Challans (Draft & Confirm) |
| **WAREHOUSE** | warehouse@distro.com | [Set in Phase 2] | Products, Stock Movements, View Confirmed Challans |
| **ACCOUNTS** | accounts@distro.com | [Set in Phase 2] | Read-Only Audit across All Modules |
```
