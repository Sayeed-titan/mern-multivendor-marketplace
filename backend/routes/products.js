const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProductReview,
  getTopProducts,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.route('/').get(getProducts);
router.route('/top').get(getTopProducts);
router.route('/:id').get(getProductById);
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;