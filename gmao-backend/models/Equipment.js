const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  reference: { type: String, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['operational', 'maintenance', 'out_of_service'], default: 'operational' },
  brand: { type: String },
  model: { type: String },
  serialNumber: { type: String },
  purchaseDate: { type: Date },
  warrantyEnd: { type: Date },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Generate reference automatically before saving
equipmentSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      // Get the highest existing reference number
      const highestRef = await mongoose.model('Equipment').findOne({}, {}, { sort: { _id: -1 } });
      const nextNumber = highestRef ? parseInt(highestRef.reference.split('-')[1]) + 1 : 1;
      this.reference = `EQU-${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
