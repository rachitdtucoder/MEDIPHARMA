const mysql = require('mysql2');
require('dotenv').config();

// Log the DATABASE_URL to check it's being loaded correctly
console.log('Database URL:', process.env.DATABASE_URL);

// Create a connection using the full URL
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database as ID ' + connection.threadId);
});

module.exports = connection;
