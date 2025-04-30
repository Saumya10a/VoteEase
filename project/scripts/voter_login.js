document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/voters/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        sessionStorage.setItem('voterId', data.id);
        sessionStorage.setItem('voterName', data.fullName);
        sessionStorage.setItem('voterEmail', data.email);
        
        window.location.href = 'voter_dashboard.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});