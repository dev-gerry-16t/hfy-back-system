"use-strict";
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const cors = require("cors");
const CONFIG = require("./database/configDb");
const GLOBAL_CONSTANTS = require("./constants/constants");
const verifyToken = require("./middleware/authenticate");
const multer = require("multer");

const app = express();
sql.connect(CONFIG);
const projectRoutes = require("./routes/routes");
const protectRoutes = require("./routes/protectRoutes");

const port = process.env.PORT || GLOBAL_CONSTANTS.PORT;
const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, "");
  },
});
const upload = multer(storage).single("file");
app.listen(port, () => {
  console.log(
    `Welcome to homify backend, you are connected to port ${GLOBAL_CONSTANTS.PORT} in version ${GLOBAL_CONSTANTS.VERSION}`
  );
});
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
