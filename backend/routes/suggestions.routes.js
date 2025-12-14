// Routes xử lý gợi ý món ăn từ AI (US03)
const express = require('express');
const pool = require('../config/database');
const model = require('../config/gemini');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ==========================
// API GỢI Ý MÓN ĂN VỚI GEMINI AI (US03)
// ==========================
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Lấy thông tin preferences của user
        const [prefs] = await pool.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);

        // Lấy danh sách món ăn từ database
        const [dishes] = await pool.query('SELECT * FROM dishes');

        // Tạo prompt cho Gemini AI
        const userPref = prefs[0] || {};
        const prompt = `
Bạn là chuyên gia dinh dưỡng. Hãy gợi ý 3 món ăn phù hợp nhất từ danh sách sau:

DANH SÁCH MÓN ĂN:
${dishes.map(d => `
- ID: ${d.dish_id}
- Tên: ${d.name}
- Mô tả: ${d.description}
- Dinh dưỡng: ${d.calories} kcal, ${d.protein}g protein, ${d.carbs}g carbs, ${d.fat}g fat
- Nguyên liệu: ${d.ingredients}
`).join('\n')}

THÔNG TIN NGƯỜI DÙNG:
- Món yêu thích: ${userPref.favorite_foods || 'Chưa có'}
- Món không thích: ${userPref.dislike_foods || 'Chưa có'}
- Dị ứng: ${userPref.allergies || 'Không có'}
- Mục tiêu: ${userPref.health_goal || 'maintain'}

YÊU CẦU:
1. Tránh món có nguyên liệu gây dị ứng
2. Ưu tiên món phù hợp với mục tiêu sức khỏe
3. Không đề xuất món người dùng không thích

Trả về ĐÚNG định dạng JSON sau (không thêm markdown):
{
  "suggestions": [
    {"dish_id": 1, "reason": "Lý do gợi ý món này"}
  ]
}`;

        // Gọi Gemini AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Xử lý response từ AI (loại bỏ markdown nếu có)
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const aiResponse = JSON.parse(text);

        // Lấy chi tiết món ăn từ database
        const dishIds = aiResponse.suggestions.map(s => s.dish_id);
        const [suggestedDishes] = await pool.query(
            'SELECT * FROM dishes WHERE dish_id IN (?)',
            [dishIds]
        );

        // Kết hợp thông tin món ăn với lý do gợi ý
        const suggestions = suggestedDishes.map(dish => {
            const aiSuggestion = aiResponse.suggestions.find(s => s.dish_id === dish.dish_id);
            return {
                ...dish,
                reason: aiSuggestion?.reason || 'Món ăn phù hợp với bạn'
            };
        });

        res.json({ suggestions });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

module.exports = router;