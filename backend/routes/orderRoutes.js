const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { cloudinary } = require('../utils/cloudinary');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getOrdersByUser } = require('../controllers/orderController');

const upload = multer();

// 1️⃣ Custom Order (Direct without Stripe)
router.post('/custom', upload.single('design'), async (req, res) => {
  try {
    const { userId, productId, size, method, address } = req.body;
    let designUrl = '';

    if (req.file) {
      const streamUpload = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'PrintPeak_Designs' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });

      const result = await streamUpload(req.file.buffer);
      designUrl = result.secure_url;
    }

    const newOrder = new Order({
      user: userId,
      product: productId,
      size,
      method,
      address,
      designUrl,
      status: 'Pending',
    });

    const savedOrder = await newOrder.save();
    const populated = await Order.findById(savedOrder._id).populate('product');
    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ Error placing custom order:', err);
    res.status(500).json({ message: '❌ Order failed' });
  }
});

// 2️⃣ Stripe Checkout: Creates Stripe session & saves order immediately
router.post('/create-stripe-session', upload.single('design'), async (req, res) => {
  try {
    const { userId, productId, size, method, address } = req.body;
    let designUrl = '';

    // Upload design to Cloudinary if file is present
    if (req.file) {
      const streamUpload = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'PrintPeak_Designs' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });

      const result = await streamUpload(req.file.buffer);
      designUrl = result.secure_url;
    }

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${product.name} - Size: ${size}`,
              images: [product.image],
            },
            unit_amount: Math.max(product.price * 100, 5000),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/orders?status=success',
      cancel_url: 'http://localhost:3000/products?status=cancel',
    });

    // ✅ Save order immediately (assuming payment is successful via redirect)
    const newOrder = new Order({
  user: userId,
  product: productId,
  size,
  method,
  address,
  designUrl,
  status: 'Pending',
});


    await newOrder.save();

    // Return session ID to frontend
    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('❌ Stripe session error:', err);
    res.status(500).json({ message: 'Stripe session creation failed' });
  }
});

// 3️⃣ Get Orders by User ID
router.get('/user/:userId', getOrdersByUser);

// ❌ Removed: /create-after-stripe (no longer needed)

module.exports = router;
