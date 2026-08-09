# Demo & Test Credentials

> [!IMPORTANT]
> These credentials are exclusively for **DEMO, TESTING, AND ASSIGNMENT REVIEW** purposes on the Mini ERP + CRM Operations Portal. Do NOT use personal passwords.

---

## Pre-seeded Role Accounts

All 4 test accounts are automatically seeded into the database using hashed passwords (`bcrypt`).

| Role | Email Address | Default Password | Primary System Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator (`ADMIN`)** | `admin@erp.local` | `AdminPass123!` | Full un-restricted system access (Users, Customers, Products, Inventory, Challans, Dashboard). |
| **Sales Representative (`SALES`)** | `sales@erp.local` | `SalesPass123!` | Create & manage Customers, create & confirm Sales Challans, view Products & Inventory. |
| **Warehouse Manager (`WAREHOUSE`)** | `warehouse@erp.local` | `WarehousePass123!` | Stock IN / OUT manual movements, view Products, view Challans. |
| **Financial Accountant (`ACCOUNTS`)** | `accounts@erp.local` | `AccountsPass123!` | Read-only audit access to Customers, Products, Inventory, Challans, and Financial Summary. |

---

## Local Verification Commands

To re-seed or verify these test accounts in a fresh local or production database, execute:

```bash
cd backend
npx prisma db seed
```
