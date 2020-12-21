const sql = require("mssql");
const nodemailer = require("nodemailer");
const Module = require("module");
const fs = require("fs");
const ERROR_SQL = require("../constants/errors");

Module._extensions[".jpg"] = (module, fn) => {
  var base64 = fs.readFileSync(fn).toString("base64");
  module._compile('module.exports="data:image/jpg;base64,' + base64 + '"', fn);
};

const image = require("../assets/homify-mail.jpg");

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

const executeMailTo = async (params) => {
  const { sender, receiver, code } = params;
  console.log("params", params);
  //   const transporter = nodemailer.createTransport({
  //     auth: {
  //       user: "gerardoaldair10@gmail.com",
  //       pass: "Galdair1612",
  //     },
  //     service: "gmail",
  //     port: 465,
  //   });

  const transporter = nodemailer.createTransport({
    auth: {
      user: "admin@homify.ai",
      pass: "Hfy2020Db#",
    },
    host: "giowm1210.siteground.biz",
    port: 465,
  });

  const nameUser = "Noe";
  const generateCode = code;
  const mailOptions = {
    from: "admin@homify.ai",
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
    console.log("error", error);
    console.log("info", info);
  });
};

const executeCustomerTypeGAC = async (param, res) => {
  const { idType } = param;
  try {
    const request = new sql.Request();
    request.input("p_intType", sql.Int, idType);
    request.execute("catCustomerSch.USPgetAllCustomerTypes", (err, result) => {
      if (err) {
        res.status(500).send({ result: ERROR_SQL[err.number] });
      } else {
        res.status(200).send({ result: result.recordset });
      }
    });
  } catch (error) {}
};

const executePersonTypeGAP = async (param, res) => {
  const { idType, idCustomerType } = param;
  try {
    const request = new sql.Request();
    request.input("p_intType", sql.Int, idType);
    request.input("p_intIdCustomerType", sql.Int, idCustomerType);
    request.execute("catCustomerSch.USPgetAllPersonTypes", (err, result) => {
      if (err) {
        res.status(500).send({ result: "Error en los parametros" });
      } else {
        res.status(200).send({ result: result.recordset });
      }
    });
  } catch (error) {}
};

const executeEndorsementTypeGAE = async (param, res) => {
  const { idType } = param;
  try {
    const request = new sql.Request();
    request.input("p_intType", sql.Int, idType);
    request.execute("catCustomerSch.USPgetAllEndorsements", (err, result) => {
      if (err) {
        res.status(500).send({ result: "Error en los parametros" });
      } else {
        res.status(200).send({ result: result.recordset });
      }
    });
  } catch (error) {}
};

const executeEmailSentAES = async (param) => {
  const {
    idEmailStatus = 1,
    idEmailTemplate = 1,
    idRequestSignUp,
    idUserSender,
    idUserReceiver = "",
    sender,
    receiver,
    subject,
    content,
    jsonServiceResponse = [],
    offset,
  } = param;

  try {
    const request = new sql.Request();
    request.input("p_intIdEmailStatus", sql.Int, idEmailStatus);
    request.input("p_intIdEmailTemplate", sql.Int, idEmailTemplate);
    request.input(
      "p_uidIdRequestSignUp",
      sql.TYPES.UniqueIdentifier,
      idRequestSignUp
    );
    request.input("p_uidIdUserSender", sql.UniqueIdentifier, idUserSender);
    request.input("p_uidIdUserReceiver", sql.UniqueIdentifier, idUserReceiver);
    request.input("p_nvcSender", sql.NVarChar, sender);
    request.input("p_nvcReceiver", sql.NVarChar, receiver);
    request.input("p_nvcSubject", sql.NVarChar, subject);
    request.input("p_nvcContent", sql.NVarChar, content);
    request.input(
      "p_nvcJsonServiceResponse",
      sql.NVarChar,
      jsonServiceResponse
    );
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("comSch.USPaddEmailSent", (err, result) => {
      console.log("err", err);

      console.log("result", result);
    });
  } catch (error) {}
};

const executeRequestSignUpPSU = async (param, res) => {
  const {
    username,
    password,
    idCustomerType,
    idPersonType,
    idEndorsement,
    givenName,
    lastName,
    mothersMaidenName,
    phoneNumber,
    offset = "-06:00",
  } = param;

  try {
    const request = new sql.Request();
    request.input("p_nvcUsernameRequested", sql.NVarChar, username);
    request.input("p_nvcPasswordRequested", sql.NVarChar, password);
    request.input("p_intIdCustomerType", sql.Int, idCustomerType);
    request.input("p_intIdPersonType", sql.Int, idPersonType);
    request.input("p_intIdEndorsement", sql.Int, idEndorsement);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("authSch.USPrequestSignUp", async (err, result, value) => {
      //   console.log("err", err);
      //   console.log("result", result);
      //   console.log("value", value);
      //   console.log("result.recordset.stateCode", result.recordset);
      console.log("result", result);
      if (err) {
        res.status(500).send({});
      } else {
        if (result.recordset[0].stateCode === 400) {
          res.status(400).send({ result: result.recordset[0].message });
        } else {
          const objectResponseDataBase = {
            idRequestSignUp: result.recordset[0].idRequestSignUp,
            idUserSender: result.recordset[0].idUserSender,
            sender: result.recordset[0].sender,
            receiver: result.recordset[0].receiver,
            subject: result.recordset[0].subject,
            content: result.recordset[0].content,
            code: result.recordset[0].code,
            offset: offset,
          };
          //await executeEmailSentAES(objectResponseDataBase);
          executeMailTo(objectResponseDataBase);
          res.status(200).send({
            result: { idRequestSignUp: result.recordset[0].idRequestSignUp },
          });
        }
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};

const executeRequestSignUpVCFSU = async (param, res) => {
  const { idRequestSignUp, code, offset } = param;
  try {
    const request = new sql.Request();
    request.input("p_uidIdRequestSignUp", sql.VarChar, idRequestSignUp);
    request.input("p_vchCode", sql.VarChar, code);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("authSch.USPverifyCodeForSignUp", (err, result) => {
      if (err) {
        res.status(500).send({ result: "Error en los parametros" });
      } else {
        res
          .status(200)
          .send({
            result: { idRequestSignUp: result.recordset[0].idRequestSignUp },
          });
      }
    });
  } catch (error) {}
};

const ControllerRegister = {
  register: (req, res) => {
    const params = req.body;
    executeRegister(params, res);
  },
  mailto: (req, res) => {
    executeMailTo(res).catch(console.error);
  },
  customerType: (req, res) => {
    const params = req.body;
    executeCustomerTypeGAC(params, res);
  },
  personType: (req, res) => {
    const params = req.body;
    executePersonTypeGAP(params, res);
  },
  endorsement: (req, res) => {
    const params = req.body;
    executeEndorsementTypeGAE(params, res);
  },
  signUp: (req, res) => {
    const params = req.body;
    executeRequestSignUpPSU(params, res);
  },
  verifyCode: (req, res) => {
    const params = req.body;
    executeRequestSignUpVCFSU(params, res);
  },
};

module.exports = ControllerRegister;
