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
const executeSlackLogCatchBackend = require("./actions/slackLogCatchBackend");

const app = express();
sql.connect(CONFIG, (err, res) => {
  if (err) {
    executeSlackLogCatchBackend({
      storeProcedure: "Connect DB",
      error: err,
      body: CONFIG,
    });
  }
  if (res) console.log("success connect");
});
const projectRoutes = require("./routes/routes");
const protectRoutes = require("./routes/protectRoutes");
const customerRoutes = require("./routes/customerRoutes");
const externalRoutes = require("./routes/externalRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

const port = process.env.PORT || process.env.port || GLOBAL_CONSTANTS.PORT;
const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
    callback(null, "");
  },
});
const upload = multer(storage).single("file");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  bodyParser.json({
    verify: (req, res, buf, encoding) => {
      req.rawBody = buf.toString();
    },
    strict: false,
  })
);
app.use(cors());
app.use(upload);

app.get("/", (req, res) => {
  res
    .status(200)
    .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
});
app.use("/api", projectRoutes);
app.use("/apiAccess", verifyToken, protectRoutes);
app.use("/customer", verifyToken, customerRoutes);
app.use("/property", verifyToken, propertyRoutes);
app.use("/external", verifyToken, externalRoutes);

app.listen(port, () => {
  console.log(
    `Welcome to homify backend, you are connected to port ${port} in version ${GLOBAL_CONSTANTS.VERSION}`
  );
});
