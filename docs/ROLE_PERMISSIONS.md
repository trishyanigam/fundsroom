# Role & Permission Matrix Specifications

This document defines the Access Control Matrix across system roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) and documents HTTP authentication/authorization behavior for the **Mini ERP + CRM Operations Portal**.

---

## 1. HTTP 401 vs HTTP 403 Distinction

The system strictly distinguishes between authentication failures and role permission authorization failures:

- **`HTTP 401 Unauthorized`**: Returned when the request is **not authenticated**.
  - Authorization header is missing or malformed.
  - JWT token is missing, invalid, tampered with, or expired.
  - Client must log in to receive a valid access token.
- **`HTTP 403 Forbidden`**: Returned when the request is **authenticated but not authorized**.
  - The JWT token is valid and user identity is verified.
  - The user's role (e.g. `SALES`) lacks the required permission to access the target route (e.g., `/api/v1/inventory/movements` manual stock creation).

---

## 2. System Roles Overview

| Role | Primary Purpose | Development Demo Account | Default Password |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | Platform administration, global oversight, full access across all business modules | `admin@erp.local` | `AdminPass123!` |
| **`SALES`** | Lead acquisition, customer relationship management, sales challan creation | `sales@erp.local` | `SalesPass123!` |
| **`WAREHOUSE`** | Physical inventory control, product catalog management, stock adjustments | `warehouse@erp.local` | `WarehousePass123!` |
| **`ACCOUNTS`** | Financial oversight, challan audit, read-only sales and stock reporting | `accounts@erp.local` | `AccountsPass123!` |

---

## 3. Access Control Matrix

| Module / Route Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS | Permission Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Authentication & Session** |
| `POST /api/v1/auth/login` | Public | Public | Public | Public | ✅ Verified Phase 3 |
| `GET /api/v1/auth/me` | ✅ | ✅ | ✅ | ✅ | ✅ Verified Phase 3 |
| **RBAC Testing Endpoints** |
| `GET /api/v1/auth/test/admin` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ✅ Verified Phase 3 |
| `GET /api/v1/auth/test/sales` | ✅ | ✅ | ❌ (403) | ❌ (403) | ✅ Verified Phase 3 |
| `GET /api/v1/auth/test/warehouse` | ✅ | ❌ (403) | ✅ | ❌ (403) | ✅ Verified Phase 3 |
| `GET /api/v1/auth/test/accounts` | ✅ | ❌ (403) | ❌ (403) | ✅ | ✅ Verified Phase 3 |
| **Customer CRM Module (Phase 4)** |
| View Customer List & Details | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create & Edit Customers | ✅ | ✅ | ❌ (403) | ❌ (403) | Explicit Requirement |
| Add Customer Follow-up Notes | ✅ | ✅ | ❌ (403) | ❌ (403) | Explicit Requirement |
| **Product Catalog (Phase 5)** |
| View Product Catalog & Stock | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create & Edit Products | ✅ | ❌ (403) | ✅ | ❌ (403) | Explicit Requirement |
| **Inventory Movements (Phase 6)** |
| View Stock Movement History | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create Manual Stock Movement | ✅ | ❌ (403) | ✅ | ❌ (403) | Explicit Requirement |
| **Sales Challans (Phase 7 & 8)** |
| View Sales Challans | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create Draft Challan | ✅ | ✅ | ❌ (403) | ❌ (403) | Explicit Requirement |
| Confirm Challan (Atomic Stock Deduct) | ✅ | ✅ | ❌ (403) | ❌ (403) | Explicit Requirement |
| Cancel Challan | ✅ | ✅ | ❌ (403) | ❌ (403) | System Assumption |
