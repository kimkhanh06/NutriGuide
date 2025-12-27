// Routes xử lý gợi ý món ăn từ AI (Gemini) – phiên bản ổn định
const express = require('express');
const pool = require('../config/database');
const model = require('../config/gemini');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        // =========================
        // 1️⃣ LẤY THÔNG TIN USER
        // =========================
        const [[user]] = await pool.query(
            'SELECT health_goal, budget_range FROM users WHERE user_id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // =========================
        // 2️⃣ LẤY SỞ THÍCH USER
        // =========================
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

        // =========================
        // 3️⃣ LẤY DANH SÁCH MÓN + NGUYÊN LIỆU
        // =========================
        const [dishes] = await pool.query(`
            SELECT 
                d.dish_id,
                d.name,
                d.description,
                d.calories,
                d.protein,
                d.carbs,
                d.fat,
                d.price,
                GROUP_CONCAT(i.ingredient_name) AS ingredients
            FROM dishes d
            LEFT JOIN dish_ingredients di ON d.dish_id = di.dish_id
            LEFT JOIN ingredients i ON di.ingredient_id = i.ingredient_id
            GROUP BY d.dish_id
        `);

        if (dishes.length === 0) {
            return res.json({ suggestions: [] });
        }

        // =========================
        // 4️⃣ LẤY LỊCH SỬ ĂN
        // =========================
        const [history] = await pool.query(
            `SELECT d.name 
             FROM meal_history mh
             JOIN dishes d ON mh.dish_id = d.dish_id
             WHERE mh.user_id = ?
             ORDER BY mh.eaten_at DESC
             LIMIT 10`,
            [userId]
        );

        // =========================
        // 5️⃣ TẠO PROMPT
        // =========================
        const prompt = `
Bạn là chuyên gia dinh dưỡng.
Hãy tư vấn một cách THÂN THIỆN, DỄ HIỂU và CÓ CẢM HỨNG như một ứng dụng chăm sóc sức khỏe.
Gợi ý 3 món ăn phù hợp nhất từ danh sách sau:

DANH SÁCH MÓN ĂN:
${dishes.map(d => `
- ID: ${d.dish_id}
- Tên: ${d.name}
- Mô tả: ${d.description || 'Không có'}
- Dinh dưỡng: ${d.calories} kcal, ${d.protein}g protein, ${d.carbs}g carbs, ${d.fat}g fat
- Giá: ${d.price} VNĐ
- Nguyên liệu: ${d.ingredients || 'Không rõ'}
`).join('\n')}

THÔNG TIN NGƯỜI DÙNG:
- Mục tiêu sức khỏe: ${user.health_goal}
- Ngân sách: ${user.budget_range || 'Không giới hạn'} VNĐ/bữa
- Món yêu thích: ${favorites.map(f => f.food_name).join(', ') || 'Không có'}
- Món không thích: ${dislikes.map(d => d.food_name).join(', ') || 'Không có'}
- Dị ứng: ${allergies.map(a => a.allergen).join(', ') || 'Không có'}

LỊCH SỬ ĂN GẦN ĐÂY:
${history.map(h => h.name).join(', ') || 'Chưa có'}

YÊU CẦU:
1. Tránh món có nguyên liệu gây dị ứng
2. Ưu tiên món phù hợp với mục tiêu sức khỏe
3. Không đề xuất món người dùng không thích
4. Xem xét ngân sách
5. Đa dạng hóa dựa trên lịch sử
6. Giọng văn tích cực, gần gũi, không máy móc

Trả về ĐÚNG định dạng JSON sau (không thêm markdown):
{
  "suggestions": [
    {"dish_id": 1, "reason": "Lý do gợi ý món này"},
    {"dish_id": 2, "reason": "Lý do gợi ý món này..."},
    {"dish_id": 3, "reason": "Lý do gợi ý món này..."}
  ]
}`;

        // =========================
        // 6️⃣ GỌI GEMINI
        // =========================
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // =========================
        // 7️⃣ LÀM SẠCH & PARSE JSON
        // =========================
        // Xóa markdown
        text = text.replace(/```json|```/g, '').trim();

        // Tách JSON dù có text thừa
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('AI raw response:', text);
            return res.status(500).json({ error: 'AI response is not valid JSON' });
        }

        let aiData;
        try {
            aiData = JSON.parse(jsonMatch[0]);
        } catch (err) {
            console.error('JSON parse error:', jsonMatch[0]);
            return res.status(500).json({ error: 'Failed to parse AI JSON' });
        }

        if (!aiData.suggestions || !Array.isArray(aiData.suggestions)) {
            return res.status(500).json({ error: 'Invalid AI response structure' });
        }

        // =========================
        // 8️⃣ TRẢ KẾT QUẢ
        // =========================
        const suggestedIds = aiData.suggestions.map(s => s.dish_id);

        const [suggestedDishes] = await pool.query(
            'SELECT * FROM dishes WHERE dish_id IN (?)',
            [suggestedIds]
        );

        const suggestions = suggestedDishes.map(dish => {
            const aiItem = aiData.suggestions.find(s => s.dish_id === dish.dish_id);
            return {
                ...dish,
                reason: aiItem?.reason || 'Phù hợp với nhu cầu dinh dưỡng của bạn'
            };
        });

        res.json({ suggestions });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: 'Failed to generate suggestions' });
    }
});

module.exports = router;
