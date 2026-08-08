# Role & Permission Matrix Specifications

This document defines the Access Control Matrix across system roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) for the **Mini ERP + CRM Operations Portal**.

---

## 1. System Roles Overview

| Role | Core Purpose | Typical Primary Users |
| :--- | :--- | :--- |
| **`ADMIN`** | Full system access, platform administration, user management, global oversight | Company Management, System Administrators |
| **`SALES`** | Lead acquisition, customer relationship management, sales challan creation | Sales Executives, Account Managers |
| **`WAREHOUSE`** | Physical inventory control, stock adjustments, order dispatch verification | Inventory Managers, Warehouse Staff |
| **`ACCOUNTS`** | Financial oversight, challan audit, sales report review, compliance check | Accounting Department, Finance Officers |

---

## 2. Comprehensive RBAC Permission Matrix

| Module / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS | Permission Type |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Authentication & Profile** |
| Login / Refresh Token | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| View Own User Profile | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| **Customer CRM** |
| View Customer List | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Search / Filter Customers | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| View Customer Detail | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create New Customer | ✅ | ✅ | ❌ | ❌ | Explicit Requirement |
| Edit Customer Profile | ✅ | ✅ | ❌ | ❌ | Explicit Requirement |
| Add Customer Follow-up Notes | ✅ | ✅ | ❌ | ❌ | Explicit Requirement |
| Delete Customer Record | ✅ | ❌ | ❌ | ❌ | System Assumption |
| **Product Catalog** |
| View Product Catalog | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Search Products by SKU / Category | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create New Product | ✅ | ❌ | ✅ | ❌ | Explicit Requirement |
| Edit Product (Name, SKU, Price) | ✅ | ❌ | ✅ | ❌ | Explicit Requirement |
| Set Minimum Stock Alert Level | ✅ | ❌ | ✅ | ❌ | System Assumption |
| Delete Product Record | ✅ | ❌ | ❌ | ❌ | System Assumption |
| **Inventory & Stock Movement** |
| View Stock Movement Log | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| View Warehouse Stock Levels | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create Manual Stock Movement (`IN`/`OUT`) | ✅ | ❌ | ✅ | ❌ | Explicit Requirement |
| System Automated Stock Movement (`OUT`) | ✅ | ✅ | ❌ | ❌ | Explicit (via Challan Confirmation) |
| Adjust Warehouse Physical Location | ✅ | ❌ | ✅ | ❌ | System Assumption |
| **Sales Challans** |
| View Challan List & Details | ✅ | ✅ | ✅ | ✅ | Explicit Requirement |
| Create Draft Challan | ✅ | ✅ | ❌ | ❌ | Explicit Requirement |
| Confirm Challan (Trigger Stock Deduct) | ✅ | ✅ | ❌ | ❌ | Explicit Requirement |
| Cancel Draft / Confirmed Challan | ✅ | ✅ | ❌ | ❌ | System Assumption |
| Print / Export Challan Summary | ✅ | ✅ | ✅ | ✅ | System Assumption |

---

## 3. Explicit Requirements vs. System Assumptions

### Explicit Case Study Requirements
1. **SALES Users** must have access to create and manage Customers, add follow-up notes, create Draft Challans, and trigger Challan Confirmations.
2. **WAREHOUSE Users** must have access to create products, edit product information, view inventory, and record stock movements (`IN`/`OUT`).
3. **Draft Challan Creation** is restricted from mutating inventory.
4. **Challan Confirmation** triggers an automated stock check and stock reduction (`OUT` movement record creation).

### Reasonable System Assumptions
1. **ACCOUNTS Role Boundaries:** Accounts users require complete read-only visibility across Customers, Products, Inventory, and Sales Challans for audit and invoicing reconciliation, but are barred from creating draft orders or mutating inventory.
2. **Deletion Authority:** Hard deletion of products or customers is strictly limited to the `ADMIN` role to preserve database integrity and relational constraints.
3. **Warehouse Dispatch View:** Warehouse users can view `CONFIRMED` challans to organize physical packing and dispatch, but cannot create or modify sales orders.
