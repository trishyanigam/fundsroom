# Technical & Business Assumptions

This document lists all explicit technical assumptions, business constraints, and scope boundaries established for the **Mini ERP + CRM Operations Portal**.

---

## 1. Business & Operational Assumptions

1. **Wholesale Enterprise Focus:** The portal is designed specifically for B2B wholesale and distribution operations where order fulfillment involves dispatch vouchers (Sales Challans) rather than immediate retail point-of-sale receipting.
2. **Single-Warehouse Primary Model (v1):** While products include a `warehouseLocation` string field (e.g., "Aisle 4, Rack B2") for item bin lookup, inventory stock is tracked in a single consolidated primary warehouse pool for initial v1 releases.
3. **Currency & Tax Standards:** 
   - All prices and monetary totals are formatted in local currency (INR `₹`) with 2 decimal precision using PostgreSQL `DECIMAL(12, 2)`.
   - `gstNumber` is optional during customer onboarding to accommodate non-registered retail clients alongside registered GST wholesale buyers.
4. **Historical Product Data Preservation:** It is assumed that catalog prices and product titles will change over time. Storing historical snapshot fields (`productName`, `sku`, `unitPrice`) inside `ChallanItem` is mandatory to keep historical sales financials invariant.

---

## 2. Technical & Architectural Assumptions

1. **Stateless Authentication:** Authentication relies on stateless JSON Web Tokens (JWT) transmitted via HTTP `Authorization: Bearer <token>` headers. Token expiration is set to 24 hours.
2. **Database Soft Constraints & Cascade Protections:**
   - Products and Customers linked to existing Sales Challans cannot be hard-deleted from the database to prevent foreign key orphan violations.
   - `ChallanItem` records cascade delete only if an unconfirmed `DRAFT` Challan header is explicitly deleted by an Admin.
3. **Atomic Transactional Database Engine:** PostgreSQL is selected due to its support for ACID-compliant interactive transactions via Prisma ORM (`prisma.$transaction`), ensuring atomic stock evaluation and reduction.
4. **Pagination & Query Limits:** Default pagination returns 10 items per page with a maximum ceiling of 100 items per request to protect backend memory and query performance.

---

## 3. Scope Boundaries & Non-Requirements (Phase 0)

1. **No External Payment Gateway Integration:** The system handles order challans and inventory movements; credit line processing or external credit card gateway processing is excluded from initial scope.
2. **No Real-Time WebSockets:** REST API polling and React state re-fetching are sufficient for inventory updates in v1; real-time WebSocket infrastructure is not required.
3. **No PDF Generation / S3 Storage in Phase 0:** PDF invoice generation and AWS S3 document uploads are excluded during early phases to prioritize core atomic transactional stock logic and RBAC.
