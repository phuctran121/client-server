const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const User = require('../models/User');

// Generate tokens for a user
const generateTokens = async (userId) => {
  try {
    // Generate access token
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
    
    // Calculate expiration dates
    const accessTokenExp = jwt.decode(accessToken).exp * 1000;
    const refreshTokenExp = jwt.decode(refreshToken).exp * 1000;
    
    // Store tokens in database
    await Promise.all([
      // Store access token
      Token.findOneAndUpdate(
        { key: `${userId}_access` },
        { 
          token: accessToken, 
          expiresAt: new Date(accessTokenExp),
          type: 'access',
          userId
        },
        { upsert: true }
      ),
      // Store refresh token
      Token.findOneAndUpdate(
        { key: `${userId}_refresh` },
        { 
          token: refreshToken, 
          expiresAt: new Date(refreshTokenExp),
          type: 'refresh',
          userId
        },
        { upsert: true }
      )
    ]);
    
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Error generating tokens');
  }
};

// Revoke all tokens for a user
const revokeAllTokens = async (userId) => {
  try {
    await Token.deleteMany({ userId });
    return true;
  } catch (error) {
    throw new Error('Error revoking tokens');
  }
};

// Revoke a specific token
const revokeToken = async (token, type) => {
  try {
    const result = await Token.deleteOne({ token, type });
    return result.deletedCount > 0;
  } catch (error) {
    throw new Error('Error revoking token');
  }
};

// Authenticate user with username and password
const authenticateUser = async (username, password) => {
  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password' };
    }
    
    // Update last login
    // user.lastLogin = new Date();
    // await user.save();
    
    // Generate tokens
    const tokens = await generateTokens(user._id.toString());
    
    return { 
      success: true, 
      // userId: user._id,
      username: user.username,
      // role: user.role,
      iat: tokens.iat,
      ...tokens 
    };
  } catch (error) {
    return { success: false, message: 'Authentication failed' };
  }
};

module.exports = {
  generateTokens,
  revokeAllTokens,
  revokeToken,
  authenticateUser
}; 