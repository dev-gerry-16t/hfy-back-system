const sql = require("mssql");
const executeMailTo = require("./sendInformationUser");

const executeUpdateShortMessageService = async (params) => {
  const {
    idShortMessageService = null,
    idService = null,
    jsonServiceResponse = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_nvcIdShortMessageService", sql.NVarChar, idShortMessageService)
      .input("p_nvcIdService", sql.NVarChar, idService)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("comSch.USPupdateShortMessageService");
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

module.exports = executeUpdateShortMessageService;
