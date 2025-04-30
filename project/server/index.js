const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'your-username',        // Replace with your MySQL username
    password: 'your-password',    // Replace with your MySQL password
    database: 'your-database'     // Replace with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');

    // Enable auto-commit
    db.query('SET autocommit = 1', (err) => {
        if (err) {
            console.error('Error enabling auto-commit:', err);
        } else {
            console.log('Auto-commit enabled.');
        }
    });
});

// Create voters table if it doesn't exist
const createVotersTable = `
    CREATE TABLE IF NOT EXISTS voters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(15) NOT NULL,
        password VARCHAR(255) NOT NULL
    );
`;

db.query(createVotersTable, (err, result) => {
    if (err) {
        console.error('Failed to create voters table:', err);
        return;
    }
    console.log('Voters table is ready.');
});

// Create admin table if it doesn't exist
const createAdminTable = `
    CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
`;

db.query(createAdminTable, (err, result) => {
    if (err) {
        console.error('Failed to create admin table:', err);
        return;
    }
    console.log('Admin table is ready.');
});

// Create elections table if it doesn't exist
const createElectionsTable = `
    CREATE TABLE IF NOT EXISTS elections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        candidates JSON NOT NULL
    );
`;

db.query(createElectionsTable, (err, result) => {
    if (err) {
        console.error('Failed to create elections table:', err);
        return;
    }
    console.log('Elections table is ready.');
});

// Create votes table if it doesn't exist
const createVotesTable = `
    CREATE TABLE IF NOT EXISTS votes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        voter_id INT NOT NULL,
        election_id INT NOT NULL,
        candidate_name VARCHAR(255) NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote (voter_id, election_id)
    );
`;

db.query(createVotesTable, (err, result) => {
    if (err) {
        console.error('Failed to create votes table:', err);
        return;
    }
    console.log('Votes table is ready.');
});

// Voter registration endpoint
const bcrypt = require('bcrypt');

app.post('/api/voters/register', (req, res) => {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
        console.error('Validation Error: Missing required fields.');
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Check if email already exists
        const emailCheckQuery = 'SELECT email FROM voters WHERE email = ?';
        db.query(emailCheckQuery, [email], (err, results) => {
            if (err) {
                console.error('Database Error during email check:', err);
                return res.status(500).json({ error: 'Database error.' });
            }

            if (results.length > 0) {
                console.error('Validation Error: Email already registered.');
                return res.status(409).json({ error: 'Email already registered.' });
            }

            // Insert new voter without hashing the password
            const query = 'INSERT INTO voters (fullName, email, phone, password) VALUES (?, ?, ?, ?)';
            db.query(query, [fullName, email, phone, password], (err, result) => {
                if (err) {
                    console.error('Database Error during voter registration:', err);
                    return res.status(500).json({ error: 'Failed to register voter.' });
                }

                console.log('Voter registered successfully:', result); // Debugging
                res.status(201).json({ message: 'Voter registered successfully.' });
            });
        });
    } catch (error) {
        console.error('Error processing registration:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// Voter login endpoint
app.post('/api/voters/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = 'SELECT * FROM voters WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Failed to authenticate voter.' });
        }

        if (results.length > 0) {
            res.status(200).json({ message: 'Login successful.', fullName: results[0].fullName });
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }
    });
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = 'SELECT * FROM admin WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error fetching admin data:', err);
            return res.status(500).json({ error: 'Failed to authenticate admin.' });
        }

        if (results.length > 0) {
            res.status(200).json({ message: 'Admin login successful.', username: results[0].username });
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }
    });
});

