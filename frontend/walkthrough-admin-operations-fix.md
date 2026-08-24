# Walkthrough — Fix Broken Admin Customer Operations

Repaired and completed full MongoDB database integration for the Admin Customer Operations / Commerce pages:
- `/admin/orders` (Customer Orders Management)
- `/admin/orders/:id` (Admin Order Detail View)
- `/admin/enquiries` (Customer Enquiries Management)
- `/admin/consultations` (Video Consultation Queue)
- `/admin/newsletter` (Insiders Newsletter Subscribers)
- `/admin/inventory` (Stock Management Operation Modal UI Fixes)

---

## 1. Root Cause of Broken Pages & API Response Mismatch

### A. Token Resolution Mismatch
- Previously, `getAuthToken()` in `apiClient.js` was checking `mayura.token.v1` and `mayura.auth.v1`. If an admin logged in and stored the JWT under `mayura_auth_token`, `mayura_token`, or `token`, `apiClient` sent requests without an `Authorization: Bearer` header.
- Fix: Enhanced `getAuthToken()` in `apiClient.js` to inspect all token keys (`mayura.token.v1`, `mayura_auth_token`, `mayura_token`, `token`, `mayura.auth.v1` session objects).

### B. Missing Error State & Loading Traps
- Pages previously checked `if (res.success && res.data)`. If `res.success` was `false` (e.g. 401 expired session, 403 forbidden, or network failure), `setOrders([])` was skipped while `setLoading(false)` ran silently. The UI showed `"0 orders total"` and `"No customer orders matching the current criteria"` or remained stuck in a loading skeleton state.
- Fix: Implemented **strict three-state UI guarding**:
  - `LOADING`: Render animated champagne skeleton container.
  - `ERROR`: Render red alert card with HTTP status-specific messaging (`401` session expired prompt with Log In button, `403` forbidden prompt, `500` server error) and **[ Retry ]** button.
  - `SUCCESS`: Render real MongoDB records or clean empty state if query genuinely returns 0 items.

---

## 2. Page & Service Implementation Details

1. **`frontend/src/services/apiClient.js`**:
   - Enhanced `getAuthToken()` to resolve JWTs across all storage keys.
   - Standardized `handleResponse()` to return `{ success, status, message, data }` for both success and error responses.

2. **`frontend/src/pages/admin/AdminOrdersPage.jsx`**:
   - Fetches and displays 14 real orders from MongoDB.
   - Displays Order Ref, Customer Name, Email, Phone, Item Count, Grand Total, Payment Method & Status, Order Status, Date, and View Order button.
   - Added search, status filter (`PENDING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), payment status filter, payment method filter, date sorting, pagination, and error alert box with Retry/Login.

3. **`frontend/src/pages/admin/AdminOrderDetailPage.jsx`**:
   - Displays full customer details, shipping address, historical line items snapshot, financial summary, fulfillment info, payment info, and admin notes.
   - Status updates allow transition to `SHIPPED`, `DELIVERED`, `CANCELLED` with tracking info.

4. **`frontend/src/pages/admin/AdminInventoryPage.jsx`**:
   - Fixed Nullish Coalescing fallback for current units display (`Current: {selectedProduct.inventoryQuantity ?? 0} units`).
   - Fixed modal footer button layout (`flex flex-wrap items-center justify-between gap-3`), ensuring `Audit Logs`, `Cancel`, and `Save Stock Adjustment` buttons render cleanly without text clipping.

5. **`frontend/src/pages/admin/AdminEnquiriesPage.jsx`**, **`AdminConsultationsPage.jsx`**, **`AdminNewsletterPage.jsx`**:
   - Updated all fetch handlers to handle 401/403/500 HTTP status codes explicitly and render Error Cards with Retry controls.

---

## 3. Automated & Manual Verification Results

### Direct API Verification (Admin JWT)
- `GET /api/v1/admin/orders` $\rightarrow$ `200 OK` (Returns 14 real MongoDB orders).
- `GET /api/v1/admin/enquiries` $\rightarrow$ `200 OK` (Returns real enquiries).
- `GET /api/v1/admin/consultations` $\rightarrow$ `200 OK` (Returns real consultations).
- `GET /api/v1/admin/insiders` $\rightarrow$ `200 OK` (Returns real subscribers).

### Security Checks
- Guest request without token $\rightarrow$ `401 Unauthorized`.
- Customer request with Customer JWT $\rightarrow$ `403 Forbidden`.

### Automated Regression Suites
- `test_admin_orders.js` $\rightarrow$ **20/20 PASSED**.
- `test_admin_customer_operations.js` $\rightarrow$ **24/24 PASSED**.

---

## 4. Production Build Verification

Executed Vite production build in `frontend/`:
```bash
vite v5.4.21 building for production...
✓ 2092 modules transformed.
dist/index.html                         4.32 kB │ gzip:   1.57 kB
dist/assets/index-CNvx1-Dl.css        102.03 kB │ gzip:  16.46 kB
dist/assets/icons-qi2NuUsU.js          44.56 kB │ gzip:   8.82 kB
dist/assets/motion-DD5hDzxC.js        122.36 kB │ gzip:  40.87 kB
dist/assets/react-vendor-TrjXm2Sh.js  163.02 kB │ gzip:  53.23 kB
dist/assets/index-C6oW_vp7.js         675.66 kB │ gzip: 162.39 kB
✓ built in 24.38s
```
0 build errors.
