/**
 * Express routes for handling encrypted passwords from client
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Your user model

const router = express.Router();

/**
 * APPROACH 1: Handle client-encrypted passwords
 */
router.post('/signup-encrypted', async (req, res) => {
  try {
    const { name, password: encryptedPassword, email, fullName } = req.body;
    
    // Decode the client-encrypted password
    const decoded = JSON.parse(Buffer.from(encryptedPassword, 'base64').toString());
    console.log('Client sent encrypted password:', decoded);
    
    // Store the encrypted password as-is (client already encrypted it)
    const user = new User({
      name,
      email,
      fullName,
      password: encryptedPassword, // Store the base64 encrypted version
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ message: 'Signup failed' });
  }
});

router.post('/login-encrypted', async (req, res) => {
  try {
    const { name, password: encryptedPassword } = req.body;
    
    // Find user by name
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare encrypted passwords
    if (user.password !== encryptedPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Login failed' });
  }
});

/**
 * APPROACH 2: Simpler and more secure - let server handle encryption
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, password, email, fullName } = req.body;
    
    // Hash password on server (more secure)
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      name,
      email,
      fullName,
      password: hashedPassword,
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Compare password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Login failed' });
  }
});

module.exports = router;
