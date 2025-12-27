const API_URL = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Kiểm tra quyền admin
if (!token) {
    showPleaseLogin();
} else if (user.role !== 'admin') {
    showAccessDenied();
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
                    <p>Bạn cần đăng nhập với tài khoản Admin để truy cập trang quản trị.</p>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="window.location.href='login.html'">
                            🔑 Đăng nhập
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.href='dashboard.html'">
                            ← Về trang chủ
                        </button>
                    </div>
                </div>
            `;
}

function showAccessDenied() {
    document.getElementById('mainHeader').style.display = 'none';
    document.getElementById('mainNav').style.display = 'none';

    document.getElementById('mainContent').innerHTML = `
                <div class="please-login">
                    <div class="icon">⛔</div>
                    <h2>Truy cập bị từ chối</h2>
                    <p>Bạn không có quyền truy cập trang quản trị. Chỉ Admin mới có thể sử dụng trang này.</p>
                    <div class="actions">
                        <button class="btn btn-primary" onclick="window.location.href='dashboard.html'">
                            ← Về trang chủ
                        </button>
                    </div>
                </div>
            `;
}

function initPage() {
    document.getElementById('userDisplay').textContent = `Admin: ${user.username}`;
    loadDishes();
}

// Xử lý submit form (thêm/sửa)
document.getElementById('dishForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dishId = document.getElementById('dishId').value;
    const formData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        calories: parseInt(document.getElementById('calories').value),
        protein: parseFloat(document.getElementById('protein').value),
        carbs: parseFloat(document.getElementById('carbs').value),
        fat: parseFloat(document.getElementById('fat').value),
        price: parseFloat(document.getElementById('price').value),
        ingredients: document.getElementById('ingredients').value,
    };

    try {
        let response;
        if (dishId) {
            // Cập nhật món
            response = await fetch(`${API_URL}/admin/dishes/${dishId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Thêm món mới
            response = await fetch(`${API_URL}/admin/dishes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            showMessage('✅ Lưu thành công!', 'success');
            resetForm();
            loadDishes(); // Reload danh sách
        } else {
            showMessage('❌ Lưu thất bại!', 'error');
        }
    } catch (error) {
        console.error('Save dish error:', error);
        showMessage('❌ Lỗi kết nối!', 'error');
    }
});

// Load danh sách món ăn
async function loadDishes() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('dishesContainer');

    loading.style.display = 'block';

    try {
        const response = await fetch(`${API_URL}/dishes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const dishes = await response.json();
            displayDishes(dishes);
        }
    } catch (error) {
        console.error('Load dishes error:', error);
        showMessage('❌ Lỗi tải danh sách!', 'error');
    } finally {
        loading.style.display = 'none';
    }
}

// Hiển thị danh sách món
function displayDishes(dishes) {
    const container = document.getElementById('dishesContainer');

    if (dishes.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><h3>Chưa có món ăn</h3></div>';
        return;
    }

    let html = '<table class="admin-table"><thead><tr><th>Tên</th><th>Calo</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Giá</th><th>Hành động</th></tr></thead><tbody>';

    dishes.forEach(dish => {
        html += `
                    <tr>
                        <td><strong>${dish.name}</strong></td>
                        <td>${dish.calories} kcal</td>
                        <td>${dish.protein} g</td>
                        <td>${dish.carbs} g</td>
                        <td>${dish.fat} g</td>
                        <td>${Number(dish.price).toLocaleString('vi-VN')} ₫</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-edit" onclick='editDish(${JSON.stringify(dish)})'> Sửa</button>
                                <button class="btn btn-delete" onclick="deleteDish(${dish.dish_id})"> Xóa</button>
                            </div>
                        </td>
                    </tr>
                `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Sửa món
function editDish(dish) {
    document.getElementById('formTitle').textContent = ' Chỉnh sửa món ăn';
    document.getElementById('dishId').value = dish.dish_id;
    document.getElementById('name').value = dish.name;
    document.getElementById('description').value = dish.description;
    document.getElementById('calories').value = dish.calories;
    document.getElementById('protein').value = dish.protein;
    document.getElementById('carbs').value = dish.carbs;
    document.getElementById('fat').value = dish.fat;
    document.getElementById('price').value = dish.price;
    document.getElementById('ingredients').value = dish.ingredients;
    document.getElementById('submitBtn').textContent = '💾 Cập nhật';

    // Scroll lên form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Xóa món
function deleteDish(dishId) {
    showConfirm('Bạn có chắc muốn xóa món này?', async () => {
        try {
            const response = await fetch(`${API_URL}/admin/dishes/${dishId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showMessage('✅ Xóa thành công!', 'success');
                loadDishes();
            } else {
                showMessage('❌ Xóa thất bại!', 'error');
            }
        } catch (error) {
            showMessage('❌ Lỗi kết nối!', 'error');
        }
    });
}

function showConfirm(message, onYes) {
    const modal = document.getElementById('confirmModal');
    const msg = document.getElementById('confirmMessage');
    const yesBtn = document.getElementById('confirmYes');
    const noBtn = document.getElementById('confirmNo');

    msg.textContent = message;
    modal.style.display = 'flex';

    yesBtn.onclick = () => {
        modal.style.display = 'none';
        onYes();
    };

    noBtn.onclick = () => {
        modal.style.display = 'none';
    };
}


// Reset form
function resetForm() {
    document.getElementById('formTitle').textContent = '➕ Thêm món ăn mới';
    document.getElementById('dishForm').reset();
    document.getElementById('dishId').value = '';
    document.getElementById('submitBtn').textContent = '💾 Lưu món';
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `toast toast-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 2000);
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}