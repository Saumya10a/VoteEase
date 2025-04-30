document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('http://localhost:3000/api/admin/login', { // Fixed endpoint URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Invalid credentials');
        }

        const data = await response.json();
        sessionStorage.setItem('adminId', data.id); // Store admin ID (if returned by the backend)
        sessionStorage.setItem('adminUsername', data.username); // Store admin username

        // Redirect to admin dashboard
        window.location.href = 'admin_dashboard.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});