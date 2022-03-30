const sql = require("mssql");
const rp = require("request-promise");
const executeMailToV2 = require("../actions/sendInformationUser");
const GLOBAL_CONSTANTS = require("../constants/constants");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");

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

const executeCustomerTypeGAC = async (param, res) => {
  const { idType } = param;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_intType", sql.Int, idType)
      .execute("catCustomerSch.USPgetAllCustomerTypes");
    res.status(200).send({ result: result.recordset });
  } catch (error) {
    res.status(500).send({ result: [] });
  }
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

const executeRequestSignUpPSU = async (param, res, ip) => {
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
    offset = process.env.OFFSET,
    idInvitation = null,
    hasAcceptedTC = 1,
    idCountryNationality = null,
    captchaToken,
    idContact = null,
  } = param;

  try {
    const responseGoogle = await rp({
      url: `https://www.google.com/recaptcha/api/siteverify`,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
      body: `secret=${GLOBAL_CONSTANTS.RECAPTCHA_VERIFY_KEY}&response=${captchaToken}&remoteip=${ip}`,
      rejectUnauthorized: false,
    });
    const { success, score } = responseGoogle;
    // if (success === true && score > 0.5) {
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
    request.input("p_bitHasAcceptedTC", sql.Bit, hasAcceptedTC);
    request.input("p_nvcIdInvitation", sql.NVarChar, idInvitation);
    request.input("p_nvcRequestedFromIP", sql.NVarChar, ip);
    request.input("p_intIdCountryNationality", sql.Int, idCountryNationality);
    request.input("p_nvcIdContact", sql.NVarChar, idContact);
    request.execute("authSch.USPrequestSignUp", async (err, result, value) => {
      if (err) {
        executeSlackLogCatchBackend({
          storeProcedure: "authSch.USPrequestSignUp",
          error: err,
        });
        res.status(500).send({});
      } else {
        const resultRecordset = result.recordset;
        const resultRecordsetObject = result.recordset[0];
        if (resultRecordsetObject.stateCode !== 200) {
          res.status(resultRecordsetObject.stateCode).send({
            response: {
              message: resultRecordsetObject.message,
              idRequestSignUp: resultRecordsetObject.idRequestSignUp,
            },
          });
        } else {
          for (const element of resultRecordset) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailToV2({
              ...element,
              ...configEmailServer,
              idInvitation,
              offset,
            });
          }
          res.status(200).send({
            result: {
              idRequestSignUp: resultRecordsetObject.idRequestSignUp,
            },
          });
        }
      }
    });
    // } else {
    //   res.status(500).send({
    //     response: "Detectamos un problema de seguridad, intenta nuevamente",
    //   });
    // }
  } catch (error) {
    console.log("error", error);
  }
};

const executeRequestSignUpVCFSU = async (param, res) => {
  const {
    idRequestSignUp,
    code,
    offset = process.env.OFFSET,
    idInvitation = null,
  } = param;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdRequestSignUp", sql.NVarChar, idRequestSignUp);
    request.input("p_vchCode", sql.VarChar, code);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcIdInvitation", sql.NVarChar, idInvitation);
    request.execute("authSch.USPverifyCodeForSignUp", (err, result) => {
      if (err) {
        console.log("error", err);
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset[0];
        if (resultRecordset.stateCode !== 200) {
          res.status(resultRecordset.stateCode).send({
            response: {
              message: resultRecordset.message,
              idRequestSignUp: resultRecordset.idRequestSignUp,
            },
          });
        } else {
          result.recordset.forEach((element) => {
            if (element.canSendEmail === true) {
              const configEmailServer = JSON.parse(
                element.jsonEmailServerConfig
              );
              executeMailToV2({
                ...element,
                ...configEmailServer,
              });
            }
          });
          res.status(200).send({
            response: { idRequestSignUp: resultRecordset.idRequestSignUp },
          });
        }
      }
    });
  } catch (error) {}
};

const executeGetInvitation = async (param, res) => {
  const { idInvitation } = param;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdInvitation", sql.NVarChar, idInvitation);
    request.execute("customerSch.USPgetInvitation", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset[0];
        res.status(200).send({
          response: resultRecordset,
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
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeRequestSignUpPSU(params, res, ipPublic);
  },
  verifyCode: (req, res) => {
    const params = req.body;
    executeRequestSignUpVCFSU(params, res);
  },
  getInvitation: (req, res) => {
    const params = req.params;
    executeGetInvitation(params, res);
  },
};

module.exports = ControllerRegister;
