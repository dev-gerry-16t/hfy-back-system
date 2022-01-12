const rp = require("request-promise");
const GLOBAL_CONSTANTS = require("../constants/constants");

const executeSlackLogCatchBackend = async (params) => {
  const { storeProcedure, error, body = "" } = params;
  try {
    await rp({
      url: GLOBAL_CONSTANTS.URL_SLACK_MESSAGE,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: {
        text: `
        Ambiente: ${GLOBAL_CONSTANTS.APP_ENVIRONMENT}
        USP: ${storeProcedure}
        ------
        body: 
        ${body}
        ------
        Error:

        ${typeof error == "object" ? JSON.stringify(error, null, 2) : error}
                  `,
      },
      rejectUnauthorized: false,
    });
  } catch (error) {}
};

module.exports = executeSlackLogCatchBackend;
