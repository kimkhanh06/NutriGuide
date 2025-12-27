// Routes xử lý danh sách món ăn (US04) – phiên bản chuẩn hóa
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// API LẤY TẤT CẢ MÓN ĂN + NGUYÊN LIỆU
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                d.*,
                GROUP_CONCAT(i.ingredient_name) AS ingredients
            FROM dishes d
            LEFT JOIN dish_ingredients di ON d.dish_id = di.dish_id
            LEFT JOIN ingredients i ON di.ingredient_id = i.ingredient_id
            GROUP BY d.dish_id
            ORDER BY d.name
        `);

        res.json(rows);
    } catch (error) {
        console.error('Get dishes error:', error);
        res.status(500).json({ error: 'Failed to get dishes' });
    }
});

module.exports = router;
