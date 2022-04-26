const nodemailer = require("nodemailer");
const mandrillTransport = require("nodemailer-mandrill-transport");
const GLOBAL_CONSTANTS = require("../constants/constants");

const smtpTransporter = nodemailer.createTransport(
    mandrillTransport({
      auth: {
        apiKey: GLOBAL_CONSTANTS.KEY_MANDRILL,
      },
    })
  );

module.exports = smtpTransporter;
