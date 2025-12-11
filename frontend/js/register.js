const API_URL = 'http://localhost:3000/api';

// Xử lý đăng ký
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate: Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    try {
        // Gọi API đăng ký
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Đăng ký thành công
            showMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');

            // Chuyển hướng đến trang login sau 2 giây
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            // Đăng ký thất bại (có thể username đã tồn tại)
            showMessage(data.error || 'Đăng ký thất bại!', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
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