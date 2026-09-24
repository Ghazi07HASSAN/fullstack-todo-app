// server/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <TOKEN>"

  if (!token) return res.status(401).json({ error: 'Access denied. Token missing!' });

  jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token!' });
    req.user = user; // Token se decoded user info (id, email)
    next();
  });
};

module.exports = authenticateToken;