// controllers/cartController.js
const Cart = require('../models/Cart');

// Get all cart items for a user
exports.getCartByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await Cart.find({ user: userId }).populate('product');
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
};

// Remove a specific item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    await Cart.deleteOne({ product: productId, user: userId });
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
};

// Clear entire cart for user
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    await Cart.deleteMany({ user: userId });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
