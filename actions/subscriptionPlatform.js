const sql = require("mssql");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");
const executeMailTo = require("../actions/sendInformationUser");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");

const executeSetSubscriptionWebhook = async (params, offset) => {
  const jsonServiceResponse =
    isEmpty(params) === false ? JSON.stringify(params) : "{}";
  const storeProcedure = "pymtGwSch.USPsetSubscriptionWebhook";
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input(
        "p_nvcJsonServiceResponse",
        sql.NVarChar(sql.MAX),
        jsonServiceResponse
      )
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
    const resultRecordset =
      isNil(result.recordset) === false ? result.recordset : [];
    const resultRecordsetObject =
      isEmpty(resultRecordset) === false && isNil(resultRecordset[0]) === false
        ? resultRecordset[0]
        : {};
    if (
      isEmpty(resultRecordsetObject) === false &&
      resultRecordsetObject.stateCode !== 200
    ) {
      executeSlackLogCatchBackend({
        storeProcedure,
        error: resultRecordsetObject.errorMessage,
        body: params,
      });
    } else {
      if (resultRecordsetObject.updateSubscription === true) {
        await stripe.subscriptions.update(
          resultRecordsetObject.id,
          JSON.parse(resultRecordsetObject.jsonRequest)
        );
      }
      for (const element of resultRecordset) {
        if (element.canSendEmail === true) {
          const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
          await executeMailTo({
            ...element,
            ...configEmailServer,
          });
        }
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
  }
};

module.exports = executeSetSubscriptionWebhook;
