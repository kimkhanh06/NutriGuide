const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    showPleaseLogin();
} else {
    initPage();
}

function showPleaseLogin() {
    document.getElementById('mainHeader').style.display = 'none';
    document.getElementById('mainNav').style.display = 'none';

    document.getElementById('mainContent').innerHTML = `
                <div class="please-login">
                    <div class="icon">🔒</div>
                    <h2>Vui lòng đăng nhập</h2>
                    <p>Bạn cần đăng nhập để xem lịch sử ăn uống và theo dõi dinh dưỡng của mình.</p>
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

function initPage() {
    document.getElementById('userDisplay').textContent = `Xin chào, ${user.username}!`;
    if (user.role === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
    }
    loadHistory();
}

// Hàm load lịch sử từ API (US06)
async function loadHistory() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    try {
        const response = await fetch(`${API_URL}/meal-history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const history = await response.json();
            displayHistory(history);
            calculateSummary(history);
        } else {
            showMessage('❌ Lỗi tải lịch sử!', 'error');
        }
    } catch (error) {
        console.error('Load history error:', error);
        showMessage('❌ Lỗi kết nối!', 'error');
    } finally {
        loading.style.display = 'none';
    }
}

// Hiển thị lịch sử
function displayHistory(history) {
    const container = document.getElementById('historyContainer');

    if (history.length === 0) {
        container.innerHTML = '<div class="empty-history"><div class="icon">📭</div><h3>Chưa có lịch sử</h3><p>Bạn chưa có lịch sử ăn uống nào.</p></div>';
        return;
    }

    // Tạo table hiển thị
    let html = `
                <table>
                    <thead>
                        <tr>
                            <th>Thời gian</th>
                            <th>Món ăn</th>
                            <th>Calories</th>
                            <th>Protein</th>
                            <th>Carbs</th>
                            <th>Fat</th>
                            <th>Giá</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

    history.forEach(item => {
        // Format thời gian
        const date = new Date(item.eaten_at);
        const timeStr = date.toLocaleString('vi-VN');

        html += `
                    <tr>
                        <td class="date" data-label="Thời gian">${timeStr}</td>
                        <td class="meal-name" data-label="Món ăn"><strong>${item.name}</strong></td>
                        <td data-label="Calories"><span class="nutrition-badge calories">${item.calories} kcal</span></td>
                        <td data-label="Protein"><span class="nutrition-badge protein">${item.protein}g</span></td>
                        <td data-label="Carbs"><span class="nutrition-badge carbs">${item.carbs}g</span></td>
                        <td data-label="Fat"><span class="nutrition-badge fat">${item.fat}g</span></td>
                        <td class="price" data-label="Giá">${Number(item.price).toLocaleString('vi-VN')} ₫</td>
                    </tr>
                `;
    });

    html += `
                    </tbody>
                </table>
            `;

    container.innerHTML = html;
}

// Tính toán thống kê
function calculateSummary(history) {
    if (history.length === 0) return;

    const summary = document.getElementById('summary');
    summary.style.display = 'block';

    // Tổng số bữa ăn
    document.getElementById('totalMeals').textContent = history.length;

    // Tổng calories
    const totalCal = history.reduce((sum, item) => sum + (item.calories || 0), 0);
    document.getElementById('totalCalories').textContent = totalCal.toLocaleString('vi-VN');

    // Trung bình calories
    const avgCal = Math.round(totalCal / history.length);
    document.getElementById('avgCalories').textContent = avgCal.toLocaleString('vi-VN');

    // Tổng chi tiêu
    const totalSpent = history.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    document.getElementById('totalSpent').textContent = totalSpent.toLocaleString('vi-VN');
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}