const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const Provider = require('../models/provider');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user exists and is active
    let user;
    if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.type === 'provider') {
      user = await Provider.findById(decoded.id).select('-password');
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = user;
    req.userType = decoded.type;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Require admin authentication
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    
    // Check if admin exists and is active
    const user = await Admin.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = user;
    req.userType = decoded.type;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Require provider authentication
const requireProvider = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'provider') {
      return res.status(403).json({ message: 'Provider access required.' });
    }
    
    // Check if provider exists and is active
    const user = await Provider.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user inactive.' });
    }

    req.user = user;
    req.userType = decoded.type;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Optional authentication (for public endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    let user;
    if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.type === 'provider') {
      user = await Provider.findById(decoded.id).select('-password');
    }

    if (user && user.isActive) {
      req.user = user;
      req.userType = decoded.type;
    }
    
    next();
  } catch (error) {
    next(); // Continue without authentication if token is invalid
  }
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireProvider,
  optionalAuth,
  requirePermission: (permission) => async (req, res, next) => {
    try {
      if (req.userType !== 'provider') {
        return res.status(403).json({ message: 'Provider access required.' });
      }
      const permissions = Array.isArray(req.user?.permissions) ? req.user.permissions : [];
      if (!permissions.includes(permission)) {
        return res.status(403).json({ message: 'Permission denied', permission });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token.' });
    }
  }
};
