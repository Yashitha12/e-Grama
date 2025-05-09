// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect =  (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = { _id: decoded.id };

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      console.error('Token verification error stack:', error.stack);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No Authorization header or incorrect format');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };