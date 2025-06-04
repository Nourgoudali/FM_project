const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  // Ajouter un nouvel utilisateur (pour les administrateurs)
  addUser: async (req, res) => {
    const { firstName, lastName, email, password, role, department, phone, status } = req.body;
    console.log('Add user attempt received');
    
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Add user failed: Email already exists');
        return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
      }

      // Créer un nouvel utilisateur
      const user = new User({ 
        firstName, 
        lastName, 
        email, 
        password, 
        role: role || 'user', 
        department: department || 'Non assigné',
        phone: phone || '',
        status: status || 'Actif',
        lastLogin: null
      });
      
      console.log('New user created by admin');
      
      // Sauvegarder l'utilisateur (déclenchera le hook pre-save pour le hachage du mot de passe)
      await user.save();
      console.log('User saved successfully');
      
      // Retourner l'utilisateur créé sans le mot de passe
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(201).json(userResponse);
    } catch (err) {
      console.error('Add user error:', err.message);
      res.status(400).json({ message: err.message });
    }
  },
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

      // Create new user
      const user = new User({ 
        firstName, 
        lastName, 
        email, 
        password, 
        role, 
        department: department || 'Non assigné',
        phone: phone || '',
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

        // Récupérer l'utilisateur à jour
        const updatedUser = await User.findById(user._id).select('-password');

        const token = jwt.sign(
          { 
            id: updatedUser._id, 
            role: updatedUser.role
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

  // Simple déconnexion (sans mise à jour de données)
  logout: async (req, res) => {
    try {
      const userId = req.user.id;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      console.log(`User logged out: ${userId}`);
      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ message: 'Server error during logout' });
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

  // Cette fonction a été supprimée car nous n'utilisons plus lastActivity

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
  
  // Récupérer les rôles disponibles
  getRoles: async (req, res) => {
    try {
      // Récupérer les rôles définis dans le schéma User
      const roles = User.schema.path('role').enumValues;
      // Renvoyer les rôles dans un format compatible avec le frontend
      res.json({ data: roles });
    } catch (err) {
      console.error('Error fetching roles:', err);
      res.status(500).json({ message: 'Error fetching roles' });
    }
  },

  // Récupérer les départements disponibles
  getDepartments: async (req, res) => {
    try {
      // Récupérer les départements uniques des utilisateurs existants
      const departments = await User.distinct('department');
      // Renvoyer les départements dans un format compatible avec le frontend
      res.json({ data: departments });
    } catch (err) {
      console.error('Error fetching departments:', err);
      res.status(500).json({ message: 'Error fetching departments' });
    }
  }
};

module.exports = userController;