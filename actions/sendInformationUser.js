const sql = require("mssql");
const nodemailer = require("nodemailer");
const mandrillTransport = require("nodemailer-mandrill-transport");

const executeMailTo = async (params, res) => {
  const { receiver, content, user, pass, host, port, subject, sender } = params;
  const transporter = nodemailer.createTransport(
    mandrillTransport({
      auth: {
        apiKey: pass,
      },
    })
  );
  const mailOptions = {
    from: sender,
    bcc: receiver,
    subject,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error);
      res
        .status(500)
        .send({ result: "El sistema de envío de correos ha fallado" });
    } else {
      res.status(200).send({
        result: {
          idRequestPasswordRecovery: params.idRequestPasswordRecovery,
          message: params.message,
        },
      });
    }
  });
};

module.exports = executeMailTo;
