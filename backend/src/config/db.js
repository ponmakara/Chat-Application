import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const ensureDatabaseSchema = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(100) NULL AFTER username,
    ADD COLUMN IF NOT EXISTS profile_image_url TEXT NULL AFTER display_name,
    ADD COLUMN IF NOT EXISTS headline VARCHAR(160) NULL AFTER display_name,
    ADD COLUMN IF NOT EXISTS availability_status ENUM('available', 'away', 'offline') NOT NULL DEFAULT 'available' AFTER headline,
    ADD COLUMN IF NOT EXISTS profile_visibility ENUM('contacts', 'private', 'public') NOT NULL DEFAULT 'contacts' AFTER availability_status,
    ADD COLUMN IF NOT EXISTS push_notifications TINYINT(1) NOT NULL DEFAULT 1 AFTER profile_visibility,
    ADD COLUMN IF NOT EXISTS email_digest TINYINT(1) NOT NULL DEFAULT 0 AFTER push_notifications,
    ADD COLUMN IF NOT EXISTS two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER email_digest,
    ADD COLUMN IF NOT EXISTS blocked_count INT NOT NULL DEFAULT 0 AFTER two_factor_enabled,
    ADD COLUMN IF NOT EXISTS last_password_change_at TIMESTAMP NULL DEFAULT NULL AFTER blocked_count
  `);
};

export const verifyDatabaseConnection = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
};

export default pool;
