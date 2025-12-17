// Routes xử lý sở thích người dùng 
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// API LƯU SỞ THÍCH (US01, US02)

// thêm mới budget_range
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { favorite_foods, dislike_foods, allergies, health_goal, budget_range } = req.body;
        const userId = req.user.user_id;

        // Kiểm tra đã có preferences chưa
        const [existing] = await pool.query('SELECT pref_id FROM user_preferences WHERE user_id = ?', [userId]);

        if (existing.length > 0) {
            await pool.query(
                `UPDATE user_preferences SET 
                favorite_foods = ?, dislike_foods = ?, allergies = ?, 
                health_goal = ?, budget_range = ?
                WHERE user_id = ?`,
                [favorite_foods, dislike_foods, allergies, health_goal, budget_range, userId]
            );
        } else {
            await pool.query(
                `INSERT INTO user_preferences 
                (user_id, favorite_foods, dislike_foods, allergies, health_goal, budget_range)
                VALUES (?, ?, ?, ?, ?)`,
                [userId, favorite_foods, dislike_foods, allergies, health_goal, budget_range]
            );
        }

        res.json({ message: 'Preferences saved successfully' });
    } catch (error) {
        console.error('Save preferences error:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    }
});


// API LẤY SỞ THÍCH
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const [prefs] = await pool.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);

        if (prefs.length === 0) {
            return res.json(null); // Chưa có preferences
        }

        res.json(prefs[0]);
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

module.exports = router;