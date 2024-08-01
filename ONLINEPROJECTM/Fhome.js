const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const app = express();

// Middleware for parsing JSON and URL encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '/')));

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1212',
    database: 'comprehensive'
});

// Route for serving Fhome.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Fhome.html'));
});

// Route for logging out
app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'Flogin.html'));
});

// Route for adding a new question
app.get('/addQuestion', (req, res) => {
    res.sendFile(path.join(__dirname, 'add_qstn.html'));
});

// Route for viewing all questions
app.get('/', (req, res) => {
    // Use path module to get the absolute path of the HTML file
    const htmlPath = path.join(__dirname, 'all_qstn.html');
    
    // Send the HTML file as response
    res.sendFile(htmlPath);
  });
  
  // Route to fetch data from the database
  app.get('/qstn_banks', (req, res) => {
    // Fetch data from the database
    pool.query('SELECT qstn_id, qstn, op1, op2, op3, op4 FROM qstn_bank', (error, results, fields) => {
      if (error) {
        console.error('Error retrieving data from qstn_bank table:', error);
        res.status(500).send('Error retrieving data from qstn_bank table');
        return;
      }
      // Send the fetched data as JSON response
      res.json(results);
    });
  });
  
  

// Route for exiting the application
app.get('/exit', (req, res) => {
    res.send('Exiting application...');
    // Optionally, you can close the server here if needed
    // server.close();
});

// Start the server
const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