// Create a new election
app.post('/api/elections', (req, res) => {
    const { title, description, start_date, end_date, candidates } = req.body;

    if (!title || !description || !start_date || !end_date || !candidates) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Generate a clean table name
    let tableName = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().replace(/^_+|_+$/g, '');
    console.log('Generated Table Name:', tableName); // Debugging

    // Ensure table name is not empty after sanitization
    if (!tableName) {
        return res.status(400).json({ error: 'Invalid election title. Please use a valid name.' });
    }

    // Insert election into main elections table
    const query = 'INSERT INTO elections (title, description, start_date, end_date, candidates) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description, start_date, end_date, JSON.stringify(candidates)], (err, result) => {
        if (err) {
            console.error('Error creating election:', err);
            return res.status(500).json({ error: 'Failed to create election.' });
        }

        // Create the election-specific table
        const createElectionTable = `
            CREATE TABLE IF NOT EXISTS \`${tableName}\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                voter_id INT NOT NULL,
                candidate_name VARCHAR(255) NOT NULL,
                voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        console.log('Executing table creation query:', createElectionTable); // Debugging

        db.query(createElectionTable, (err, result) => {
            if (err) {
                console.error('Error creating election-specific table:', err);
                return res.status(500).json({ error: `Failed to create election table: ${err.sqlMessage}` });
            }

            console.log(`Table '${tableName}' created successfully!`); // Debugging
            res.status(201).json({ message: 'Election created successfully.', tableName });
        });
    });
});


// Submit a vote
app.post('/api/elections/:id/vote', (req, res) => {
    const electionId = req.params.id;
    const { email, candidateName } = req.body;

    console.log('Request Body:', req.body); // Debugging
    console.log('Election ID:', electionId); // Debugging

    if (!email || !candidateName) {
        console.error('Validation Error: Missing email or candidate name.');
        return res.status(400).json({ error: 'Email and candidate name are required.' });
    }

    // Fetch voter details
    const voterQuery = 'SELECT id, fullName FROM voters WHERE email = ?';
    db.query(voterQuery, [email], (err, voterResults) => {
        if (err) {
            console.error('Database Error during voter lookup:', err);
            return res.status(500).json({ error: 'Failed to fetch voter details.' });
        }

        if (voterResults.length === 0) {
            console.error('Validation Error: Voter not found.');
            return res.status(404).json({ error: 'Voter not found.' });
        }

        const voterId = voterResults[0].id;
        const voterName = voterResults[0].fullName;
        console.log('Voter Details:', { voterId, voterName }); // Debugging

        // Fetch election details to get the table name
        const electionQuery = 'SELECT title FROM elections WHERE id = ?';
        db.query(electionQuery, [electionId], (err, electionResults) => {
            if (err) {
                console.error('Database Error during election lookup:', err);
                return res.status(500).json({ error: 'Failed to fetch election details.' });
            }

            if (electionResults.length === 0) {
                console.error('Validation Error: Election not found.');
                return res.status(404).json({ error: 'Election not found.' });
            }

            const tableName = electionResults[0].title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
            console.log('Generated Table Name:', tableName); // Debugging

            // Check if the voter has already voted
            const checkVoteQuery = `SELECT * FROM \`${tableName}\` WHERE voter_id = ?`;
            db.query(checkVoteQuery, [voterId], (err, voteResults) => {
                if (err) {
                    console.error('Database Error during vote check:', err);
                    return res.status(500).json({ error: 'Failed to check vote.' });
                }

                if (voteResults.length > 0) {
                    console.error('Validation Error: Voter has already voted.');
                    return res.status(400).json({ error: 'You have already voted in this election.' });
                }

                // Insert the vote
                const insertVoteQuery = `INSERT INTO \`${tableName}\` (voter_id, voter_name, candidate_name) VALUES (?, ?, ?)`;
                db.query(insertVoteQuery, [voterId, voterName, candidateName], (err) => {
                    if (err) {
                        console.error('Database Error during vote submission:', err);
                        return res.status(500).json({ error: 'Failed to submit vote.' });
                    }

                    console.log('Vote submitted successfully for voterId:', voterId); // Debugging
                    res.status(201).json({ message: 'Vote submitted successfully.' });
                });
            });
        });
    });
});

// Fetch all elections for the admin dashboard
app.get('/api/admin/elections', (req, res) => {
    const query = `
        SELECT id, title, description, start_date, end_date, candidates
        FROM elections
        ORDER BY start_date DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database Error while fetching elections:', err);
            return res.status(500).json({ error: 'Failed to fetch elections.' });
        }

        console.log('Elections fetched successfully:', results); // Debugging
        res.status(200).json(results);
    });
});

// Fetch active elections for voters
app.get('/api/voters/elections', (req, res) => {
    const query = `
        SELECT id, title, description, start_date, end_date 
        FROM elections 
        WHERE start_date <= CURDATE() AND end_date >= CURDATE()
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching active elections for voters:', err);
            return res.status(500).json({ error: 'Failed to fetch active elections.' });
        }
        res.status(200).json(results);
    });
});

