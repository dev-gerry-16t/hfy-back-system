const sql = require("mssql");
const executeMailTo = require("./sendInformationUser");

const executeUpdateShortMessageService = async (params) => {
  const {
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
    idShortMessageService = null,
    serviceSID = null,
    serviceAccountSID = null,
    serviceChatSID = null,
    status = null,
    sentAt = null,
    jsonServiceResponse = null,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_nvcIdShortMessageService", sql.NVarChar, idShortMessageService)
      .input("p_nvcServiceSID", sql.NVarChar, serviceSID)
      .input("p_nvcServiceAccountSID", sql.NVarChar, serviceAccountSID)
      .input("p_nvcServiceChatSID", sql.NVarChar, serviceChatSID)
      .input("p_nvcStatus", sql.NVarChar, status)
      .input("p_dtoSentAt", sql.DateTimeOffset, sentAt)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("comSch.USPupdateShortMessageService");
    const resultRecordset = result.recordset;
    resultRecordset.forEach((element) => {
      if (element.canSendEmail === true) {
        const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
        executeMailTo({
          ...element,
          ...configEmailServer,
        });
      }
    });
    return resultRecordset;
  } catch (error) {
    throw error;
  }
};

module.exports = executeUpdateShortMessageService;
