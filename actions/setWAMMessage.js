const sql = require("mssql");
const executeMailTo = require("./sendInformationUser");
const rp = require("request-promise");

const executeSetWAMessageResponse = async (params) => {
  const {
    idShortMessageService = null,
    idService = null,
    idChat = null,
    jsonACKResponse = null,
    jsonMessageResponse = null,
    jsonServiceResponse = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_uidIdShortMessageService", sql.NVarChar, idShortMessageService)
      .input("p_nvcIdService", sql.NVarChar, idService)
      .input("p_nvcIdChat", sql.NVarChar, idChat)
      .input("p_nvcJsonACKResponse", sql.NVarChar, jsonACKResponse)
      .input("p_nvcJsonMessageResponse", sql.NVarChar, jsonMessageResponse)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("comSch.USPsetWAMessage");
    const resultRecordset = result.recordset;
    for (const element of resultRecordset) {
      if (element.canSendEmail === true) {
        const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
        await executeMailTo({
          ...element,
          ...configEmailServer,
        });
      }
    }
    return resultRecordset;
  } catch (error) {
    throw error;
  }
};

const executeSetWAMessage = async (params) => {
  const {
    idShortMessageService = null,
    idService = null,
    idChat = null,
    jsonACKResponse = null,
    jsonMessageResponse = null,
    jsonServiceResponse = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_uidIdShortMessageService", sql.NVarChar, idShortMessageService)
      .input("p_nvcIdService", sql.NVarChar, idService)
      .input("p_nvcIdChat", sql.NVarChar, idChat)
      .input("p_nvcJsonACKResponse", sql.NVarChar, jsonACKResponse)
      .input("p_nvcJsonMessageResponse", sql.NVarChar, jsonMessageResponse)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("comSch.USPsetWAMessage");
    const resultRecordset = result.recordset;
    for (const element of resultRecordset) {
      if (element.canSendEmail === true) {
        const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
        await executeMailTo({
          ...element,
          ...configEmailServer,
        });
      }
      if (element.shouldBeReplied === true) {
        const url = `https://api.chat-api.com/instance${element.instanceId}/message?token=${element.token}`;
        const response = await rp({
          url,
          method: "POST",
          headers: {
            encoding: "UTF-8",
            "Content-Type": "application/json",
          },
          json: true,
          body: {
            phone: element.phoneNumber,
            body: element.smsContent,
          },
          rejectUnauthorized: false,
        });
        const { id } = response;
        await executeSetWAMessageResponse({
          idShortMessageService: element.idShortMessageService,
          idService: id,
          jsonServiceResponse: JSON.stringify(response),
        });
      }
    }
    return resultRecordset;
  } catch (error) {
    throw error;
  }
};

module.exports = executeSetWAMessage;
