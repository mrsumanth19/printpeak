const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// =================== USERS ===================

// 🔹 Get all users (excluding password)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// 🔹 Delete a user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// ✅ Delete all non-admin users
exports.deleteAllUsers = async (req, res) => {
  try {
    await User.deleteMany({ isAdmin: false });
    res.json({ message: 'All non-admin users deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete users' });
  }
};

// 🔹 Update user (admin can change name, email, isAdmin)
exports.updateUser = async (req, res) => {
  const { name, email, isAdmin } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.isAdmin = isAdmin ?? user.isAdmin;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// =================== PRODUCTS ===================

// 🔹 Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// 🔹 Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// ✅ Delete all products
exports.deleteAllProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    res.json({ message: 'All products deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete products' });
  }
};

// 🔹 Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;

    if (req.file && req.file.path) {
      product.image = req.file.path; // Cloudinary image path
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// 🔹 Add new product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    const newProduct = new Product({
      name,
      price,
      description,
      image: req.file.path, // Cloudinary image URL
    });

    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// =================== ORDERS ===================

// 🔹 Get all orders (with user info)
exports.getAllOrders = async (req, res) => {
  try {
  const orders = await Order.find()
  .populate('user', 'name email')  // User info
  .populate('product', 'name price image description'); 
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// 🔹 Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = req.body.status || order.status;
    await order.save();
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

// 🔹 Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('❌ Delete order error:', err);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// ✅ Delete all orders
exports.deleteAllOrders = async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ message: 'All orders deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete orders' });
  }
};
