const User = require('../models/User');
const Product = require('../models/Product');

// ─── GET /api/cart ──────────────────────────────────────────────────────────
const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      'cart.product',
      'name price imageUrl stock category'
    );

    // Remove cart entries whose product was deleted
    const validItems = user.cart.filter((item) => item.product !== null);

    const cartItems = validItems.map((item) => ({
      _id: item._id,
      product: item.product,
      quantity: item.quantity,
      subtotal: parseFloat((item.product.price * item.quantity).toFixed(2)),
    }));

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      success: true,
      cart: cartItems,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/cart ─────────────────────────────────────────────────────────
// Body: { productId, quantity }
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock === 0) {
      return res.status(400).json({ success: false, message: 'Product is out of stock' });
    }

    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available`,
      });
    }

    const user = await User.findById(req.user.id);
    const existingIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
      const newQty = user.cart[existingIndex].quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more — only ${product.stock} units available`,
        });
      }
      user.cart[existingIndex].quantity = newQty;
    } else {
      user.cart.push({ product: productId, quantity: qty });
    }

    await user.save();
    res.json({ success: true, message: 'Item added to cart', cartCount: user.cart.length });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/cart/:itemId ──────────────────────────────────────────────────
// Body: { quantity }
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const user = await User.findById(req.user.id);
    const item = user.cart.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    const product = await Product.findById(item.product);
    if (product && qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units available`,
      });
    }

    item.quantity = qty;
    await user.save();

    res.json({ success: true, message: 'Cart item updated' });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/cart/:itemId ───────────────────────────────────────────────
const removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const item = user.cart.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    user.cart.pull(req.params.itemId);
    await user.save();

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/cart ───────────────────────────────────────────────────────
const clearCart = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { cart: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
