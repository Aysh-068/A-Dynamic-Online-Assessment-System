const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());


// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: 'localhost',          // Change this to your MySQL host
    user: 'root',      // Change this to your MySQL username
    password: 'root123',  // Change this to your MySQL password
    database: 'onlineexam'   // Change this to your MySQL database name
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

/*// Execute an INSERT query
connection.query('INSERT INTO admin VALUES(?,?,?)', [2, 'ali','ali123'], (err, results) => {
    if (err) {
        console.error('Error executing query: ' + err.stack);
        return;
    }
    console.log('Inserted ' + results.affectedRows + ' row(s)');
});

connection.end();*/
const pool = mysql.createPool(connection);

// Route to handle admin sign up
app.post('/admin/signup', (req, res) => {
    const { adminName, adminPassword } = req.body;

    // Validate request body
    if (!adminName || !adminPassword) {
        return res.status(400).json({ error: 'Admin name and password are required' });
    }

    // Query to insert admin data into the database
    const query = 'INSERT INTO admin (admin_name, admin_password) VALUES (?, ?)';
    pool.query(query, [adminName, adminPassword], (error, results) => {
        if (error) {
            console.error('Error inserting admin data:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }

        console.log('Admin account created successfully:', results.insertId);
        return res.status(201).json({ message: 'Admin account created successfully' });
    });
});

// Handle undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Handle errors
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

