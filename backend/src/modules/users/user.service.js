import { query } from "../../config/db.js";

export const getUsersForSidebar = async (currentUserId) =>
  query(
    `SELECT
        id,
        username,
        COALESCE(display_name, username) AS display_name,
        profile_image_url,
        headline,
        email,
        availability_status,
        created_at
     FROM users
     WHERE id != ?
     ORDER BY COALESCE(display_name, username) ASC`,
    [currentUserId]
  );

export const getUserProfile = async (userId) => {
  const users = await query(
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
    [userId]
  );

  return users[0] || null;
};

export const updateUserProfile = async (userId, payload) => {
  const duplicateUsers = await query(
    `SELECT id
     FROM users
     WHERE id != ?
       AND (username = ? OR email = ?)
     LIMIT 1`,
    [userId, payload.username, payload.email]
  );

  if (duplicateUsers.length > 0) {
    const error = new Error("Username or email is already in use");
    error.statusCode = 409;
    throw error;
  }

  await query(
    `UPDATE users
     SET username = ?,
         display_name = ?,
         profile_image_url = ?,
         headline = ?,
         email = ?,
         availability_status = ?,
         profile_visibility = ?,
         push_notifications = ?,
         email_digest = ?
     WHERE id = ?`,
    [
      payload.username,
      payload.display_name,
      payload.profile_image_url,
      payload.headline,
      payload.email,
      payload.availability_status,
      payload.profile_visibility,
      payload.push_notifications ? 1 : 0,
      payload.email_digest ? 1 : 0,
      userId
    ]
  );

  return getUserProfile(userId);
};

export const updateUserProfileImage = async (userId, profileImageUrl) => {
  await query("UPDATE users SET profile_image_url = ? WHERE id = ?", [profileImageUrl, userId]);
  return getUserProfile(userId);
};
