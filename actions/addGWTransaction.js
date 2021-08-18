const sql = require("mssql");
const executeMailTo = require("./sendInformationUser");

const executeAddGWTransaction = async (params) => {
  const {
    idPaymentInContract = null,
    idOrderPayment = null,
    serviceIdPI = null,
    serviceIdPC = null,
    amount = null,
    last4 = null,
    type = null,
    status = null,
    funding = null,
    network = null,
    created = null,
    jsonServiceResponse = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
    count = 0,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_nvcIdPaymentInContract", sql.NVarChar, idPaymentInContract)
      .input("p_nvcIdOrderPayment", sql.NVarChar, idOrderPayment)
      .input("p_nvcServiceIdPI", sql.NVarChar, serviceIdPI)
      .input("p_nvcServiceIdPC", sql.NVarChar, serviceIdPC)
      .input("p_intAmount", sql.Int, amount)
      .input("p_nvcLast4", sql.NVarChar, last4)
      .input("p_nvcType", sql.NVarChar, type)
      .input("p_nvcStatus", sql.NVarChar, status)
      .input("p_nvcFunding", sql.NVarChar, funding)
      .input("p_nvcNetwork", sql.NVarChar, network)
      .input("p_nvcCreated", sql.NVarChar, created)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_intCount", sql.Int, count)
      .input("p_chrOffset", sql.Char, offset)
      .execute("pymtGwSch.USPaddGWTransaction");
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

module.exports = executeAddGWTransaction;
