// db.js

const mysql = require('mysql');

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
    connectionLimit: 30,
    host: 'localhost', // Change this to your MySQL server host
    user: 'root',      // Change this to your MySQL username
    password: 'aysh',  // Change this to your MySQL password
    database: 'comprehensive' // Change this to your database name
});

module.exports = pool;
