import api from "../../../lib/api";

export const fetchConversations = async () => {
  const { data } = await api.get("/chat/conversations");
  return data;
};

export const fetchUsers = async () => {
  const { data } = await api.get("/users");
  return data;
};

export const fetchMessages = async (userId) => {
  const { data } = await api.get(`/chat/messages/${userId}`);
  return data;
};

export const sendMessageRequest = async (userId, message) => {
  const { data } = await api.post(`/chat/messages/${userId}`, { message });
  return data;
};

export const deleteMessageRequest = async (messageId) => {
  const { data } = await api.delete(`/chat/messages/item/${messageId}`);
  return data;
};
