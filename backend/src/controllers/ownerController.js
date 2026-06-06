const pool = require("../config/db");

// GET /api/owner/dashboard
const getOwnerDashboard = async (req, res) => {
    const ownerId = req.user.id;

    try {
        // Get the store belonging to this owner
        const [stores] = await pool.query(
            "SELECT id, name FROM stores WHERE owner_id = ?",
            [ownerId]
        );

        if (stores.length === 0) {
            return res.json({ store: null, avgRating: null, raters: [] });
        }

        const store = stores[0];

        // Get average rating for the store
        const [[{ avgRating }]] = await pool.query(
            "SELECT ROUND(AVG(rating), 2) AS avgRating FROM ratings WHERE store_id = ?",
            [store.id]
        );

        // Get all users who rated this store
        const [raters] = await pool.query(
            `SELECT u.name, u.email, r.rating, r.created_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
            [store.id]
        );

        return res.json({ store, avgRating, raters });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getOwnerDashboard };