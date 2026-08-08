# Comprehensive Edge Cases & Mitigation Strategies

This document identifies potential edge cases across all system modules and details the technical handling and error response strategies for the **Mini ERP + CRM Operations Portal**.

---

## 1. Authentication & Security Edge Cases

| Scenario / Edge Case | Trigger Condition | System Behavior & Mitigation | API Response / Code |
| :--- | :--- | :--- | :--- |
| **Wrong Password** | User enters incorrect password during login. | Return generic 401 response; avoid revealing whether email exists to prevent enumeration. | `401 Unauthorized`<br>`INVALID_CREDENTIALS` |
| **Invalid JWT Token** | Client sends malformed or tampered token in Bearer header. | JWT verify middleware fails; rejects request and clears frontend auth state. | `401 Unauthorized`<br>`INVALID_TOKEN` |
| **Expired JWT Token** | Token age exceeds 24-hour expiration window. | Returns explicit token expiration code; frontend redirects user to `/login`. | `401 Unauthorized`<br>`TOKEN_EXPIRED` |
| **Unauthorized Role Access** | `SALES` user attempts to trigger `POST /inventory/movements` (Warehouse/Admin endpoint). | RBAC middleware checks `req.user.role`; blocks request prior to controller execution. | `403 Forbidden`<br>`INSUFFICIENT_PERMISSIONS` |

---

## 2. Customer CRM Edge Cases

| Scenario / Edge Case | Trigger Condition | System Behavior & Mitigation | API Response / Code |
| :--- | :--- | :--- | :--- |
| **Invalid Email / Mobile Format** | User inputs malformed email (e.g. `user@com`) or non-numeric mobile. | Zod validation middleware intercepts payload before service layer execution. | `400 Bad Request`<br>`VALIDATION_ERROR` |
| **Missing Required Fields** | Payload lacks `customerName`, `mobile`, or `address`. | Schema validator highlights exact missing fields in `error.details`. | `400 Bad Request`<br>`MISSING_REQUIRED_FIELDS` |
| **Search With Zero Matches** | Query string matches no customer name, email, or mobile. | Return `200 OK` with an empty array `data: []` and total count `total: 0`. | `200 OK`<br>`data: []` |

---

## 3. Product Catalog Edge Cases

| Scenario / Edge Case | Trigger Condition | System Behavior & Mitigation | API Response / Code |
| :--- | :--- | :--- | :--- |
| **Duplicate SKU Creation** | User attempts to create a product with an existing `sku`. | Database unique constraint on `Product.sku` catches collision; service converts to clean API error. | `409 Conflict`<br>`DUPLICATE_SKU` |
| **Negative Unit Price / Stock** | Payload contains `unitPrice: -50` or `currentStock: -10`. | Zod schema enforces `unitPrice > 0` and `currentStock >= 0`. SQL check constraints enforce DB layer safety. | `400 Bad Request`<br>`INVALID_NUMERIC_VALUE` |
| **Low-Stock Alert Trigger** | `Product.currentStock <= Product.minStockAlert`. | Product detail/list response flags `isLowStock: true`; UI highlights badge in amber/red on Dashboard. | `200 OK`<br>`isLowStock: true` |

---

## 4. Inventory & Stock Movement Edge Cases

| Scenario / Edge Case | Trigger Condition | System Behavior & Mitigation | API Response / Code |
| :--- | :--- | :--- | :--- |
| **Manual Stock Out Exceeds Stock** | Warehouse user creates `OUT` movement with `quantityChanged: 50` when `currentStock: 20`. | Service layer checks `currentStock - quantityChanged < 0`; rejects transaction. | `400 Bad Request`<br>`INSUFFICIENT_STOCK` |
| **Invalid Movement Type / Quantity** | Movement type is not `IN` or `OUT`, or quantity is `<= 0`. | Enum validation and positive integer validation reject payload. | `400 Bad Request`<br>`INVALID_MOVEMENT_TYPE` |

---

## 5. Sales Challan Edge Cases (Critical Rules)

| Scenario / Edge Case | Trigger Condition | System Behavior & Mitigation | API Response / Code |
| :--- | :--- | :--- | :--- |
| **Empty Items Array** | Creating challan with `items: []`. | Validation schema mandates `items.length >= 1`. | `400 Bad Request`<br>`EMPTY_CHALLAN_ITEMS` |
| **Invalid Customer or Product ID** | `customerId` or `productId` does not exist in DB. | Foreign key pre-check validates existence before challan creation. | `404 Not Found`<br>`RESOURCE_NOT_FOUND` |
| **Zero or Negative Quantity** | Item quantity is `0` or `-5`. | Schema validation mandates `quantity >= 1`. | `400 Bad Request`<br>`INVALID_QUANTITY` |
| **Confirming Non-Draft Challan** | Triggering confirmation on a Challan already in `CONFIRMED` or `CANCELLED` status. | Service layer checks `challan.status === 'DRAFT'`. If false, rejects operation. | `400 Bad Request`<br>`CHALLAN_NOT_DRAFT` |
| **Confirming Cancelled Challan** | Attempting to confirm a cancelled challan. | Blocked by state check; cancelled challans are immutable terminal states. | `400 Bad Request`<br>`CHALLAN_CANCELLED` |
| **Multi-Item Stock Shortage (Atomic Rule)** | Product A (stock 10, req 5), Product B (stock 2, req 10). | Transaction evaluates ALL items first. Identifies Product B failure, **rolls back transaction completely**. Stock for Product A is **NOT** reduced. Challan remains `DRAFT`. | `400 Bad Request`<br>`INSUFFICIENT_STOCK`<br>(Lists failing SKUs) |
| **Product Information Changes Later** | Product name, SKU, or price is edited in catalog after Challan creation. | Challan items preserve original frozen values (`productName`, `sku`, `unitPrice`) stored during creation. Historical vouchers remain unchanged. | N/A (Guaranteed by Schema Snapshot Design) |
