const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// POST /api/auth/register
const register = async (req, res) => {
    const { name, email, password, address } = req.body;

    // Basic validation
    if (!name || !email || !password || !address) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: "Name must be 20 to 60 characters" });
    }
    if (address.length > 400) {
        return res.status(400).json({ message: "Address max 400 characters" });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be 8 to 16 characters with at least one uppercase letter and one special character",
        });
    }

    try {
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'user')",
            [name, email, hashed, address]
        );

        const user = { id: result.insertId, role: "user" };
        return res.status(201).json({ token: generateToken(user), role: "user" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            token: generateToken(user),
            role: user.role,
            name: user.name,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Both fields are required" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            message: "New password must be 8–16 chars, one uppercase, one special character",
        });
    }

    try {
        const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(currentPassword, rows[0].password);
        if (!match) return res.status(401).json({ message: "Current password is incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

        return res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login, changePassword };