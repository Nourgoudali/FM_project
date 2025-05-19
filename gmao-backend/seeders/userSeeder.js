const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Données des utilisateurs de test
const users = [
  {
    username: 'admin',
    email: 'admin@gmao.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    username: 'teamleader',
    email: 'team@gmao.com',
    password: 'Team123!',
    role: 'team_leader'
  },
  {
    username: 'technician',
    email: 'tech@gmao.com',
    password: 'Tech123!',
    role: 'technician'
  },
  {
    username: 'aya',
    email: 'AYA@gmail.com',
    password: 'AYA@0000',
    role: 'admin'
  }
];

// Fonction pour créer les utilisateurs
const seedUsers = async () => {
  try {
    // Supprimer tous les utilisateurs existants
    await User.deleteMany({});
    console.log('Utilisateurs existants supprimés');

    // Créer les nouveaux utilisateurs
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      await user.save();
      console.log(`Utilisateur ${userData.username} (${userData.role}) créé`);
    }

    console.log('Seeding terminé avec succès');
    mongoose.disconnect();
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    mongoose.disconnect();
  }
};

// Exécuter le seeding
seedUsers(); 