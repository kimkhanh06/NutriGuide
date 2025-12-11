// Hằng số API URL
const API_URL = 'http://localhost:3000/api';

// Lắng nghe sự kiện submit form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn form reload trang

    // Lấy giá trị từ input
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Gọi API đăng nhập
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Đăng nhập thành công
            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Hiển thị thông báo thành công
            showMessage('Đăng nhập thành công! Đang chuyển hướng...', 'success');

            // Chuyển hướng sau 1 giây
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            // Đăng nhập thất bại
            showMessage(data.error || 'Đăng nhập thất bại!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Lỗi kết nối đến server!', 'error');
    }
});

// Hàm hiển thị thông báo
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
}