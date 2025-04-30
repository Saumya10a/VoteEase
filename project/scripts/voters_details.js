// Array to hold voter data
let voters = [];

// References to DOM elements
const addVoterBtn = document.getElementById("addVoterBtn");
const filterBtn = document.getElementById("filterBtn");
const searchInput = document.getElementById("searchInput");
const submitVoterBtn = document.getElementById("submitVoter");
const closeModalBtn = document.getElementById("closeModal");
const voterForm = document.getElementById("voterForm");
const voterList = document.getElementById("voterList");
const addEditVoterModal = document.getElementById("addEditVoterModal");
const modalTitle = document.getElementById("modalTitle");

// Show Add Voter Modal
addVoterBtn.addEventListener("click", () => {
  addEditVoterModal.style.display = "flex";
  modalTitle.textContent = "Add Voter";
  voterForm.reset();
  submitVoterBtn.textContent = "Add Voter";
});

// Close Modal
closeModalBtn.addEventListener("click", () => {
  addEditVoterModal.style.display = "none";
});

// Handle Voter Form Submission
submitVoterBtn.addEventListener("click", (e) => {
  e.preventDefault();
  
  const voterId = document.getElementById("voterId").value;
  const voterName = document.getElementById("voterName").value;
  const voterAge = document.getElementById("voterAge").value;
  const voterRegion = document.getElementById("voterRegion").value;
  const voterStatus = document.getElementById("voterStatus").value;

  if (voterId && voterName && voterAge && voterRegion && voterStatus) {
    const newVoter = { voterId, voterName, voterAge, voterRegion, voterStatus };
    voters.push(newVoter);
    addEditVoterModal.style.display = "none";
    renderVoterList();
  }
});

// Render Voter List
function renderVoterList() {
  voterList.innerHTML = "";
  voters.forEach((voter) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${voter.voterId}</td>
      <td>${voter.voterName}</td>
      <td>${voter.voterAge}</td>
      <td>${voter.voterRegion}</td>
      <td>${voter.voterStatus}</td>
      <td><button onclick="deleteVoter('${voter.voterId}')">Delete</button></td>
    `;

    voterList.appendChild(tr);
  });
}

// Delete Voter
function deleteVoter(voterId) {
  voters = voters.filter((voter) => voter.voterId !== voterId);
  renderVoterList();
}

// Filter Voters by Name
filterBtn.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase();
  const filteredVoters = voters.filter((voter) => 
    voter.voterName.toLowerCase().includes(query) || voter.voterId.includes(query)
  );
  renderFilteredVoterList(filteredVoters);
});

// Render Filtered Voter List
function renderFilteredVoterList(filteredVoters) {
  voterList.innerHTML = "";
  filteredVoters.forEach((voter) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${voter.voterId}</td>
      <td>${voter.voterName}</td>
      <td>${voter.voterAge}</td>
      <td>${voter.voterRegion}</td>
      <td>${voter.voterStatus}</td>
      <td><button onclick="deleteVoter('${voter.voterId}')">Delete</button></td>
    `;

    voterList.appendChild(tr);
  });
}
