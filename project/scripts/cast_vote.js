document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const electionId = urlParams.get('id');

    if (!electionId) {
        alert('Invalid election.');
        window.location.href = 'voter_dashboard.html';
        return;
    }

    try {
        // Fetch election details
        console.log(`Fetching election details for ID: ${electionId}`); // Debugging
        const electionResponse = await fetch(`http://localhost:3000/api/elections/${electionId}`);
        if (!electionResponse.ok) {
            throw new Error('Failed to fetch election details.');
        }
        const election = await electionResponse.json();
        console.log('Election Details:', election); // Debugging

        document.getElementById('electionTitle').textContent = election.title;
        document.getElementById('electionDescription').textContent = election.description;

        // Fetch candidates
        console.log(`Fetching candidates for election ID: ${electionId}`); // Debugging
        const candidatesResponse = await fetch(`http://localhost:3000/api/elections/${electionId}/candidates`);
        if (!candidatesResponse.ok) {
            throw new Error('Failed to fetch candidates.');
        }
        const candidates = await candidatesResponse.json();
        console.log('Candidates:', candidates); // Debugging

        const candidatesList = document.getElementById('candidates');
        candidates.forEach(candidate => {
            const li = document.createElement('li');
            li.textContent = candidate.name;
            const voteButton = document.createElement('button');
            voteButton.textContent = 'Vote';
            voteButton.className = 'vote-btn';
            voteButton.addEventListener('click', () => castVote(electionId, candidate.name));
            li.appendChild(voteButton);
            candidatesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error:', error); // Debugging
        alert('Failed to load election details.');
        window.location.href = 'voter_dashboard.html';
    }

    async function castVote(electionId, candidateName) {
        const email = prompt('Please enter your registered email to confirm your vote:'); // Ask for the voter's email
        console.log('Retrieved email:', email); // Debugging
    
        if (!email) {
            alert('Email is required to vote.');
            return;
        }
    
        const confirmation = confirm(`Are you sure you want to vote for ${candidateName}? This action cannot be undone.`);
        if (!confirmation) return;
    
        try {
            console.log('Sending vote request:', { electionId, email, candidateName }); // Debugging
            const response = await fetch(`http://localhost:3000/api/elections/${electionId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, candidateName }),
            });
    
            if (!response.ok) {
                const error = await response.json();
                console.error('Vote submission failed:', error); // Debugging
                alert(error.error || 'Failed to submit vote.');
                return;
            }
    
            alert('Vote submitted successfully!');
            window.location.href = 'voter_dashboard.html';
        } catch (error) {
            console.error('Error submitting vote:', error); // Debugging
            alert('Failed to submit vote.');
        }
    }
});