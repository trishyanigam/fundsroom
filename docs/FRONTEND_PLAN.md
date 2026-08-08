# Frontend Architecture & UI/UX Plan

This document details the Information Architecture, page route specifications, component hierarchy, route guards, state management, and role-based UI access strategies for the **Mini ERP + CRM Operations Portal**.

---

## 1. Information Architecture & Routing

```
+-------------------------------------------------------------------------+
|                               Router Tree                               |
+-------------------------------------------------------------------------+
                                     │
      ┌──────────────────────────────┴──────────────────────────────┐
      ▼                                                             ▼
[ Public Routes ]                                         [ Protected Routes ]
(AuthLayout)                                              (AppLayout)
   ├── /login                                                ├── /dashboard
                                                             ├── /customers
                                                             │     ├── /customers (List & Search)
                                                             │     └── /customers/:id (Detail & Notes)
                                                             ├── /products (Catalog & Stock)
                                                             ├── /inventory (Stock Movements Log)
                                                             └── /challans
                                                                   ├── /challans (List & Search)
                                                                   ├── /challans/new (Create Draft)
                                                                   └── /challans/:id (View & Confirm/Cancel)
```

---

## 2. Detailed Page Breakdown

| Page Path | Target Page Name | Access Scope | Key Features & Actions |
| :--- | :--- | :--- | :--- |
| `/login` | **Login Page** | Public | Email/Password login form, role test credentials picker for quick demoing. |
| `/dashboard` | **Dashboard Overview** | All Roles | High-level metrics: Total Customers, Low Stock Alerts, Total Challans (Draft vs Confirmed), recent activity logs. |
| `/customers` | **Customer CRM Directory** | All Roles | Filterable table by status (`LEAD`, `ACTIVE`), search bar, "Add Customer" modal trigger (Sales/Admin only). |
| `/customers/:id` | **Customer Details** | All Roles | Comprehensive customer profile, GST info, address, follow-up history timeline, "Add Follow-up Note" modal. |
| `/products` | **Product Catalog** | All Roles | Product table with stock levels, low-stock warning badges, search by SKU/category, "Add Product" button (Warehouse/Admin). |
| `/inventory` | **Stock Movement Audit** | All Roles | Detailed log of stock movements (`IN`/`OUT`), reason, created by user, date filters, "Manual Stock Movement" modal (Warehouse/Admin). |
| `/challans` | **Sales Challan Management** | All Roles | List of sales challans, status filters (`DRAFT`, `CONFIRMED`, `CANCELLED`), "Create Challan" button (Sales/Admin). |
| `/challans/new` | **Create Sales Challan** | `ADMIN`, `SALES` | Interactive form: Select customer, dynamic multi-product line items, quantity pickers, live total calculation, "Save as Draft" submit. |
| `/challans/:id` | **Challan Detail & Confirm** | All Roles | Itemized snapshot voucher view, "Confirm Challan" trigger with atomic stock check alert, "Cancel Challan" button. |

---

## 3. Component Hierarchy

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx               # Render status pills (LEAD, ACTIVE, DRAFT, CONFIRMED)
│   │   ├── Modal.tsx               # Reusable dialog backdrop & container
│   │   ├── DataTable.tsx           # Generic paginated data table component
│   │   └── ToastNotification.tsx   # Global feedback alert messages
│   ├── layout/
│   │   ├── Sidebar.tsx             # Collapsible navigation with role-based item filtering
│   │   ├── Header.tsx              # Top bar with current user info, role badge, logout
│   │   └── AppLayout.tsx           # Main application frame
│   └── modules/
│       ├── crm/
│       │   ├── CustomerFormModal.tsx
│       │   └── AddNoteModal.tsx
│       ├── products/
│       │   ├── ProductFormModal.tsx
│       │   └── LowStockBadge.tsx
│       ├── inventory/
│       │   └── ManualMovementModal.tsx
│       └── challan/
│           ├── ChallanStatusBadge.tsx
│           ├── ProductSelectorRow.tsx
│           └── ChallanSnapshotTable.tsx
```

---

## 4. Route Protection & RBAC Enforcement

### 1. `ProtectedRoute.tsx`
Wraps private pages. Checks if `AuthContext` contains a valid user session and token. If false, stores return path and redirects to `/login`.

### 2. `RoleGuard.tsx`
Checks logged-in user role against allowed roles for specific pages or actions.

```tsx
// Conceptual RoleGuard Component
interface RoleGuardProps {
  allowedRoles: ('ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard = ({ allowedRoles, children, fallback = null }: RoleGuardProps) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
```

---

## 5. UI/UX Design System & Aesthetics

- **Theme & Palette:** Sleek modern dashboard theme featuring deep slate/indigo navigation, neutral crisp backgrounds (`#F8FAFC`), distinct functional status colors:
  - `ACTIVE` / `CONFIRMED` / `IN Movement`: Emerald Green (`#10B981`)
  - `LEAD` / `DRAFT`: Amber / Warm Gold (`#F59E0B`)
  - `CANCELLED` / `OUT Movement` / `Low Stock Alert`: Crimson Red (`#EF4444`)
- **Typography:** Modern clean sans-serif font (Inter / Outfit).
- **Responsive Layout:** Dynamic grid / flexbox layouts adapting seamlessly across desktop and tablet viewpoints.
