const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assure-toi que le nom du fichier correspond bien

module.exports.verifyToken = async (req, res, next) => {
  try {
    const bearerHeader = req.header('Authorization');

    if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentification requise. Veuillez vous connecter.' });
    }

    const token = bearerHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      return res.status(401).json({ message: 'Utilisateur introuvable. Veuillez vous reconnecter.' });
    }

    if (currentUser.status === 'Inactif') {
      return res.status(403).json({ message: 'Votre compte est inactif. Veuillez contacter l\'administrateur.' });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification');

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Votre session a expiré. Veuillez vous reconnecter.' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Session invalide. Veuillez vous reconnecter.' });
    }

    return res.status(401).json({ message: 'Erreur d\'authentification. Veuillez vous reconnecter.' });
  }
};

module.exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    // Conversion en tableau s'il s'agit d'une string
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
    }

    next();
  };
};
