const sql = require("mssql");
const AWS = require("aws-sdk");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module");
const PizZip = require("pizzip");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");
const nodemailer = require("nodemailer");
const rp = require("request-promise");
const GLOBAL_CONSTANTS = require("../constants/constants");
const replaceConditionsDocx = require("../actions/conditions");
const executeMailToV2 = require("../actions/sendInformationUser");
const CryptoHandler = require("../actions/cryptoHandler");
const executeMailToNotification = require("../actions/sendInformationLog");
const {
  executeSetDispersionOrder,
  executeValidateCollAndDisp,
} = require("../actions/setDataSpeiCollect");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const base64DataURLToArrayBuffer = (dataURL) => {
  const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) {
    return false;
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  let binaryString;
  if (typeof window !== "undefined") {
    binaryString = window.atob(stringBase64);
  } else {
    binaryString = Buffer.from(stringBase64, "base64").toString("binary");
  }
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
};

const imageOpts = {
  getImage(tag) {
    return base64DataURLToArrayBuffer(tag);
  },
  getSize() {
    return [300, 100];
  },
};

const executeGetCustomerById = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetCustomerById", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeTenantCoincidences = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    topIndex = null,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetCustomerTenantCoincidences",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddProperty = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    street,
    suite,
    streetNumber,
    neighborhood,
    city,
    state,
    idZipCode,
    firstStreetReference,
    secondStreetReference,
    totalSuites,
    departament,
    offset = process.env.OFFSET,
  } = params;
  try {
    const parseDepartment = JSON.stringify(departament);
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcStreet", sql.NVarChar, street);
    request.input("p_nvcSuite", sql.NVarChar, suite);
    request.input("p_nvcStreetNumber", sql.NVarChar, streetNumber);
    request.input("p_nvcNeighborhood", sql.NVarChar, neighborhood);
    //request.input("p_nvcState", sql.NVarChar, state);
    request.input("p_nvcCity", sql.NVarChar, city);
    //request.input("p_nvcZipCode", sql.NVarChar, zipCode);
    request.input(
      "p_nvcFirstStreetReference",
      sql.NVarChar,
      firstStreetReference
    );
    request.input(
      "p_nvcSecondStreetReference",
      sql.NVarChar,
      secondStreetReference
    );
    request.input("p_intTotalSuites", sql.Int, totalSuites);
    request.input("p_nvcDepartment", sql.NVarChar, parseDepartment);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intIdZipCode", sql.Int, idZipCode);
    request.execute("customerSch.USPaddProperty", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        const statusResponse = resultRecordset[0].stateCode;
        res.status(statusResponse).send({
          response: resultRecordset[0],
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllProperties = async (params, res) => {
  const { idCustomer, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "customerSch.USPgetAllCustomerProperties",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetStatsChart = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    jsonConditions = [],
    offset = process.env.OFFSET,
  } = params;
  const parseConditions = JSON.stringify(jsonConditions);
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcJsonCondition", sql.NVarChar, parseConditions);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetCustomerStatsChart", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        const resultParse = JSON.parse(resultRecordset[0].result);
        res.status(200).send({
          response: resultParse,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllApartments = async (params, res) => {
  const { idCustomer, idSystemUser, idLoginHistory, idProperty, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdProperty", sql.NVarChar, idProperty);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "customerSch.USPgetAllCustomerApartments",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetCustomerTenants = async (params, res) => {
  const { idCustomer, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("customerSch.USPgetAllCustomerTenants", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetTenantsById = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    idCustomerTenant,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetCustomerTenantById", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllBanks = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    type,
    clabe = null,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.input("p_nvcClabe", sql.NVarChar, clabe);
    request.execute("catPaymentSch.USPgetAllBanks", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAdressZipCode = async (params, res) => {
  const { idCustomer, idSystemUser, idLoginHistory, type, zipCode } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcZipCode", sql.NVarChar, zipCode);
    request.input("p_intType", sql.Int, type);
    request.execute("addressSch.USPgetAddressByZipCode", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset1 = result.recordsets[0];
        const resultRecordset2 = result.recordsets[1];
        res.status(200).send({
          response1: resultRecordset1,
          response2: resultRecordset2,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllPayments = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    type,
    idCustomerTenant,
    idContract,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_intType", sql.Int, type);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("catPaymentSch.USPgetAllPaymentTypes", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllPaymentInContract = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    idCustomerTenant,
    idContract,
    idIncidence,
    idPaymentType,
    paymentDate,
    amount,
    advancingRents,
    documents,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdIncidence", sql.NVarChar, idIncidence);
    request.input("p_intIdPaymentType", sql.Int, idPaymentType);
    request.input("p_datPaymentDate", sql.Date, paymentDate);
    request.input("p_decAmount", sql.Decimal(19, 2), amount);
    request.input("p_intAdvancingRents", sql.Int, advancingRents);
    request.input("p_nvcDocuments", sql.NVarChar, documents);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("paymentSch.USPaddPaymentInContract", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: resultRecordset });
        } else {
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeRequestAdvance = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    idContract,
    accountHolder,
    accountNumber,
    clabeNumber,
    idBank,
    bankBranch,
    offset = process.env.OFFSET,
    totalRentsRequested,
    totalPeriod,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcAccountHolder", sql.NVarChar, accountHolder);
    request.input("p_nvcAccountNumber", sql.NVarChar, accountNumber);
    request.input("p_nvcClabeNumber", sql.NVarChar, clabeNumber);
    request.input("p_nvcBankBranch", sql.NVarChar, bankBranch);
    request.input("p_nvcIdBank", sql.NVarChar, idBank);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intTotalRentsRequested", sql.Int, totalRentsRequested);
    request.input("p_intTotalPeriod", sql.Int, totalPeriod);
    request.execute("customerSch.USPrequestAdvancePymt", (err, result) => {
      if (err) {
        res.status(500).send({
          response: { message: "Error en los parametros", messageType: err },
        });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: {
              message: resultRecordset[0].message,
            },
          });
        } else {
          resultRecordset.forEach((element) => {
            if (element.canSendEmail === true) {
              const configEmailServer = JSON.parse(
                element.jsonEmailServerConfig
              );
              executeMailToV2({
                ...element,
                ...configEmailServer,
              });
            }
          });
          res.status(200).send({
            response: {
              idRequestAdvancePymt: resultRecordset[0].idRequestAdvancePymt,
            },
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeMailTo = async (params) => {
  const { receiver, content, user, pass, host, port, subject, sender } = params;
  const transporter = nodemailer.createTransport({
    auth: {
      user,
      pass,
    },
    host,
    port,
  });
  const mailOptions = {
    from: sender,
    to: receiver,
    subject,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    console.log("error mail", error);
  });
};

const executeEmailSentAES = async (param) => {
  const {
    idEmailStatus = 1,
    idEmailTemplate = 1,
    idRequestSignUp,
    idUserSender,
    idUserReceiver = null,
    sender,
    receiver,
    subject,
    content,
    jsonServiceResponse,
    offset = process.env.OFFSET,
    jsonEmailServerConfig,
    idInvitation,
  } = param;
  const configEmailServer = JSON.parse(jsonEmailServerConfig);
  try {
    const request = new sql.Request();
    request.input("p_intIdEmailStatus", sql.Int, idEmailStatus);
    request.input("p_intIdEmailTemplate", sql.Int, idEmailTemplate);
    request.input("p_nvcIdRequesSignUp", sql.NVarChar, idRequestSignUp);
    request.input("p_nvcIdUserSender", sql.NVarChar, idUserSender);
    request.input("p_nvcIdUserReceiver", sql.NVarChar, idUserReceiver);
    request.input("p_nvcSender", sql.NVarChar, sender);
    request.input("p_nvcReceiver", sql.NVarChar, receiver);
    request.input("p_nvcSubject", sql.NVarChar, subject);
    request.input("p_nvcContent", sql.NVarChar, content);
    request.input(
      "p_nvcJsonServiceResponse",
      sql.NVarChar,
      jsonServiceResponse
    );
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcIdInvitation", sql.NVarChar, idInvitation);
    await request.execute("comSch.USPaddEmailSent", async (err, result) => {
      if (err) {
        console.log("err", err);
      } else if (result) {
        await executeMailTo({
          sender,
          receiver,
          content,
          subject,
          offset,
          ...configEmailServer,
        });
      }
    });
  } catch (error) {}
};

const executeSendTenantInvitation = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    idApartment,
    idPersonType,
    givenName,
    lastName,
    mothersMaidenName,
    email,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdApartment", sql.NVarChar, idApartment);
    request.input("p_intIdPersonType", sql.Int, idPersonType);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcEmailAddress", sql.NVarChar, email);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPsendTenantInvitation",
      async (err, result) => {
        if (err) {
          console.log("err", err);
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset[0];
          if (resultRecordset.stateCode !== 200) {
            res.status(resultRecordset.stateCode).send({
              response: {
                message: resultRecordset.message,
                idInvitation: resultRecordset.idInvitation,
              },
            });
          } else {
            const objectResponseDataBase = {
              ...result.recordset[0],
              offset,
              jsonServiceResponse: result.recordset[0].stateCode,
            };
            await executeEmailSentAES(objectResponseDataBase);
            res.status(200).send({
              result: {
                idInvitation: resultRecordset.idInvitation,
                idUserSender: resultRecordset.idUserSender,
                message: resultRecordset.message,
              },
            });
          }
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAgentIndicators = async (params, res) => {
  const { idSystemUser, idLoginHistory, offset = process.env.OFFSET } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetAgentIndicators", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAgentContractCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetAgentContractCoincidences",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAgentCommissionChart = async (params, res) => {
  const { idSystemUser, idLoginHistory, offset = process.env.OFFSET } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetAgentCommissionChart", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeUpdateInvitation = async (params, res, url) => {
  const {
    idSystemUser,
    idLoginHistory,
    isActive,
    requestResend,
    offset = process.env.OFFSET,
  } = params;
  const { idInvitation } = url;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdInvitation", sql.NVarChar, idInvitation)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_bitIsActive", sql.Bit, isActive)
      .input("p_bitRequestResend", sql.Bit, requestResend)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPupdateInvitation");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      res.status(resultRecordset[0].stateCode).send({
        response: { message: resultRecordset[0].message },
      });
    } else {
      result.recordset.forEach((element) => {
        if (element.canSendEmail === true) {
          const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
          executeMailToV2({
            ...element,
            ...configEmailServer,
          });
        }
      });
      res.status(200).send({
        response: {
          idInvitation: resultRecordset[0].idInvitation,
          message: resultRecordset[0].message,
        },
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: err,
      },
    });
  }
};

const executeUpdateCustomerLoan = async (params, res, url) => {
  const {
    idCustomerTenant,
    isAccepted,
    digitalSignature,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  const { idContract } = url;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_bitIsAccepted", sql.Bit, isAccepted)
      .input("p_nvcDigitalSignature", sql.NVarChar, digitalSignature)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPupdateCustomerLoan");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      res.status(resultRecordset[0].stateCode).send({
        response: {
          message: resultRecordset[0].message,
          errorMessage: resultRecordset[0].errorMessage,
        },
      });
    } else {
      // result.recordset.forEach((element) => {
      //   if (element.canSendEmail === true) {
      //     const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
      //     executeMailToV2({
      //       ...element,
      //       ...configEmailServer,
      //     });
      //   }
      // });
      res.status(200).send({
        response: {
          idContract: resultRecordset[0].idContract,
          message: resultRecordset[0].message,
        },
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: `${err}`,
      },
    });
  }
};

const executeGetRequestAdvancePymtPlan = async (params, res) => {
  const {
    idCustomer,
    idContract,
    totalRentsRequested,
    totalPeriod,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_intTotalRentsRequested", sql.Int, totalRentsRequested)
      .input("p_intTotalPeriod", sql.Int, totalPeriod)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetRequestAdvancePymtPlan");
    res.status(200).send({ response: result.recordsets });
  } catch (error) {
    res.status(500).send({
      response: { message: "Error en la petición", messageType: error },
    });
  }
};

const executeGetPropertyCoincidences = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_intTopIndex", sql.Int, topIndex)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetPropertyCoincidences");
    const resultRecordset = result.recordset;
    res.status(200).send({
      response: resultRecordset,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: err,
      },
    });
  }
};

const executeAddRequestAdvancePymtDocument = async (params) => {
  const {
    idRequestAdvancePymt,
    idDocument,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdRequestAdvancePymt", sql.NVarChar, idRequestAdvancePymt)
      .input("p_nvcIdDocument", sql.NVarChar, idDocument)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPaddRequestAdvancePymtDocument");
    const resultRecordset = result.recordset;
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeAddLoanDocument = async (params) => {
  const {
    idContract,
    idDocument,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdDocument", sql.NVarChar, idDocument)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPaddLoanDocument");
    const resultRecordset = result.recordset;
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeAddDocument = async (params) => {
  const {
    idCustomer = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    documentName = "Contrato_de_adelanto.docx",
    extension = "docx",
    preview = null,
    thumbnail = null,
    idDocumentType,
  } = params;
  try {
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
    const resultRecordset = result.recordset;
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeGetRequestAdvancePymtProperties = async (params, res) => {
  const {
    idRequestAdvancePymt,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    idDocument,
    idDocumentType,
    idPreviousDocument,
    bucketSource,
  } = params;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdRequestAdvancePymt", sql.NVarChar, idRequestAdvancePymt)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetRequestAdvancePymtProperties");
    const resultRecordset = result.recordset[0];
    const bucketSourceS3 = bucketSource.toLowerCase();
    const file = await s3
      .getObject({
        Bucket: bucketSourceS3,
        Key: idDocument,
      })
      .promise();
    const buff = new Buffer.from(file.Body, "binary");
    const dataAddDocument = await executeAddDocument({
      idSystemUser,
      idLoginHistory,
      idDocumentType: idDocumentType,
    });
    const resultObjectAddDocument = dataAddDocument[0];
    if (resultObjectAddDocument.stateCode !== 200) {
      res.status(resultObjectAddDocument.stateCode).send({
        response: { message: resultObjectAddDocument.message },
      });
    } else {
      const zip = new PizZip(buff);
      let doc;
      const imageModule = new ImageModule(imageOpts);
      doc = await new Docxtemplater(zip, {
        modules: [imageModule],
        parser: replaceConditionsDocx,
        nullGetter: () => {
          return "";
        },
      });
      await doc.setData(resultRecordset);
      await doc.render();
      const fileDocument = await doc.getZip().generate({ type: "nodebuffer" });
      const bucketSorceData =
        isNil(resultObjectAddDocument) === false &&
        isNil(resultObjectAddDocument.bucketSource) === false
          ? resultObjectAddDocument.bucketSource.toLowerCase()
          : bucketSource.toLowerCase();
      const idDocumentData = resultObjectAddDocument.idDocument;
      const params2 = {
        Bucket: bucketSorceData,
        Key: idDocumentData,
        Body: fileDocument,
      };
      await executeAddRequestAdvancePymtDocument({
        idRequestAdvancePymt: resultRecordset.idRequestAdvancePymt,
        idSystemUser,
        idLoginHistory,
        idDocument: idDocumentData,
      });
      await s3.upload(params2).promise();
      if (isNil(idPreviousDocument) === false) {
        const params1 = {
          Bucket: bucketSourceS3,
          Key: idPreviousDocument,
        };
        await s3.deleteObject(params1).promise();
      }
      res.status(200).send({
        response: {
          url: `/api/viewFilesDocx/${idDocumentData}/${bucketSorceData}`,
          fullNameTenant: resultRecordset.nvcCustomerFullName,
        },
      });
    }
  } catch (error) {
    res.status(500).send({
      response: { message: "Error en la petición", messageType: error },
    });
  }
};

const executeGetCustomerLoan = async (params, res) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetCustomerLoan");
    const resultRecordset = result.recordset;
    res.status(200).send({
      response: resultRecordset,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: `${err}`,
      },
    });
  }
};

const executeGetCustomerLoanProperties = async (params, res) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    idDocument,
    idDocumentType,
    idPreviousDocument,
    bucketSource,
  } = params;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetCustomerLoanProperties");
    const resultRecordset = result.recordset[0];
    const bucketSourceS3 = bucketSource.toLowerCase();
    const file = await s3
      .getObject({
        Bucket: bucketSourceS3,
        Key: idDocument,
      })
      .promise();
    const buff = new Buffer.from(file.Body, "binary");
    const dataAddDocument = await executeAddDocument({
      idSystemUser,
      idLoginHistory,
      idDocumentType: idDocumentType,
    });
    const resultObjectAddDocument = dataAddDocument[0];
    if (resultObjectAddDocument.stateCode !== 200) {
      res.status(resultObjectAddDocument.stateCode).send({
        response: { message: resultObjectAddDocument.message },
      });
    } else {
      const zip = new PizZip(buff);
      let doc;
      const imageModule = new ImageModule(imageOpts);
      doc = await new Docxtemplater(zip, {
        modules: [imageModule],
        parser: replaceConditionsDocx,
        nullGetter: () => {
          return "";
        },
      });
      await doc.setData(resultRecordset);
      await doc.render();
      const fileDocument = await doc.getZip().generate({ type: "nodebuffer" });
      const bucketSorceData =
        isNil(resultObjectAddDocument) === false &&
        isNil(resultObjectAddDocument.bucketSource) === false
          ? resultObjectAddDocument.bucketSource.toLowerCase()
          : bucketSource.toLowerCase();
      const idDocumentData = resultObjectAddDocument.idDocument;
      const params2 = {
        Bucket: bucketSorceData,
        Key: idDocumentData,
        Body: fileDocument,
      };
      await executeAddLoanDocument({
        idContract: idContract,
        idSystemUser,
        idLoginHistory,
        idDocument: idDocumentData,
      });
      await s3.upload(params2).promise();
      if (isNil(idPreviousDocument) === false) {
        const params1 = {
          Bucket: bucketSourceS3,
          Key: idPreviousDocument,
        };
        await s3.deleteObject(params1).promise();
      }
      res.status(200).send({
        response: {
          url: `/api/viewFilesDocx/${idDocumentData}/${bucketSorceData}`,
          fullNameTenant: resultRecordset.nvcCustomerTenantFullName,
        },
      });
    }
  } catch (error) {
    res.status(500).send({
      response: { message: "Error en la petición", messageType: `${error}` },
    });
  }
};

const executeGetDispersionOrder = async (params, res) => {
  const offset = process.env.OFFSET;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_chrOffset", sql.Char, offset)
      .execute("stpSch.USPgetDispersionOrder");
    const resultRecordset = result.recordset;
    for (const element of resultRecordset) {
      const {
        url,
        idDispersionOrder,
        institucionContraparte,
        empresa,
        fechaOperacion,
        claveRastreo,
        institucionOperante,
        monto,
        tipoPago,
        tipoCuentaOrdenante,
        nombreOrdenante,
        cuentaOrdenante,
        rfcCurpOrdenante,
        tipoCuentaBeneficiario,
        nombreBeneficiario,
        cuentaBeneficiario,
        rfcCurpBeneficiario,
        conceptoPago,
        referenciaNumerica,
      } = element;
      const bodyRequest = {
        institucionContraparte,
        empresa,
        fechaOperacion,
        claveRastreo,
        institucionOperante,
        monto,
        tipoPago,
        tipoCuentaOrdenante,
        nombreOrdenante,
        cuentaOrdenante,
        rfcCurpOrdenante,
        tipoCuentaBeneficiario,
        nombreBeneficiario,
        cuentaBeneficiario,
        rfcCurpBeneficiario,
        conceptoPago,
        referenciaNumerica,
      };
      const crypto = new CryptoHandler(
        bodyRequest,
        GLOBAL_CONSTANTS.SECRET_KEY_ENCRYPT,
        null,
        GLOBAL_CONSTANTS.ENVIRONMENT_TEST
      );
      const orderPay = { ...bodyRequest, firma: crypto.getSign() };
      //console.log("orderPay", JSON.stringify(orderPay, null, 2));
      const response = await rp({
        url,
        method: "PUT",
        headers: {
          encoding: "UTF-8",
          "Content-Type": "application/json",
        },
        json: true,
        body: orderPay,
        rejectUnauthorized: false,
      });
      await executeSetDispersionOrder({
        idDispersionOrder,
        jsonServiceResponse: JSON.stringify(response),
      });
    }

    res.status(200).send({ response: "ok" });
  } catch (err) {
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: `${err}`,
      },
    });
  }
};

const executeGetConfigForCollAndDisp = async (params, res) => {
  const offset = process.env.OFFSET;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_chrOffset", sql.Char, offset)
      .execute("stpSch.USPgetConfigForCollAndDisp");
    const resultRecordset = result.recordset;

    const { empresa, fechaOperacion, estado, url } = resultRecordset[0];
    let bodyRequest = {};
    let cadenaOriginal = "";
    if (isNil(fechaOperacion) === false) {
      bodyRequest = {
        empresa,
        fechaOperacion,
      };
      cadenaOriginal = `|||${empresa}|${fechaOperacion}|||||||||||||||||||||||||||||||||`;
    } else {
      bodyRequest = { empresa };
      cadenaOriginal = `|||${empresa}||||||||||||||||||||||||||||||||||`;
    }
    const crypto = new CryptoHandler(
      bodyRequest,
      GLOBAL_CONSTANTS.SECRET_KEY_ENCRYPT,
      cadenaOriginal,
      GLOBAL_CONSTANTS.ENVIRONMENT_TEST
    );
    const orderPay = { ...bodyRequest, estado, firma: crypto.getSign() };
    //console.log("orderPay", orderPay);
    executeMailToNotification({
      subject: "Log",
      content: `
      <div>
        Body: ${JSON.stringify(orderPay, null, 2)}
      Action: stpSch.USPgetConfigForCollAndDisp
      </div>
      `,
    });
    const response = await rp({
      url,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: orderPay,
      rejectUnauthorized: false,
    });
    await executeValidateCollAndDisp({
      jsonServiceResponse: JSON.stringify(response),
    });

    res.status(200).send({ response: "Ok" });
  } catch (err) {
    executeMailToNotification({
      subject: "Catch",
      content: `
      <div>
        ${err}
      Action: stpSch.USPgetConfigForCollAndDisp
      </div>
      `,
    });
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: `${err}`,
      },
    });
  }
};

