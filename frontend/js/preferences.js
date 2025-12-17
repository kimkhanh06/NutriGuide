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
                    <p>Bạn cần đăng nhập để thiết lập sở thích và sử dụng các tính năng của NutriGuide.</p>
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
    loadPreferences();
}

async function loadPreferences() {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    try {
        // Gọi API lấy preferences
        const response = await fetch(`${API_URL}/preferences`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const prefs = await response.json();

            if (prefs) {
                document.getElementById('favorite_foods').value = prefs.favorite_foods || '';
                document.getElementById('dislike_foods').value = prefs.dislike_foods || '';
                document.getElementById('allergies').value = prefs.allergies || '';
                document.getElementById('health_goal').value = prefs.health_goal || 'maintain';
                //
                document.getElementById('budget_range').value = prefs.budget_range || '';
            }
        }
    } catch (error) {
        console.error('Load preferences error:', error);
        showMessage('Lỗi tải thông tin!', 'error');
    } finally {
        loading.style.display = 'none';
    }
}

document.getElementById('preferencesForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        favorite_foods: document.getElementById('favorite_foods').value.trim(),
        dislike_foods: document.getElementById('dislike_foods').value.trim(),
        allergies: document.getElementById('allergies').value.trim(),
        health_goal: document.getElementById('health_goal').value,
        budget_range: document.getElementById('budget_range').value || null
    };

    try {
        // Gọi API lưu preferences
        const response = await fetch(`${API_URL}/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('✅ Đã lưu sở thích thành công!', 'success');
        } else {
            showMessage('❌ Lưu thất bại!', 'error');
        }
    } catch (error) {
        console.error('Save preferences error:', error);
        showMessage('❌ Lỗi kết nối!', 'error');
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');

    messageDiv.innerHTML = `
        <div class="info-box ${type}">
            ${message}
        </div>
    `;

    messageDiv.style.display = 'block';

    // Tự ẩn sau 2 giây
    setTimeout(() => {
        messageDiv.style.display = 'none';
        messageDiv.innerHTML = '';
    }, 2000);
}


function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}