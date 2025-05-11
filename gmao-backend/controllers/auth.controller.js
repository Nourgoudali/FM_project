const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Vérifier si l'utilisateur existe
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            // Vérifier le mot de passe
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
            }

            // Générer le token JWT
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.name
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
    },

    register: async (req, res) => {
        try {
            const { email, password, name, role } = req.body;

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Cet email est déjà utilisé' });
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Créer le nouvel utilisateur
            const user = new User({
                email,
                password: hashedPassword,
                name,
                role: role || 'user'
            });

            await user.save();

            res.status(201).json({ message: 'Utilisateur créé avec succès' });
        } catch (error) {
            res.status(500).json({ message: 'Erreur lors de l\'inscription' });
        }
    }
};

module.exports = authController; 