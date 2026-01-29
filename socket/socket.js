const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});
let users = [];
const getSocketId = (userId) => {
  const user = users.find((u) => u.user._id === userId || u.user.id === userId);
  return user ? user.socketId : null;
};
const addOnlineUser = (user, socketId) => {
  const checkUser = users.find(
    (u) => u.user._id === user._id || u.user.id === user.id,
  );
  if (!checkUser) {
    users.push({ user, socketId });
  }
};
io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on("addOnlineUser", (user) => {
    console.log("Online user added:", user);
    addOnlineUser(user, socket.id);
    console.log("Current users:", users);
    io.emit("getOnlineUsers", users);
  });
  socket.on("createContact", ({ currentUser, receiver }) => {
    const receiverSocketId = getSocketId(receiver._id || receiver.id);
    console.log("receiversocketid", receiverSocketId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("getCreateUser", currentUser);
    }
  });
  socket.on("sendMessage", ({ newMessage, receiver, sender }) => {
    const receiverSocketId = getSocketId(receiver._id || receiver.id);
    if (receiverSocketId) {
      socket
        .to(receiverSocketId)
        .emit("getNewMessage", { newMessage, sender, receiver });
    }
  });
  socket.on("readMessages", ({ receiver, messages }) => {
    const receiverSocketId = getSocketId(receiver._id || receiver.id);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit("getReadMessages", { messages });
    }
  });
  socket.on("updateMessage", ({ updatedMessage, receiver, sender }) => {
    const receiverSocketId = getSocketId(receiver._id || receiver.id);
    if (receiverSocketId) {
      socket
        .to(receiverSocketId)
        .emit("getUpdatedMessage", { updatedMessage, sender, receiver });
    }
  });
  socket.on(
    "deleteMessage",
    ({ deletedMessage, filteredMessages, sender, receiver }) => {
      const receiverSocketId = getSocketId(receiver._id || receiver.id);
      if (receiverSocketId) {
        socket
          .to(receiverSocketId)
          .emit("getDeletedMessage", {
            deletedMessage,
            sender,
            filteredMessages,
          });
      }
    },
  );
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    users = users.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", users);
  });
});