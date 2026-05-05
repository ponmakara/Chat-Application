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
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);

    io.emit("users:online", Array.from(connectedUsers.keys()));

    socket.on("disconnect", () => {
      connectedUsers.delete(userId);
      io.emit("users:online", Array.from(connectedUsers.keys()));
    });
  });
};
