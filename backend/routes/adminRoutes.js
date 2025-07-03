const express = require('express');
const {
  getAllUsers, deleteUser, updateUser,
  getAllOrders, deleteOrder, updateOrderStatus,
  getAllProducts, deleteProduct, updateProduct, createProduct,

  // New delete all controllers (to be added in adminController.js)
  deleteAllUsers, deleteAllOrders, deleteAllProducts
} = require('../controllers/adminController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const router = express.Router();
router.use(protect, adminOnly);

// Users
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.delete('/users', deleteAllUsers);       // ✅ Delete all users
router.put('/users/:id', updateUser);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);
router.delete('/orders', deleteAllOrders);     // ✅ Delete all orders

// Products
router.get('/products', getAllProducts);
router.post('/products', upload.single('image'), createProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);
router.delete('/products', deleteAllProducts); // ✅ Delete all products

module.exports = router;
