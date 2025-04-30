document.addEventListener('DOMContentLoaded', () => {
    const activeElectionsContainer = document.getElementById('activeElections');
    const createElectionBtn = document.getElementById('createElection');

    // Fetch and display active elections
    const fetchActiveElections = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/elections'); // Updated API endpoint
            if (response.ok) {
                const elections = await response.json();
                displayActiveElections(elections);
            } else {
                const error = await response.json();
                console.error('Failed to fetch active elections:', error);
                activeElectionsContainer.innerHTML = '<p>No active elections found.</p>';
            }
        } catch (error) {
            console.error('Error fetching active elections:', error);
            activeElectionsContainer.innerHTML = '<p>Error loading elections. Please try again later.</p>';
        }
    };

    // Display active elections
    const displayActiveElections = (elections) => {
        activeElectionsContainer.innerHTML = ''; // Clear existing elections
        if (elections.length === 0) {
            activeElectionsContainer.innerHTML = '<p>No active elections found.</p>';
            return;
        }

        elections.forEach((election) => {
            const electionDiv = document.createElement('div');
            electionDiv.className = 'election';
            electionDiv.innerHTML = `
                <h3>${election.title}</h3>
                <p>${election.description}</p>
                <p><strong>Start Date:</strong> ${election.start_date}</p>
                <p><strong>End Date:</strong> ${election.end_date}</p>
                <button class="btn view-results-btn" data-id="${election.id}">View Results</button>
                <button class="btn manage-voters-btn" data-id="${election.id}">Manage Voters</button>
                <button class="btn delete-btn" data-id="${election.id}">Delete Election</button>
            `;
            activeElectionsContainer.appendChild(electionDiv);

            // Add event listeners for the buttons
            const viewResultsBtn = electionDiv.querySelector('.view-results-btn');
            const manageVotersBtn = electionDiv.querySelector('.manage-voters-btn');
            const deleteBtn = electionDiv.querySelector('.delete-btn');

            viewResultsBtn.addEventListener('click', () => {
                viewResults(election.id);
            });

            manageVotersBtn.addEventListener('click', () => {
                manageVoters(election.id);
            });

            deleteBtn.addEventListener('click', () => {
                deleteElection(election.id);
            });
        });
    };

    // Handle "View Results" button click
    const viewResults = (electionId) => {
        alert(`Viewing results for election ID: ${electionId}`);
        // Redirect or fetch results logic can go here
        window.location.href = `view_results.html?electionId=${electionId}`;
    };

    // Handle "Manage Voters" button click
    const manageVoters = (electionId) => {
        alert(`Managing voters for election ID: ${electionId}`);
        // Redirect or manage voters logic can go here
        window.location.href = `manage_voters.html?electionId=${electionId}`;
    };

    // Handle "Delete Election" button click
    const deleteElection = async (electionId) => {
        const confirmDelete = confirm('Are you sure you want to delete this election? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/api/elections/${electionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Election deleted successfully.');
                fetchActiveElections(); // Refresh the list of elections
            } else {
                const error = await response.json();
                console.error('Error deleting election:', error);
                alert(`Error: ${error.error || 'Failed to delete election.'}`);
            }
        } catch (error) {
            console.error('Error deleting election:', error);
            alert('An error occurred. Please try again.');
        }
    };

    // Handle "Create New Election" button click
    createElectionBtn.addEventListener('click', () => {
        window.location.href = 'new_election.html'; // Redirect to the "Create New Election" page
    });

    // Fetch active elections on page load
    fetchActiveElections();
});