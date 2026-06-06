const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getOwnerDashboard } = require("../controllers/ownerController");

router.use(verifyToken, requireRole("store_owner"));

router.get("/dashboard", getOwnerDashboard);

module.exports = router;