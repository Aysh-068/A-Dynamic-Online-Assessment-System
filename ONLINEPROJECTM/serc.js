const http = require('http');
const url = require('url');
const XLSX = require('xlsx');

const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session'); // For session management
const MySQLStore = require('express-mysql-session')(session); // For session storage in MySQL

const app = express();
const port = 8080;

const pool = require('./db');

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Create a connection to the MySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'aysh',
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

// Set up session management
const sessionStore = new MySQLStore({}, connection);

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 1800000 } // Session timeout of 30 minutes
}));


// Route for the facexam page
app.get('/facexam.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'facexm.html'));
});


// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front.html'));
});

// Handle login form submission
// Faculty Login Route
// Faculty Login Route
app.post('/alogin', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM faculty WHERE femail = ? AND fpass = ?';
  pool.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.status(500).send('Internal server error');
      return;
    }
    if (results.length > 0) {
      const facultyId = results[0].faculty_id;
      req.session.facultyId = facultyId; // Store faculty ID in session
      console.log(`Login successful for facultyId: ${facultyId}`);
      res.redirect(`/fcourse.html?facultyId=${facultyId}`);
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

// General Login Route
app.post('/alogin', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT faculty_id FROM faculty WHERE username = ? AND password = ?';
  pool.query(query, [username, password], (error, results) => {
    if (error) {
      console.error('Error during login:', error);
      res.status(500).send('Error during login');
      return;
    }

    if (results.length > 0) {
      req.session.facultyId = results[0].faculty_id;
      console.log(`Login successful for facultyId: ${results[0].faculty_id}`);
      res.redirect('/dashboard');
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});



// Middleware to require login
function requireLogin(req, res, next) {
  if (!req.session.facultyId) {
    res.status(401).send('You must be logged in to view this page.');
  } else {
    next();
  }
}

// Serve protected routes
app.get('/fcourse.html', requireLogin, (req, res) => {
     const facultyId = req.query.facultyId;
  res.sendFile(path.join(__dirname, 'fcourse.html'));
});

app.get('/course_create.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'course_create.html'));
});

app.get('/submit-user-answers', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'exam.html'));
});

// Handle course creation form submission
app.post('/course_create', requireLogin, (req, res) => {
  const { FacultyName, CourseName, Department, FacultyId, CourseId, Semester } = req.body;

  const sql = 'INSERT INTO course_create (facultyname, coursename, department, faculty_id, course_id, sem) VALUES (?, ?, ?, ?, ?, ?)';
  pool.query(sql, [FacultyName, CourseName, Department, FacultyId, CourseId, Semester], (err, result) => {
      if (err) {
          console.error('Error creating course:', err);
          res.status(500).send('An error occurred while creating the course');
          return;
      }
      // Redirect back to the fcourse.html page after successful course creation
      res.redirect(`/fcourse.html?facultyId=${FacultyId}`);
  });
});

// Handle GET request to fetch courses for a specific faculty
app.get('/courses', requireLogin, (req, res) => {
  const facultyId = req.query.facultyId;
  const sql = 'SELECT * FROM course_create WHERE faculty_id = ?';
  pool.query(sql, [facultyId], (err, results) => {
      if (err) {
          console.error('Error fetching courses:', err);
          res.status(500).send('An error occurred while fetching courses');
          return;
      }
      res.json(results);
  });
});

// Delete course route
app.post('/delete_course', requireLogin, (req, res) => {
  const { course_id } = req.body;
  const sql = 'SELECT faculty_id FROM course_create WHERE course_id = ?';

  pool.query(sql, [course_id], (err, result) => {
    if (err) {
      res.status(500).send('Error retrieving course information');
      return;
    }

    if (result.length === 0) {
      res.status(404).send('Course not found');
      return;
    }

    const facultyId = result[0].faculty_id;
    const deleteSql = 'DELETE FROM course_create WHERE course_id = ?';

    pool.query(deleteSql, [course_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        res.status(500).send('Error deleting course');
      } else {
        res.redirect(`/fcourse.html?facultyId=${facultyId}`);
      }
    });
  });
});


