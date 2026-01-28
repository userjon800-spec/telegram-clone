require("dotenv").config(); // .env-dagi data-larni o'qish uchun
const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser")
const { default: mongoose } = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware.js");
const cors = require("cors");
const app = express();
app.use(express.json()); // bu client kelgan json ma'lumotni obyektga o'zgartirib beradi har bir loyihda bo'lishi shart !
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
app.use("/api", require("./routes/index.js"));
app.use(errorMiddleware);
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const bootstarp = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo Db Connected");
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