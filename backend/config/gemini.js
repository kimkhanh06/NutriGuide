// Cấu hình Gemini AI
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Khởi tạo Gemini AI với API key từ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tạo model gemini-2.5-flash (nhanh và ổn định)
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

// Export model để sử dụng ở routes
module.exports = model;