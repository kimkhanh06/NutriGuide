// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const suggestionsRoutes = require('./routes/suggestions.routes');
const dishesRoutes = require('./routes/dishes.routes');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(express.json()); // Parse JSON request body
app.use(cors()); // Cho phép CORS từ mọi domain

// Routes xác thực (đăng ký/đăng nhập)
app.use('/api', authRoutes);

// Routes sở thích người dùng
app.use('/api/preferences', preferencesRoutes);

// Routes gợi ý món ăn từ AI
app.use('/api/suggestions', suggestionsRoutes);

// Routes danh sách món ăn
app.use('/api/dishes', dishesRoutes);

// KHỞI ĐỘNG SERVER
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🍽️  NutriGuide Backend Server');
    console.log('========================================');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log('========================================');
});