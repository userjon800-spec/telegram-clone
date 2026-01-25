const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});
let users = [];
const addOnlineUser = (user, socketId) => {
  const checkUser = users.find((u) => u.user._id === user._id || u.user.id === user.id);
  if (!checkUser) {
    users.push({user, socketId});
  }
};
io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  socket.on("addOnlineUser", (user) => {
    console.log("Online user added:", user); // Debugging log
    addOnlineUser(user, socket.id);
    console.log("Current users:", users); // Debugging log
    io.emit("getOnlineUsers", users);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    users = users.filter((u) => u.socketId !== socket.id);
    io.emit("getOnlineUsers", users);
  });
});