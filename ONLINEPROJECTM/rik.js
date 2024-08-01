const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const mime = require('mime-types');
const app = express();


app.use(express.static(__dirname + '/'));
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

// Add body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define route for the root path
app.get('submit-user-answers', (req, res) => {
  res.sendFile(__dirname + '/exam.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/adsignup.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/adminlogin.html');
});

app.get('/stulogin', (req, res) => {
  res.sendFile(__dirname + '/stulogin.html');
});

app.get('/flogin', (req, res) => {
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

app.get('/results', (req, res) => {
  res.sendFile(__dirname + '/results.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/results.html');
});


app.get('/check-student-id', (req, res) => {
  res.sendFile(__dirname + '/examfront.html');
});


// API endpoint to fetch questions
// API endpoint to fetch questions
// API endpoint to fetch questions
app.get('/api/questions', (req, res) => {
  let { questionNumbers } = req.query;

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

  // Fetch questions from database based on question numbers
  const sql = 'SELECT * FROM qstn_bank WHERE qstn_id IN (?)';
  connection.query(sql, [questionIds], (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
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
  const { name, email, password, confirmPassword } = req.body;

  // Check passwords match
  if (password !== confirmPassword) {
    res.send('Passwords do not match');
    return;
  }

  const sql = 'INSERT INTO faculty (facname, femail, fpasswd) VALUES (?, ?, ?)';
  connection.query(sql, [name, email, password], (err, result) => {
    if (err) throw err;
    res.send('User registered successfully');
  });
});

// Handle
app.post('/stusignup', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check passwords match
  if (password !== confirmPassword) {
    res.send('Passwords do not match');
    return;
  }

  const sql = 'INSERT INTO faculty (stname, stemail, password) VALUES (?, ?, ?)';
  connection.query(sql, [name, email, password], (err, result) => {
    if (err) throw err;
    res.send('User registered successfully');
  });
});

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

app.post('/faclogin', (req, res) => {
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
      res.redirect('facfun.html');
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

  const sql = 'SELECT * FROM student WHERE stname = ?';
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
  const { facultyName } = req.body;

  // Delete faculty member
  const sql = 'DELETE FROM faculty WHERE facname = ?';
  connection.query(sql, [facultyName], (err, results) => {
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
  const { facultyName } = req.body;

  // Delete student
  const sql = 'DELETE FROM student WHERE stname = ?';
  connection.query(sql, [studentName], (err, results) => {
    if (err) {
      console.error('Error deleting student details:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'student not found' });
    } else {
      res.send('Deleted successfully');
    }
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
    `SELECT * FROM qstn_bank WHERE qstn_id IN (?) ORDER BY RAND()`,
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

app.post('/api/submit-user-answers', async (req, res) => {
  const userAnswers = req.body.userAnswers;

  try {
    // Start transaction within the route handler
    await connection.beginTransaction();

    // Insert user answers into the database
    const insertQuery = 'INSERT INTO result (qstnid, answerchoosen) VALUES (?, ?)';
    for (const answer of userAnswers) {
      console.log('Inserting user answer:', answer);
      await connection.query(insertQuery, [answer.qstn_id, answer.selectedOption]);
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

  const sql = 'SELECT * FROM student WHERE stid = ?'; // Using prepared statement

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


// Start server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});

