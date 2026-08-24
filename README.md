# Mayura Jewellers

Full-stack e-commerce platform for Mayura Jewellers — React (Vite) frontend with an Express & MongoDB backend API.

## Project Structure

```
Mayura_Jewellers/
├── backend/    Express + MongoDB REST API (src/server.js)
└── frontend/   React + Vite + Tailwind storefront & admin CMS
```

## Features

- Product catalog, collections, banners, blog, gallery, testimonials, FAQs, policies
- Cart, checkout, orders with Razorpay payments
- Admin CMS: products, media (Cloudinary uploads), homepage, navigation, settings
- Auth (JWT) with admin roles, email notifications (Resend/SMTP)

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MongoDB, Cloudinary, email credentials
npm run dev            # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Environment Variables

See `backend/.env.example` for all supported variables (MongoDB, JWT, Cloudinary, email providers).
