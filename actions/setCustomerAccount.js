const sql = require("mssql");
const AWS = require("aws-sdk");
const rp = require("request-promise");
const crypto = require("crypto");
const executeMailTo = require("./sendInformationUser");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const executeSlackLogCatchBackend = require("./slackLogCatchBackend");
const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const verify = (signature, secret, payloadBody) => {
  let hash = crypto.createHmac("sha256", secret);
  hash = hash.update(payloadBody).digest("hex");
  return hash === signature;
};

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

const executeAddCustomerDocument = async (params) => {
  const {
    idCustomer,
    idDocument,
    type,
    idSystemUser,
    idLoginHistory,
    offset,
    idVerificationProcess,
  } = params;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_uidIdDocument", sql.NVarChar, idDocument)
      .input("p_intType", sql.Int, type)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_uidIdVerificationProcess", sql.NVarChar, idVerificationProcess)
      .execute("customerSch.USPaddCustomerDocument");
    const resultRecordset = result.recordset[0];
    if (resultRecordset.stateCode !== 200) {
      throw resultRecordset.errorMessage;
    }
    return true;
  } catch (err) {
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
        customerSch.USPaddCustomerDocument:
      ${err}
      `,
      },
      rejectUnauthorized: false,
    });
    return false;
  }
};

const executeAddDocument = async (params) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory = null,
    offset,
    documentName = null,
    preview = null,
    thumbnail = null,
    idDocumentType,
    type,
    resource,
    idVerificationProcess,
  } = params;

  try {
    const response = await rp({
      url: resource,
      method: "GET",
      encoding: null,
      resolveWithFullResponse: true,
    });
    const stringWord = response.headers["content-type"];
    const separate =
      isNil(stringWord) === false && isEmpty(stringWord) === false
        ? stringWord.split("/")
        : "";
    const extension =
      isNil(separate) === false &&
      isNil(separate) === false &&
      isNil(separate[1]) === false
        ? separate[1]
        : "";
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_nvcDocumentName", sql.NVarChar, documentName)
      .input("p_nvcExtension", sql.NVarChar, extension)
      .input("p_nvcPreview", sql.NVarChar, preview)
      .input("p_nvcThumbnail", sql.NVarChar, thumbnail)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intIdDocumentType", sql.Int, idDocumentType)
      .execute("documentSch.USPaddDocument");

    const resultRecordset = result.recordset[0];
    if (resultRecordset.stateCode !== 200) {
      throw resultRecordset.errorMessage;
    } else {
      const bucketSource =
        isNil(resultRecordset.bucketSource) === false
          ? resultRecordset.bucketSource.toLowerCase()
          : "";
      const bufferFile = Buffer.from(response.body, "utf8");
      const paramsFileAws = {
        Bucket: bucketSource,
        Key: resultRecordset.idDocument,
        Body: bufferFile,
      };
      await s3.upload(paramsFileAws).promise();
      await executeAddCustomerDocument({
        idCustomer,
        idDocument: resultRecordset.idDocument,
        type,
        idSystemUser,
        idLoginHistory,
        idVerificationProcess,
        offset,
      });
      return true;
    }
  } catch (err) {
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
        documentSch.USPaddDocument:
      ${err}
      `,
      },
      rejectUnauthorized: false,
    });
    return false;
  }
};

const executeMatiWebHook = async (req) => {
  const headers = req.headers;
  const offset = process.env.OFFSET;
  const jsonServiceResponse = JSON.stringify(req.body);
  const xHeaderAWSKey = GLOBAL_CONSTANTS.MATI_WEBHOOK_SECRET;
  const signatureMati = headers["x-signature"];
  let jsonVerificationData = null;
  const isValidPayload = verify(
    signatureMati,
    xHeaderAWSKey,
    jsonServiceResponse
  );

  try {
    if (isValidPayload === true) {
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
            user: GLOBAL_CONSTANTS.USER_GET_MATI,
            pass: GLOBAL_CONSTANTS.PASS_GET_MATI,
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
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
        .input("p_nvcJsonVerificationData", sql.NVarChar, jsonVerificationData)
        .input("p_nvcXHeaderAWSKey", sql.NVarChar, xHeaderAWSKey)
        .input("p_chrOffset", sql.Char, offset)
        .execute("matiSch.USPsetMatiWebHook");
      const resultRecordset = result.recordset;
      if (resultRecordset[0].stateCode !== 200) {
        throw resultRecordset[0].errorMessage;
      } else {
        const resultRecordset1 =
          isNil(result.recordsets[1]) === false ? result.recordsets[1] : [];
        let uploadMedia;
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
          uploadMedia = element.canUploadMedia;
        }
        if (uploadMedia === true) {
          for (const element of resultRecordset1) {
            await executeAddDocument({
              idCustomer: element.idCustomer,
              idSystemUser: element.idSystemUser,
              idLoginHistory: null,
              offset: GLOBAL_CONSTANTS.OFFSET,
              documentName: null,
              preview: null,
              thumbnail: null,
              idDocumentType: element.idDocumentType,
              type: element.type,
              resource: element.resource,
              idVerificationProcess: element.idVerificationProcess,
            });
          }
        }
      }
    } else {
      throw "Token invalido, el webhook no proviene de nuestros servicios";
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure: "matiSch.USPsetMatiWebHook",
      error: err,
      body: jsonServiceResponse,
    });
  }
};

module.exports = {
  executeSetCustomerAccount,
  executesetConnectAccountWH,
  executeMatiWebHook,
};
