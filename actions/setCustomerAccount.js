const sql = require("mssql");
const rp = require("request-promise");
const crypto = require("crypto");
const executeMailTo = require("./sendInformationUser");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");

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

const verify = (signature, secret, payloadBody) => {
  let hash = crypto.createHmac("sha256", secret);
  hash = hash.update(payloadBody).digest("hex");
  console.log("hash2", hash);
  return hash === signature;
};

const executeMatiWebHook = async (req, res) => {
  const offset = process.env.OFFSET;
  const jsonServiceResponse = JSON.stringify(req.body);
  const xHeaderAWSKey = "szeePVZO157pgeFML92!|=|";
  let jsonVerificationData = null;
  // console.log("req.headers", req.headers);

  // // Mati hashes your webhook payload
  // const signature = crypto
  //   .createHmac("sha256", xHeaderAWSKey)
  //   .update(JSON.stringify(jsonServiceResponse))
  //   .digest("hex");
  // console.log("signature", signature);

  // const isValidPayload = verify(
  //   signature,
  //   xHeaderAWSKey,
  //   JSON.stringify(jsonServiceResponse)
  // );
  // console.log(isValidPayload);
  // await rp({
  //   url: GLOBAL_CONSTANTS.URL_SLACK_MESSAGE,
  //   method: "POST",
  //   headers: {
  //     encoding: "UTF-8",
  //     "Content-Type": "application/json",
  //   },
  //   json: true,
  //   body: {
  //     text: jsonServiceResponse,
  //   },
  //   rejectUnauthorized: false,
  // });
  try {
    if (
      req.body.eventName === "verification_updated" ||
      req.body.eventName === "verification_completed"
    ) {
      const response = await rp({
        url: "https://api.getmati.com/oauth",
        method: "POST",
        headers: {
          encoding: "UTF-8",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          user: "612d17a8ebca36001b36d7ab",
          pass: "R28HQ91X87T5GQ8D4DMGBG5GXNMTGX6W",
        },
        json: true,
        body: "grant_type=client_credentials",
        rejectUnauthorized: false,
      });
      const responseResource = await rp({
        url: req.body.resource,
        method: "GET",
        headers: {
          encoding: "UTF-8",
        },
        auth: {
          bearer: response.access_token,
        },
        json: true,
        rejectUnauthorized: false,
      });
      jsonVerificationData = JSON.stringify(responseResource);
    }
    // await rp({
    //   url: GLOBAL_CONSTANTS.URL_SLACK_MESSAGE,
    //   method: "POST",
    //   headers: {
    //     encoding: "UTF-8",
    //     "Content-Type": "application/json",
    //   },
    //   json: true,
    //   body: {
    //     text: `
    //   p_nvcJsonServiceResponse:
    //   ${jsonServiceResponse}

    //   p_nvcJsonVerificationData:
    //   ${jsonVerificationData}
    //   `,
    //   },
    //   rejectUnauthorized: false,
    // });
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_nvcJsonVerificationData", sql.NVarChar, jsonVerificationData)
      .input("p_nvcXHeaderAWSKey", sql.NVarChar, xHeaderAWSKey)
      .input("p_chrOffset", sql.Char, offset)
      .execute("matiSch.USPsetMatiWebHook");
    const resultRecordset = result.recordset;
    const resultRecordset1 =
      isNil(result.recordsets[1]) === false ? result.recordsets[1] : [];
    console.log("resultRecordset", resultRecordset);
    console.log("resultRecordset1", resultRecordset1);
    // for (const element of resultRecordset) {
    //   if (element.canSendEmail === true) {
    //     const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
    //     await executeMailTo({
    //       ...element,
    //       ...configEmailServer,
    //     });
    //   }
    // }
  } catch (err) {
    console.log("err", err);
    throw err;
  }
};

module.exports = {
  executeSetCustomerAccount,
  executesetConnectAccountWH,
  executeMatiWebHook,
};
