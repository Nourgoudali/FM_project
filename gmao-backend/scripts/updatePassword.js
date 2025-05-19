const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for password update'))
  .catch(err => console.error('MongoDB connection error:', err));

const updatePassword = async () => {
  try {
    const email = 'AYA@gmail.com';
    const newPassword = 'AYA@0000';

    // Find all users with this email
    const users = await User.find({ email });
    console.log(`Found ${users.length} users with email ${email}`);

    if (users.length === 0) {
      console.log('No users found with this email');
      return;
    }

    // If multiple users exist, keep the most recent one
    if (users.length > 1) {
      console.log('Multiple users found. Cleaning up duplicates...');
      // Sort by creation date, newest first
      users.sort((a, b) => b.createdAt - a.createdAt);
      
      // Keep the most recent user
      const keepUser = users[0];
      console.log('Keeping user:', {
        id: keepUser._id,
        email: keepUser.email,
        createdAt: keepUser.createdAt
      });

      // Delete other users
      for (let i = 1; i < users.length; i++) {
        await User.findByIdAndDelete(users[i]._id);
        console.log(`Deleted duplicate user: ${users[i]._id}`);
      }

      // Update the password for the kept user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      keepUser.password = hashedPassword;
      await keepUser.save();
      console.log('Password updated for kept user');

      // Verify the password works
      const isPasswordValid = await bcrypt.compare(newPassword, keepUser.password);
      console.log('Password verification:', isPasswordValid);

      // Final check
      const finalUser = await User.findOne({ email });
      console.log('Final user state:', {
        id: finalUser._id,
        email: finalUser.email,
        passwordHash: finalUser.password
      });
    } else {
      // Single user case
      const user = users[0];
      console.log('Found single user:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      // Directly update the password without using the pre-save hook
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      console.log('Password updated successfully');

      // Verify the password works
      const updatedUser = await User.findById(user._id);
      const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
      console.log('Password verification:', isPasswordValid);

      if (!isPasswordValid) {
        console.error('Password verification failed after update');
        return;
      }

      console.log('Password update verified successfully');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating password:', error);
    mongoose.disconnect();
  }
};

// Run the update
updatePassword(); 