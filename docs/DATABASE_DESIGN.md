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

### 2.1 StockMovement Table (`StockMovement`)

The `StockMovement` table serves as an immutable, audited transaction log recording all physical stock adjustments (`IN` or `OUT`).

| Field Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, `default(uuid())` | Unique movement record identifier |
| `productId` | `UUID` | Foreign Key (`Product.id`), `onDelete: Restrict` | Referenced product ID |
| `quantity` | `Integer` | `NOT NULL`, `quantity > 0` | Quantity of stock added or removed |
| `movementType` | `Enum` | `MovementType` (`IN`, `OUT`, `ADJUSTMENT`) | Type of stock movement |
| `reason` | `Text` | `NOT NULL` | Business explanation / reference number |
| `createdById` | `UUID` | Foreign Key (`User.id`), `onDelete: Restrict` | Authenticated user who executed transaction |
| `createdAt` | `Timestamp` | `default(now())` | Transaction timestamp |

---

## 3. Stock Movement Business Semantics & Immutability Policy

### 3.1 Transactional Atomicity
All stock adjustments (`IN` or `OUT`) are executed inside interactive Prisma Transactions (`prisma.$transaction`).
- **`IN` Movement**: Increments `Product.currentStock` by `quantity` AND creates `StockMovement` record atomically.
- **`OUT` Movement**: Validates `Product.currentStock >= quantity`. Decrements `Product.currentStock` by `quantity` AND creates `StockMovement` record atomically.
- **Rollback Guarantee**: If stock is insufficient or movement creation fails, the entire transaction rolls back cleanly so stock never changes without a corresponding movement log.

### 3.2 Negative Stock Prevention
Stock must **NEVER** drop below zero. Excessive `OUT` movement requests are rejected immediately with `409 Conflict` before any database modifications take place.

### 3.3 Historical Record Immutability Policy
Stock Movement records are immutable audit logs.
- **No Editing (`PUT`)**: API clients cannot alter past stock movements.
- **No Deletion (`DELETE`)**: Historical movement records cannot be purged.
- **Correction Strategy**: If a clerical error occurs, a new corrective stock movement (`IN` or `OUT`) must be logged.
