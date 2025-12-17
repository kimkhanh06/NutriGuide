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
                    <p>Bạn cần đăng nhập để nhận gợi ý món ăn từ AI dựa trên sở thích của bạn.</p>
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
}

// Hàm lấy gợi ý từ AI
async function getSuggestions() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('suggestionsContainer');

    loading.style.display = 'block';
    container.innerHTML = '';

    try {
        // Gọi API gợi ý 
        const response = await fetch(`${API_URL}/suggestions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            displaySuggestions(data.suggestions);
        } else {
            const error = await response.json();
            showMessage(`❌ ${error.error}`, 'error');
        }
    } catch (error) {
        console.error('Get suggestions error:', error);
        showMessage('❌ Lỗi kết nối hoặc API Gemini chưa được cấu hình!', 'error');
    } finally {
        loading.style.display = 'none';
    }
}

function displaySuggestions(suggestions) {
    const container = document.getElementById('suggestionsContainer');

    if (!suggestions || suggestions.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">🍽️</div><h3>Không có gợi ý</h3><p>Vui lòng cập nhật sở thích!</p></div>';
        return;
    }

    container.innerHTML = '';

    suggestions.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.innerHTML = `
                    
                    <div class="content">
                        <h3>${dish.name}</h3>
                        <p class="description">${dish.description}</p>
                        
                        <div class="nutrition-info">
                            <div class="nutrition-item">
                                <strong>${dish.calories}</strong>
                                <span>kcal</span>
                            </div>
                            <div class="nutrition-item">
                                <strong>${dish.protein}g</strong>
                                <span>Protein</span>
                            </div>
                            <div class="nutrition-item">
                                <strong>${dish.carbs}g</strong>
                                <span>Carbs</span>
                            </div>
                            <div class="nutrition-item">
                                <strong>${dish.fat}g</strong>
                                <span>Fat</span>
                            </div>
                        </div>
                        
                        <!-- US05: Hiển thị giá -->
                        <div class="price-badge">💰 ${Number(dish.price).toLocaleString('vi-VN')} VNĐ</div>
                        
                        <!-- Lý do AI gợi ý -->
                        <div class="ai-reason">
                            <strong>🤖 Tại sao AI gợi ý:</strong>
                            <p>${dish.reason}</p>
                        </div>
                        
                        <div class="ingredients">
                            <strong>🥗 Nguyên liệu:</strong>
                            <div class="ingredients-list">
                                ${dish.ingredients.split(',').map(ing => `<span class="ingredient-tag">${ing.trim()}</span>`).join('')}
                            </div>
                        </div>

                        <div class="actions">
                            <button class="btn btn-success" onclick="saveToHistory(${dish.dish_id})">
                                ✅ Đã ăn món này
                            </button>
                        </div>
                    </div
                `;
        container.appendChild(card);
    });
}

// Hàm lưu món vào lịch sử (US06)
async function saveToHistory(dishId) {
    try {
        const response = await fetch(`${API_URL}/meal-history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ dish_id: dishId })
        });

        if (response.ok) {
            showMessage('✅ Đã lưu vào lịch sử!', 'success');
        } else {
            showMessage('❌ Lưu thất bại!', 'error');
        }
    } catch (error) {
        console.error('Save to history error:', error);
        showMessage('❌ Lỗi kết nối!', 'error');
    }
}


function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `toast toast-${type}`;

    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}