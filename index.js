const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const cors = require("cors");
require('dotenv').config();

const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());
// Create a MySQL connection pool
const pool = mysql.createPool(`${process.env.MYSQL_URL}/mern`);

// GET request to fetch all users
app.get("/api/users", async (req, res) => {
  const connection = await pool.getConnection();
  const [results, fields] = await connection.query(
    "SELECT * FROM employee_details"
  );
  res.json(results);
}); 

// GET request to fetch a single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const connection = await pool.getConnection();
    const [results] = await connection.query(
      "SELECT * FROM employee_details WHERE UniqueID = ?",
      [userId]
    );
    if (results?.length === 0)
      return res.status(404).json({ message: "User not found" });
    return res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});



app.post("/api/login", async (req, res) => {
    const { username, password } = req.body; // Corrected 'Password' to 'password'
    console.log({ username, password });
    // Check if userName and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const connection = await pool.getConnection();
        
        // Query the database to check if the user exists
        const [results, fields] = await connection.query(
            "SELECT * FROM employee_details WHERE Name = ? AND password = ?",
            [username, password]
        );

        connection.release(); // Release the connection after query execution
        
        // Check if user was found
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        // If user exists, return user details
        res.status(200).json({ message: "Login successful.", user: results[0] });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
});


app.post("/api/adduser", async (req, res) => {
    const {
        // UniqueID,
        Image,
        Name : username,
        Email : email,
        Mobile,
        Designation,
        Gender,
        Course,
        Date,
        Password : password,
      } = req.body;
    // Check if all required fields are provided

    if (!username || !password || !email) {
        return res.status(400).json({ message: "Username, password, and email are required." });
    }

    try {
        const connection = await pool.getConnection();
        
        // Check if the username or email already exists in the database
        const [existingUsers] = await connection.query(
            "SELECT * FROM employee_details WHERE Name = ? OR email = ?",
            [username, email]
        );

        // If username or email already exists, return a conflict error
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Username or email already exists." });
        }

        // Insert the new user into the database
        await connection.query(
            "INSERT INTO employee_details (Image, Name, Email, Mobile, Designation, Gender, Course, Date, Password)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                // UniqueID,
                '',
                username,
                email,
                Mobile,
                Designation,
                Gender,
                Course,
                Date,
                password,
              ]
        );

        connection.release(); // Release the connection after query execution

      return  res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
});


  
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
