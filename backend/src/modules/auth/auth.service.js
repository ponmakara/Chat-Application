import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../../config/db.js";

const createToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name || user.username,
      profile_image_url: user.profile_image_url || ""
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const registerUser = async ({ username, email, password }) => {
  const existingUsers = await query(
    "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
    [email, username]
  );

  if (existingUsers.length > 0) {
    const error = new Error("Email or username already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users
      (username, display_name, profile_image_url, email, password, availability_status, profile_visibility, push_notifications, email_digest, two_factor_enabled, blocked_count, last_password_change_at)
     VALUES (?, ?, '', ?, ?, 'available', 'contacts', 1, 0, 0, 0, NOW())`,
    [username, username, email, hashedPassword]
  );

  const createdUsers = await query(
    `SELECT
        id,
        username,
        COALESCE(display_name, username) AS display_name,
        profile_image_url,
        headline,
        email,
        availability_status,
        profile_visibility,
        push_notifications,
        email_digest,
        two_factor_enabled,
        blocked_count,
        last_password_change_at,
        created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [result.insertId]
  );

  const user = createdUsers[0];

  return {
    user: {
      ...user,
      push_notifications: Boolean(user.push_notifications),
      email_digest: Boolean(user.email_digest),
      two_factor_enabled: Boolean(user.two_factor_enabled)
    },
    token: createToken(user)
  };
};

export const loginUser = async ({ email, password }) => {
  const users = await query(
    `SELECT
        id,
        username,
        COALESCE(display_name, username) AS display_name,
        profile_image_url,
        headline,
        email,
        password,
        availability_status,
        profile_visibility,
        push_notifications,
        email_digest,
        two_factor_enabled,
        blocked_count,
        last_password_change_at,
        created_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  if (users.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      profile_image_url: user.profile_image_url,
      headline: user.headline,
      email: user.email,
      availability_status: user.availability_status,
      profile_visibility: user.profile_visibility,
      push_notifications: Boolean(user.push_notifications),
      email_digest: Boolean(user.email_digest),
      two_factor_enabled: Boolean(user.two_factor_enabled),
      blocked_count: user.blocked_count,
      last_password_change_at: user.last_password_change_at,
      created_at: user.created_at
    },
    token: createToken(user)
  };
};
