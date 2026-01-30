require("dotenv").config();
const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const { default: mongoose } = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use("/api", require("./routes/index.js"));
app.use(errorMiddleware);
const PORT = process.env.PORT || 7800;
const server = http.createServer(app);
const { Server } = require("socket.io");
const socketHandler = require("./server");
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});
socketHandler(io);
const bootstarp = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    server.listen(PORT, () =>
      console.log(`Server is run http://localhost:${PORT}`),
    );
  } catch (error) {
    console.error(error);
  }
};
server.on("error", (err) => {
  if (err.syscall !== "listen") throw err;
  switch (err.code) {
    case "EACCES":
      console.error(`PORT ${PORT} requires elevated privilages.`);
      process.exit(1);
    case "EADDAINUSE":
      console.error(`PORT ${PORT} is already use.`);
      process.exit(1);
    default:
      throw err;
  }
});
bootstarp();