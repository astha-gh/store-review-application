const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users");
        const [[{ totalStores }]] = await pool.query("SELECT COUNT(*) AS totalStores FROM stores");
        const [[{ totalRatings }]] = await pool.query("SELECT COUNT(*) AS totalRatings FROM ratings");

        return res.json({ totalUsers, totalStores, totalRatings });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
    const { name, email, address, role } = req.query;

    let query = "SELECT id, name, email, address, role FROM users WHERE 1=1";
    const params = [];

    if (name) { query += " AND name LIKE ?"; params.push(`%${name}%`); }
    if (email) { query += " AND email LIKE ?"; params.push(`%${email}%`); }
    if (address) { query += " AND address LIKE ?"; params.push(`%${address}%`); }
    if (role) { query += " AND role = ?"; params.push(role); }

    const sortField = ["name", "email", "address", "role"].includes(req.query.sortBy)
        ? req.query.sortBy : "name";
    const sortOrder = req.query.order === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    try {
        const [rows] = await pool.query(query, params);
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, name, email, address, role FROM users WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ message: "User not found" });

        const user = rows[0];

        // If store owner, also get their average rating
        if (user.role === "store_owner") {
            const [[store]] = await pool.query(
                `SELECT s.id, s.name, ROUND(AVG(r.rating), 2) AS avgRating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?
         GROUP BY s.id`,
                [user.id]
            );
            user.store = store || null;
        }

        return res.json(user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/admin/users
const addUser = async (req, res) => {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: "Name must be 20–60 characters" });
    }
    if (address.length > 400) {
        return res.status(400).json({ message: "Address max 400 characters" });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "Password must be 8–16 chars, one uppercase, one special character" });
    }
    if (!["admin", "user", "store_owner"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    try {
        const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashed, address, role]
        );

        return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// GET /api/admin/stores
const getAllStores = async (req, res) => {
    const { name, email, address } = req.query;

    let query = `
    SELECT s.id, s.name, s.email, s.address,
      ROUND(AVG(r.rating), 2) AS rating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
    const params = [];

    if (name) { query += " AND s.name LIKE ?"; params.push(`%${name}%`); }
    if (email) { query += " AND s.email LIKE ?"; params.push(`%${email}%`); }
    if (address) { query += " AND s.address LIKE ?"; params.push(`%${address}%`); }

    query += " GROUP BY s.id";

    const sortField = ["name", "email", "address", "rating"].includes(req.query.sortBy)
        ? `s.${req.query.sortBy}` : "s.name";
    const sortOrder = req.query.order === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    try {
        const [rows] = await pool.query(query, params);
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/admin/stores
const addStore = async (req, res) => {
    const { name, email, address, owner_id } = req.body;

    if (!name || !email || !address) {
        return res.status(400).json({ message: "Name, email and address are required" });
    }
    if (name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: "Name must be 20–60 characters" });
    }
    if (address.length > 400) {
        return res.status(400).json({ message: "Address max 400 characters" });
    }

    try {
        const [existing] = await pool.query("SELECT id FROM stores WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Store with this email already exists" });
        }

        await pool.query(
            "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
            [name, email, address, owner_id || null]
        );

        return res.status(201).json({ message: "Store created successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getDashboardStats, getAllUsers, getUserById, addUser, getAllStores, addStore };