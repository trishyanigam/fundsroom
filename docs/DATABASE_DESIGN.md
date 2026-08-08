# Database Design & Entity Relationship Specifications

This document outlines the database schema, Prisma models, entity relationships, index design, data constraints, deletion behaviors, and historical snapshot preserve rules for the **Mini ERP + CRM Operations Portal**.

---

## 1. Entity Relationship Diagram (ERD)

```
User
 |
 +---- Customer
 |
 +---- Challan ---- Customer
 |        |
 |        +---- ChallanItem ---- Product
 |
 +---- StockMovement ---- Product
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

## 3. Database Schema Definitions (Prisma Schema)

```prisma
// 1. USER MODEL
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  password     String
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

// 2. CUSTOMER MODEL
model Customer {
  id           String         @id @default(uuid())
  customerName String
  mobile       String
  email        String
  businessName String
  gstNumber    String?
  customerType CustomerType   @default(RETAIL)
  address      String
  status       CustomerStatus @default(LEAD)
  followUpDate DateTime?
  notes        String?        @db.Text

  createdById  String
  createdBy    User           @relation("UserCustomers", fields: [createdById], references: [id], onDelete: Restrict)
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

// 3. PRODUCT MODEL
model Product {
  id                String   @id @default(uuid())
  name              String
  sku               String   @unique
  category          String
  unitPrice         Decimal  @db.Decimal(12, 2)
  currentStock      Int      @default(0)
  minimumStock      Int      @default(5)
  warehouseLocation String

  createdById       String
  createdBy         User     @relation("UserProducts", fields: [createdById], references: [id], onDelete: Restrict)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relationships
  stockMovements    StockMovement[]
  challanItems      ChallanItem[]

  @@index([sku])
  @@index([category])
  @@map("products")
}

// 4. STOCK MOVEMENT MODEL
model StockMovement {
  id           String       @id @default(uuid())
  productId    String
  product      Product      @relation(fields: [productId], references: [id], onDelete: Restrict)
  quantity     Int
  movementType MovementType
  reason       String

  createdById  String
  createdBy    User         @relation("UserStockMovements", fields: [createdById], references: [id], onDelete: Restrict)
  createdAt    DateTime     @default(now())

  @@index([productId])
  @@index([movementType])
  @@index([createdAt])
  @@map("stock_movements")
}

// 5. CHALLAN MODEL
model Challan {
  id            String        @id @default(uuid())
  challanNumber String        @unique
  customerId    String
  customer      Customer      @relation(fields: [customerId], references: [id], onDelete: Restrict)
  status        ChallanStatus @default(DRAFT)
  totalQuantity Int           @default(0)

  createdById   String
  createdBy     User          @relation("UserChallans", fields: [createdById], references: [id], onDelete: Restrict)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relationships
  items         ChallanItem[]

  @@index([challanNumber])
  @@index([customerId])
  @@index([status])
  @@map("challans")
}

// 6. CHALLAN ITEM MODEL (Product Snapshot Preserved)
model ChallanItem {
  id          String   @id @default(uuid())
  challanId   String
  challan     Challan  @relation(fields: [challanId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Restrict)

  // IMMUTABLE PRODUCT SNAPSHOT FIELDS
  productName String
  sku         String
  unitPrice   Decimal  @db.Decimal(12, 2)
  quantity    Int

  @@index([challanId])
  @@index([productId])
  @@map("challan_items")
}
```

---

## 4. Foreign Key Deletion & Update Behavior

1. **Restrictive Deletion (`onDelete: Restrict`):**
   - **`Customer` Deletion:** A Customer linked to existing `Challan` records cannot be deleted. Historical vouchers must be protected.
   - **`Product` Deletion:** A Product referenced in `ChallanItem` or `StockMovement` cannot be deleted from the database. This prevents broken foreign keys and corrupt audit logs.
   - **`User` Deletion:** A User who created customers, products, stock movements, or challans cannot be hard-deleted.

2. **Cascading Deletion (`onDelete: Cascade`):**
   - **`ChallanItem` Deletion:** If a `DRAFT` Challan header is explicitly deleted by an Admin, its associated line items (`ChallanItem`) are automatically cleaned up via cascade.

---

## 5. Rationale & Core Design Rules

### Why `ChallanItem` Stores Product Snapshot Data
`ChallanItem` explicitly duplicates historical product details (`productName`, `sku`, `unitPrice`) alongside `productId` and `quantity`:
- **Price Inflation Protection:** If a product's price increases from $50 to $75 in the catalog next month, historical sales vouchers must retain the original $50 unit price as billed.
- **Catalog Rename Immunity:** If a product title or SKU is updated in the catalog, historical sales vouchers retain the exact title and SKU that existed on the order date.

### Why Stock Movement Quantity is Always Positive & Movement Type Determines Direction
- **Audit Consistency:** `StockMovement.quantity` stores a positive integer (`quantity > 0`), such as `quantity: 50`.
- **Direction Determination:** The `movementType` enum (`IN` or `OUT`) unambiguously defines whether stock increases or decreases.
- **Prevents Double Negatives:** Storing negative integers (e.g. `quantity: -10`) with `movementType: OUT` creates mathematical ambiguity. Storing positive amounts with explicit type guarantees clear audit reporting.

---

## 6. PostgreSQL Setup Instructions

To run PostgreSQL locally:
1. Ensure PostgreSQL (v14+) is installed and running on `localhost:5432`.
2. Create the database: `CREATE DATABASE minierp_db;`
3. Configure `backend/.env`:
   ```ini
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/minierp_db?schema=public"
   ```
4. Run Prisma schema validation: `npx prisma validate`
5. Run Prisma Client generation: `npx prisma generate`
6. Execute migrations: `npx prisma migrate dev --name initial_database_schema`
