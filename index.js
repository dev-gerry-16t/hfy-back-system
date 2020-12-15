"use-strict";
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const CONFIG = require("./database/configDb");
const GLOBAL_CONSTANTS = require("./constants/constants");

const app = express();
sql.connect(CONFIG);

const port = process.env.PORT || GLOBAL_CONSTANTS.PORT;
app.listen(port, () => {
  console.log(
    `Welcome to homify backend, you are connected to port ${GLOBAL_CONSTANTS.PORT} in version ${GLOBAL_CONSTANTS.VERSION}`
  );
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const router = express.Router();

app.get("/test", (req, res) => {
  console.log("Entre al back");
  res.status(200).send("Bienvenido a back homify v.0.0.1");
});
