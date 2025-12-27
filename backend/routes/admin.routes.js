// Routes quản lý món ăn cho Admin (US07) – phiên bản chuẩn hóa
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * API ADMIN: TẠO MÓN ĂN MỚI
 * body:
 * {
 *   name, description, calories, protein, carbs, fat, price,
 *   ingredients: ["thịt bò", "bông cải", "tỏi"]
 * }
 */
router.post('/dishes', authenticateToken, isAdmin, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const {
            name, description, calories,
            protein, carbs, fat, price,
            ingredients
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Dish name is required' });
        }

        await conn.beginTransaction();

        // 1️⃣ Insert dish
        const [dishResult] = await conn.query(
            `INSERT INTO dishes 
            (name, description, calories, protein, carbs, fat, price)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, description, calories, protein, carbs, fat, price]
        );

        const dishId = dishResult.insertId;

        // 2️⃣ Insert ingredients + mapping
        if (Array.isArray(ingredients)) {
            for (const ing of ingredients) {
                const ingredientName = ing.trim();
                if (!ingredientName) continue;

                // insert ingredient if not exists
                const [[existing]] = await conn.query(
                    'SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?',
                    [ingredientName]
                );

                let ingredientId;
                if (existing) {
                    ingredientId = existing.ingredient_id;
                } else {
                    const [ingResult] = await conn.query(
                        'INSERT INTO ingredients (ingredient_name) VALUES (?)',
                        [ingredientName]
                    );
                    ingredientId = ingResult.insertId;
                }

                // mapping
                await conn.query(
                    'INSERT INTO dish_ingredients (dish_id, ingredient_id) VALUES (?, ?)',
                    [dishId, ingredientId]
                );
            }
        }

        await conn.commit();
        res.status(201).json({ message: 'Dish created', dish_id: dishId });
    } catch (error) {
        await conn.rollback();
        console.error('Create dish error:', error);
        res.status(500).json({ error: 'Failed to create dish' });
    } finally {
        conn.release();
    }
});

/**
 * API ADMIN: XÓA MÓN ĂN
 */
router.delete('/dishes/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const dishId = req.params.id;
        await pool.query('DELETE FROM dishes WHERE dish_id = ?', [dishId]);
        res.json({ message: 'Dish deleted' });
    } catch (error) {
        console.error('Delete dish error:', error);
        res.status(500).json({ error: 'Failed to delete dish' });
    }
});

module.exports = router;
