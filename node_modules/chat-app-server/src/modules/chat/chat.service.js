import { query } from "../../config/db.js";

const normalizeConversation = async (senderId, receiverId) => {
  const [user1Id, user2Id] = [senderId, receiverId].sort((a, b) => a - b);

  const existing = await query(
    "SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ? LIMIT 1",
    [user1Id, user2Id]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const result = await query(
    "INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)",
    [user1Id, user2Id]
  );

  return result.insertId;
};

export const listMessagesBetweenUsers = async (currentUserId, otherUserId) =>
  query(
    `SELECT id, sender_id, receiver_id, message, created_at
     FROM messages
     WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)
     ORDER BY created_at ASC, id ASC`,
    [currentUserId, otherUserId, otherUserId, currentUserId]
  );

export const listConversationSummaries = async (currentUserId) =>
  query(
    `SELECT
        u.id,
        u.username,
        COALESCE(u.display_name, u.username) AS display_name,
        u.profile_image_url,
        u.headline,
        u.email,
        u.availability_status,
        u.created_at,
        m.message AS last_message,
        m.created_at AS last_message_at,
        m.sender_id AS last_sender_id
     FROM users u
     LEFT JOIN messages m ON m.id = (
       SELECT m2.id
       FROM messages m2
       WHERE (
         (m2.sender_id = ? AND m2.receiver_id = u.id)
         OR
         (m2.sender_id = u.id AND m2.receiver_id = ?)
       )
       ORDER BY m2.created_at DESC, m2.id DESC
       LIMIT 1
     )
     WHERE u.id != ?
     ORDER BY COALESCE(m.created_at, u.created_at) DESC, u.username ASC`,
    [currentUserId, currentUserId, currentUserId]
  );

export const createMessage = async ({ senderId, receiverId, message }) => {
  const conversationId = await normalizeConversation(senderId, receiverId);

  const result = await query(
    "INSERT INTO messages (conversation_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)",
    [conversationId, senderId, receiverId, message]
  );

  const created = await query(
    `SELECT id, conversation_id, sender_id, receiver_id, message, created_at
     FROM messages
     WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return created[0];
};

export const getMessageById = async (messageId) => {
  const rows = await query(
    `SELECT id, conversation_id, sender_id, receiver_id, message, created_at
     FROM messages
     WHERE id = ? LIMIT 1`,
    [messageId]
  );

  return rows[0] || null;
};

export const deleteMessageById = async (messageId) => {
  const result = await query("DELETE FROM messages WHERE id = ?", [messageId]);
  return result.affectedRows > 0;
};
