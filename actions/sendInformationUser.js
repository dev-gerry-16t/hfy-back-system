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
    request.input("p_nvcIdInvitation", sql.NVarChar, idInvitation);
    await request.execute("comSch.USPaddEmailSent", async (err, result) => {
      if (err) {
        console.log("err", err);
      } else {
        console.log("success");
      }
    });
  } catch (error) {}
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
    if (error) {
      console.log("send error mail", error);
    } else {
      console.log("send success mail");
      executeEmailSentAES(params);
    }
  });
};

module.exports = executeMailTo;
