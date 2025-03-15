const jwt = require('jsonwebtoken');
const User = require('../models/User');

const express = require("express");
const app = express();


const authMiddleware = async (req, res, next) => {
  console.log('Cookies:', req.cookies);
  const { authToken } = req.cookies;
  console.log('authToken:', authToken);
  
  if (!authToken) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    req.user = user;
    if (req.originalUrl.startsWith('/api/admin') && user.email !== 'vedantzalkemt@gmail.com') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
