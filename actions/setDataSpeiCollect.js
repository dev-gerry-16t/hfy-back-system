const sql = require("mssql");
const executeMailTo = require("./sendInformationUser");

const executeSetDispersionOrder = async (params) => {
  const {
    idDispersionOrder = null,
    jsonServiceResponse = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_uidIdDispersionOrder", sql.NVarChar, idDispersionOrder)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_chrOffset", sql.Char, offset)
      .execute("stpSch.USPsetDispersionOrder");
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

const executeSetCollection = async (params) => {
  const { jsonServiceResponse = null, offset = process.env.OFFSET } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_chrOffset", sql.Char, offset)
      .execute("stpSch.USPsetCollection");
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
    const { causaDevolucion, id, stateCode } = resultRecordset[0];
    return { id: causaDevolucion, stateCode };
  } catch (error) {
    throw error;
  }
};

module.exports = { executeSetDispersionOrder, executeSetCollection };
