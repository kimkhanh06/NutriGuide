// Routes xử lý lịch sử ăn uống (US06)
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ==========================
// API LƯU LỊCH SỬ ĂN (US06)
// ==========================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { dish_id } = req.body;
        const userId = req.user.user_id;

        await pool.query(
            'INSERT INTO meal_history (user_id, dish_id) VALUES (?, ?)',
            [userId, dish_id || null]
        );

        res.json({ message: 'Meal history saved' });
    } catch (error) {
        console.error('Save meal history error:', error);
        res.status(500).json({ error: 'Failed to save meal history' });
    }
});

// ==========================
// API LẤY LỊCH SỬ ĂN (US06)
// ==========================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const [history] = await pool.query(
            `SELECT mh.*, d.name, d.calories, d.protein, d.carbs, d.fat, d.price
            FROM meal_history mh
            JOIN dishes d ON mh.dish_id = d.dish_id
            WHERE mh.user_id = ?
            ORDER BY mh.eaten_at DESC`,
            [userId]
        );

        res.json(history);
    } catch (error) {
        console.error('Get meal history error:', error);
        res.status(500).json({ error: 'Failed to get meal history' });
    }
});

module.exports = router;