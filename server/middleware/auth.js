const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

// Middleware to verify access token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Check if token exists in database and is not revoked
    const storedToken = await Token.findOne({ 
      token, 
      type: 'access',
      userId: decoded.userId
    });
    
    if (!storedToken) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to verify refresh token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in database and is not revoked
    const storedToken = await Token.findOne({ 
      token: refreshToken, 
      type: 'refresh',
      userId: decoded.userId
    });
    
    if (!storedToken) {
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

module.exports = { authenticate, verifyRefreshToken }; 