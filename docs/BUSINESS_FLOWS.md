# Business Logic Workflows & Process Flows

This document details the operational business process flows for the **Mini ERP + CRM Operations Portal**.

---

## 1. Sales Challan Confirmation & Transactional Stock Deduction Flow

```
Start (Sales / Admin user clicks "Confirm & Deduct Stock")
   │
   ▼
PUT /api/v1/challans/:id/confirm (No request body required)
   │
   ▼
Begin Prisma Interactive Transaction (`prisma.$transaction`)
   │
   ├─► 1. Verify Challan status == DRAFT (Return HTTP 409 Conflict if CONFIRMED or CANCELLED)
   │
   ├─► 2. Multi-Item Stock Availability Pre-Check Loop:
   │      For every item in challan.items:
   │         Is Product.currentStock >= item.quantity?
   │         │
   │         ├─► NO (Insufficient Stock on ANY item):
   │         │      │
   │         │      └─► ABORT & ROLLBACK TRANSACTION IMMEDIATELY!
   │         │             - Product stocks remain 100% untouched
   │         │             - Zero StockMovement records created
   │         │             - Challan status remains DRAFT
   │         │             - Return HTTP 409 Conflict with available vs requested details
   │         │
   │         └─► YES (Sufficient Stock on ALL items): Continue loop
   │
   ├─► 3. Atomic Multi-Item Stock Deduction & Audit Logging Loop:
   │      For every item in challan.items:
   │         - Decrement Product.currentStock by item.quantity (Row-level conditional lock)
   │         - Create OUT StockMovement (reason: "Sales Challan CH-YYYY-XXXXXX", createdById = req.user.id)
   │
   └─► 4. Update Challan.status = CONFIRMED
   │
   ▼
Commit Transaction & Return HTTP 200 OK
```
