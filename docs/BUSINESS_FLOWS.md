# Business Logic Workflows & Process Flows

This document details the operational business process flows for the **Mini ERP + CRM Operations Portal**.

---

## 1. Stock IN Workflow

```
Start (Warehouse / Admin logs Stock IN)
   │
   ▼
Validate Payload (productId, quantity > 0, movementType = IN, reason)
   │
   ▼
Begin Prisma Interactive Transaction (`prisma.$transaction`)
   │
   ├─► Fetch Product Record (verify product exists)
   │
   ├─► Increment Stock: Product.currentStock = Product.currentStock + quantity
   │
   └─► Create StockMovement Audit Record (createdById = req.user.id)
   │
   ▼
Commit Transaction & Return HTTP 201 Created
```

---

## 2. Stock OUT Workflow

```
Start (Warehouse / Admin logs Stock OUT)
   │
   ▼
Validate Payload (productId, quantity > 0, movementType = OUT, reason)
   │
   ▼
Begin Prisma Interactive Transaction (`prisma.$transaction`)
   │
   ├─► Fetch Product Record (verify product exists)
   │
   ├─► Check Stock Availability: Is Product.currentStock >= quantity?
   │      │
   │      ├─► NO (Insufficient Stock):
   │      │      │
   │      │      └─► Abort & Rollback Transaction ──► Return HTTP 409 Conflict
   │      │
   │      └─► YES (Sufficient Stock):
   │             │
   │             ├─► Decrement Stock: Product.currentStock = Product.currentStock - quantity
   │             │
   │             └─► Create StockMovement Audit Record (createdById = req.user.id)
   │
   ▼
Commit Transaction & Return HTTP 201 Created
```

---

## 3. Customer CRM & Sales Challan Integration Workflow

*(Sales Challans will automatically generate OUT Stock Movements upon confirmation in Phase 8).*
