// Kiểm tra đăng nhập khi load trang
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    showPleaseLogin();
} else {
    initDashboard();
}

function showPleaseLogin() {
    document.getElementById('mainHeader').style.display = 'none';
    document.getElementById('mainNav').style.display = 'none';

    document.getElementById('mainContent').innerHTML = `
                <div class="please-login">
                    <div class="icon">🔒</div>
                    <h2>Vui lòng đăng nhập</h2>
                    <p>Bạn cần đăng nhập để xem Dashboard và sử dụng các tính năng của NutriGuide.</p>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="window.location.href='login.html'">
                            🔑 Đăng nhập
                        </button>
                        <button class="btn btn-success" onclick="window.location.href='register.html'">
                            ✨ Đăng ký ngay
                        </button>
                    </div>
                </div>
            `;
}

function initDashboard() {
    document.getElementById('userDisplay').textContent = `Xin chào, ${user.username}!`;
    //thêm
    if (user.role === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
    }

    document.getElementById('mainContent').innerHTML = `
                <h2>Chào mừng đến với NutriGuide! 👋</h2>
                <p>Hệ thống gợi ý món ăn thông minh được hỗ trợ bởi Gemini AI</p>

                <div class="grid">
                    <div class="card">
                        <h3>📝 Thiết lập sở thích</h3>
                        <p>Cập nhật khẩu vị, món yêu thích/không thích, thực phẩm dị ứng và mục tiêu sức khỏe của bạn.</p>
                        <button class="btn btn-primary mt-20" onclick="location.href='preferences.html'">
                            Đi đến thiết lập
                        </button>
                    </div>

                    <div class="card">
                        <h3>🤖 Gợi ý món ăn AI</h3>
                        <p>Nhận gợi ý món ăn được cá nhân hóa dựa trên sở thích và mục tiêu của bạn.</p>
                        <button class="btn btn-success mt-20" onclick="location.href='suggestions.html'">
                            Xem gợi ý
                        </button>
                    </div>

                    <div class="card">
                        <h3>📊 Lịch sử ăn uống</h3>
                        <p>Xem lại các món đã ăn và theo dõi dinh dưỡng hàng ngày của bạn.</p>
                        <button class="btn btn-primary mt-20">
                            Xem lịch sử
                        </button>
                    </div>
                </div>

                <div class="card mt-20 instructions">
                    <h3>🚀 Bắt đầu như thế nào?</h3>
                    <ol>
                        <li>Truy cập <strong>"Sở thích của tôi"</strong> để thiết lập thông tin cá nhân</li>
                        <li>Nhập món yêu thích, món không thích và thực phẩm dị ứng (nếu có)</li>
                        <li>Chọn mục tiêu sức khỏe (giảm cân, tăng cơ, duy trì...)</li>
                        <li>Đặt ngân sách cho mỗi bữa ăn</li>
                        <li>Nhấn <strong>"Gợi ý món ăn"</strong> để nhận đề xuất từ AI</li>
                        <li>Lưu lại món đã ăn để AI tối ưu gợi ý theo thời gian</li>
                    </ol>
                </div>
            `;
}

// Hàm đăng xuất
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}