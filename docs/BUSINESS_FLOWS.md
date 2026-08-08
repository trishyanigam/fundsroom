# Core Business Logic & Process Flow Diagrams

This document details the critical operational workflows and business logic pipelines for the **Mini ERP + CRM Operations Portal**.

---

## 1. Authentication & Session Flow

```
[ User ]                   [ React Frontend ]             [ Express API Layer ]           [ PostgreSQL DB ]
   │                              │                                │                             │
   │ 1. Submits email + password  │                                │                             │
   ──────────────────────────────>│                                │                             │
   │                              │ 2. POST /api/v1/auth/login     │                             │
   │                              ────────────────────────────────>│                             │
   │                              │                                │ 3. Fetch User by Email      │
   │                              │                                ─────────────────────────────>│
   │                              │                                │ 4. Return User Record       │
   │                              │                                <─────────────────────────────│
   │                              │                                │ 5. Validate Password (bcrypt)
   │                              │                                │ 6. Sign JWT (userId, role)  │
   │                              │ 7. Returns JWT + User DTO      │                             │
   │                              <────────────────────────────────│                             │
   │ 8. Store Token & Redirect    │                                                              │
   <──────────────────────────────│                                                              │
```

---

## 2. Customer CRM Lead-to-Active Pipeline

```
  +--------------------+         Initial Follow-up          +--------------------+
  |   LEAD Customer    | ─────────────────────────────────> |   LEAD Customer    |
  |  (Prospect Status) |                                    | (Follow-Up Logged) |
  +--------------------+                                    +--------------------+
            │                                                         │
            │ First Confirmed Sales Challan Generated                 │ Client Approves Contract
            ▼                                                         ▼
  +--------------------+                                    +--------------------+
  |  ACTIVE Customer   | <───────────────────────────────── |  ACTIVE Customer   |
  |  (Regular Order)   |                                    | (Verified Account) |
  +--------------------+                                    +--------------------+
```

### Operational Steps:
1. **Creation:** Sales team adds customer (Default status: `LEAD`, default type: `RETAIL`/`WHOLESALE`/`DISTRIBUTOR`).
2. **Follow-up Logging:** Sales rep records notes (`notes`) and updates next contact date (`followUpDate`).
3. **Activation:** Upon confirmed orders or explicit status change, status updates to `ACTIVE`.

---

## 3. Inventory Stock Movement Workflow

Stock levels are updated via two distinct mechanisms:

### Scenario A: Manual Warehouse Stock Movement (`IN` or `OUT`)
- **Actor:** Warehouse User or Admin.
- **Purpose:** Receiving shipment from supplier (`IN`), recording damage/loss (`OUT`), or manual audit correction.
- **Process:**
  1. User selects product, inputs `quantityChanged`, `movementType`, and `reason`.
  2. Database checks if `movementType == OUT` and `currentStock - quantityChanged < 0`. If true, rejects with error `INSUFFICIENT_STOCK`.
  3. Increments/decrements `Product.currentStock`.
  4. Inserts immutable record into `StockMovement` audit log.

### Scenario B: Automated Stock Deduct on Challan Confirmation
- **Actor:** Sales User or Admin.
- **Process:** Triggered automatically via atomic database transaction during Challan Confirmation (see Section 4).

---

## 4. Sales Challan Lifecycle & Critical Transaction Logic

```
                    +-----------------------------+
                    |    Create Sales Challan     |
                    |  (POST /api/v1/challans)    |
                    +-----------------------------+
                                   │
                                   ▼
                    +-----------------------------+
                    |    Status = "DRAFT"         |
                    |  (Zero Stock Modification)  |
                    +-----------------------------+
                                   │
                                   ├─────────────────────────────┐
                                   ▼                             ▼
                    +-----------------------------+   +-----------------------------+
                    |  POST /challans/:id/cancel  |   | POST /challans/:id/confirm  |
                    +-----------------------------+   +-----------------------------+
                                   │                               │
                                   ▼                               ▼
                    +-----------------------------+   +-----------------------------+
                    |   Status = "CANCELLED"      |   | Begin Database Transaction  |
                    +-----------------------------+   +-----------------------------+
                                                                   │
                                                                   ▼
                                                      +-----------------------------+
                                                      | Check Stock for ALL Items   |
                                                      +-----------------------------+
                                                                   │
                                           ┌───────────────────────┴───────────────────────┐
                                           ▼                                               ▼
                              [ Any Product Lacks Stock ]                    [ All Products Have Stock ]
                                           │                                               │
                                           ▼                                               ▼
                              +--------------------------+                   +--------------------------+
                              | ROLLBACK Transaction     |                   | Deduct Stock for Each    |
                              | Return Error 400 API     |                   | Product                  |
                              | Stock Unchanged          |                   +--------------------------+
                              +--------------------------+                                 │
                                                                                           ▼
                                                                             +--------------------------+
                                                                             | Create OUT StockMovement |
                                                                             | for Each Item            |
                                                                             +--------------------------+
                                                                                           │
                                                                                           ▼
                                                                             +--------------------------+
                                                                             | Status = "CONFIRMED"     |
                                                                             | COMMIT Transaction       |
                                                                             +--------------------------+
```

---

## 5. Critical Business Rules Enforcement

### RULE 1: Draft Challan Stock Immunity
- Creating a Draft Challan records the customer order intent and captures product snapshots (`productName`, `sku`, `unitPrice`, `quantity`), but **MUST NOT** decrement `currentStock` or create `StockMovement` entries.

### RULE 2: Atomic Transactional Challan Confirmation Logic
When a request to confirm a Challan is received (`POST /api/v1/challans/:id/confirm`):

```typescript
// Conceptual Transaction Logic (Prisma Interactive Transaction)
await prisma.$transaction(async (tx) => {
  // 1. Fetch Challan with items & ensure status is DRAFT
  const challan = await tx.challan.findUnique({
    where: { id: challanId },
    include: { items: true }
  });

  if (!challan || challan.status !== 'DRAFT') {
    throw new BadRequestError("Only DRAFT challans can be confirmed.");
  }

  // 2. Validate stock for EVERY item in the challan
  const insufficientItems = [];
  for (const item of challan.items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.currentStock < item.quantity) {
      insufficientItems.push({
        sku: item.sku,
        productName: item.productName,
        available: product ? product.currentStock : 0,
        requested: item.quantity
      });
    }
  }

  // 3. ATOMIC CHECK: If ANY product lacks stock, ABORT TRANSACTION
  if (insufficientItems.length > 0) {
    throw new InsufficientStockError("Cannot confirm challan due to insufficient stock.", insufficientItems);
  }

  // 4. Reduce stock & create OUT stock movement log for ALL items
  for (const item of challan.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { currentStock: { decrement: item.quantity } }
    });

    await tx.stockMovement.create({
      data: {
        productId: item.productId,
        quantityChanged: item.quantity,
        movementType: 'OUT',
        reason: `Challan Confirmation: ${challan.challanNumber}`,
        createdById: userId
      }
    });
  }

  // 5. Update Challan status to CONFIRMED
  return await tx.challan.update({
    where: { id: challanId },
    data: { status: 'CONFIRMED' }
  });
});
```

### Key Safety Guarantees:
- **No Partial Deductions:** If Item A (qty: 10) and Item B (qty: 5) have stock, but Item C (qty: 20, stock: 2) lacks stock, **zero** items are deducted, no stock movements are written, and the Challan remains in `DRAFT` status.
