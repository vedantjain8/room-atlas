const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const socketio = require("socket.io");
const http = require("http");
const initSocket = require("./functions/socket");
const bodyParser = require("body-parser");
const pool = require("./config/db");

const userRoutes = require("./routes/user/userRoutes");
const listingRoutes = require("./routes/listing/listingRoutes");
const chattingRoutes = require("./routes/chat/chattingRoutes");
const verificationRoutes = require("./routes/user/verificationRoutes");
const userProfileRoutes = require("./routes/user/userProfileRoutes");
const feedbackRoutes = require("./routes/pages/feedbackRoutes");
const jwtRoutes = require("./routes/jwtRoutes");

const uploadImageRoutes = require("./routes/image/uploadImageRoutes");
const settings = require("./config/settings");

// cron jobs
require("./jobs/cron24hr");
require("./jobs/cron1hr");
require("./jobs/cron10sec");

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(express.static("public"));

app.set("trust proxy", true);
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:3000"],
  })
);

// console logging
app.use(
  morgan(
    ":date[web] :remote-addr  :method :url :status - :response-time ms :res[content-length]"
  )
);

// routes for different modules
app.use(uploadImageRoutes);

// routes for logging
app.use("/user", userRoutes);
app.use("/listing", listingRoutes);
app.use("/chat", chattingRoutes);
app.use("/verify", verificationRoutes);
app.use("/user", userProfileRoutes);
app.use("/feedback", feedbackRoutes);
app.use(jwtRoutes);

// app.use(jwtRoutes);

app.get("/ping", (req, res) => {
  console.log(res);
  return res.status(200).json({ message: `Pong` });
});

const io = socketio(server);
initSocket(io, pool);

process.on("SIGINT", async () => {
  console.log("Ctrl-C was pressed");
  process.exit();
});

server.listen(settings.server.port, () => {
  console.log(`Server started on port ${settings.server.port}`);
});
