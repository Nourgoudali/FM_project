const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  register: async (req, res) => {
    const { firstName, lastName, email, password, role, department, phone } = req.body;
    // Enregistrer seulement l'action, pas les données sensibles
    console.log('Register attempt received');
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Registration failed: Email already exists');
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user with status Inactif
      const user = new User({ 
        firstName, 
        lastName, 
        email, 
        password, 
        role, 
        department: department || 'Non assigné',
        phone: phone || '',
        status: 'Inactif', // Initialiser comme Inactif
        lastLogin: null
      });
      console.log('New user created');
      
      // Save user (this will trigger the pre-save hook for password hashing)
      await user.save();
      console.log('User saved successfully');
      
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Registration error');
      res.status(400).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    console.log('Login request received');
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log('Login failed: Invalid credentials');
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      try {
        // First, verify the stored password is a valid bcrypt hash
        if (!user.password.startsWith('$2')) {
          console.error('Invalid password hash format in database');
          return res.status(500).json({ message: 'Erreur de configuration de la base de données' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          console.log('Login failed: Invalid password');
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET is not defined in environment variables');
          return res.status(500).json({ message: 'Erreur de configuration du serveur' });
        }

        // Mettre à jour la date de dernière connexion et le statut
        const now = new Date();
        const updates = {
          lastLogin: now,
          status: 'Actif',
          lastActivity: now
        };

        // Mettre à jour l'utilisateur
        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          updates,
          { new: true, select: '-password' }
        );

        const token = jwt.sign(
          { 
            id: updatedUser._id, 
            role: updatedUser.role,
            status: updatedUser.status
          }, 
          process.env.JWT_SECRET, 
          { expiresIn: '30d' }
        );

        console.log('Authentication successful');
        
        const response = {
          token,
          user: {
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            status: updatedUser.status,
            lastLogin: updatedUser.lastLogin,
            lastActivity: updatedUser.lastActivity
          }
        };
        res.json(response);
      } catch (bcryptError) {
        console.error('Error during authentication process');
        return res.status(500).json({ message: 'Error during authentication' });
      }
    } catch (err) {
      console.error('Login error');
      res.status(500).json({ message: err.message });
    }
  },

  // Modifier le mot de passe
  changePassword: async (req, res) => {
    try {
      const userId = req.user._id; // Utiliser _id au lieu de id car mongoose retourne _id
      const { currentPassword, newPassword } = req.body;
      
      // Vérifier que les champs requis sont fournis
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Le mot de passe actuel et le nouveau mot de passe sont requis' });
      }
      
      // Trouver l'utilisateur dans la base de données
      const user = await User.findById(userId);
      if (!user) {
        console.log('Password change failed: User not found');
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Vérifier l'ancien mot de passe
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        console.log('Password change failed: Current password incorrect');
        return res.status(401).json({ message: 'Le mot de passe actuel est incorrect' });
      }
      
      // Mettre à jour le mot de passe
      user.password = newPassword; // Le hook pre-save se chargera du hachage
      await user.save();
      console.log('Password changed successfully');
      
      res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (err) {
      console.error('Error changing password');
      res.status(500).json({ message: err.message });
    }
  },

  // Récupérer tous les utilisateurs
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}, '-password');
      console.log('Retrieved all users');
      res.json(users);
    } catch (err) {
      console.error('Error fetching users');
      res.status(500).json({ message: err.message });
    }
  },

  // Récupérer un utilisateur par ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id, '-password');
      if (!user) {
        console.log(`User not found: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`Retrieved user: ${req.params.id}`);
      res.json(user);
    } catch (err) {
      console.error('Error fetching user');
      res.status(500).json({ message: err.message });
    }
  },

  // Mettre à jour un utilisateur
  updateUser: async (req, res) => {
    try {
      const { firstName, lastName, email, role, department, phone, status } = req.body;
      
      // Trouver l'utilisateur existant
      const user = await User.findById(req.params.id);
      if (!user) {
        console.log(`Update failed: User not found: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Mettre à jour les champs
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.role = role || user.role;
      user.department = department || user.department;
      user.phone = phone || user.phone;
      user.status = status || user.status;
      
      // Si un nouveau mot de passe est fourni
      if (req.body.password) {
        user.password = req.body.password;
        console.log(`Password updated for user: ${req.params.id}`);
      }
      
      // Sauvegarder les modifications
      const updatedUser = await user.save();
      console.log(`User updated: ${req.params.id}`);
      
      // Retourner l'utilisateur mis à jour sans le mot de passe
      const userResponse = updatedUser.toObject();
      delete userResponse.password;
      
      res.json(userResponse);
    } catch (err) {
      console.error('Error updating user');
      res.status(400).json({ message: err.message });
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        console.log(`Delete failed: User not found: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      await User.findByIdAndDelete(req.params.id);
      console.log(`User deleted: ${req.params.id}`);
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user');
      res.status(500).json({ message: err.message });
    }
  },

  // Changer le statut d'un utilisateur
  changeUserStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status || !['Actif', 'Inactif'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      const user = await User.findById(req.params.id);
      if (!user) {
        console.log(`Status update failed: User not found: ${req.params.id}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      user.status = status;
      const updatedUser = await user.save();
      console.log(`User status updated to ${status}: ${req.params.id}`);
      
      // Retourner l'utilisateur mis à jour sans le mot de passe
      const userResponse = updatedUser.toObject();
      delete userResponse.password;
      
      res.json(userResponse);
    } catch (err) {
      console.error('Error changing user status');
      res.status(400).json({ message: err.message });
    }
  },

  // Ajouter une méthode pour mettre à jour l'activité de l'utilisateur
  updateUserActivity: async (req, res) => {
    try {
      const userId = req.user.id;
      const now = new Date();
      
      await User.findByIdAndUpdate(userId, {
        lastActivity: now,
        status: 'Actif'
      });

      res.json({ message: 'User activity updated' });
    } catch (err) {
      console.error('Error updating user activity:', err);
      res.status(500).json({ message: 'Error updating user activity' });
    }
  },

  // Ajouter une méthode pour vérifier et mettre à jour automatiquement le statut des utilisateurs inactifs
  checkInactiveUsers: async () => {
    try {
      const inactivityThreshold = new Date();
      inactivityThreshold.setDate(inactivityThreshold.getDate() - 30); // 30 jours d'inactivité
      
      const inactiveUsers = await User.find({
        lastActivity: { $lt: inactivityThreshold },
        status: 'Actif'
      });
      
      for (const user of inactiveUsers) {
        user.status = 'Inactif';
        await user.save();
        console.log(`Utilisateur ${user.email} marqué comme inactif après 30 jours d'inactivité`);
      }
      
      return inactiveUsers.length;
    } catch (error) {
      console.error('Erreur lors de la vérification des utilisateurs inactifs:', error);
      return 0;
    }
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  // Mettre à jour le profil de l'utilisateur actuel
  updateCurrentUser: async (req, res, next) => {
    try {
      const { firstName, lastName, email, phone, department } = req.body;
      const updateData = {};
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (department) updateData.department = department;
      
      const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      
      res.json({
        message: 'Profil mis à jour avec succès',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  // Administrateur change le mot de passe d'un utilisateur
  adminChangeUserPassword: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const { newPassword } = req.body;
      
      // Vérifier que l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      
      // Vérifier que l'utilisateur qui fait la demande est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent modifier les mots de passe des utilisateurs.' });
      }
      
      // Hasher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
      
      res.json({ message: `Mot de passe mis à jour pour l'utilisateur ${user.email}` });
    } catch (error) {
      next(error);
    }
  },

  // Attribuer un rôle à un utilisateur
  assignRole: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const { role } = req.body;
      
      // Vérifier que le rôle est valide
      if (!['admin', 'planificateur', 'demandeur', 'technicien'].includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide' });
      }
      
      // Vérifier que l'utilisateur qui fait la demande est un administrateur
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Accès refusé. Seuls les administrateurs peuvent attribuer des rôles.' });
      }
      
      // Mettre à jour le rôle de l'utilisateur
      const user = await User.findByIdAndUpdate(
        userId, 
        { role }, 
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
      
      res.json({ 
        message: `Rôle mis à jour vers ${role}`, 
        user 
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;