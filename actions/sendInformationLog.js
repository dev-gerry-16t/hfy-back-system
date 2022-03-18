const nodemailer = require("nodemailer");
const mandrillTransport = require("nodemailer-mandrill-transport");

const executeMailToNotification = async (params) => {
  const { content, subject } = params;
  const transporter = nodemailer.createTransport(
    mandrillTransport({
      auth: {
        apiKey: pass,
      },
    })
  );
  const mailOptions = {
    from: "Backend <notificaciones@homify.ai>",
    bcc: "gagonzalez@homify.ai",
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
