const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  nomEntreprise: { 
    type: String, 
    required: true,
    trim: true
  },
  nom: { 
    type: String, 
    required: true,
    trim: true
  },
  prenom: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir une adresse email valide']
  },
  telephone: { 
    type: String, 
    required: true,
    trim: true
  },
  adresse: { 
    type: String, 
    required: true,
    trim: true
  },
  quantiteMinCommande: {
    type: Number,
    required: false,
    default: 1,
    min: 1
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware pour mettre à jour la date de modification
fournisseurSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Fournisseur', fournisseurSchema);
