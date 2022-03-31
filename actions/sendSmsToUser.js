const GLOBAL_CONSTANTS = require("../constants/constants");
const accountSid = GLOBAL_CONSTANTS.TWILIO_ACCOUNT_SID;
const authToken = GLOBAL_CONSTANTS.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const executeSendSmsToUser = async (param) => {
  const { from, content, countryCode, phoneNumber } = param;
  try {
    await client.messages.create({
      to: `${countryCode}${phoneNumber}`,
      from: from,
      body: content,
    });
  } catch (error) {
    throw error;
  }
};

module.exports = executeSendSmsToUser;
