const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Create a MySQL connection pool
const pool = mysql.createPool(`mysql://root:1234567890@localhost:3306/mern`);

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

// POST request to create a new user
app.post("/api/users", async (req, res) => {
  try {
    const {
      UniqueID,
      Image,
      Name,
      Email,
      Mobile,
      Designation,
      Gender,
      Course,
      Date,
      Password,
    } = req.body;
    const connection = await pool.getConnection();
    const [ results ] =  await connection.query(
      "INSERT INTO employee_details (UniqueID, Image, Name, Email, Mobile, Designation, Gender, Course, Date, Password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        UniqueID,
        Image,
        Name,
        Email,
        Mobile,
        Designation,
        Gender,
        Course,
        Date,
        Password,
      ]
    );
    res.status(201).json({ id: results.insertId, Name, Email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
