const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });

const {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} = require('../controllers/productController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public - Get all products
router.get('/', getAllProducts);

// Admin-only routes
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