// Function to process Excel file and store data into the database
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Fhome.html'));
});

// Route for logging out
app.get('/logout', (req, res) => {
  res.sendFile(path.join(__dirname, 'Flogin.html'));
});

// Route for adding a new question
// Serve the HTML file for file upload
app.get('/', (req, res) => {
  fs.readFile(__dirname + '/add_qstn.html', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Error reading HTML file');
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    }
  });
});

function processExcelFile(filePath, facultyId) {
  return new Promise((resolve, reject) => {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      const values = sheetData.map(rowData => [
        rowData.qstn_id, // Use the qstn_id from Excel data
        rowData.qstn,
        rowData.op1,
        rowData.op2,
        rowData.op3,
        rowData.op4,
        rowData.crct_ans,
        rowData.course_id,
        facultyId
      ]);

      const insertQuery = 'INSERT INTO qstn_bank (qstn_id, qstn, op1, op2, op3, op4, crct_ans, course_id, faculty_id) VALUES ?';
      connection.query(insertQuery, [values], (error, results) => {
        connection.release();
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });
}


// Define a route to handle file uploads
app.post('/uploads', upload.array('files', 50), requireLogin, (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }

  const facultyId = req.session.facultyId;

  const promises = files.map(file => {
    return processExcelFile(file.path, facultyId);
  });

  Promise.all(promises)
    .then(results => {
      console.log('All files processed successfully:', results);
      res.sendStatus(200);
    })
    .catch(error => {
      console.error('Error processing files:', error)
      ;
      res.status(500).send('Error processing files');
    });
});
app.get('/qstn_banks', requireLogin, (req, res) => {
  const facultyId = req.session.facultyId;

  const sql = `
    SELECT qstn_id, qstn, op1, op2, op3, op4 
    FROM qstn_bank 
    WHERE faculty_id = ?;
  `;

  pool.query(sql, [facultyId], (error, results) => {
    if (error) {
      console.error('Error retrieving data from qstn_bank table:', error);
      res.status(500).send('Error retrieving data from qstn_bank table');
      return;
    }
    res.json(results);
  });
});

app.post('/deleteQuestion', (req, res) => {
  const { questionId, facultyId } = req.body;

  // Check if facultyId and questionId are provided and valid
  if (!questionId || !facultyId) {
    console.log('Missing questionId or facultyId');
    res.status(400).json({ error: 'Both questionId and facultyId are required' });
    return;
  }

  if (isNaN(questionId) || isNaN(facultyId)) {
    console.log('Invalid questionId or facultyId:', questionId, facultyId);
    res.status(400).json({ error: 'Invalid questionId or facultyId' });
    return;
  }

  console.log('Deleting question with ID:', questionId, 'and facultyId:', facultyId);

  // Ensure facultyId is treated as an integer
  const deleteSql = 'DELETE FROM qstn_bank WHERE qstn_id = ? AND faculty_id = ?';
  connection.query(deleteSql, [parseInt(questionId), parseInt(facultyId)], (err, deleteResult) => {
    if (err) {
      console.error('Error deleting question:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    console.log('Delete result:', deleteResult);

    // Check if any rows were deleted
    if (deleteResult.affectedRows === 0) {
      res.status(404).json({ error: 'No matching question found for deletion' });
      return;
    }

    // Fetch all remaining questions for the specific faculty after deletion
    const selectAllByFacultySql = 'SELECT * FROM qstn_bank WHERE faculty_id = ? ORDER BY qstn_id';
    connection.query(selectAllByFacultySql, [facultyId], (err, allQuestions) => {
      if (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      console.log('Fetched all remaining questions:', allQuestions);

      // Reorder the questions and update their IDs
      const reorderPromises = allQuestions.map((question, index) => {
        return new Promise((resolve, reject) => {
          const updateSql = 'UPDATE qstn_bank SET qstn_id = ? WHERE qstn_id = ? AND faculty_id = ?';
          connection.query(updateSql, [index + 1, question.qstn_id, facultyId], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      });

      // Handle the reordering process
      Promise.all(reorderPromises)
        .then((results) => {
          res.status(200).json({ message: 'Question deleted and reordered successfully' });
        })
        .catch((err) => {
          console.error('Error reordering questions:', err);
          res.status(500).json({ error: 'Internal Server Error during reordering' });
        });
    });
  });
});




  

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out.');
    } else {
      return res.redirect('/');
    }
  });
});




// Serve static files from the current directory
app.use(express.static(__dirname));
//admin and student 

// Define route for the root path
app.get('submit-user-answers', (req, res) => {
  res.sendFile(__dirname + '/exam.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/adsignup.html');
});

app.get('/alogin', (req, res) => {
  res.sendFile(__dirname + '/adminlogin.html');
});


app.get('/stulogin', (req, res) => {
  res.sendFile(__dirname + '/stulogin.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/flogin.html');
});

app.get('/searchfac', (req, res) => {
  res.sendFile(__dirname + '/searchfac.html');
});

app.get('/dltfac', (req, res) => {
  res.sendFile(__dirname + '/dltfac.html');
});

app.get('/dltstu', (req, res) => {
  res.sendFile(__dirname + '/dltstu.html');
});

app.get('/facresult.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'facresult.html'));
});



app.get('/check-student-id', (req, res) => {
  res.sendFile(__dirname + '/examfront.html');
});
app.get('/api/get-courses-not-published', (req, res) => {
  res.sendFile(__dirname + '/results.html');
});

app.get('/api/publish-result/:courseId', (req, res) => {
  res.sendFile(__dirname + '/results.html');
});

app.get('/api/check-exam-taken', (req, res) => {
  res.sendFile(__dirname + '/exam.html');
});

app.get('/api/view-result', (req, res) => {
  res.sendFile(__dirname + '/resultview.html');
});


// API endpoint to fetch questions
// API endpoint to fetch questions
app.get('/api/questions', (req, res) => {
  const { questionNumbers, facultyid } = req.query;

  // Parse the question numbers range and convert it into an array
  let questionIds = [];
  let range = questionNumbers.split('-');
  if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
    let start = parseInt(range[0]);
    let end = parseInt(range[1]);
    for (let i = start; i <= end; i++) {
      questionIds.push(i);
    }
  } else {
    res.status(400).json({ error: 'Invalid question numbers range format' });
    return;
  }

  // Check if the faculty ID exists in the faculty table
  const facultyCheckSql = 'SELECT * FROM faculty WHERE faculty_id = ?';
  connection.query(facultyCheckSql, [facultyid], (err, facultyResults) => {
    if (err) {
      console.error('Error checking faculty ID:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (facultyResults.length === 0) {
      res.status(404).json({ error: 'Invalid faculty ID' });
      return;
    }

    // Check if questions exist for the specified faculty and question numbers
    const questionCheckSql = 'SELECT * FROM qstn_bank WHERE qstn_id IN (?) AND faculty_id = ?';
    connection.query(questionCheckSql, [questionIds, facultyid], (err, results) => {
      if (err) {
        console.error('Error checking questions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ error: 'No questions found for the specified criteria' });
        return;
      }

      // If questions exist, return them
      res.json(results);
    });
  });
});







// Handle
app.post('/signup', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check passwords match
  if (password !== confirmPassword) {
    res.send('Passwords do not match');
    return;
  }

  const sql = 'INSERT INTO admin (name, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [name, email, password], (err, result) => {
    if (err) throw err;
    res.send('User registered successfully');
  });
});

