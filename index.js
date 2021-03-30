"use-strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");
const CONFIG = require("./database/configDb");
const GLOBAL_CONSTANTS = require("./constants/constants");
const verifyToken = require("./middleware/authenticate");
const multer = require("multer");
const http = require("http");
const socketIo = require("socket.io");

const executeGetContractStats = async (params, socket) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
    type = 0,
    topIndex = null,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_intType", sql.Int, type);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("comSch.USPgetNotifications", (err, result) => {
      if (err) {
        socket.emit("get_notification", []);
      } else {
        const resultRecordset = result.recordset;
        socket.emit("get_notification", resultRecordset);
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const app = express();
sql.connect(CONFIG, (err, res) => {
  if (err) console.log("error connect", err);
  if (res) console.log("success connect");
});
const projectRoutes = require("./routes/routes");
const protectRoutes = require("./routes/protectRoutes");

const port = process.env.PORT || GLOBAL_CONSTANTS.PORT;
const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, "");
  },
});
const upload = multer(storage).single("file");
// app.listen(port, () => {
//   console.log(
//     `Welcome to homify backend, you are connected to port ${GLOBAL_CONSTANTS.PORT} in version ${GLOBAL_CONSTANTS.VERSION}`
//   );
// });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(upload);

app.get("/", (req, res) => {
  res
    .status(200)
    .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
});
app.use("/api", projectRoutes);
app.use("/apiAccess", verifyToken, protectRoutes);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://apptest.homify.ai",
      "https://app.homify.ai",
    ],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  socket.on("user_subscribed", (data) => {
    executeGetContractStats(data, socket);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
