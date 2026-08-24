# Mayura Jewellers — Backend API Foundation (Phase B-01)

Official backend infrastructure for **Mayura Jewellers** dynamic web platform. Built to support customer operations, CMS administration, catalogue management, and consultations while maintaining compatibility with the existing static/React frontend.

---

## Tech Stack

* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB (Mongoose ODM)
* **Middleware**: CORS, Morgan (Logging), Custom Error & 404 Handlers
* **Environment Handling**: `dotenv`

---

## Folder Structure

```text
mayura-jewellers-backend/
├── src/
│   ├── config/
│   │   ├── db.js             # Mongoose connection & status checker
│   │   ├── env.js            # Environment variable loader & validator
│   │   └── cors.js           # CORS configuration
│   │
│   ├── controllers/
│   │   └── healthController.js # Health check endpoint logic
│   │
│   ├── middleware/
│   │   ├── errorHandler.js   # Centralized error handler
│   │   └── notFound.js       # 404 handler for undefined routes
│   │
│   ├── routes/
│   │   └── healthRoutes.js   # Route handler for /api/v1/health
│   │
│   ├── app.js                # Express app setup & middleware pipeline
│   └── server.js             # HTTP server entry point & DB boot
│
├── .env.example              # Environment variables template
├── .env                      # Local environment variables (ignored by Git)
├── .gitignore                # Git ignore configuration
├── package.json              # Backend dependencies & scripts
└── README.md                 # Project documentation
```

---

## Environment Variables

Copy `.env.example` to `.env` before starting the server:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP Server Port | `5000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/mayura_jewellers` |
| `CLIENT_URL` | Frontend URL allowed by CORS | `http://localhost:5173` |
| `JWT_SECRET` | Secret key for JWT signing (future auth phases) | `your_secret_key` |

---

## Local Setup & Development Server

### 1. Install Dependencies

```bash
cd mayura-jewellers-backend
npm install
```

### 2. MongoDB Setup

Ensure MongoDB is running locally or provide a valid MongoDB Atlas connection string in `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/mayura_jewellers
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Start Production Server

```bash
npm start
```

---

## API Versioning & Response Conventions

All backend APIs are prefixed with `/api/v1`.

### Success Response Format

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

### Failure Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Health Check Endpoint

```text
GET /api/v1/health
```

### Sample Response

```json
{
  "success": true,
  "message": "Mayura Jewellers API is running",
  "data": {
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-08-21T12:36:12.000Z"
  }
}
```

---

## Planned Architecture (Future Phases)

* **Phase B-02**: Authentication & Authorization (JWT, Customer & Admin Roles)
* **Phase B-03**: Product & Category Management (Catalogue CRUD, MongoDB Models)
* **Phase B-04**: Customer Operations & Wishlist/Cart Sync
* **Phase B-05**: Consultations & Newsletter Services
* **Phase B-06**: Order & Checkout Processing
* **Phase B-16**: Production Deployment (Render + MongoDB Atlas)
