const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
  register: async (req, res) => {
    const { username, email, password, role } = req.body;
    console.log('Register attempt:', { username, email, role });
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        console.log('User already exists:', existingUser.email);
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = new User({ username, email, password, role });
      console.log('New user created:', { username, email, role });
      
      // Save user (this will trigger the pre-save hook for password hashing)
      await user.save();
      console.log('User saved successfully');
      
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(400).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    console.log('Login request received');
    console.log('Request body:', req.body);
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    try {
      const user = await User.findOne({ email });
      console.log('User found:', user ? {
        id: user._id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      } : 'No');
      
      if (!user) {
        console.log('No user found with email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Debug password comparison
      console.log('Attempting password comparison...');
      console.log('Provided password:', password);
      console.log('Stored password hash:', user.password);
      
      try {
        // First, verify the stored password is a valid bcrypt hash
        if (!user.password.startsWith('$2')) {
          console.error('Invalid password hash format in database');
          return res.status(500).json({ message: 'Database configuration error' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('Invalid password for user:', email);
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET is not defined in environment variables');
          return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated successfully');
        
        const response = {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        };
        console.log('Sending response:', { ...response, token: '***' });
        res.json(response);
      } catch (bcryptError) {
        console.error('Error during password comparison:', bcryptError);
        return res.status(500).json({ message: 'Error during authentication' });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = userController;