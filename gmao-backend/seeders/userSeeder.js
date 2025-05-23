const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Charger les variables d'environnement
dotenv.config();

// Données des utilisateurs de test
const users = [
  {
    firstName: 'admin',
    lastName: 'admin',
    email: 'admin@gmao.com',
    password: 'Admin123!',
    role: 'admin',
    department: 'Administration',
    phone: '01 23 45 67 89',
  },
  {
    firstName: 'teamleader',
    lastName: 'teamleader',
    email: 'team@gmao.com',
    password: 'Team123!',
    role: 'team_leader',
    department: 'Maintenance',
    phone: '01 23 45 67 90',
  },
  {
    firstName: 'technician',
    lastName: 'technician',
    email: 'tech@gmao.com',
    password: 'Tech123!',
    role: 'technician',
    department: 'Production',
    phone: '01 23 45 67 91',
  },
  {
    firstName: 'aya',
    lastName: 'aya',
    email: 'AYA@gmail.com',
    password: 'AYA@0000',
    role: 'admin',
    department: 'Administration',
    phone: '01 23 45 67 92',
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion MongoDB établie');

    await User.deleteMany();
    console.log('🗑️ Tous les utilisateurs supprimés');

    const hashedUsers = await Promise.all(users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10),
      status: 'Actif',
      lastLogin: new Date(),
    })));

    await User.insertMany(hashedUsers);
    console.log('✅ Utilisateurs insérés avec succès');

  } catch (err) {
    console.error('❌ Erreur lors du seeding:', err.message);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
seedUsers();