const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/login', userController.login);
router.post('/register', userController.register);

// Routes protégées
router.get('/profile', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

// Route pour récupérer l'utilisateur actuel
router.get('/me', verifyToken, userController.getCurrentUser);

// Route pour mettre à jour le profil de l'utilisateur actuel
router.put('/me', verifyToken, userController.updateCurrentUser);

// Route pour changer son mot de passe (accessible à tous les utilisateurs authentifiés)
router.post('/change-password', verifyToken, userController.changePassword);

// Routes d'administration des utilisateurs (protégées et réservées aux admins)
router.get('/', verifyToken, checkRole('admin'), userController.getAllUsers);
router.get('/:id', verifyToken, checkRole('admin'), userController.getUserById);
router.put('/:id', verifyToken, checkRole('admin'), userController.updateUser);
router.delete('/:id', verifyToken, checkRole('admin'), userController.deleteUser);
router.patch('/:id/status', verifyToken, checkRole('admin'), userController.changeUserStatus);

// Route pour attribuer un rôle à un utilisateur (admin uniquement)
router.post('/:userId/role', verifyToken, checkRole('admin'), userController.assignRole);

// Route pour changer le mot de passe d'un utilisateur (admin uniquement)
router.post('/:userId/password', verifyToken, checkRole('admin'), userController.adminChangeUserPassword);

module.exports = router;