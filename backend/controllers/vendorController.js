const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
const getVendorStats = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Get total products
    const totalProducts = await Product.countDocuments({ vendor: vendorId });

    // Get total sales
    const orders = await Order.find({
      'orderItems.vendor': vendorId,
      isPaid: true,
    });

    let totalRevenue = 0;
    let totalOrders = 0;

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.vendor.toString() === vendorId.toString()) {
          totalRevenue += item.price * item.quantity;
          totalOrders++;
        }
      });
    });

    // Get recent orders
    const recentOrders = await Order.find({ 'orderItems.vendor': vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Get low stock products
    const lowStockProducts = await Product.find({
      vendor: vendorId,
      stock: { $lt: 10 },
    }).limit(5);

    res.json({
      totalProducts,
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor products
// @route   GET /api/vendor/products
// @access  Private/Vendor
const getVendorProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const count = await Product.countDocuments({ vendor: req.user._id });
    const products = await Product.find({ vendor: req.user._id })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/vendor/products
// @access  Private/Vendor
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      category,
      stock,
      tags,
      specifications,
    } = req.body;

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const product = await Product.create({
      vendor: req.user._id,
      name,
      description,
      price,
      comparePrice,
      category,
      stock,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      specifications,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/vendor/products/:id
// @access  Private/Vendor
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      name,
      description,
      price,
      comparePrice,
      category,
      stock,
      tags,
      isActive,
    } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.comparePrice = comparePrice || product.comparePrice;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    if (tags) {
      product.tags = tags.split(',').map((tag) => tag.trim());
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        product.images.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/vendor/products/:id
// @access  Private/Vendor
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete images from cloudinary
    for (let image of product.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vendor orders
// @route   GET /api/vendor/orders
// @access  Private/Vendor
const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'orderItems.vendor': req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/vendor/orders/:id
// @access  Private/Vendor
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if vendor has items in this order
    const hasVendorItems = order.orderItems.some(
      (item) => item.vendor.toString() === req.user._id.toString()
    );

    if (!hasVendorItems) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    order.status = status;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVendorStats,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorOrders,
  updateOrderStatus,
};