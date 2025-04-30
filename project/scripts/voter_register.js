document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior

        // Get form data
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validate form data
        if (!fullName || !email || !phone || !password) {
            alert('All fields are required.');
            return;
        }

        try {
            // Send data to the backend
            const response = await fetch('http://localhost:3000/api/voters/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullName, email, phone, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Registration failed:', error); // Debugging
                alert(error.error || 'Failed to register. Please try again.');
                return;
            }

            // Registration successful
            alert('Registration successful! You can now log in.');
            window.location.href = 'voter_login.html'; // Redirect to login page
        } catch (error) {
            console.error('Error during registration:', error); // Debugging
            alert('An error occurred. Please try again later.');
        }
    });
});