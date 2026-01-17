require("dotenv").config(); // .env-dagi data-larni o'qish uchun
const express = require("express");
const http = require("http");
const app = express();
app.use(express.json()) // bu client kelgan json ma'lumotni obyektga o'zgartirib beradi har bir loyihda bo'lishi shart !
app.use("/api", require("./routes/index.js"));
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
app.listen(PORT, () => console.log(`Server is run http://localhost:${PORT}`));
server.on("error", (err) => {
  if (err.syscall !== "listen") throw err;
  switch (err.code) {
    case "EACCES":
      console.error(`PORT ${PORT} requires elevated privilages.`);
      process.exit(1);
      break;
    case "EADDAINUSE":
      console.error(`PORT ${PORT} is already use.`);
      process.exit(1);
      break;
    default:
      throw err;
  }
});