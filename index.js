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
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});


const router = express.Router();

const executeLoginUser = async (params, res) => {
  const { email, password } = params;
  try {
    const request = new sql.Request();
    request.input("email", sql.VarChar, email);
    request.input("pass", sql.VarChar, password);
    request.execute("SPLoginUserv2", (err, result) => {
      if (email === null || password === null) {
        res
          .status(400)
          .send({ response: "Los parametros de entrada son incorrectos" });
      } else {
        if (err) {
          console.log("ERROR DE SERVICIO", err);
          res.status(500).send({ response: "Error de servidor" });
        } else if (result.recordset.length === 0) {
          res
            .status(500)
            .send({ response: "Usuario o contraseña incorrectos" });
        } else if (result) {
          res.status(200).send({ response: result.recordset });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

app.get("/test", (req, res) => {
  console.log("Welcome to backend test, conection is successfully");
  res.status(200).send("Bienvenido a back homify v.0.0.3");
});

app.post("/loginUser", (req, res) => {
  const params = req.body;
  executeLoginUser(params, res);
});
