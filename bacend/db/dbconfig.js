

import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConnection = mysql.createPool({
  user: process.env.DB_USER, // Use DB_USER instead of USER
  host: process.env.DB_HOST, // Use DB_HOST instead of HOST
  password: process.env.DB_PASSWORD, // Use DB_PASSWORD instead of PASSWORD
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Use DB_PORT for database port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to create tables
const createTable = (query, tableName) => {
  dbConnection.query(query, (err) => {
    if (err) {
      console.error(`Error creating ${tableName} table:`, err.message);
    } else {
      console.log(`${tableName} table created successfully.`);
    }
  });
};

// Table creation queries
const userTable = `
  CREATE TABLE IF NOT EXISTS users (
    userId INT AUTO_INCREMENT,
    userName VARCHAR(20) NOT NULL,
    firstName VARCHAR(20) NOT NULL,
    lastName VARCHAR(20) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    RegisteredTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (userId)
  )
`;

const questionTable = `
  CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT,
    questionId VARCHAR(100) NOT NULL UNIQUE,
    userId INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    tag VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES users(userId)
  )
`;

const answerTable = `
  CREATE TABLE IF NOT EXISTS answers (
    answerId INT AUTO_INCREMENT,
    userId INT NOT NULL,
    questionId VARCHAR(100) NOT NULL,
    answer VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (answerId),
    FOREIGN KEY (questionId) REFERENCES questions(questionId),
    FOREIGN KEY (userId) REFERENCES users(userId)
  )
`;

// Create tables
createTable(userTable, 'user');
createTable(questionTable, 'question');
createTable(answerTable, 'answer');

// Exporting dbConnection
export default dbConnection.promise();

