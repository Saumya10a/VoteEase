document.addEventListener('DOMContentLoaded', () => {
    const candidatesContainer = document.getElementById('candidatesContainer');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const newElectionForm = document.getElementById('newElectionForm');

    let candidateCount = 0;

    // Add a new candidate field
    addCandidateBtn.addEventListener('click', () => {
        candidateCount++;

        const candidateDiv = document.createElement('div');
        candidateDiv.className = 'candidate';
        candidateDiv.id = `candidate-${candidateCount}`;
        candidateDiv.innerHTML = `
            <label for="candidate-name-${candidateCount}">Candidate Name:</label>
            <input type="text" id="candidate-name-${candidateCount}" name="candidates[${candidateCount}][name]" required>
            
            <button type="button" class="deleteCandidateBtn" data-id="${candidateCount}">Delete Candidate</button>
        `;

        candidatesContainer.appendChild(candidateDiv);

        // Add delete functionality
        candidateDiv.querySelector('.deleteCandidateBtn').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            document.getElementById(`candidate-${id}`).remove();
        });
    });

    // Handle form submission
    newElectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(newElectionForm);

        // Manually construct the candidates array
        const candidates = [];
        for (let i = 1; i <= candidateCount; i++) {
            const candidateName = formData.get(`candidates[${i}][name]`);
            if (candidateName) {
                candidates.push({ name: candidateName });
            }
        }

        // Construct the final payload
        const payload = {
            title: formData.get('title'),
            description: formData.get('description'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            candidates: JSON.stringify(candidates) // Convert candidates array to JSON string
        };

        console.log('Payload:', payload); // Debugging: Log the payload

        try {
            const response = await fetch('http://localhost:3000/api/elections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message); // Show success message
                window.location.href = 'admin_dashboard.html'; // Redirect to the dashboard
            } else {
                const error = await response.json();
                console.error('Error Response:', error); // Debugging: Log error response
                alert(`Error: ${error.error || 'An unknown error occurred.'}`);
            }
        } catch (error) {
            console.error('Error creating election:', error);
            alert('An error occurred. Please try again.');
        }
    });
});