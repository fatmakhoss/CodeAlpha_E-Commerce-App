const express = require('express');
const { body, param } = require('express-validator');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

const itemIdParam = param('itemId').isMongoId().withMessage('Invalid cart item ID');

// GET  /api/cart
router.get('/', getCart);

// POST /api/cart
router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('Valid product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  addToCart
);

// PUT /api/cart/:itemId
router.put(
  '/:itemId',
  [
    itemIdParam,
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  updateCartItem
);

// DELETE /api/cart/:itemId
router.delete('/:itemId', [itemIdParam], validate, removeFromCart);

// DELETE /api/cart  — clear entire cart
router.delete('/', clearCart);

module.exports = router;