// Fetch candidates for a specific election
app.get('/api/elections/:id/candidates', (req, res) => {
    const electionId = req.params.id;

    const query = 'SELECT candidates FROM elections WHERE id = ?';
    db.query(query, [electionId], (err, results) => {
        if (err) {
            console.error('Error fetching candidates:', err);
            return res.status(500).json({ error: 'Failed to fetch candidates.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Election not found.' });
        }

        const candidates = JSON.parse(results[0].candidates);
        res.status(200).json(candidates);
    });
});

// Fetch election details
app.get('/api/elections/:id', (req, res) => {
    const electionId = req.params.id;

    const query = 'SELECT id, title, description, start_date, end_date FROM elections WHERE id = ?';
    db.query(query, [electionId], (err, results) => {
        if (err) {
            console.error('Error fetching election details:', err);
            return res.status(500).json({ error: 'Failed to fetch election details.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Election not found.' });
        }

        res.status(200).json(results[0]);
    });
});

// Fetch election results
app.get('/api/elections/:id/results', (req, res) => {
    const electionId = req.params.id;

    // Fetch election details to get the table name
    const electionQuery = 'SELECT title FROM elections WHERE id = ?';
    db.query(electionQuery, [electionId], (err, electionResults) => {
        if (err) {
            console.error('Database Error during election lookup:', err);
            return res.status(500).json({ error: 'Failed to fetch election details.' });
        }

        if (electionResults.length === 0) {
            console.error('Validation Error: Election not found.');
            return res.status(404).json({ error: 'Election not found.' });
        }

        const tableName = electionResults[0].title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        console.log('Generated Table Name:', tableName); // Debugging

        // Fetch vote data from the election-specific table
        const voteQuery = `
            SELECT candidate_name, COUNT(*) AS vote_count
            FROM \`${tableName}\`
            GROUP BY candidate_name
            ORDER BY vote_count DESC
        `;
        db.query(voteQuery, (err, voteResults) => {
            if (err) {
                console.error('Database Error during vote data fetch:', err);
                return res.status(500).json({ error: 'Failed to fetch vote data.' });
            }

            // Calculate total votes and determine the winner
            const totalVotes = voteResults.reduce((sum, row) => sum + row.vote_count, 0);
            const winner = voteResults.length > 0 ? voteResults[0].candidate_name : 'No votes cast';

            // Fetch total registered voters for turnout calculation
            const voterCountQuery = 'SELECT COUNT(*) AS total_voters FROM voters';
            db.query(voterCountQuery, (err, voterCountResults) => {
                if (err) {
                    console.error('Database Error during voter count fetch:', err);
                    return res.status(500).json({ error: 'Failed to fetch voter count.' });
                }

                const totalVoters = voterCountResults[0].total_voters;
                const turnoutPercentage = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : '0.00';

                // Send the results back to the frontend
                res.status(200).json({
                    totalVotes,
                    turnoutPercentage,
                    winner,
                    voteDistribution: voteResults,
                });
            });
        });
    });
});

// Fetch voter data for a specific election
app.get('/api/elections/:id/voters', (req, res) => {
    const electionId = req.params.id;

    // Fetch election details to get the table name
    const electionQuery = 'SELECT title FROM elections WHERE id = ?';
    db.query(electionQuery, [electionId], (err, electionResults) => {
        if (err) {
            console.error('Database Error during election lookup:', err);
            return res.status(500).json({ error: 'Failed to fetch election details.' });
        }

        if (electionResults.length === 0) {
            console.error('Validation Error: Election not found.');
            return res.status(404).json({ error: 'Election not found.' });
        }

        const tableName = electionResults[0].title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        console.log('Generated Table Name:', tableName); // Debugging

        // Fetch voter data from the election-specific table
        const voterQuery = `
            SELECT voter_name, candidate_name, voted_at
            FROM \`${tableName}\`
            ORDER BY voted_at DESC
        `;
        db.query(voterQuery, (err, voterResults) => {
            if (err) {
                console.error('Database Error during voter data fetch:', err);
                return res.status(500).json({ error: 'Failed to fetch voter data.' });
            }

            res.status(200).json(voterResults);
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
