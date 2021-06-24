const sql = require("mssql");
const nodemailer = require("nodemailer");
const GLOBAL_CONSTANTS = require("../constants/constants");

const executeEmailSentAES = async (param) => {
  const {
    idEmailStatus = 1,
    idEmailTemplate = 1,
    idRequestSignUp = null,
    idUserSender = null,
    idUserReceiver = null,
    sender = null,
    receiver = null,
    subject = null,
    content = null,
    jsonServiceResponse = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
    jsonEmailServerConfig = null,
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
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_nvcIdInvitation", sql.NVarChar, idInvitation)
      .execute("comSch.USPaddEmailSent");
    return result;
  } catch (error) {
    return error;
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
  try {
    await transporter.sendMail(mailOptions);
    await executeEmailSentAES(params);
    console.log("correo enviado");
  } catch (error) {
    console.log(`Error al enviar correo: ${error}`);
  }
};

module.exports = executeMailTo;
