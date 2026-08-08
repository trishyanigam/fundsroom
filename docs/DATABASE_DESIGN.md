# Database Design & Entity Relationship Specifications

This document outlines the database schema, Prisma models, entity relationships, index design, data constraints, and historical snapshot preserve rules for the **Mini ERP + CRM Operations Portal**.

---

## 1. Entity Relationship Diagram (ERD)

```
  +------------------+         creates         +---------------------+
  |       User       | ──────────────────────> |      Customer       |
  |  (ADMIN, SALES,  |                         | (Lead/Active, Type) |
  | WAREHOUSE, ACCT) | ──┐                     +---------------------+
  +------------------+   │                                │ 1
           │             │                                │
           │ creates     │ creates                        │ has many
           │             │                                ▼
           ▼             │                     +---------------------+
  +------------------+   │                     |       Challan       |
  |     Product      |   │                     |  (DRAFT, CONFIRMED, |
  | (SKU, Stock, Loc)|   │                     |      CANCELLED)     |
  +------------------+   │                     +---------------------+
     │ 1        │ 1      │                                │ 1
     │          │        │                                │
     │ has many │        ▼                                ▼ has many
     │          │  +------------------+        +---------------------+
     │          └─>|  StockMovement   |        |     ChallanItem     |
     │             |    (IN, OUT)     |        | (Product Snapshot:  |
     │             +------------------+        |  Name, SKU, Price)  |
     │                                         +---------------------+
     └────────────────────────────────────────────────────┘
                          references
```

---

## 2. Enumerations

```prisma
enum Role {
  ADMIN
  SALES
  WAREHOUSE
  ACCOUNTS
}

enum CustomerType {
  RETAIL
  WHOLESALE
  DISTRIBUTOR
}

enum CustomerStatus {
  LEAD
  ACTIVE
  INACTIVE
}

enum MovementType {
  IN
  OUT
}

enum ChallanStatus {
  DRAFT
  CONFIRMED
  CANCELLED
}
```

---

## 3. Database Schema Definitions (Prisma Syntax)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ------------------------------------------------------
// 1. USER ENTITY
// ------------------------------------------------------
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(SALES)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relationships
  customers      Customer[]      @relation("UserCustomers")
  products       Product[]       @relation("UserProducts")
  stockMovements StockMovement[] @relation("UserStockMovements")
  challans       Challan[]       @relation("UserChallans")

  @@map("users")
}

// ------------------------------------------------------
// 2. CUSTOMER ENTITY (CRM)
// ------------------------------------------------------
model Customer {
  id           String         @id @default(uuid())
  customerName String
  mobile       String
  email        String
  businessName String
  gstNumber    String?        // Optional GST identification
  customerType CustomerType   @default(RETAIL)
  address      String
  status       CustomerStatus @default(LEAD)
  followUpDate DateTime?
  notes        String?        @db.Text

  createdById  String
  createdBy    User           @relation("UserCustomers", fields: [createdById], references: [id])
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  // Relationships
  challans     Challan[]

  @@index([customerName])
  @@index([mobile])
  @@index([email])
  @@index([status])
  @@map("customers")
}

// ------------------------------------------------------
// 3. PRODUCT ENTITY (Catalog & Current Inventory)
// ------------------------------------------------------
model Product {
  id                String   @id @default(uuid())
  productName       String
  sku               String   @unique
  category          String
  unitPrice         Decimal  @db.Decimal(12, 2)
  currentStock      Int      @default(0)
  minStockAlert     Int      @default(5)
  warehouseLocation String

  createdById       String
  createdBy         User     @relation("UserProducts", fields: [createdById], references: [id])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relationships
  stockMovements    StockMovement[]
  challanItems      ChallanItem[]

  @@index([sku])
  @@index([category])
  @@map("products")
}

// ------------------------------------------------------
// 4. STOCK MOVEMENT ENTITY (Audit Trail)
// ------------------------------------------------------
model StockMovement {
  id              String       @id @default(uuid())
  productId       String
  product         Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantityChanged Int
  movementType    MovementType
  reason          String

  createdById     String
  createdBy       User         @relation("UserStockMovements", fields: [createdById], references: [id])
  createdAt       DateTime     @default(now())

  @@index([productId])
  @@index([movementType])
  @@index([createdAt])
  @@map("stock_movements")
}

// ------------------------------------------------------
// 5. CHALLAN ENTITY (Sales Order Header)
// ------------------------------------------------------
model Challan {
  id            String        @id @default(uuid())
  challanNumber String        @unique // e.g. CH-20260808-0001
  customerId    String
  customer      Customer      @relation(fields: [customerId], references: [id])
  totalQuantity Int           @default(0)
  status        ChallanStatus @default(DRAFT)

  createdById   String
  createdBy     User          @relation("UserChallans", fields: [createdById], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relationships
  items         ChallanItem[]

  @@index([challanNumber])
  @@index([customerId])
  @@index([status])
  @@map("challans")
}

// ------------------------------------------------------
// 6. CHALLAN ITEM ENTITY (Product Snapshot Preservation)
// ------------------------------------------------------
model ChallanItem {
  id          String   @id @default(uuid())
  challanId   String
  challan     Challan  @relation(fields: [challanId], references: [id], onDelete: Cascade)
  
  productId   String
  product     Product  @relation(fields: [productId], references: [id])

  // CRITICAL HISTORICAL PRODUCT SNAPSHOT FIELDS
  productName String   // Captured snapshot of Product.productName
  sku         String   // Captured snapshot of Product.sku
  unitPrice   Decimal  @db.Decimal(12, 2) // Captured snapshot of Product.unitPrice
  quantity    Int

  @@index([challanId])
  @@index([productId])
  @@map("challan_items")
}
```

---

## 4. Product Snapshot Requirement & Rationale

### Why Product Snapshot Information is Mandatory

When a sales user adds products to a Sales Challan, `ChallanItem` stores both the foreign key reference `productId` **AND** frozen historical copies of:
- `productName`
- `sku`
- `unitPrice`
- `quantity`

### Key Benefits:
1. **Catalog Mutation Protection:** If an Admin renames a product or updates its unit price in the catalog months later, historical Challans maintain the exact product title, SKU, and unit price as recorded on the date of sale.
2. **Audit Compliance:** Accounting and compliance audits require that historical sales vouchers cannot be mutated retroactively by catalog changes.

---

## 5. Constraints & Indexes Summary

1. **Unique Constraints:**
   - `User.email` must be unique.
   - `Product.sku` must be unique.
   - `Challan.challanNumber` must be unique.

2. **Data Integrity Constraints:**
   - `Product.currentStock` >= 0 (Enforced in database via SQL check constraint & application layer).
   - `Product.unitPrice` > 0.
   - `ChallanItem.quantity` > 0.
   - `StockMovement.quantityChanged` > 0.

3. **Database Indexing Strategy:**
   - Indexes on frequently searched columns (`Customer.customerName`, `Customer.mobile`, `Product.sku`, `Challan.challanNumber`).
   - Indexes on foreign keys (`ChallanItem.challanId`, `StockMovement.productId`, `Challan.customerId`) for optimal JOIN query performance.
