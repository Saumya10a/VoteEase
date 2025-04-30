// Check if voter is logged in
if (!sessionStorage.getItem('voterId')) {
    window.location.href = 'voter_login.html';
}

// Set voter name in the navbar
document.getElementById('voterName').textContent = `Welcome, ${sessionStorage.getItem('voterName')}`;

// Function to create election cards
async function createElectionCard(election) {
    const card = document.createElement('div');
    card.className = 'election-card';

    card.innerHTML = `
        <h3>${election.title}</h3>
        <p>${election.description}</p>
        <p><strong>Ends on:</strong> ${new Date(election.end_date).toLocaleDateString()}</p>
        <button class="btn vote-btn" onclick="window.location.href='cast_vote.html?id=${election.id}'">Cast Vote</button>
        <button class="btn results-btn" onclick="viewResults('${election.id}', '${election.end_date}')">View Results</button>
    `;
    return card;
}

// Check if user has voted in an election
async function checkIfVoted(electionId) {
    try {
        const response = await fetch(`http://localhost:3000/api/elections/${electionId}/check-vote`, {
            headers: {
                'voter-id': sessionStorage.getItem('voterId')
            }
        });
        const data = await response.json();
        return data.hasVoted;
    } catch (error) {
        console.error('Error checking vote status:', error);
        return false;
    }
}

// Initialize the dashboard
async function initializeDashboard() {
    try {
        // Fetch active elections
        const electionsResponse = await fetch('http://localhost:3000/api/voters/elections');
        const elections = await electionsResponse.json();

        const electionsList = document.getElementById('activeElections');
        electionsList.innerHTML = '';

        // Populate active elections
        for (const election of elections) {
            const card = await createElectionCard(election);
            electionsList.appendChild(card);
        }

        // Fetch voting history
        const historyResponse = await fetch(`http://localhost:3000/api/voters/${sessionStorage.getItem('voterId')}/history`);
        const history = await historyResponse.json();

        const votingHistory = document.getElementById('votingHistory');
        votingHistory.innerHTML = '';

        // Populate voting history
        history.forEach(vote => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <h4>${vote.election_title}</h4>
                <p>Voted for: ${vote.candidate_name}</p>
                <p>Date: ${new Date(vote.voted_at).toLocaleDateString()}</p>
            `;
            votingHistory.appendChild(item);
        });
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

// Handle "View Results" button click
function viewResults(electionId, endDate) {
    const currentDate = new Date();
    const electionEndDate = new Date(endDate);

    if (currentDate < electionEndDate) {
        alert('Results will be available after the voting period ends.');
        return;
    }

    window.location.href = `view_results.html?electionId=${electionId}`;
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '../index.html';
});

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);