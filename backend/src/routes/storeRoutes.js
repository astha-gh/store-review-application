const express = require("express");
const router = express.Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");
const { getStores, rateStore } = require("../controllers/storeController");

router.use(verifyToken, requireRole("user"));

router.get("/", getStores);
router.post("/:id/rate", rateStore);

module.exports = router;