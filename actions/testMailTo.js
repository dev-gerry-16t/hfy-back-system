const nodemailer = require("nodemailer");
var mandrillTransport = require("nodemailer-mandrill-transport");

const executeTestMailToNotification = async (params) => {
  console.log("params", params);
  const { content = "<strong>HOLA Mundo</strong>", subject = "TEST" } = params;

  // const transporter = nodemailer.createTransport({
  //   host: "smtp.mandrillapp.com",
  //   auth: {
  //     user: "HOMIFY",
  //     pass: "pkcHX8AIJA2Yg-p65CLpzw",
  //   },
  //   port: 587,
  //   logger: true, // log to console
  //   debug: true, // include SMTP traffic in the logs
  // });
  const mailOptions = {
    from: "Homify <no-reply@homify.ai>",
    bcc: "lnhinojosa@homify.ai,gerardoaldair@hotmail.com",
    subject,
    html: content,
  };
  try {
    const transport = nodemailer.createTransport(
      mandrillTransport({
        auth: {
          apiKey: "pkcHX8AIJA2Yg-p65CLpzw",
        },
      })
    );
    await transport.sendMail(mailOptions);
    console.log("ok");
  } catch (error) {
    console.log(`Error al enviar correo: ${error}`);
  }
};

module.exports = executeTestMailToNotification;
