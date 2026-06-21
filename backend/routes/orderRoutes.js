const express = require('express');
const { body, param } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(protect);

const mongoIdParam = param('id').isMongoId().withMessage('Invalid order ID');

const shippingAddressValidation = [
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').optional().trim().notEmpty().withMessage('Country cannot be empty'),
];

// POST /api/orders
router.post(
  '/',
  [
    body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('orderItems.*.product').isMongoId().withMessage('Each item must have a valid product ID'),
    body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Each item must have a quantity of at least 1'),
    body('paymentMethod')
      .optional()
      .isIn(['card', 'paypal', 'cod'])
      .withMessage('Invalid payment method'),
    ...shippingAddressValidation,
  ],
  validate,
  createOrder
);

// GET /api/orders/myorders
router.get('/myorders', getMyOrders);

// GET /api/orders  (admin)
router.get('/', authorize('admin'), getAllOrders);

// GET /api/orders/:id
router.get('/:id', [mongoIdParam], validate, getOrderById);

// PUT /api/orders/:id/status  (admin)
router.put(
  '/:id/status',
  authorize('admin'),
  [
    mongoIdParam,
    body('status')
      .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateOrderStatus
);

module.exports = router;
