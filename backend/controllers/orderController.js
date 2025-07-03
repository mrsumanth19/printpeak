const Order = require('../models/Order');

// 🛒 Create Order
exports.placeOrder = async (req, res) => {
  try {
    const {
      userId,
      productId,
      size,
      method,
      address,
      designUrl,
      status = 'Pending',
    } = req.body;

    const newOrder = new Order({
      user: userId,
      product: productId,
      size,
      method,
      address,
      designUrl,
      status,
    });

    const savedOrder = await newOrder.save();
    const populated = await Order.findById(savedOrder._id).populate('product');
    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Order creation failed:', err);
    res.status(500).json({ message: 'Order creation failed' });
  }
};

// 📦 Get Orders of a User
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate('product');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};
