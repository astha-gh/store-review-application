const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Test DB connection on startup
const pool = require("./config/db");
pool.getConnection()
    .then(() => console.log("MySQL connected"))
    .catch((err) => console.error("DB connection failed:", err.message));


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));