# ShopAlpha — CodeAlpha E-Commerce Store

> **CodeAlpha Full Stack Development Internship — Task 1: Simple E-Commerce Store**

A full-stack e-commerce web application built with React + Vite, Tailwind CSS, Express, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, TypeScript |
| Styling | Tailwind CSS |
| Backend / API | Express REST API |
| Auth | JWT email/password auth |
| Database | MongoDB via Mongoose |
| Icons | Lucide React |

---

## Features

### Customer
- User registration & login (JWT-secured sessions)
- Browse all products with search and category filters
- Product detail page with related products
- Add to cart, update quantities, remove items
- Checkout with shipping form and order creation
- Order history with expandable details

### Admin
- Secure admin-only dashboard (role-based access)
- Add new products with image preview
- Edit existing products
- Delete products with confirmation
- Stats overview (total products, orders, revenue)

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Auth state + JWT session
│   └── CartContext.tsx  # Shopping cart state
├── lib/
│   └── api.ts           # Express API client
├── pages/               # Route-level page components
│   ├── HomePage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── OrdersPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       └── ProductFormPage.tsx
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx              # Router + layout
└── main.tsx
```

---

## Database Schema

### `profiles`
User data is stored in MongoDB. The `role` field controls admin access.

### `products`
Product catalog. Public read, admin-write RLS policies.

### `cart_items`
Per-user cart. Owner-scoped RLS (user sees only their own cart).

### `orders` + `order_items`
Order history. Owner-scoped RLS. Stores a snapshot of product name/image at purchase time.

---

## Getting Started (Admin)

1. Register a new account via `/register`
2. In MongoDB, update your user document and set `role` to `admin`
3. Refresh the app — the **Admin Panel** link appears in the nav

---

## Environment Variables

Frontend:
- `VITE_API_URL=http://localhost:5000/api`

Backend:
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `CLIENT_URL`