const executeForgiveInterest = async (params, res, url) => {
  const {
    idCustomer,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  const { idContract } = url;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_uidIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_uidIdContract", sql.NVarChar, idContract)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPforgiveInterest");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      res.status(resultRecordset[0].stateCode).send({
        response: {
          message: resultRecordset[0].message,
          errorMessage: resultRecordset[0].errorMessage,
        },
      });
    } else {
      resultRecordset.forEach((element) => {
        if (element.canSendEmail === true) {
          const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
          executeMailToV2({
            ...element,
            ...configEmailServer,
          });
        }
      });
      res.status(200).send({
        response: {
          idContract: resultRecordset[0].idContract,
          message: resultRecordset[0].message,
        },
      });
    }
  } catch (err) {
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: `${err}`,
      },
    });
  }
};

const executeGetTransactionsByUser = async (params, res) => {
  const { idSystemUser, idLoginHistory, offset = process.env.OFFSET } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("paymentSch.USPgetTransactionsByUser");
    const resultRecordset = result.recordset;
    res.status(200).send({
      response: resultRecordset,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      response: {
        message: "No se pudo procesar tu solicitud",
        messageType: `${err}`,
      },
    });
  }
};
// setInterval(() => {
//   hoy = new Date();
//   hora = hoy.getHours();
//   console.log("hoy", hoy);
//   console.log("hora", hora);
//   if (hora === 9 && hora < 10) {
//     console.log("ejecutando");

