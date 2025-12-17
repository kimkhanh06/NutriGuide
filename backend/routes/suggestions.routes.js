// Routes xử lý gợi ý món ăn từ AI 
const express = require('express');
const pool = require('../config/database');
const model = require('../config/gemini');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// API GỢI Ý MÓN ĂN VỚI GEMINI AI 
// thêm ngân sách,lịch sử
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [prefs] = await pool.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
        const [dishes] = await pool.query('SELECT * FROM dishes');
        // Lấy lịch sử ăn của user (thêm mới)
        const [history] = await pool.query(
            `SELECT d.name FROM meal_history mh 
            JOIN dishes d ON mh.dish_id = d.dish_id 
            WHERE mh.user_id = ? ORDER BY mh.eaten_at DESC LIMIT 10`,
            [userId]
        );
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
- Giá: ${d.price} VNĐ
- Nguyên liệu: ${d.ingredients}
`).join('\n')}

THÔNG TIN NGƯỜI DÙNG:
- Món yêu thích: ${userPref.favorite_foods || 'Chưa có'}
- Món không thích: ${userPref.dislike_foods || 'Chưa có'}
- Dị ứng: ${userPref.allergies || 'Không có'}
- Mục tiêu: ${userPref.health_goal || 'maintain'}
- Ngân sách: ${userPref.budget_range || 'Không giới hạn'} VNĐ/bữa

LỊCH SỬ ĂN GẦN ĐÂY:
${history.length > 0 ? history.map(h => `${h.name} `).join(', ') : 'Chưa có'}

YÊU CẦU:
1. Tránh món có nguyên liệu gây dị ứng
2. Ưu tiên món phù hợp với mục tiêu sức khỏe
3. Không đề xuất món người dùng không thích
4. Xem xét ngân sách
5. Đa dạng hóa dựa trên lịch sử

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

        // Xử lý response từ AI 
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const aiResponse = JSON.parse(text);

        const dishIds = aiResponse.suggestions.map(s => s.dish_id);
        const [suggestedDishes] = await pool.query(
            'SELECT * FROM dishes WHERE dish_id IN (?)',
            [dishIds]
        );

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