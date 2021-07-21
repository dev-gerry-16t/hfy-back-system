const nodemailer = require("nodemailer");

const executeMailToNotification = async (params) => {
  const { content, subject } = params;
  const transporter = nodemailer.createTransport({
    auth: {
      user: "notificaciones@homify.ai",
      pass: "5#2i$$14pdh#",
    },
    host: "giowm1210.siteground.biz",
    port: 465,
  });
  const mailOptions = {
    from: "Backend <notificaciones@homify.ai>",
    to: "gagonzalez@homify.ai",
    subject,
    html: content,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(`Error al enviar correo: ${error}`);
  }
};

module.exports = executeMailToNotification;
