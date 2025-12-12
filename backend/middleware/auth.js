// Middleware xác thực JWT token
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Secret key cho JWT từ .env
const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key-change-this';

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
    // Lấy token từ header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    // Kiểm tra token có tồn tại không
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Xác thực token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user; // Lưu thông tin user vào request
        next(); // Tiếp tục xử lý request
    });
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// Export các middleware
module.exports = {
    authenticateToken,
    isAdmin,
    JWT_SECRET
};