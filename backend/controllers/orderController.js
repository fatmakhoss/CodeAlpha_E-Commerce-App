const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Calculate prices server-side (never trust client totals)
const calcPrices = (orderItems) => {
  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice >= 50 ? 0 : 9.99;
  const taxPrice = itemsPrice * 0.08; // 8% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return {
    itemsPrice: parseFloat(itemsPrice.toFixed(2)),
    shippingPrice: parseFloat(shippingPrice.toFixed(2)),
    taxPrice: parseFloat(taxPrice.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
};

// ─── POST /api/orders ───────────────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod = 'card' } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    // Validate products exist and have sufficient stock
    const productIds = orderItems.map((i) => i.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products not found' });
    }

    // Build verified order items using DB prices (not client prices)
    const verifiedItems = orderItems.map((item) => {
      const dbProduct = dbProducts.find((p) => p._id.toString() === item.product.toString());

      if (!dbProduct) {
        throw Object.assign(new Error(`Product not found: ${item.product}`), { statusCode: 404 });
      }

      if (dbProduct.stock < item.quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for "${dbProduct.name}" — ${dbProduct.stock} available`),
          { statusCode: 400 }
        );
      }

      return {
        product: dbProduct._id,
        name: dbProduct.name,
        imageUrl: dbProduct.imageUrl,
        quantity: item.quantity,
        price: dbProduct.price, // server-side price
      };
    });

    const prices = calcPrices(verifiedItems);

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems: verifiedItems,
      shippingAddress,
      paymentMethod,
      ...prices,
    });

    // Decrement stock
    await Promise.all(
      verifiedItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    // Clear user's cart after successful order
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    const populated = await order.populate('orderItems.product', 'name imageUrl');
    res.status(201).json({ success: true, order: populated });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/myorders ───────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('orderItems.product', 'name imageUrl');

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/:id ────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'name imageUrl');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Users can only view their own orders; admins can view all
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/orders/:id/status  (admin) ────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const update = { status };
    if (status === 'delivered') {
      update.isDelivered = true;
      update.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders  (admin) ───────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort('-createdAt')
      .populate('user', 'name email');

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({
      success: true,
      count: orders.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      orders,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus, getAllOrders };
