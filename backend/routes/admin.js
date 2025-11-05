const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  approveVendor,
  getAllProducts,
  deleteProduct,
  getAllOrders,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

router.use(protect, checkRole('admin'));

router.route('/dashboard').get(getAdminStats);
router.route('/users').get(getAllUsers);
router.route('/users/:id').delete(deleteUser);
router.route('/vendors/:id/approve').put(approveVendor);
router.route('/products').get(getAllProducts);
router.route('/products/:id').delete(deleteProduct);
router.route('/orders').get(getAllOrders);

module.exports = router;