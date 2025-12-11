// Routes xử lý danh sách món ăn (US04)
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ==========================
// API LẤY TẤT CẢ MÓN ĂN (US04)
// ==========================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [dishes] = await pool.query('SELECT * FROM dishes ORDER BY name');
        res.json(dishes);
    } catch (error) {
        console.error('Get dishes error:', error);
        res.status(500).json({ error: 'Failed to get dishes' });
    }
});

module.exports = router;