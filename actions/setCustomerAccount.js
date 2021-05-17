const sql = require("mssql");
const executeMailTo = require("./sendInformationUser");

const executeSetCustomerAccount = async (params) => {
  const {
    idContract,
    idCustomer,
    idConnectAccount,
    idConnectAccountPerson,
    createdConnectAccount,
    jsonServiceResponseAccount,
    jsonServiceResponsePerson,
    isActive = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
    idAccount = null,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdConnectAccount", sql.NVarChar, idConnectAccount)
      .input(
        "p_nvcIdConnectAccountPerson",
        sql.NVarChar,
        idConnectAccountPerson
      )
      .input("p_nvcCreatedConnectAccount", sql.NVarChar, createdConnectAccount)
      .input(
        "p_nvcJsonServiceResponseAccount",
        sql.NVarChar,
        jsonServiceResponseAccount
      )
      .input(
        "p_nvcJsonServiceResponsePerson",
        sql.NVarChar,
        jsonServiceResponsePerson
      )
      .input("p_bitIsActive", sql.Bit, isActive)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_nvcIdAccount", sql.NVarChar, idAccount)
      .execute("pymtGwSch.USPsetCustomerAccount");
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

const executesetConnectAccountWH = async (params) => {
  const {
    idConnectAccount,
    idBankAccount,
    created = null,
    isActive = null,
    jsonServiceResponse,
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdConnectAccount", sql.NVarChar, idConnectAccount)
      .input("p_nvcIdBankAccount", sql.NVarChar, idBankAccount)
      .input("p_nvcCreated", sql.NVarChar, created)
      .input("p_bitIsActive", sql.Bit, isActive)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("pymtGwSch.USPsetConnectAccountWH");
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

module.exports = { executeSetCustomerAccount, executesetConnectAccountWH };
