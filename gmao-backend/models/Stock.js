const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  quantity: { type: Number, required: true, min: 0 },
  minThreshold: { type: Number, required: true, min: 0 },
  supplier: { type: String },
  leadTime: { type: Number }, // In days
  movements: [{
    type: { type: String, enum: ['entry', 'exit'], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    comment: { type: String },
  }],
  createdAt: { type: Date, default: Date.now },
});

stockSchema.pre('save', async function (next) {
  if (this.isNew && !this.reference) {
    try {
      const latestStock = await mongoose.model('Stock')
        .findOne()
        .sort({ createdAt: -1 })
        .select('reference');
      
      let nextNumber;
      if (latestStock) {
        const match = latestStock.reference.match(/ST-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        } else {
          nextNumber = 1;
        }
      } else {
        nextNumber = 1;
      }
      
      this.reference = `ST-${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (err) {
      console.error('Error generating stock reference:', err);
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Stock', stockSchema);