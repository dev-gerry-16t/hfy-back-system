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
  const { receiver, content, user, pass, host, port, subject } = params;

  const transporter = nodemailer.createTransport({
    auth: {
      user,
      pass,
    },
    host,
    port,
  });
  const mailOptions = {
    from: user,
    to: receiver,
    subject,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    console.log("error mail", error);
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
    idUserReceiver = null,
    sender,
    receiver,
    subject,
    content,
    jsonServiceResponse = [],
    offset,
    jsonEmailServerConfig,
  } = param;
  console.log("param", jsonEmailServerConfig);
  const configEmailServer = JSON.parse(jsonEmailServerConfig);
  try {
    const request = new sql.Request();
    request.input("p_intIdEmailStatus", sql.Int, idEmailStatus);
    request.input("p_intIdEmailTemplate", sql.Int, idEmailTemplate);
    request.input("p_nvcIdRequesSignUp", sql.NVarChar, idRequestSignUp);
    request.input("p_nvcIdUserSender", sql.NVarChar, idUserSender);
    request.input("p_nvcIdUserReceiver", sql.NVarChar, idUserReceiver);
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
    await request.execute("comSch.USPaddEmailSent", async (err, result) => {
      if (err) {
        console.log("err", err);
      } else if (result) {
        await executeMailTo({
          sender,
          receiver,
          content,
          subject,
          offset,
          ...configEmailServer,
        });
      }
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
      if (err) {
        res.status(500).send({});
      } else {
        if (result.recordset[0].stateCode === 400) {
          res.status(400).send({ result: result.recordset[0].message });
        } else {
          const objectResponseDataBase = { offset, ...result.recordset[0] };
          await executeEmailSentAES(objectResponseDataBase);
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
    request.input("p_nvcIdRequestSignUp", sql.NVarChar, idRequestSignUp);
    request.input("p_vchCode", sql.VarChar, code);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("authSch.USPverifyCodeForSignUp", (err, result) => {
      if (err) {
        console.log("error", err);
        res.status(500).send({ result: "Error en los parametros" });
      } else {
        res.status(200).send({
          result: { idRequestSignUp },
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
