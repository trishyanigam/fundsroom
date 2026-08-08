# Business Logic Workflows & Process Flows

This document details the operational business process flows for the **Mini ERP + CRM Operations Portal**.

---

## 1. Admin Dashboard Analytics Summary Flow

```
Start (User opens Dashboard)
   │
   ▼
GET /api/v1/dashboard/summary (Authorization: Bearer JWT)
   │
   ▼
Execute Concurrent Database Aggregation Queries (`Promise.all`):
   ├─► Query 1: Count Total Customers (`prisma.customer.count()`)
   ├─► Query 2: Count Total Products (`prisma.product.count()`)
   ├─► Query 3: Count Total Sales Challans (`prisma.challan.count()`)
   ├─► Query 4: Fetch Product Stock Levels -> Filter Low Stock Items (`currentStock <= minimumStock`)
   └─► Query 5: Fetch Top 5 Recent Sales Challans (`take: 5, orderBy: { createdAt: 'desc' }`)
   │
   ▼
Format Summary Object & Return HTTP 200 OK
```
