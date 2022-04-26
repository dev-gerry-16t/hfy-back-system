const sql = require("mssql");
const nodemailer = require("nodemailer");
const mandrillTransport = require("nodemailer-mandrill-transport");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../constants/constants");
const executeSlackLogCatchBackend = require("./slackLogCatchBackend");

const executeEmailSentAES = async (param) => {
  const {
    idEmailStatus = null,
    idEmailTemplate = null,
    idRequestSignUp = null,
    idUserSender = null,
    idUserReceiver = null,
    sender = null,
    receiver = null,
    subject = null,
    content = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
    idInvitation = null,
  } = param;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_intIdEmailStatus", sql.Int, idEmailStatus)
      .input("p_intIdEmailTemplate", sql.Int, idEmailTemplate)
      .input("p_nvcIdRequesSignUp", sql.NVarChar, idRequestSignUp)
      .input("p_nvcIdUserSender", sql.NVarChar, idUserSender)
      .input("p_nvcIdUserReceiver", sql.NVarChar, idUserReceiver)
      .input("p_nvcSender", sql.NVarChar, sender)
      .input("p_nvcReceiver", sql.NVarChar, receiver)
      .input("p_nvcSubject", sql.NVarChar, subject)
      .input("p_nvcContent", sql.NVarChar, content)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, null)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_nvcIdInvitation", sql.NVarChar, idInvitation)
      .execute("comSch.USPaddEmailSent");
    const resultRecordsetObject =
      isEmpty(result.recordset) === false &&
      isNil(result.recordset[0]) === false &&
      isEmpty(result.recordset[0]) === false
        ? result.recordset[0]
        : {};
    if (isEmpty(resultRecordsetObject) === false) {
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure: "comSch.USPaddEmailSent",
          error: resultRecordsetObject.errorMessage,
          body: params,
        });
      } else {
        return resultRecordsetObject;
      }
    } else {
      throw "No se encontraron parámetros de salida en el USP comSch.USPaddEmailSent";
    }
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure: "comSch.USPaddEmailSent",
      error,
      body: params,
    });
  }
};

const executeMailTo = async (params) => {
  const { receiver, content, pass, subject, sender, tags = null } = params;
  try {
    const { idEmailSent } = await executeEmailSentAES(params);
    const transporter = await nodemailer.createTransport(
      mandrillTransport({
        auth: {
          apiKey: pass,
        },
      })
    );
    const message = {};

    if (isNil(idEmailSent) === false) {
      message.metadata = {
        idEmailSent,
      };
    }
    if (isNil(tags) === false && isEmpty(tags) === false) {
      message.tags = JSON.parse(tags);
    }
    const mailOptions = {
      from: sender,
      bcc: receiver,
      subject,
      html: content,
      mandrillOptions: {
        message,
      },
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure: "Nodemailer or mandrill error",
      error,
      body: params,
    });
  }
};

module.exports = executeMailTo;
