const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Le titre est obligatoire'] 
  },
  description: { 
    type: String, 
    default: '' 
  },
  category: { 
    type: String, 
    required: true
  },
  equipment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Equipment',
    default: null
  },
  fileUrl: { 
    type: String, 
    required: true
  },
  qrCodeData: { 
    type: String, 
    sparse: true,
    unique:true,
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  }

})
documentSchema.virtual('createdAt').get(function() {
  return this.uploadDate;
}).set(function(v) {
  this.uploadDate = v;
});

module.exports = mongoose.model('Document', documentSchema);