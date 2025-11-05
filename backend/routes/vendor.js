const express = require('express');
const router = express.Router();
const {
  getVendorStats,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorOrders,
  updateOrderStatus,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(protect, checkRole('vendor'));

router.route('/dashboard').get(getVendorStats);
router
  .route('/products')
  .get(getVendorProducts)
  .post(upload.array('images', 5), createProduct);
router
  .route('/products/:id')
  .put(upload.array('images', 5), updateProduct)
  .delete(deleteProduct);
router.route('/orders').get(getVendorOrders);
router.route('/orders/:id').put(updateOrderStatus);

module.exports = router;