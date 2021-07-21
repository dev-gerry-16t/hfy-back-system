const sql = require("mssql");
const executeMailTo = require("./sendInformationUser");

const executeSetDispersionOrder = async (params) => {
  const {
    idDispersionOrder = null,
    jsonServiceResponse = null,
    ipAddress = null,
    offset = process.env.OFFSET,
    headerAws = null,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_uidIdDispersionOrder", sql.NVarChar, idDispersionOrder)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_nvcIpAddress", sql.NVarChar, ipAddress)
      .input("p_nvcXHeaderAWSKey", sql.NVarChar, headerAws)
      .execute("stpSch.USPsetDispersionOrder");
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
    const { stateCode, message } = resultRecordset[0];
    return { stateCode, message };
  } catch (error) {
    throw error;
  }
};

const executeSetCollection = async (params) => {
  const {
    jsonServiceResponse = null,
    ipAddress = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_nvcIpAddress", sql.NVarChar, ipAddress)
      .execute("stpSch.USPsetCollection");
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
    const { causaDevolucion, id, stateCode, message } = resultRecordset[0];
    return { id: causaDevolucion, stateCode, message };
  } catch (error) {
    throw error;
  }
};

const executeValidateCollAndDisp = async (params) => {
  const { jsonServiceResponse = null, offset = process.env.OFFSET } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_chrOffset", sql.Char, offset)
      .execute("stpSch.USPvalidateCollAndDisp");
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
    return "ok";
  } catch (error) {
    throw error;
  }
};

module.exports = {
  executeSetDispersionOrder,
  executeSetCollection,
  executeValidateCollAndDisp,
};
