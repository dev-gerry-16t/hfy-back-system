"use-strict";
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const express = require("express");
const bodyParser = require("body-parser");
const GLOBAL_CONSTANTS = require("./constants/constants");
const sql = require("mssql");
const {
  USER_DATABASE,
  PASS_DATABASE,
  SERVER_DATABASE,
  DATABASE_NAME,
} = GLOBAL_CONSTANTS;

const config = {
  user: USER_DATABASE,
  password: PASS_DATABASE,
  server: SERVER_DATABASE,
  database: DATABASE_NAME,
  // pool: {
  //     max: 10,
  //     min: 0,
  //     idleTimeoutMillis: 30000
  // }
};

const app = express();
sql.connect(config);

const port = process.env.port || GLOBAL_CONSTANTS.PORT;
app.listen(port, () => {
  console.log(
    `Welcome to homify backend, you are connected to port ${GLOBAL_CONSTANTS.PORT} in version ${GLOBAL_CONSTANTS.VERSION}`
  );
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const router = express.Router();

const execute = async (params, res) => {
  const { idUser } = params;
  try {
    const request = new sql.Request();
    request.input("idUser", sql.Int, idUser);
    request.execute("SPLoginUser", (err, result) => {
      res.status(200).send({ message: result.recordset });
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeLoginUser = async (params, res) => {
  const { email, password } = params;
  try {
    const request = new sql.Request();
    request.input("email", sql.VarChar, email);
    request.input("pass", sql.VarChar, password);
    request.execute("SPLoginUserv2", (err, result) => {
      if (isNil(email) || isNil(password)) {
        res
          .status(400)
          .send({ message: "Los parametros de entrada son incorrectos" });
      } else {
        if (err) {
          res.status(500).send({ message: "Error de servidor" });
        } else if (isEmpty(result.recordset)) {
          res.status(500).send({ message: "Usuario o contraseña incorrectos" });
        } else if (result) {
          res.status(200).send({ message: result.recordset });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeRegister = async (params, res) => {
  const { email, password, name, surname } = params;
  try {
    const request = new sql.Request();
    request.input("name", sql.VarChar, name);
    request.input("surname", sql.VarChar, surname);
    request.input("email", sql.VarChar, email);
    request.input("pass", sql.VarChar, password);
    request.execute("SPRegisterUser", (err, result) => {
      res.status(200).send({ message: result });
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

app.post("/test", (req, res) => {
  const params = req.body;
  execute(params, res);
});

app.post("/loginUser", (req, res) => {
  const params = req.body;
  executeLoginUser(params, res);
});

app.post("/registerUser", (req, res) => {
  const params = req.body;
  executeRegister(params, res);
});
