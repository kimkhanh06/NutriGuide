// Cấu hình kết nối MySQL
const mysql = require('mysql2/promise');
require('dotenv').config();

// Cấu hình database từ biến môi trường
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nutriguide'
};

// Tạo connection pool (quản lý nhiều kết nối hiệu quả)
const pool = mysql.createPool(dbConfig);

module.exports = pool;