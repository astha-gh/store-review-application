const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const {
    getDashboardStats,
    getAllUsers,
    getUserById,
    addUser,
    getAllStores,
    addStore,
} = require("../controllers/adminController");

// All admin routes require login + admin role
router.use(verifyToken, requireRole("admin"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", addUser);
router.get("/stores", getAllStores);
router.post("/stores", addStore);

module.exports = router;