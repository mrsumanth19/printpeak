const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  size: { type: String },
  designUrl: { type: String },
  method: { type: String },
  address: { type: String },
  quantity: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
