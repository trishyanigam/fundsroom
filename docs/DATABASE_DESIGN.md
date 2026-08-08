# PostgreSQL Database Schema & Relational Design

This document details the PostgreSQL relational database schema, table definitions, field types, constraints, foreign key relationships, enums, indexing strategies, and immutability policies for the **Mini ERP + CRM Operations Portal**.

---

## 1. Database Entity Models Overview

The database comprises 6 core models configured in [`backend/prisma/schema.prisma`](file:///c:/Users/HP/OneDrive/Desktop/Fundsroom/backend/prisma/schema.prisma):

```
+----------------+          1:N          +------------------+
|      User      | ─────────────────────►|     Customer     |
+----------------+                       +------------------+
   │          │                                   │
   │ 1:N      │ 1:N                               │ 1:N
   ▼          ▼                                   ▼
+-----------+ +------------------+       +------------------+
| Product   | |  StockMovement   |       |     Challan      |
+-----------+ +------------------+       +------------------+
                                                  │ 1:N
                                                  ▼
                                         +------------------+
                                         |   ChallanItem    |
                                         +------------------+
```

---

## 2. Model Specifications

### 2.1 Challan Table (`Challan`)

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, `default(uuid())` | Unique challan voucher identifier |
| `challanNumber` | `String` | Unique, `CH-YYYY-XXXXXX` | Auto-generated readable challan number |
| `customerId` | `UUID` | Foreign Key (`Customer.id`), `onDelete: Restrict` | Target customer relationship |
| `status` | `Enum` | `ChallanStatus` (`DRAFT`, `CONFIRMED`, `CANCELLED`) | Lifecycle status |
| `totalQuantity` | `Integer` | `NOT NULL` | Server-calculated total units sum |
| `createdById` | `UUID` | Foreign Key (`User.id`), `onDelete: Restrict` | User who generated voucher |
| `createdAt` | `Timestamp` | `default(now())` | Creation timestamp |

### 2.2 ChallanItem Table (`ChallanItem`) - Product Historical Snapshot

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, `default(uuid())` | Line item identifier |
| `challanId` | `UUID` | Foreign Key (`Challan.id`), `onDelete: Cascade` | Parent challan reference |
| `productId` | `UUID` | Foreign Key (`Product.id`), `onDelete: Restrict` | Referenced catalog product ID |
| `productName` | `String` | `NOT NULL` | **Frozen product name snapshot** |
| `sku` | `String` | `NOT NULL` | **Frozen product SKU snapshot** |
| `unitPrice` | `Decimal` | `@db.Decimal(12, 2)` | **Frozen unit price snapshot** |
| `quantity` | `Integer` | `NOT NULL`, `quantity > 0` | Quantity ordered for this item |

---

## 3. Product Historical Snapshot Architecture

To guarantee historical financial and audit accuracy, `ChallanItem` stores frozen copies of `productName`, `sku`, and `unitPrice` captured at the moment of creation/update.
- Even if a product is later renamed or repriced in the Product catalog, historical challan vouchers retain the original price, name, and SKU as of voucher generation.

---

## 4. Challan Number Generation Strategy

- **Format:** `CH-YYYY-XXXXXX` (e.g. `CH-2026-000001`).
- **Generation:** Derived server-side within the `prisma.$transaction` block using sequence counts.
- **Race Condition Prevention:** Database `UNIQUE` constraint on `challanNumber` provides final protection against duplicate numbers under concurrent requests.
