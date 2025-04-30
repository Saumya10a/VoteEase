const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Saumya/1013', // Replace with your MySQL password
    database: 'voteease', // Use your existing schema name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database.');
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

// Voter registration endpoint
app.post('/api/voters/register', (req, res) => {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = 'INSERT INTO voters (fullName, email, phone, password) VALUES (?, ?, ?, ?)';
    db.query(query, [fullName, email, phone, password], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to register voter.' });
        }
        res.status(201).json({ message: 'Voter registered successfully.' });
    });
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

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const voter = results[0];
        res.status(200).json({ message: 'Login successful.', fullName: voter.fullName });
    });
});

// Add admin endpoint
app.post('/api/admin/add', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const query = 'INSERT INTO admin (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, result) => {
        if (err) {
            console.error('Error inserting admin data:', err);
            return res.status(500).json({ error: 'Failed to add admin.' });
        }
        res.status(201).json({ message: 'Admin added successfully.' });
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

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const admin = results[0];
        res.status(200).json({ message: 'Admin login successful.', username: admin.username });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});