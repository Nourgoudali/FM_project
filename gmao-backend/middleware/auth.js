const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Vérifier si le token est présent dans les headers
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'Aucun token fourni'
      });
    }

    // Extraire le token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Format du token invalide'
      });
    }

    // Vérifier le token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Vérifier si l'utilisateur existe
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Utilisateur non trouvé'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalide ou expiré'
      });
    }
  } catch (error) {
    console.error('Erreur dans le middleware auth:', error);
    res.status(401).json({
      status: 'error',
      message: 'Erreur d\'authentification'
    });
  }
};

module.exports = auth;