//     executeGetDispersionOrder();
//   }
// }, 60000);

const ControllerCustomer = {
  getCustomerById: (req, res) => {
    const params = req.body;
    executeGetCustomerById(params, res);
  },
  getTenantCoincidences: (req, res) => {
    const params = req.body;
    executeTenantCoincidences(params, res);
  },
  addProperty: (req, res) => {
    const params = req.body;
    executeAddProperty(params, res);
  },
  getCustomerProperties: (req, res) => {
    const params = req.body;
    executeGetAllProperties(params, res);
  },
  getCustomerApartments: (req, res) => {
    const params = req.body;
    executeGetAllApartments(params, res);
  },
  sendTenantInvitation: (req, res) => {
    const params = req.body;
    executeSendTenantInvitation(params, res);
  },
  addDocument: (req, res) => {
    const params = req.body;
  },
  getStatsChart: (req, res) => {
    const params = req.body;
    executeGetStatsChart(params, res);
  },
  getCustomerTenants: (req, res) => {
    const params = req.body;
    executeGetCustomerTenants(params, res);
  },
  getAllBanks: (req, res) => {
    const params = req.body;
    executeGetAllBanks(params, res);
  },
  requestAdvance: (req, res) => {
    const params = req.body;
    executeRequestAdvance(params, res);
  },
  getAdressZipCode: (req, res) => {
    const params = req.body;
    executeGetAdressZipCode(params, res);
  },
  getCustomerTenantsById: (req, res) => {
    const params = req.body;
    executeGetTenantsById(params, res);
  },
  getAllPayments: (req, res) => {
    const params = req.body;
    executeGetAllPayments(params, res);
  },
  getAllPaymentInContract: (req, res) => {
    const params = req.body;
    executeGetAllPaymentInContract(params, res);
  },
  getAgentIndicators: (req, res) => {
    const params = req.body;
    executeGetAgentIndicators(params, res);
  },
  getAgentContractCoincidences: (req, res) => {
    const params = req.body;
    executeGetAgentContractCoincidences(params, res);
  },
  getAgentCommissionChart: (req, res) => {
    const params = req.body;
    executeGetAgentCommissionChart(params, res);
  },
  getRequestAdvancePymtPlan: (req, res) => {
    const params = req.body;
    executeGetRequestAdvancePymtPlan(params, res);
  },
  getRequestAdvancePymtProperties: (req, res) => {
    const params = req.body;
    executeGetRequestAdvancePymtProperties(params, res);
  },
  updateInvitation: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateInvitation(params, res, url);
  },
  getPropertyCoincidences: (req, res) => {
    const params = req.body;
    executeGetPropertyCoincidences(params, res);
  },
  getCustomerLoan: (req, res) => {
    const params = req.body;
    executeGetCustomerLoan(params, res);
  },
  updateCustomerLoan: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateCustomerLoan(params, res, url);
  },
  getCustomerLoanProperties: (req, res) => {
    const params = req.body;
    executeGetCustomerLoanProperties(params, res);
  },
  getDispersionOrder: (req, res) => {
    const params = req.body;
    executeGetDispersionOrder(params, res);
  },
  getConfigForCollAndDisp: (req, res) => {
    const params = req.body;
    executeGetConfigForCollAndDisp(params, res);
  },
  forgiveInterest: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeForgiveInterest(params, res, url);
  },
  getTransactionsByUser: (req, res) => {
    const params = req.body;
    executeGetTransactionsByUser(params, res);
  },
};

module.exports = ControllerCustomer;
