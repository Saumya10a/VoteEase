document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const electionId = urlParams.get('electionId');

    if (!electionId) {
        alert('Invalid election ID.');
        return;
    }

    const voterDataBody = document.getElementById('voterDataBody');

    try {
        // Fetch voter data from the backend
        const response = await fetch(`http://localhost:3000/api/elections/${electionId}/voters`);
        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to fetch voter data:', error);
            alert(error.error || 'Failed to fetch voter data.');
            return;
        }

        const voters = await response.json();
        console.log('Voter Data:', voters); // Debugging

        // Populate the table with voter data
        voterDataBody.innerHTML = ''; // Clear existing rows
        if (voters.length === 0) {
            voterDataBody.innerHTML = '<tr><td colspan="3">No voters found for this election.</td></tr>';
            return;
        }

        voters.forEach((voter) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${voter.voter_name}</td>
                <td>${voter.candidate_name}</td>
                <td>${new Date(voter.voted_at).toLocaleString()}</td>
            `;
            voterDataBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching voter data:', error);
        alert('An error occurred while fetching voter data.');
    }
});