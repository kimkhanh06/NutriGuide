// Routes quản lý món ăn cho Admin (US07)
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// API ADMIN: TẠO MÓN ĂN MỚI
// ==========================
router.post('/dishes', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, description, calories, protein, carbs, fat, price, ingredients } = req.body;

        const [result] = await pool.query(
            `INSERT INTO dishes (name, description, calories, protein, carbs, fat, price, ingredients)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, calories, protein, carbs, fat, price, ingredients]
        );

        res.status(201).json({ message: 'Dish created', dishId: result.insertId });
    } catch (error) {
        console.error('Create dish error:', error);
        res.status(500).json({ error: 'Failed to create dish' });
    }
});

// API ADMIN: CẬP NHẬT MÓN ĂN
// ==========================
router.put('/dishes/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const dishId = req.params.id;
        const { name, description, calories, protein, carbs, fat, price, ingredients } = req.body;

        await pool.query(
            `UPDATE dishes SET name=?, description=?, calories=?, protein=?, carbs=?, 
            fat=?, price=?, ingredients=? WHERE dish_id=?`,
            [name, description, calories, protein, carbs, fat, price, ingredients, dishId]
        );

        res.json({ message: 'Dish updated' });
    } catch (error) {
        console.error('Update dish error:', error);
        res.status(500).json({ error: 'Failed to update dish' });
    }
});

// API ADMIN: XÓA MÓN ĂN

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