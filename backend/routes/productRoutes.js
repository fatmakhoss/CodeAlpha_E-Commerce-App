const express = require('express');
const { body, param } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category')
    .isIn(['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Furniture', 'Sports', 'General'])
    .withMessage('Invalid category'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

const mongoIdParam = param('id').isMongoId().withMessage('Invalid product ID');

// GET /api/products  — public
router.get('/', getProducts);

// GET /api/products/:id  — public
router.get('/:id', [mongoIdParam], validate, getProductById);

// POST /api/products  — admin only
router.post('/', protect, authorize('admin'), productValidation, validate, createProduct);

// PUT /api/products/:id  — admin only
router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    mongoIdParam,
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('category')
      .optional()
      .isIn(['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Furniture', 'Sports', 'General'])
      .withMessage('Invalid category'),
  ],
  validate,
  updateProduct
);

// DELETE /api/products/:id  — admin only
router.delete('/:id', protect, authorize('admin'), [mongoIdParam], validate, deleteProduct);

// POST /api/products/:id/reviews  — authenticated users
router.post(
  '/:id/reviews',
  protect,
  [
    mongoIdParam,
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Review comment is required'),
  ],
  validate,
  createReview
);

module.exports = router;
