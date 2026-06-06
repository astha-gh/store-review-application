const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const hash = (pw) => bcrypt.hash(pw, 10);

async function seed() {
    const conn = await pool.getConnection();

    try {
        console.log("Clearing existing data...");
        await conn.query("SET FOREIGN_KEY_CHECKS = 0");
        await conn.query("TRUNCATE TABLE ratings");
        await conn.query("TRUNCATE TABLE stores");
        await conn.query("TRUNCATE TABLE users");
        await conn.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("Seeding users...");
        const users = [
            {
                name: "Administrator Account User One",
                email: "admin@test.com",
                password: await hash("Admin@123"),
                address: "Admin Office Pune Maharashtra India",
                role: "admin",
            },
            {
                name: "Store Owner First Account Test",
                email: "owner1@test.com",
                password: await hash("Owner@123"),
                address: "Shop Lane Koregaon Park Pune Maharashtra",
                role: "store_owner",
            },
            {
                name: "Store Owner Second Account Test",
                email: "owner2@test.com",
                password: await hash("Owner@123"),
                address: "Market Road Baner Pune Maharashtra India",
                role: "store_owner",
            },
            {
                name: "Normal User First Account Test",
                email: "user1@test.com",
                password: await hash("User@1234"),
                address: "Flat 12 Kothrud Pune Maharashtra India",
                role: "user",
            },
            {
                name: "Normal User Second Account Test",
                email: "user2@test.com",
                password: await hash("User@1234"),
                address: "House 45 Wakad Pune Maharashtra India",
                role: "user",
            },
            {
                name: "Normal User Third Account Test",
                email: "user3@test.com",
                password: await hash("User@1234"),
                address: "Block B Hinjewadi Pune Maharashtra India",
                role: "user",
            },
        ];

        const userIds = {};
        for (const u of users) {
            const [res] = await conn.query(
                "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
                [u.name, u.email, u.password, u.address, u.role]
            );
            userIds[u.email] = res.insertId;
        }

        console.log("Seeding stores...");
        const stores = [
            {
                name: "The Coffee House Specialty Cafe",
                email: "coffeehouse@store.com",
                address: "FC Road Shivajinagar Pune Maharashtra",
                owner_email: "owner1@test.com",
            },
            {
                name: "Green Basket Organic Grocery Store",
                email: "greenbasket@store.com",
                address: "Baner Road Pune Maharashtra India",
                owner_email: "owner1@test.com",
            },
            {
                name: "Tech World Electronics Retail Shop",
                email: "techworld@store.com",
                address: "MG Road Camp Pune Maharashtra India",
                owner_email: "owner2@test.com",
            },
            {
                name: "Spice Garden Indian Restaurant Pune",
                email: "spicegarden@store.com",
                address: "Koregaon Park Pune Maharashtra India",
                owner_email: "owner2@test.com",
            },
            {
                name: "Book Nook Reading Store Pune City",
                email: "booknook@store.com",
                address: "Deccan Gymkhana Pune Maharashtra India",
                owner_email: null,
            },
        ];

        const storeIds = {};
        for (const s of stores) {
            const [res] = await conn.query(
                "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
                [s.name, s.email, s.address, s.owner_email ? userIds[s.owner_email] : null]
            );
            storeIds[s.email] = res.insertId;
        }

        console.log("Seeding ratings...");
        const ratings = [
            { user: "user1@test.com", store: "coffeehouse@store.com", rating: 5 },
            { user: "user1@test.com", store: "greenbasket@store.com", rating: 4 },
            { user: "user1@test.com", store: "techworld@store.com", rating: 3 },
            { user: "user2@test.com", store: "coffeehouse@store.com", rating: 4 },
            { user: "user2@test.com", store: "spicegarden@store.com", rating: 5 },
            { user: "user2@test.com", store: "booknook@store.com", rating: 4 },
            { user: "user3@test.com", store: "coffeehouse@store.com", rating: 3 },
            { user: "user3@test.com", store: "techworld@store.com", rating: 5 },
            { user: "user3@test.com", store: "spicegarden@store.com", rating: 4 },
        ];

        for (const r of ratings) {
            await conn.query(
                "INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)",
                [userIds[r.user], storeIds[r.store], r.rating]
            );
        }

        console.log("Done! Seeded successfully.");
        console.log("---");
        console.log("Admin:       admin@test.com   / Admin@123");
        console.log("Owner 1:     owner1@test.com  / Owner@123");
        console.log("Owner 2:     owner2@test.com  / Owner@123");
        console.log("User 1:      user1@test.com   / User@1234");
        console.log("User 2:      user2@test.com   / User@1234");
        console.log("User 3:      user3@test.com   / User@1234");
    } catch (err) {
        console.error("Seeding failed:", err.message);
    } finally {
        conn.release();
        process.exit();
    }
}

seed();