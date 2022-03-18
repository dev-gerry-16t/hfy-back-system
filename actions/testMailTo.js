const nodemailer = require("nodemailer");

const executeTestMailToNotification = async (params) => {
  console.log('params',params);
  const { content = "HOLA", subject = "TEST" } = params;
  const transporter = nodemailer.createTransport({
    auth: {
      user: "HOMIFY",
      pass: "pkcHX8AIJA2Yg-p65CLpzw",
    },
    host: "smtp.mandrillapp.com",
    port: 587,
  });
  const mailOptions = {
    from: "Prueba",
    to: "gerardoaldair@hotmail.com",
    subject,
    html: content,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("ok");
  } catch (error) {
    console.log(`Error al enviar correo: ${error}`);
  }
};

module.exports = executeTestMailToNotification;
