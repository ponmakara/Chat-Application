import jwt from "jsonwebtoken";

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return authToken;
  }

  const header = socket.handshake.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }

  return null;
};

const getOnlineUserIds = (connectedUsers) =>
  Array.from(connectedUsers.entries())
    .filter(([, socketIds]) => socketIds.size > 0)
    .map(([userId]) => userId);

export const initializeSocketServer = (io, connectedUsers) => {
  io.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const userSockets = connectedUsers.get(userId) || new Set();
    userSockets.add(socket.id);
    connectedUsers.set(userId, userSockets);
    socket.join(`user:${userId}`);

    io.emit("users:online", getOnlineUserIds(connectedUsers));

    socket.on("typing:start", ({ to }) => {
      const targetUserId = Number(to);

      if (!targetUserId) {
        return;
      }

      io.to(`user:${targetUserId}`).emit("typing:start", { from: userId });
    });

    socket.on("typing:stop", ({ to }) => {
      const targetUserId = Number(to);

      if (!targetUserId) {
        return;
      }

      io.to(`user:${targetUserId}`).emit("typing:stop", { from: userId });
    });

    socket.on("disconnect", () => {
      const activeSockets = connectedUsers.get(userId);

      if (activeSockets) {
        activeSockets.delete(socket.id);

        if (activeSockets.size === 0) {
          connectedUsers.delete(userId);
        } else {
          connectedUsers.set(userId, activeSockets);
        }
      }

      io.emit("users:online", getOnlineUserIds(connectedUsers));
    });
  });
};
