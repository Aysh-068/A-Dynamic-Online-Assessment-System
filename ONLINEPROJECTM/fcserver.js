const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1212',
    database: 'comprehensive'
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Serve fcourse.html when root path is accessed
// Serve fcourse.html for both '/' and '/fcourse.html'
app.get(['/','/fcourse.html'], (req, res) => {
    res.sendFile(__dirname + '/fcourse.html');
});


// Serve course_create.html when '/course_create.html' path is accessed
app.get('/course_create.html', (req, res) => {
    res.sendFile(__dirname + '/course_create.html');
});

app.get(['/','/Fhome.html','/fcourse.html'], (req, res) => {
    res.sendFile(__dirname + '/Fhome.html');
});

// Handle course creation form submission
app.post('/course_create', (req, res) => {
    const { FacultyName, CourseName, Department } = req.body;

    const sql = 'INSERT INTO course_create (facultyname, coursename, department) VALUES (?, ?, ?)';
    connection.query(sql, [FacultyName, CourseName, Department], (err, result) => {
        if (err) {
            console.error('Error creating course:', err);
            res.status(500).send('An error occurred while creating the course');
            return;
        }
        // Redirect to fcourse.html after successful course creation
        res.redirect('/fcourse.html');
    });
});

// Handle GET request to fetch courses
app.get('/courses', (req, res) => {
    const sql = 'SELECT * FROM course_create'; // Modify this query as per your database schema
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err);
            res.status(500).send('An error occurred while fetching courses');
            return;
        }
        // Send the courses as JSON response
        res.json(results);
    });
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
