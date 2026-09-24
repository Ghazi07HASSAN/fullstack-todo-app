// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Check kar rahe hain ke .env file se URL read hua ya nahi
if (!process.env.DATABASE_URL) {
  console.log("❌ ERROR: .env file se DATABASE_URL nahi mila!");
} else {
  console.log("✅ DATABASE_URL Successfully Load Ho Gaya!");
}

// Agar Neon/Cloud DB hai toh SSL enable hoga, warna disable
const isNeonDB = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeonDB ? { rejectUnauthorized: false } : false
});

module.exports = pool;