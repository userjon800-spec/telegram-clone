const http = require("http");
const app = require("./app");
const socketHandler = (io) => {
  const users = new Map();
  const getSocketId = (user) => {
    const id = user?._id ?? user?.id ?? user;
    return users.get(id?.toString());
  };
  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);
    socket.on("addOnlineUser", (user) => {
      const id = user?._id ?? user?.id ?? user;
      if (!id) return;
      users.set(id.toString(), socket.id);
      io.emit(
        "getOnlineUsers",
        Array.from(users.keys()).map((u) => ({ user: { _id: u } })),
      );
    });
    socket.on("sendMessage", ({ newMessage, receiver, sender }) => {
      const receiverSocketId = getSocketId(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getNewMessage", {
          newMessage,
          sender,
          receiver,
        });
      }
    });
    socket.on("readMessages", ({ receiver, messages }) => {
      const receiverSocketId = getSocketId(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getReadMessages", messages);
      }
    });
    socket.on("updateMessage", ({ updatedMessage, receiver, sender }) => {
      const receiverSocketId = getSocketId(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getUpdatedMessage", {
          updatedMessage,
          sender,
        });
      }
    });
    socket.on("deleteMessage", ({ deletedMessage, receiver, sender }) => {
      const receiverSocketId = getSocketId(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getDeletedMessage", {
          deletedMessage,
          sender,
        });
      }
    });
    socket.on("disconnect", () => {
      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }
      io.emit(
        "getOnlineUsers",
        Array.from(users.keys()).map((u) => ({ user: { _id: u } })),
      );
      console.log("🔴 Disconnected:", socket.id);
    });
  });
};
module.exports = socketHandler;
