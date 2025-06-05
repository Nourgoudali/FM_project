const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
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

// Hook pour générer automatiquement une référence de document unique
documentSchema.pre('save', async function(next) {
  if (this.isNew && !this.reference) {
    try {
      const latestDoc = await mongoose.model('Document')
        .findOne()
        .sort({ uploadDate: -1 })
        .select('reference');
      
      let nextNumber;
      if (latestDoc && latestDoc.reference) {
        const match = latestDoc.reference.match(/DOC-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        } else {
          nextNumber = 1;
        }
      } else {
        nextNumber = 1;
      }
      
      this.reference = `DOC-${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (err) {
      console.error('Erreur lors de la génération de la référence du document:', err);
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Document', documentSchema);