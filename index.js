"use-strict";
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
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
const upload = multer({ storage }).single("image");
app.listen(port, () => {
  console.log(
    `Welcome to homify backend, you are connected to port ${GLOBAL_CONSTANTS.PORT} in version ${GLOBAL_CONSTANTS.VERSION}`
  );
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});
app.use(upload);

app.use("/api", projectRoutes);
app.use("/apiAccess", verifyToken, protectRoutes);
