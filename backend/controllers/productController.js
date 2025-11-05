const Product = require('../models/Product');
const Review = require('../models/Review');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { tags: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const category = req.query.category
      ? { category: req.query.category }
      : {};

    const priceFilter = {};
    if (req.query.minPrice) priceFilter.price = { $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) {
      priceFilter.price = { ...priceFilter.price, $lte: Number(req.query.maxPrice) };
    }

    const filter = { ...keyword, ...category, ...priceFilter, isActive: true };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('vendor', 'name shopName shopLogo')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'vendor',
      'name shopName shopDescription shopLogo vendorRating'
    );

    if (product) {
      // Get reviews
      const reviews = await Review.find({ product: product._id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

      res.json({ product, reviews });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if already reviewed
      const alreadyReviewed = await Review.findOne({
        product: req.params.id,
        user: req.user._id,
      });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      // Create review
      const review = await Review.create({
        product: req.params.id,
        user: req.user._id,
        rating: Number(rating),
        comment,
      });

      // Update product rating
      const reviews = await Review.find({ product: req.params.id });
      product.numReviews = reviews.length;
      product.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();

      res.status(201).json({ message: 'Review added', review });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(8)
      .populate('vendor', 'name shopName');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  getTopProducts,
};