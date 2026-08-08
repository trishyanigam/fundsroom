# Business Logic Workflows & Process Flows

This document details the operational business process flows for the **Mini ERP + CRM Operations Portal**.

---

## 1. Create Draft Sales Challan Workflow

```
Start (Sales / Admin user creates Sales Challan)
   │
   ▼
Validate Payload (customerId, non-empty items array, quantities > 0)
   │ (Reject if status = "CONFIRMED")
   ▼
Begin Prisma Interactive Transaction (`prisma.$transaction`)
   │
   ├─► Verify Customer exists (Return 404 if missing)
   │
   ├─► For each item in items array:
   │      ├─► Verify Product exists (Return 404 if missing)
   │      ├─► Extract Product Snapshot: productName, sku, unitPrice
   │      └─► Accumulate totalQuantity
   │
   ├─► Auto-Generate Unique Challan Number: CH-YYYY-XXXXXX
   │
   └─► Create Challan (status = DRAFT) & ChallanItem snapshot records
   │
   ▼ (ZERO STOCK MUTATION: Stock remains untouched)
Commit Transaction & Return HTTP 201 Created
```

---

## 2. Edit Draft Sales Challan Workflow

```
Start (Sales / Admin edits DRAFT Challan)
   │
   ▼
Check Challan Status: Is status == DRAFT?
   │
   ├─► NO (Status is CONFIRMED or CANCELLED):
   │      └─► Return HTTP 409 Conflict ("Challan cannot be edited")
   │
   └─► YES (Status is DRAFT):
          │
          ▼
   Begin Transaction -> Refresh Customer & Product Snapshots -> Update Items -> Recalculate totalQuantity -> Return HTTP 200 OK
```

---

## 3. Cancel Draft Sales Challan Workflow

```
Start (Sales / Admin cancels DRAFT Challan)
   │
   ▼
Check Challan Status: Is status == DRAFT?
   │
   ├─► NO (Status is CONFIRMED or CANCELLED):
   │      └─► Return HTTP 409 Conflict ("Challan cannot be cancelled")
   │
   └─► YES (Status is DRAFT):
          │
          ▼
   Update status = CANCELLED -> Zero Stock Mutation -> Return HTTP 200 OK
```
