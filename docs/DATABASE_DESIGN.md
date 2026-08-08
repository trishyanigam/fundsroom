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

## 2. Challan Confirmation Single-Transaction Rationale

Challan confirmation (`PUT /api/v1/challans/:id/confirm`) must execute within a single interactive Prisma transaction (`prisma.$transaction`) across `Challan`, `Product`, and `StockMovement` for the following structural integrity reasons:

1. **Multi-Item Atomic Verification & Rollback**: A sales challan can contain multiple line items (e.g. 5 products). If items #1 through #4 have sufficient stock, but item #5 has insufficient stock, PostgreSQL must abort the transaction and roll back ALL changes. Without a single transaction, items #1-#4 would suffer partial stock deduction, corrupting inventory state.
2. **Synchronized Audit Logging**: Every stock reduction on `Product.currentStock` must be paired 1-to-1 with an `OUT` `StockMovement` record. A single transaction guarantees that stock can never be reduced without a corresponding audit movement log.
3. **Status Immutability**: The challan status transitions from `DRAFT` to `CONFIRMED` only after all product stock deductions and movement creations commit successfully.
