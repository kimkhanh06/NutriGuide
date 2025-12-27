// Routes xử lý sở thích người dùng (phiên bản mới – đã chuẩn hóa)
const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * API LƯU / CẬP NHẬT SỞ THÍCH NGƯỜI DÙNG
 * - health_goal, budget_range  -> bảng users
 * - favorite_foods             -> user_favorite_foods
 * - dislike_foods              -> user_dislike_foods
 * - allergies                  -> user_allergies
 */
router.post('/', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const userId = req.user.user_id;
        let {
            health_goal,
            budget_range,
            favorite_foods,
            dislike_foods,
            allergies
        } = req.body;

        // Chuẩn hóa dữ liệu (cho phép gửi string hoặc array)
        const normalizeArray = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return value.split(',').map(v => v.trim()).filter(v => v);
        };

        favorite_foods = normalizeArray(favorite_foods);
        dislike_foods = normalizeArray(dislike_foods);
        allergies = normalizeArray(allergies);

        await connection.beginTransaction();

        // 1️⃣ Cập nhật thông tin đơn trị vào users
        await connection.query(
            `UPDATE users 
             SET health_goal = ?, budget_range = ?
             WHERE user_id = ?`,
            [health_goal || 'maintain', budget_range || null, userId]
        );

        // 2️⃣ Xóa sở thích cũ
        await connection.query(
            'DELETE FROM user_favorite_foods WHERE user_id = ?',
            [userId]
        );
        await connection.query(
            'DELETE FROM user_dislike_foods WHERE user_id = ?',
            [userId]
        );
        await connection.query(
            'DELETE FROM user_allergies WHERE user_id = ?',
            [userId]
        );

        // 3️⃣ Thêm lại favorite foods
        for (const food of favorite_foods) {
            await connection.query(
                'INSERT INTO user_favorite_foods (user_id, food_name) VALUES (?, ?)',
                [userId, food]
            );
        }

        // 4️⃣ Thêm lại dislike foods
        for (const food of dislike_foods) {
            await connection.query(
                'INSERT INTO user_dislike_foods (user_id, food_name) VALUES (?, ?)',
                [userId, food]
            );
        }

        // 5️⃣ Thêm lại allergies
        for (const allergen of allergies) {
            await connection.query(
                'INSERT INTO user_allergies (user_id, allergen) VALUES (?, ?)',
                [userId, allergen]
            );
        }

        await connection.commit();

        res.json({
            message: 'Preferences saved successfully'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Save preferences error:', error);
        res.status(500).json({ error: 'Failed to save preferences' });
    } finally {
        connection.release();
    }
});

/**
 * API LẤY SỞ THÍCH NGƯỜI DÙNG
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // 1️⃣ Lấy thông tin từ users
        const [[user]] = await pool.query(
            `SELECT health_goal, budget_range
             FROM users
             WHERE user_id = ?`,
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2️⃣ Lấy sở thích chi tiết
        const [favorites] = await pool.query(
            'SELECT food_name FROM user_favorite_foods WHERE user_id = ?',
            [userId]
        );
        const [dislikes] = await pool.query(
            'SELECT food_name FROM user_dislike_foods WHERE user_id = ?',
            [userId]
        );
        const [allergies] = await pool.query(
            'SELECT allergen FROM user_allergies WHERE user_id = ?',
            [userId]
        );

        res.json({
            health_goal: user.health_goal,
            budget_range: user.budget_range,
            favorite_foods: favorites.map(f => f.food_name),
            dislike_foods: dislikes.map(d => d.food_name),
            allergies: allergies.map(a => a.allergen)
        });
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

module.exports = router;
