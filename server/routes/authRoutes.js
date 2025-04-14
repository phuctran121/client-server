const express = require('express');
const router = express.Router();
const { authenticate, verifyRefreshToken } = require('../middleware/auth');
const authService = require('../services/authService');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      password,
      email
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Authenticate user
    const result = await authService.authenticateUser(username, password);
    
    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }
    
    // Return tokens and user info
    res.json({
      message: 'Login successful',
      userId: result.userId,
      username: result.username,
      role: result.role,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout user
router.post('/logout', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Revoke all tokens for the user
    await authService.revokeAllTokens(userId);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Refresh access token
router.post('/refresh-token', verifyRefreshToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Generate new tokens
    const tokens = await authService.generateTokens(userId);
    
    res.json({
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed' });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user by ID
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router; 