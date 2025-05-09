const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  supplier: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'ordered', 'delivered'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
  expectedDeliveryDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);