const express = require("express");
const mysql = require("mysql2/promise"); // Using promises instead of callbacks
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");
const helmet = require("helmet"); // Added for security headers
const rateLimit = require("express-rate-limit"); // Added for rate limiting

const app = express();

// Environment variables configuration
require('dotenv').config();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection pool (better than single connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "172.30.30.35",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "NEXASCORE",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to database with threadId:", connection.threadId);
    connection.release();
  } catch (error) {
    console.error("❌ Database connection error:", error.stack);
    process.exit(1); // Exit if DB connection fails
  }
}
testConnection();

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Input validation middleware
const validateStudentInput = (req, res, next) => {
  const { identificacion, nombre, correo, telefono, contrasena } = req.body;
  
  if (!identificacion || !nombre || !correo || !telefono || !contrasena) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }
  
  if (contrasena.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }
  
  next();
};

// 🔹 Student registration endpoint
app.post("/registrarEstudiante", validateStudentInput, async (req, res) => {
  try {
    const { identificacion, nombre, correo, telefono, contrasena } = req.body;

    // Check if user already exists
    const [existing] = await pool.query(
      "SELECT Identificacion FROM Sistemas_3W3 WHERE Identificacion = ?", 
      [identificacion]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "El usuario ya existe" });
    }

    // Hash password
    const hash = await bcrypt.hash(contrasena, 12);

    // Insert new student
    await pool.query(
      `INSERT INTO Sistemas_3W3 
      (Identificacion, Nombre_y_apellidos, correo_electronico, numero_Telefonico, Contrasena) 
      VALUES (?, ?, ?, ?, ?)`,
      [identificacion, nombre, correo, telefono, hash]
    );

    res.status(201).json({ message: "✅ Estudiante registrado correctamente" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "❌ Error al registrar al estudiante" });
  }
});

// 🔹 Login endpoint
app.post("/iniciarSesion", async (req, res) => {
  try {
    const { identificacion, contrasena } = req.body;

    if (!identificacion || !contrasena) {
      return res.status(400).json({ error: "Identificación y contraseña son requeridos" });
    }

    // Find user
    const [results] = await pool.query(
      "SELECT * FROM Sistemas_3W3 WHERE Identificacion = ?", 
      [identificacion]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "⚠️ Usuario no encontrado" });
    }

    const estudiante = results[0];

    // Compare passwords
    const match = await bcrypt.compare(contrasena, estudiante.Contrasena);
    if (!match) {
      return res.status(401).json({ error: "❌ Contraseña incorrecta" });
    }

    // Successful login
    res.json({ 
      message: "✅ Inicio de sesión exitoso",
      redirect: `/welcome.html?nombre=${encodeURIComponent(estudiante.Nombre_y_apellidos)}`
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "❌ Error al iniciar sesión" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "❌ Error interno del servidor" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});