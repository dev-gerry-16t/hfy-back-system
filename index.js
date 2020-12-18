"use-strict";
const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const nodemailer = require("nodemailer");
const CONFIG = require("./database/configDb");
const GLOBAL_CONSTANTS = require("./constants/constants");

const Module = require("module");
const fs = require("fs");

Module._extensions[".jpg"] = (module, fn) => {
  var base64 = fs.readFileSync(fn).toString("base64");
  module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
};

const image = require("./assets/homify-mail.jpg");

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
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
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

const executeRegister = async (params, res) => {
  const { email, password, name, surname } = params;
  try {
    const request = new sql.Request();
    request.input("name", sql.VarChar, name);
    request.input("surname", sql.VarChar, surname);
    request.input("email", sql.VarChar, email);
    request.input("pass", sql.VarChar, password);
    request.execute("SPRegisterUser", (err, result) => {
      res.status(200).send({ response: result });
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeMailTo = async (res) => {
  const transporter = nodemailer.createTransport({
    auth: {
      user: "gerardoaldair10@gmail.com",
      pass: "Galdair1612",
    },
    service: "gmail",
    port: 465,
  });
  const nameUser = "Ramón";
  const generateCode = "567456";
  const mailOptions = {
    from: "gerardoaldair10@gmail.com",
    to: "gerardoaldair@hotmail.com",
    subject: "Test Backend homify Validación",
    html: `
    <table style="margin:0 auto;text-align:center;width:600px">
      <tbody style="text-align:center">
        <tr>
          <td>
            <img src=${image} alt="Logo Homify"></img>
          </td>
        </tr>
        <tr>
          <td>
            <h3 style="font-family: sans-serif;color:rgb(255,2,130); margin-top: 20px;"> 
              Hola ${nameUser}, este es tu código de confirmación para la validación de tu cuenta
            </h3>
          </td>
        </tr>
        <tr>
          <td>
            <div style="border:3px solid #FF0282;padding:15px 40px;background:#efefef;letter-spacing:2px;font-size:18px;width: 106px;margin: 20px auto;">
              ${generateCode}
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <span  style="text-align:center;font-size:10px;color:#aaa">
              En caso de que sospeche que alguien tiene acceso a sus factores de autenticación deberá cambiarlos inmediatamente y reportarlo a correo <span style="color:#0000ff">soporteseguridad@homify.com.mx.
            </span>
          </td>
        </tr>
        <tr>
          <td>
            <div style="height:40px;background:rgb(255,2,130);color:#fff;font-size:10px;padding-top: 20px;">
              <span>Homify© 2020. All rights reserved.</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(200).send("Email sent failed " + error);
    } else {
      res.status(200).send("Email sent: " + info.response);
    }
  });
};

app.get("/", (req, res) => {
  res
    .status(200)
    .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
});

app.get("/test", (req, res) => {
  console.log("Welcome to backend test, conection is successfully", sql);
  res
    .status(200)
    .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
});

app.get("/mailto", (req, res) => {
  executeMailTo(res).catch(console.error);
});

app.post("/loginUser", (req, res) => {
  const params = req.body;
  executeLoginUser(params, res);
});

app.post("/registerUser", (req, res) => {
  const params = req.body;
  executeRegister(params, res);
});
