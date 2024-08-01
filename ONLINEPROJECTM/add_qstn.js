const express = require('express');
const fs = require('fs');
const xlsx = require('xlsx');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 8080;



app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ dest: 'uploads/' });
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
app.use(express.static(__dirname + '/'));
// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/login'); // Redirect to the login page if not authenticated
}
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
// Route for adding a new question
app.post('/uploads', upload.array('files', 50), ensureAuthenticated, (req, res) => {
  const facultyId = req.user.faculty_id; // Retrieve faculty ID from authenticated user
  const files = req.files; // Get the array of uploaded files
  
  if (!files || files.length === 0) {
      res.status(400).send('No files were uploaded.');
      return;
  }

  const promises = files.map(file => {
      return new Promise((resolve, reject) => {
          processExcelFile(file.path, facultyId)
              .then(result => resolve(result))
              .catch(error => reject(error));
      });
  });

  Promise.all(promises)
      .then(results => {
          console.log('All files processed successfully:', results);
          res.sendStatus(200);
      })
      .catch(error => {
          console.error('Error processing files:', error);
          res.status(500).send('Error processing files');
      });
});

// Function to read Excel file and store data into the database
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

          // Fetch the last inserted question ID
          connection.query('SELECT MAX(qstn_id) AS max_qstn_id FROM qstn_bank', (err, result) => {
              if (err) {
                  connection.release();
                  reject(err);
                  return;
              }

              let nextQstnId = result[0].max_qstn_id || 0; // If no questions present, start from 0
              nextQstnId++; // Increment to get the next question ID

              // Prepare values to insert into the database
              const values = sheetData.map(rowData => {
                  return [nextQstnId++, rowData.qstn, rowData.op1, rowData.op2, rowData.op3, rowData.op4, rowData.crct_ans, facultyId];
              });

              // Insert questions into the database
              const insertQuery = 'INSERT INTO qstn_bank (qstn_id, qstn, op1, op2, op3, op4, crct_ans, faculty_id) VALUES ?';
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
  });
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
