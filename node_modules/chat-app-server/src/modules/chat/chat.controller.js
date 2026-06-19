import {
  createMessage,
  deleteMessageById,
  getMessageById,
  listConversationSummaries,
  listMessagesBetweenUsers
} from "./chat.service.js";

export const getConversations = async (req, res) => {
  try {
    const conversations = await listConversationSummaries(req.user.id);
    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load conversations" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const otherUserId = Number(req.params.userId);

    if (!otherUserId) {
      return res.status(400).json({ message: "A valid user id is required" });
    }

    const messages = await listMessagesBetweenUsers(req.user.id, otherUserId);
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load messages" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const receiverId = Number(req.params.userId);
    const { message } = req.body;

    if (!receiverId || !message?.trim()) {
      return res.status(400).json({ message: "Receiver and message are required" });
    }

    const createdMessage = await createMessage({
      senderId: req.user.id,
      receiverId,
      message: message.trim()
    });

    const io = req.app.get("io");

    io.to(`user:${receiverId}`).emit("message:new", createdMessage);
    io.to(`user:${req.user.id}`).emit("message:new", createdMessage);

    return res.status(201).json(createdMessage);
  } catch (error) {
    return res.status(500).json({ message: "Unable to send message" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const messageId = Number(req.params.messageId);

    if (!messageId) {
      return res.status(400).json({ message: "A valid message id is required" });
    }

    const message = await getMessageById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender_id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete messages you sent" });
    }

    await deleteMessageById(messageId);

    const io = req.app.get("io");
    const deletedPayload = {
      id: message.id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id
    };

    io.to(`user:${message.sender_id}`).emit("message:deleted", deletedPayload);
    io.to(`user:${message.receiver_id}`).emit("message:deleted", deletedPayload);

    return res.status(200).json(deletedPayload);
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete message" });
  }
};
