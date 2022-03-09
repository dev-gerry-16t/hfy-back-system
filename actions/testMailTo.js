const nodemailer = require("nodemailer");

const executeTestMailToNotification = async (params) => {
  const { content = "HOLA", subject = "TEST" } = params;
  const transporter = nodemailer.createTransport({
    auth: {
      user: "gagonzalez@homify.ai",
      pass: "Galdair1612#",
    },
    host: "smtp.gmail.com",
    port: 465,
  });
  const mailOptions = {
    from: "Prueba <gagonzalez@homify.ai>",
    to: "gerardoaldair@hotmail.com",
    subject,
    html: content,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error al enviar correo: ${error}`);
  }
};

module.exports = executeTestMailToNotification;
