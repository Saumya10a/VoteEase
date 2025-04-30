// filepath: [results.js](http://_vscodecontentref_/0)
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const electionId = urlParams.get('electionId');

  if (!electionId) {
      alert('Invalid election ID.');
      return;
  }

  try {
      const response = await fetch(`http://localhost:3000/api/elections/${electionId}/results`);
      if (!response.ok) {
          const error = await response.json();
          console.error('Failed to fetch election results:', error);
          alert(error.error || 'Failed to fetch election results.');
          return;
      }

      const results = await response.json();
      console.log('Election Results:', results); // Debugging

      // Update the results overview
      document.getElementById('turnoutPercentage').textContent = `${results.turnoutPercentage}%`;
      document.getElementById('winnerName').textContent = results.winner;

      // Render the vote distribution chart
      const ctx = document.getElementById('voteChart').getContext('2d');
      new Chart(ctx, {
          type: 'pie',
          data: {
              labels: results.voteDistribution.map((row) => row.candidate_name),
              datasets: [{
                  data: results.voteDistribution.map((row) => row.vote_count),
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
              }],
          },
      });
  } catch (error) {
      console.error('Error fetching election results:', error);
      alert('An error occurred while fetching election results.');
  }
});