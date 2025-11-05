const Order = require('../models/Order');
const Product = require('../models/Product');
const sendEmail = require('../utils/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify stock availability
    for (let item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Available: ${product.stock}`,
        });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    // Update product stock
    for (let item of orderItems) {
      const product = await Product.findById(item.product);
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    // Send order confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: 'Order Confirmation',
        html: `
          <h1>Thank you for your order!</h1>
          <p>Order ID: ${order._id}</p>
          <p>Total: $${totalPrice}</p>
          <p>We'll send you updates about your order status.</p>
        `,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .populate('orderItems.vendor', 'name shopName email');

    if (order) {
      // Check if user owns the order or is vendor/admin
      if (
        order.user._id.toString() === req.user._id.toString() ||
        req.user.role === 'admin' ||
        order.orderItems.some(
          (item) => item.vendor._id.toString() === req.user._id.toString()
        )
      ) {
        res.json(order);
      } else {
        res.status(403).json({ message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'processing';
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Stripe payment intent
// @route   POST /api/orders/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { userId: req.user._id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  createPaymentIntent,
};