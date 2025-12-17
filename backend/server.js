// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const suggestionsRoutes = require('./routes/suggestions.routes');
const dishesRoutes = require('./routes/dishes.routes');
const historyRoutes = require('./routes/history.routes');
const adminRoutes = require('./routes/admin.routes');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(express.json()); // Parse JSON request body
app.use(cors());


app.use('/api', authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/dishes', dishesRoutes);

//thêm mới sprint 2
app.use('/api/meal-history', historyRoutes);
app.use('/api/admin', adminRoutes);
// ROUTE KIỂM TRA HEALTH
app.get('/', (req, res) => {
    res.json({
        message: '🍽️ NutriGuide API đang hoạt động!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/register, /api/login',
            preferences: '/api/preferences',
            suggestions: '/api/suggestions',
            dishes: '/api/dishes',
            history: '/api/meal-history',
            admin: '/api/admin/dishes'
        }
    });
});

// KHỞI ĐỘNG SERVER
app.listen(PORT, () => {
    console.log('========================================');
    console.log('  NutriGuide Backend Server');
    console.log('========================================');
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` JWT Secret: ${process.env.JWT_SECRET ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(` Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log('========================================');
});