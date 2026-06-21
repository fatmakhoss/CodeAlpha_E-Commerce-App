# ShopAlpha — Backend API

> **CodeAlpha Full Stack Development Internship — Task 1 Backend**
> Node.js · Express.js · MongoDB (Mongoose) · JWT

---

## Project Structure

```
backend/
├── config/
│   └── db.js                  # Mongoose connection
├── models/
│   ├── User.js                # User schema (bcrypt, cart subdoc)
│   ├── Product.js             # Product schema (reviews subdoc)
│   └── Order.js               # Order schema (items, shipping, pricing)
├── controllers/
│   ├── authController.js      # register, login, getMe
│   ├── productController.js   # CRUD + reviews
│   ├── cartController.js      # get, add, update, remove, clear
│   └── orderController.js     # create, myorders, getById, updateStatus, getAll
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── productRoutes.js       # /api/products/*
│   ├── cartRoutes.js          # /api/cart/*
│   └── orderRoutes.js         # /api/orders/*
├── middleware/
│   ├── authMiddleware.js      # protect (JWT verify), authorize (role check)
│   ├── errorMiddleware.js     # global error handler + 404 catcher
│   └── validateMiddleware.js  # express-validator result handler
├── server.js                  # App entry point
├── .env.example               # Environment variable template
└── package.json
```

---

## Quick Start

```bash
# 1. Copy env file and fill in your values
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run in development (nodemon)
npm run dev

# 4. Run in production
npm start
```

---

## Environment Variables

| Variable        | Description                          | Default                              |
|-----------------|--------------------------------------|--------------------------------------|
| `NODE_ENV`      | `development` / `production`         | `development`                        |
| `PORT`          | Server port                          | `5000`                               |
| `MONGO_URI`     | MongoDB connection string            | `mongodb://localhost:27017/shopalpha`|
| `JWT_SECRET`    | Secret for signing JWTs              | **required**                         |
| `JWT_EXPIRES_IN`| Token lifetime                       | `7d`                                 |
| `CLIENT_URL`    | CORS allowed origin                  | `*`                                  |

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## API Reference

All responses follow the shape:
```json
{ "success": true/false, "message": "...", "data": ... }
```

Errors include `"errors"` array for validation failures (HTTP 422).

### Auth

| Method | Endpoint              | Auth | Description              |
|--------|-----------------------|------|--------------------------|
| POST   | `/api/auth/register`  | —    | Register new user        |
| POST   | `/api/auth/login`     | —    | Login, returns JWT       |
| GET    | `/api/auth/me`        | JWT  | Get current user profile |

**Register body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Token usage:** `Authorization: Bearer <token>`

---

### Products

| Method | Endpoint                     | Auth       | Description             |
|--------|------------------------------|------------|-------------------------|
| GET    | `/api/products`              | —          | List products           |
| GET    | `/api/products/:id`          | —          | Get single product      |
| POST   | `/api/products`              | Admin      | Create product          |
| PUT    | `/api/products/:id`          | Admin      | Update product          |
| DELETE | `/api/products/:id`          | Admin      | Delete product          |
| POST   | `/api/products/:id/reviews`  | JWT        | Add review              |

**Query params for GET /api/products:**
- `search` — text search on name/description
- `category` — filter by category
- `sort` — field prefix with `-` for desc (e.g. `-price`, `rating`)
- `page`, `limit` — pagination (default: page=1, limit=12, max=50)

---

### Cart

| Method | Endpoint           | Auth | Description        |
|--------|--------------------|------|--------------------|
| GET    | `/api/cart`        | JWT  | Get user's cart    |
| POST   | `/api/cart`        | JWT  | Add item to cart   |
| PUT    | `/api/cart/:itemId`| JWT  | Update item qty    |
| DELETE | `/api/cart/:itemId`| JWT  | Remove single item |
| DELETE | `/api/cart`        | JWT  | Clear entire cart  |

**Add to cart body:**
```json
{ "productId": "<mongoId>", "quantity": 2 }
```

---

### Orders

| Method | Endpoint                    | Auth  | Description            |
|--------|-----------------------------|-------|------------------------|
| POST   | `/api/orders`               | JWT   | Create order           |
| GET    | `/api/orders/myorders`      | JWT   | Get my orders          |
| GET    | `/api/orders/:id`           | JWT   | Get order by ID        |
| GET    | `/api/orders`               | Admin | Get all orders         |
| PUT    | `/api/orders/:id/status`    | Admin | Update order status    |

**Create order body:**
```json
{
  "orderItems": [
    { "product": "<mongoId>", "quantity": 1 }
  ],
  "shippingAddress": {
    "fullName": "Jane Doe",
    "address": "123 Main St",
    "city": "New York",
    "postalCode": "10001",
    "country": "US"
  },
  "paymentMethod": "card"
}
```

Prices are **always calculated server-side** (never trusted from client).

---

## Security Notes

- Passwords hashed with `bcryptjs` (cost factor 12)
- JWT verified on every protected route
- Role-based access control (`user` / `admin`) via `authorize()` middleware
- `express-validator` validates and sanitizes all inputs
- Stock is verified and decremented atomically on order creation
- JSON body limited to 10kb to prevent abuse
- MongoDB Mongoose `runValidators: true` on all updates
