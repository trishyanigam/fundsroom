# Role-Based Access Control (RBAC) & Permissions Matrix

This document defines the Role-Based Access Control (RBAC) system for the **Mini ERP + CRM Operations Portal**.

---

## 1. Role Overview & System Matrix

| Business Module | Endpoint / Feature | `ADMIN` | `SALES` | `WAREHOUSE` | `ACCOUNTS` |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Authentication** | Login, Me Profile | ✅ | ✅ | ✅ | ✅ |
| **Admin Dashboard** | Summary Metrics API (`GET /dashboard/summary`) | ✅ | ✅ | ✅ | ✅ |
| **Customer CRM** | Read / Search / Details | ✅ | ✅ | ❌ (403) | ✅ |
| | Create & Edit Customer Profile | ✅ | ✅ | ❌ (403) | ❌ (403) |
| **Product Catalog** | Read / Search / Details | ✅ | ✅ | ✅ | ✅ |
| | Create & Edit Product Catalog | ✅ | ❌ (403) | ✅ | ❌ (403) |
| **Inventory Movements** | Read Audit Log History | ✅ | ✅ | ✅ | ✅ |
| | Log Stock IN (+) / Stock OUT (-) | ✅ | ❌ (403) | ✅ | ❌ (403) |
| **Sales Challans** | Read / Search / Detail View | ✅ | ✅ | ✅ | ✅ |
| | Draft Create, Edit & Cancel | ✅ | ✅ | ❌ (403) | ❌ (403) |
| | Confirm Challan & Deduct Stock | ✅ | ✅ | ❌ (403) | ❌ (403) |

---

## 2. Dashboard Role-Based UI Action Visibility

- **`ADMIN`**: Full Access across all shortcuts (+ Add Customer, + Add Product, + Create Challan, View Inventory).
- **`SALES`**: Customer & Challan shortcuts (+ Add Customer, + Create Challan, View Inventory).
- **`WAREHOUSE`**: Catalog & Inventory shortcuts (+ Add Product, View Inventory).
- **`ACCOUNTS`**: View-only audit shortcuts (View Inventory, View Customers, View Products, View Challans).
