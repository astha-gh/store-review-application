const pool = require("../config/db");

// GET /api/stores
const getStores = async (req, res) => {
    const { name, address } = req.query;
    const userId = req.user.id;

    let query = `
    SELECT
      s.id,
      s.name,
      s.address,
      ROUND(AVG(r.rating), 2) AS overallRating,
      MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS userRating
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE 1=1
  `;
    const params = [userId];

    if (name) { query += " AND s.name LIKE ?"; params.push(`%${name}%`); }
    if (address) { query += " AND s.address LIKE ?"; params.push(`%${address}%`); }

    const sortField = ["name", "address", "overallRating"].includes(req.query.sortBy)
        ? req.query.sortBy : "s.name";
    const sortOrder = req.query.order === "desc" ? "DESC" : "ASC";

    query += ` GROUP BY s.id ORDER BY ${sortField} ${sortOrder}`;

    try {
        const [rows] = await pool.query(query, params);
        return res.json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/stores/:id/rate — submit or update a rating
const rateStore = async (req, res) => {
    const userId = req.user.id;
    const storeId = req.params.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
        const [store] = await pool.query("SELECT id FROM stores WHERE id = ?", [storeId]);
        if (store.length === 0) return res.status(404).json({ message: "Store not found" });

        await pool.query(
            `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
            [userId, storeId, rating]
        );

        return res.json({ message: "Rating submitted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getStores, rateStore };