// Handle
app.post('/facsignup', (req, res) => {
  const { name, department, username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).send('Passwords do not match');
    return;
  }

  const sql = 'INSERT INTO faculty (facname, fdept, fuser, femail, fpass) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [name, department, username, email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect('/flogin.html');
  });
});

// Handle
app.post('/stusignup', (req, res) => {
  const { std_id, name, username, password, confirmPassword, stdept, stemail, stclass } = req.body;

  console.log("Received data:", req.body); // Log received data for debugging

  // Check passwords match
  if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match');
  }

  // Prepare SQL query
  const sql = 'INSERT INTO student (std_id, stname, username, password, stdept, stemail, stclass) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  // Execute the query
  connection.query(sql, [std_id, name, username, password, stdept, stemail, stclass], (err, result) => {
      if (err) {
          console.error('Error inserting into student:', err);
          return res.status(500).send('Internal Server Error');
      }
      // Redirect on successful insert
      res.redirect('/stulogin.html');
  });
});



// Route for serving the admin login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/adminlogin.html');
});
// Route for handling admin login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Received email:', email);
  console.log('Received password:', password);

  const sql = 'SELECT * FROM admin WHERE email = ? AND password = ?';
  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log('Database results:', results);

    if (results.length > 0) {
      res.redirect('adfun.html');
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

app.post('/stulogin', (req, res) => {
  const { email, password } = req.body;

  console.log('Received email:', email);
  console.log('Received password:', password);

  const sql = 'SELECT * FROM student WHERE stemail = ? AND password = ?';
  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log('Database results:', results);

    if (results.length > 0) {
      res.redirect('stufunction.html');
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Received email:', email);
  console.log('Received password:', password);

  const sql = 'SELECT * FROM faculty WHERE femail = ? AND fpasswd = ?';
  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log('Database results:', results);

    if (results.length > 0) {
      res.redirect('fcourse.html');
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

app.post('/searchfac', (req, res) => {
  const { name } = req.body;

  const sql = 'SELECT * FROM faculty WHERE facname = ?';
  connection.query(sql, [name], (err, results) => {
    if (err) {
      console.error('Error fetching faculty details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Faculty not found' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/searchstu', (req, res) => {
  const { name } = req.body;

  const sql = 'SELECT * FROM student WHERE username = ?';
  connection.query(sql, [name], (err, results) => {
    if (err) {
      console.error('Error fetching student details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'student not found' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/dltfac', (req, res) => {
  const { facultyId } = req.body;

  // Delete faculty member by faculty ID
  const sql = 'DELETE FROM faculty WHERE faculty_id = ?';
  connection.query(sql, [facultyId], (err, results) => {
    if (err) {
      console.error('Error deleting faculty details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Faculty not found' });
    } else {
      res.send('Deleted successfully');
    }
  });
});



app.post('/dltstu', (req, res) => {
  const { studentId } = req.body;

  // Delete student by student ID
  const sql = 'DELETE FROM student WHERE std_id = ?';
  connection.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error deleting student details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.send('Deleted successfully');
    }
  });
});

app.post('/searchfacbydept', (req, res) => {
  const { dept } = req.body;

  const sql = 'SELECT * FROM faculty WHERE fdept = ?';
  connection.query(sql, [dept], (err, results) => {
    if (err) {
      console.error('Error fetching faculty details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Faculty not found' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.post('/searchstubyclass', (req, res) => {
  const { class: studentClass } = req.body;

  const sql = 'SELECT * FROM student WHERE stclass = ?';
  connection.query(sql, [studentClass], (err, results) => {
    if (err) {
      console.error('Error fetching student details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/api/displayfaculties', (req, res) => {
  const sql = 'SELECT * FROM faculty';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/api/displaystudents', (req, res) => {
  const sql = 'SELECT * FROM student';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});



app.post('/api/submit-exam', (req, res) => {
  // Process exam submission data here
  const examData = req.body;
  console.log('Exam submitted:', examData);

  // Send response
  res.send('Exam submitted successfully');
});

/*app.post('/api/results', (req, res) => {
  const results = req.body.results;

  // Iterate over results and insert into the database
  results.forEach((result) => {
    const { qstnId, answerChoosen, markScored } = result;
    const sql = 'INSERT INTO result VALUES (?, ?, ?)';
    connection.query(sql, [qstnid, answerChoosen, markScored], (err, result) => {
      if (err) {
        console.error('Error inserting result:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      console.log('Result inserted successfully');
    });
  });

  res.json({ message: 'Results stored successfully' });
});*/


app.get('/exam', async (req, res) => {
  const selectedQuestionIds = req.query.qstnIds; // Get question IDs from query string

  if (!selectedQuestionIds) {
    return res.status(400).send('Missing required parameter: qstnIds');
  }

  // Securely prevent SQL injection by using prepared statements
  const [questions] = await pool.query(
    `SELECT * FROM qstn_bank WHERE qstn_id IN (?) ORDER BY RAND()`,d
    [selectedQuestionIds.split(',').map(Number)]
  );

  if (!questions.length) {
    return res.status(404).send('No questions found for provided IDs');
  }

  const timer = req.query.timer; // Get timer value from query string

  let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Online Exam</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Online Exam</h1>
  <p>Time remaining: <span id="timer"></span></p>
  <form action="/submit" method="post">
    <input type="hidden" name="userId" value="`;

  htmlContent += req.query.userId; // Get user ID from query string

  htmlContent += `">`;

  for (const question of questions) {
    htmlContent += `<div class="question">
      <h3>${question.qstn}</h3>
      <ul>
        <li><input type="radio" name="answers[${question.qstn_id}]" value="${question.op1}">${question.op1}</li>
        <li><input type="radio" name="answers[${question.qstn_id}]" value="${question.op2}">${question.op2}</li>
        <li><input type="radio" name="answers[${question.qstn_id}]" value="${question.op3}">${question.op3}</li>
        <li><input type="radio" name="answers[${question.qstn_id}]" value="${question.op4}">${question.op4}</li>
      </ul>
    </div>`;
  }

  htmlContent += `
    <button type="submit">Submit Exam</button>
  </form>
  <script src="script.js"></script>
</body>
</html>`;

  res.send(htmlContent);
});

// API endpoint for submitting exam results
/*app.post('/api/submit-results', async (req, res) => {
  const userAnswers = req.body; // Array of objects containing qstn_id and selectedOption

  try {
    // Loop through user answers and insert data into the table
    for (const answer of userAnswers) {
      console.log('Inserting answer:', answer); // Print the answer object before insertion

      const query = `
        INSERT INTO result (qstnid, answerchoosen, markscored)
        VALUES (?, ?, ?)
      `;
      const [results] = await pool.execute(query, [
        answer.qstn_id,
        answer.selectedOption,
        0 // Placeholder for markscored (replace with your logic)
      ]);

      // Check if insertion was successful
      if (results.affectedRows !== 1) {
        throw new Error('Error inserting exam results');
      }

      console.log('Inserted answer:', answer); // Print the answer object after insertion
    }

    res.status(200).json({ message: 'Exam results submitted successfully!' });
  } catch (error) {
    console.error('Error submitting exam results:', error);
    res.status(500).json({ message: 'Error submitting exam results' });
  }
});*/
// POST endpoint to handle submitting user answers
app.post('/api/submit-user-answers', async (req, res) => {
  const { userAnswers, studentId, studentClass, facultyid, examname } = req.body;

  // Check if userAnswers is an array before proceeding
  if (!Array.isArray(userAnswers)) {
    return res.status(400).json({ error: 'Invalid user answers format' });
  }

  try {
    // Start transaction within the route handler
    await connection.beginTransaction();

    // Insert user answers into the database
    const insertQuery = 'INSERT INTO result (qstnid, answerchoosen, stid, class, faculty_id, examname) VALUES (?, ?, ?, ?, ?, ?)'; // Include examname in query
    for (const answer of userAnswers) {
      console.log('Inserting user answer:', answer);
      await connection.query(insertQuery, [answer.qstn_id, answer.selectedOption, studentId, studentClass, facultyid, examname]); // Include examname in values
    }
    // Commit the transaction on successful insertion
    await connection.commit();

    console.log('Transaction committed successfully');
    res.json({ message: 'User answers submitted successfully' });

  } catch (error) {
    console.error('Error submitting exam results:', error);
    await connection.rollback(); // Rollback on errors
    res.status(500).json({ error: 'Database insertion error' });
  }
});





app.post('/check-student-id', function(req, res) {
  const studentId = req.body.studentId;

  const sql = 'SELECT * FROM student WHERE std_id = ?'; // Using prepared statement

  connection.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (results.length > 0) {
      // Student ID exists, redirect to face verification page
      res.redirect('facexm.html');
    } else {
      res.status(401).send('Invalid student ID'); // 401 for unauthorized access
    }
  });
});
app.get('/api/unpublished-exams', (req, res) => {
  const query = `
      SELECT DISTINCT r.examname 
      FROM result r
      JOIN course_create c ON r.faculty_id = c.faculty_id
      WHERE c.result_status = 'not published'
  `;
  connection.query(query, (error, results) => {
      if (error) {
          console.error('Error executing query:', error.stack);
          res.status(500).send('Internal Server Error');
          return;
      }
      res.json(results);
  });
});

app.put('/api/publish-course/:examname', (req, res) => {
  const { examname } = req.params;
  const query = `
      UPDATE course_create c
      JOIN result r ON r.faculty_id = c.faculty_id
      SET c.result_status = 'published'
      WHERE r.examname = ? AND c.result_status = 'not published'
  `;
  
  connection.query(query, [examname], (error, results) => {
      if (error) {
          console.error('Error executing query:', error.stack);
          res.status(500).send({ success: false, error: 'Internal Server Error' });
          return;
      }
      res.json({ success: true });
  });
});


// Endpoint to check if the exam result exists for a student
app.get('/api/check-exam-result', (req, res) => {
  const { studentId, studentClass, examname } = req.query;

  // Ensure all required parameters are provided
  if (!studentId || !studentClass || !examname) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Query to check if the exam result exists for a student
    const sqlCheckStatus = `
      SELECT result_status 
      FROM course_create 
      WHERE sem = ? 
    `;

    connection.query(sqlCheckStatus, [studentClass, examname], (err, results) => {
      if (err) {
        console.error('Error checking result status:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0 || results[0].result_status !== 'published') {
        return res.json({ examTaken: false, message: 'Result not yet published for this exam.' });
      } else {
        // Query to fetch the exam results
        const sqlFetchResults = `
          SELECT * 
          FROM result 
          WHERE stid = ?  AND examname = ?
        `;

        connection.query(sqlFetchResults, [studentId,  examname], (err, results) => {
          if (err) {
            console.error('Error fetching exam result:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Check if the exam results exist for the student
          const examTaken = results.length > 0;
          res.json({ examTaken, results: results || [] });
        });
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Fetch results for a student and semester
app.get('/results', (req, res) => {
  const { studentId, semester } = req.query;

  // Check if the result_status is 'published' for the given semester
  const sqlCheckStatus = `SELECT result_status FROM course_create WHERE sem = ?`;
  connection.query(sqlCheckStatus, [semester], (err, results) => {
    if (err) {
      console.error('Error checking result status:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0 || results[0].result_status !== 'published') {
      res.json({ examTaken: false, message: 'Result not yet published for this semester.' });
    } else {
      // Prepare SQL query to fetch exam results
      const sqlFetchResults = `SELECT * FROM result WHERE stid = ? AND class = ?`;

      // Execute SQL query with parameters
      connection.query(sqlFetchResults, [studentId, semester], (err, results) => {
        if (err) {
          console.error('Error fetching exam result:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        // Check if there is a result for the studentId and semester
        const examTaken = results.length > 0;
        res.json({ examTaken, results: results || [] });
      });
    }
  });
});


// Fetch exam names
app.get('/api/get-examnames', (req, res) => {
  const sql = 'SELECT DISTINCT examname FROM result';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching exam names:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

// Fetch students by exam name with aggregated marks
app.get('/api/get-students-by-exam/:examname', (req, res) => {
  const { examname } = req.params;
  const sql = `
    SELECT s.std_id, s.stname, SUM(r.markscored) AS total_marks
    FROM result r
    JOIN student s ON r.stid = s.std_id
    WHERE r.examname = ?
    GROUP BY s.std_id, s.stname
  `;
  connection.query(sql, [examname], (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});






// Serve static files
app.use(express.static('public'));

         
     



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});