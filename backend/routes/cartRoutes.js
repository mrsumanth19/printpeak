const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// ✅ Add to cart
router.post('/add', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const existing = await Cart.findOne({ user: userId, product: productId });
    if (existing) return res.status(200).json({ message: 'Already in cart' });

    const cartItem = new Cart({ user: userId, product: productId });
    await cartItem.save();

    const populatedItem = await cartItem.populate('product');
    res.json(populatedItem);
  } catch (err) {
    console.error('❌ Add to cart failed:', err);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

// ✅ Get user's full cart (for Cart page)
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.params.userId }).populate('product');
    console.log(`🛒 Cart for user ${req.params.userId}: ${cart.length} items`);
    res.json(cart);
  } catch (error) {
    console.error('❌ Failed to fetch cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// ✅ Get user's cart count only (for dashboard)
router.get('/user/:userId', async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.params.userId }).populate('product');
    res.json(cart);
  } catch (error) {
    console.error('❌ Failed to fetch user cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

// 🗑️ Delete a single item from cart
router.delete('/item/:productId/:userId', async (req, res) => {
  try {
    await Cart.findOneAndDelete({
      user: req.params.userId,
      product: req.params.productId,
    });
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    console.error('❌ Failed to delete cart item:', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
});

// 🧹 Clear all cart items for a user
router.delete('/clear/:userId', async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.params.userId });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('❌ Failed to clear cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;
