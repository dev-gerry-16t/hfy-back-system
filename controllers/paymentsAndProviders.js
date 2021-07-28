const sql = require("mssql");
const Stripe = require("stripe");
const AWS = require("aws-sdk");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");
const GLOBAL_CONSTANTS = require("../constants/constants");
const replaceConditionsDocx = require("../actions/conditions");
const executeMailTo = require("../actions/sendInformationUser");
const executeAddGWTransaction = require("../actions/addGWTransaction");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const stripe = new Stripe(GLOBAL_CONSTANTS.SECRET_KEY_STRIPE);

const executeValidatePaymentSchedule = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    //Batch
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPvalidatePaymentSchedule", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: { message: resultRecordset[0].message } });
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

const executeUpdateMovingDialog = async (params, res) => {
  const {
    idContract,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPupdateMovingDialog", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: { message: resultRecordset[0].message } });
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

const executeSetProvider = async (params, res, url) => {
  const {
    idProviderType,
    idProviderPaymentForm,
    provider,
    taxId,
    phoneNumber,
    emailAddress,
    budgeAmount,
    providerBudgeInPolicy,
    collaborator,
    isActive,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  const { idProvider = null } = url;
  try {
    const request = new sql.Request();
    const tvpProvider = new sql.Table();
    const tvpCollaborator = new sql.Table();

    tvpProvider.columns.add("idProvider", sql.NVarChar);
    tvpProvider.columns.add("idPolicy", sql.NVarChar);
    tvpProvider.columns.add("budgeAmount", sql.Decimal(19, 2));
    tvpProvider.columns.add("isActive", sql.Bit);

    tvpCollaborator.columns.add("idProvider", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaborator", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaboratorType", sql.Int);
    tvpCollaborator.columns.add("collaboratorType", sql.NVarChar);
    tvpCollaborator.columns.add("givenName", sql.NVarChar);
    tvpCollaborator.columns.add("lastName", sql.NVarChar);
    tvpCollaborator.columns.add("mothersMaidenName", sql.NVarChar);
    tvpCollaborator.columns.add("phoneNumber", sql.NVarChar);
    tvpCollaborator.columns.add("emailAddress", sql.NVarChar);
    tvpCollaborator.columns.add("isActive", sql.Bit);

    if (isEmpty(providerBudgeInPolicy) === false) {
      providerBudgeInPolicy.forEach((element) => {
        tvpProvider.rows.add(
          element.idProvider,
          element.idPolicy,
          element.budgeAmount,
          element.isActive
        );
      });
    }

    if (isEmpty(collaborator) === false) {
      collaborator.forEach((element) => {
        tvpCollaborator.rows.add(
          element.idProvider,
          element.idCollaborator,
          element.idCollaboratorType,
          element.collaboratorType,
          element.givenName,
          element.lastName,
          element.mothersMaidenName,
          element.phoneNumber,
          element.emailAddress,
          element.isActive
        );
      });
    }

    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_intIdProviderType", sql.Int, idProviderType);
    request.input("p_intIdProviderPaymentForm", sql.Int, idProviderPaymentForm);
    request.input("p_nvcProvider", sql.NVarChar, provider);
    request.input("p_nvcTaxId", sql.NVarChar, taxId);
    request.input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_decBudgeAmount", sql.Decimal(19, 2), budgeAmount);
    request.input("p_udttProviderBudgeInPolicy", tvpProvider);
    request.input("p_udttCollaborator", tvpCollaborator);
    request.input("p_bitIsActive", sql.Bit, isActive);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPsetProvider", (err, result) => {
      if (err) {
        res.status(500).send({ response: { message: err.message } });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: { message: resultRecordset[0].message } });
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

const executeGetProviderCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetProviderCoincidences", (err, result) => {
      if (err) {
        res.status(500).send({ response: err });
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

const executeGetProviderById = async (params, res) => {
  const {
    idProvider,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetProviderById", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordsets = result.recordsets;
        res.status(200).send({
          response: {
            result1:
              isNil(resultRecordsets[0]) === false &&
              isEmpty(resultRecordsets[0]) === false &&
              isNil(resultRecordsets[0][0]) === false
                ? resultRecordsets[0][0]
                : {},
            result2:
              isNil(resultRecordsets[1]) === false ? resultRecordsets[1] : [],
            result3:
              isNil(resultRecordsets[2]) === false ? resultRecordsets[2] : [],
          },
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetRequestForProviderCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetRequestForProviderCoincidences",
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

const executeGetRequestForProviderById = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idRequestForProvider,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input(
      "p_nvcIdRequestForProvider",
      sql.NVarChar,
      idRequestForProvider
    );
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetRequestForProviderById",
      (err, result) => {
        console.log("err", err);
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordsets = result.recordsets;
          res.status(200).send({
            response: {
              result1:
                isNil(resultRecordsets[0]) === false &&
                isEmpty(resultRecordsets[0]) === false &&
                isNil(resultRecordsets[0][0]) === false
                  ? resultRecordsets[0][0]
                  : {},
              result2:
                isNil(resultRecordsets[1]) === false ? resultRecordsets[1] : [],
            },
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeUpdateRequestForProvider = async (params, res, url) => {
  const {
    idProvider,
    idRequestForProviderStatus,
    scheduleDate,
    referenceId,
    budgeAmount,
    collaborator,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    observations = null,
  } = params;
  const { idRequestForProvider } = url;
  try {
    const request = new sql.Request();
    const tvpCollaborator = new sql.Table();

    tvpCollaborator.columns.add("idProvider", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaborator", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaboratorType", sql.Int);
    tvpCollaborator.columns.add("collaboratorType", sql.NVarChar);
    tvpCollaborator.columns.add("givenName", sql.NVarChar);
    tvpCollaborator.columns.add("lastName", sql.NVarChar);
    tvpCollaborator.columns.add("mothersMaidenName", sql.NVarChar);
    tvpCollaborator.columns.add("phoneNumber", sql.NVarChar);
    tvpCollaborator.columns.add("emailAddress", sql.NVarChar);
    tvpCollaborator.columns.add("isActive", sql.Bit);

    if (isEmpty(collaborator) === false) {
      collaborator.forEach((element) => {
        tvpCollaborator.rows.add(
          element.idProvider,
          element.idCollaborator,
          element.idCollaboratorType,
          element.collaboratorType,
          element.givenName,
          element.lastName,
          element.mothersMaidenName,
          element.phoneNumber,
          element.emailAddress,
          element.isActive
        );
      });
    }

    request.input(
      "p_nvcIdRequestForProvider",
      sql.NVarChar,
      idRequestForProvider
    );
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input(
      "p_intIdRequestForProviderStatus",
      sql.Int,
      idRequestForProviderStatus
    );
    request.input("p_dtmScheduleDate", sql.DateTime, scheduleDate);
    request.input("p_nvcReferenceId", sql.NVarChar, referenceId);
    request.input("p_decBudgeAmount", sql.Decimal(19, 2), budgeAmount);
    request.input("p_udttCollaborator", tvpCollaborator);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcObservations", sql.NVarChar, observations);
    request.execute(
      "customerSch.USPupdateRequestForProvider",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          if (resultRecordset[0].stateCode !== 200) {
            res
              .status(resultRecordset[0].stateCode)
              .send({ response: { message: resultRecordset[0].message } });
          } else {
            resultRecordset.forEach((element) => {
              if (element.canSendEmail === true) {
                const configEmailServer = JSON.parse(
                  element.jsonEmailServerConfig
                );
                executeMailTo({
                  ...element,
                  ...configEmailServer,
                });
              }
            });
            res.status(200).send({
              response: resultRecordset[0].idRequestForProvider,
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

const executeAddRequestForProvider = async (params, res) => {
  const {
    idContract,
    scheduleDate,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    idProvider,
    observations = null,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_dtmScheduleDate", sql.DateTime, scheduleDate);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcObservations", sql.NVarChar, observations);
    request.execute("customerSch.USPaddRequestForProvider", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: { message: resultRecordset[0].message } });
        } else {
          resultRecordset.forEach((element) => {
            if (element.canSendEmail === true) {
              const configEmailServer = JSON.parse(
                element.jsonEmailServerConfig
              );
              executeMailTo({
                ...element,
                ...configEmailServer,
              });
            }
          });
          res.status(200).send({
            response: resultRecordset[0].idRequestForProvider,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddIncidence = async (params, res) => {
  const {
    idContract,
    idIncidenceType,
    incidenceType,
    description,
    documents,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_intIdIncidenceType", sql.Int, idIncidenceType);
    request.input("p_nvcIncidenceType", sql.NVarChar, incidenceType);
    request.input("p_nvcDescription", sql.NVarChar, description);
    request.input("p_nvcDocuments", sql.NVarChar, documents);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPaddIncidence", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: { message: resultRecordset[0].message } });
        } else {
          resultRecordset.forEach((element) => {
            if (element.canSendEmail === true) {
              const configEmailServer = JSON.parse(
                element.jsonEmailServerConfig
              );
              executeMailTo({
                ...element,
                ...configEmailServer,
              });
            }
          });
          res.status(200).send({
            response: resultRecordset[0].idIncidence,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetIncidenceCoincidences = async (params, res) => {
  const {
    idContract = null,
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetIncidenceCoincidences",
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

const executeGetIncidenceById = async (params, res) => {
  const {
    idIncidence,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdIncidence", sql.NVarChar, idIncidence);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetIncidenceById", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordsets = result.recordsets;
        res.status(200).send({
          response: {
            result1:
              isNil(resultRecordsets[0]) === false &&
              isEmpty(resultRecordsets[0]) === false &&
              isNil(resultRecordsets[0][0]) === false
                ? resultRecordsets[0][0]
                : {},
            result2:
              isNil(resultRecordsets[1]) === false &&
              isEmpty(resultRecordsets[1]) === false
                ? resultRecordsets[1]
                : [],
            result3:
              isNil(resultRecordsets[2]) === false &&
              isEmpty(resultRecordsets[2]) === false
                ? resultRecordsets[2]
                : [],
          },
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeUpdateIncidence = async (params, res, url) => {
  const {
    idIncidenceStatus = null,
    idIncidenceType = null,
    incidenceType = null,
    description = null,
    annotations = null,
    amount = null,
    customerRequestedForPayment = null,
    isPaymentAccepted = null,
    documents = null,
    idRequestForProviderStatus = null,
    confirmProvider = null,
    idIncidencePaymentMethod = null,
    idSystemUser,
    idLoginHistory,
    idProvider = null,
    scheduleDate = null,
    offset = process.env.OFFSET,
  } = params;
  const { idIncidence } = url;
  try {
    const request = new sql.Request();

    request.input("p_nvcIdIncidence", sql.NVarChar, idIncidence);
    request.input("p_intIdIncidenceStatus", sql.Int, idIncidenceStatus);
    request.input("p_intIdIncidenceType", sql.Int, idIncidenceType);
    request.input("p_nvcIncidenceType", sql.NVarChar, incidenceType);
    request.input("p_nvcDescription", sql.NVarChar, description);
    request.input("p_nvcAnnotations", sql.NVarChar, annotations);
    request.input("p_decAmount", sql.Decimal(19, 2), amount);
    request.input(
      "p_nvcCustomerRequestedForPayment",
      sql.NVarChar,
      customerRequestedForPayment
    );
    request.input("p_bitIsPaymentAccepted", sql.Bit, isPaymentAccepted);
    request.input("p_nvcDocuments", sql.NVarChar, documents);
    request.input(
      "p_intIdRequestForProviderStatus",
      sql.Int,
      idRequestForProviderStatus
    );
    request.input("p_bitConfirmProvider", sql.Bit, confirmProvider);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_dtmScheduleDate", sql.DateTime, scheduleDate);
    request.input(
      "p_intIdIncidencePaymentMethod",
      sql.Int,
      idIncidencePaymentMethod
    );
    request.execute("customerSch.USPupdateIncidence", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: { message: resultRecordset[0].message } });
        } else {
          resultRecordset.forEach((element) => {
            if (element.canSendEmail === true) {
              const configEmailServer = JSON.parse(
                element.jsonEmailServerConfig
              );
              executeMailTo({
                ...element,
                ...configEmailServer,
              });
            }
          });
          res.status(200).send({
            response: resultRecordset[0].idIncidence,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddDocument = async (params) => {
  const {
    idCustomer = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    documentName = "Contrato_de_servicio.docx",
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

const executeAddRequestForProviderDocument = async (params) => {
  const {
    idRequestForProvider,
    idDocument,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdRequestForProvider", sql.NVarChar, idRequestForProvider)
      .input("p_nvcIdDocument", sql.NVarChar, idDocument)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPaddRequestForProviderDocument");
    const resultRecordset = result.recordset;
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeGetRequestForProviderProperties = async (params, res) => {
  const {
    idRequestForProvider,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    idDocument,
    idPreviousDocument,
    idDocumentType,
    bucketSource,
    canGenerateDocument,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdRequestForProvider", sql.NVarChar, idRequestForProvider)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetRequestForProviderProperties");
    const resultRecordset = result.recordset;
    const bucketSourceS3 = bucketSource.toLowerCase();
    if (canGenerateDocument === true) {
      const file = await s3
        .getObject({
          Bucket: bucketSourceS3,
          Key: idDocument,
        })
        .promise();
      const buff = new Buffer.from(file.Body, "binary");
      const dataAddDocument = await executeAddDocument(params);
      const resultObjectAddDocument = dataAddDocument[0];
      if (resultObjectAddDocument.stateCode !== 200) {
        res.status(resultObjectAddDocument.stateCode).send({
          response: { message: resultObjectAddDocument.message },
        });
      } else {
        const zip = new PizZip(buff);
        let doc;
        doc = await new Docxtemplater(zip, {
          parser: replaceConditionsDocx,
          nullGetter: () => {
            return "";
          },
        });
        await doc.setData(resultRecordset[0]);
        await doc.render();
        const fileDocument = await doc
          .getZip()
          .generate({ type: "nodebuffer" });
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
        await executeAddRequestForProviderDocument({
          ...params,
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
        res.send(fileDocument);
      }
    } else {
      const file = await s3
        .getObject({
          Bucket: bucketSourceS3,
          Key: idPreviousDocument,
        })
        .promise();
      const buff = new Buffer.from(file.Body, "binary");
      res.send(buff);
    }
  } catch (error) {
    res.status(500).send({
      response: { message: "Error en el sistema", messageType: error },
    });
  }
};

const executeGetAmountForGWTransaction = async (params, res) => {
  const {
    idPaymentInContract = null,
    idOrderPayment = null,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    payment_method,
    payment_method_types,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdPaymentInContract", sql.NVarChar, idPaymentInContract)
      .input("p_nvcIdOrderPayment", sql.NVarChar, idOrderPayment)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("paymentSch.USPgetAmountForGWTransaction");
    const resultRecordset = result.recordset[0];
    if (resultRecordset.canBeProcess === true) {
      if (isNil(payment_method) === false) {
        const payment = await stripe.paymentIntents.create({
          payment_method,
          payment_method_types,
          amount: resultRecordset.amount,
          description: resultRecordset.description,
          currency: resultRecordset.currency,
          confirm: true,
        });
        if (payment.status === "requires_action") {
          const paymentIntent = await stripe.paymentIntents.cancel(payment.id);
          await executeAddGWTransaction({
            idPaymentInContract: idPaymentInContract,
            idOrderPayment: idOrderPayment,
            serviceIdPI: paymentIntent.id,
            serviceIdPC: null,
            amount: paymentIntent.amount,
            last4: null,
            type: null,
            status: paymentIntent.status,
            funding: null,
            network: null,
            created: paymentIntent.created,
            jsonServiceResponse: JSON.stringify(paymentIntent),
            idSystemUser,
            idLoginHistory,
          });
        } else {
          await executeAddGWTransaction({
            idPaymentInContract: idPaymentInContract,
            idOrderPayment: idOrderPayment,
            serviceIdPI: payment.id,
            serviceIdPC: payment.charges.data[0].id,
            amount: payment.amount,
            last4: payment.charges.data[0].payment_method_details.card.last4,
            type: payment.charges.data[0].payment_method_details.type,
            status: payment.status,
            funding:
              payment.charges.data[0].payment_method_details.card.funding,
            network:
              payment.charges.data[0].payment_method_details.card.network,
            created: payment.created,
            jsonServiceResponse: JSON.stringify(payment),
            idSystemUser,
            idLoginHistory,
          });
        }
        res.status(200).send({
          response: {
            result: {
              idOrderPayment,
              paymentIntent: payment.id,
              status: payment.status,
            },
          },
        });
      } else {
        const payment = await stripe.paymentIntents.create({
          payment_method_types,
          amount: resultRecordset.amount,
          description: resultRecordset.description,
          currency: resultRecordset.currency,
        });
        await executeAddGWTransaction({
          idPaymentInContract: idPaymentInContract,
          idOrderPayment: idOrderPayment,
          serviceIdPI: payment.id,
          serviceIdPC: null,
          amount: payment.amount,
          last4: null,
          type: payment.payment_method_types[0],
          status: payment.status,
          funding: null,
          network: null,
          created: payment.created,
          jsonServiceResponse: JSON.stringify(payment),
          idSystemUser,
          idLoginHistory,
        });
        res.status(200).send({
          response: {
            result: {
              idOrderPayment,
              paymentIntent: payment.id,
              status: payment.status,
              idClientSecret: payment.client_secret,
            },
          },
        });
      }
    } else {
      res.status(500).send({
        response: {
          message: "Tu pago no puede ser procesado",
        },
      });
    }
  } catch (error) {
    res.status(500).send({
      response: {
        message: "Tu banco ha declinado la transacción",
        messageType: error,
      },
    });
  }
};

const executeGetRequestForProviderPropertiesv2 = async (params, res) => {
  const {
    idRequestForProvider,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdRequestForProvider", sql.NVarChar, idRequestForProvider)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetRequestForProviderProperties");
    const resultRecordset = result.recordset[0];
    const bucketSourceS3 = resultRecordset.bucketSource.toLowerCase();
    const file = await s3
      .getObject({
        Bucket: bucketSourceS3,
        Key: resultRecordset.idDocument,
      })
      .promise();
    const buff = new Buffer.from(file.Body, "binary");
    const dataAddDocument = await executeAddDocument({
      ...params,
      idDocumentType: resultRecordset.idDocumentType,
    });
    const resultObjectAddDocument = dataAddDocument[0];
    if (resultObjectAddDocument.stateCode !== 200) {
      res.status(resultObjectAddDocument.stateCode).send({
        response: { message: resultObjectAddDocument.message },
      });
    } else {
      const zip = new PizZip(buff);
      let doc;
      doc = await new Docxtemplater(zip, {
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
      await executeAddRequestForProviderDocument({
        ...params,
        idDocument: idDocumentData,
      });
      await s3.upload(params2).promise();
      if (isNil(resultRecordset.idPreviousDocument) === false) {
        const params1 = {
          Bucket: bucketSourceS3,
          Key: resultRecordset.idPreviousDocument,
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
      response: { message: "Error en el sistema", messageType: error },
    });
  }
};

const executeSignRequestForProvider = async (params, res, url) => {
  const {
    isFaceToFace,
    digitalSignature,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  const { idRequestForProvider } = url;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdRequestForProvider", sql.NVarChar, idRequestForProvider)
      .input("p_bitIsFaceToFace", sql.Bit, isFaceToFace)
      .input("p_nvcDigitalSignature", sql.NVarChar, digitalSignature)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPsignRequestForProvider");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      res
        .status(resultRecordset[0].stateCode)
        .send({ response: { message: resultRecordset[0].message } });
    } else {
      result.recordset.forEach((element) => {
        if (element.canSendEmail === true) {
          const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
          executeMailTo({
            ...element,
            ...configEmailServer,
          });
        }
      });
      res.status(200).send({
        response: "Solicitud procesado exitosamente",
      });
    }
  } catch (error) {
    res.status(500).send({
      response: { message: "Error de sistema", messageType: error },
    });
  }
};

const ControllerPaymentProvider = {
  validatePaymentSchedule: (req, res) => {
    const params = req.body;
    executeValidatePaymentSchedule(params, res);
  },
  setProvider: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSetProvider(params, res, url);
  },
  getProviderCoincidences: (req, res) => {
    const params = req.body;
    executeGetProviderCoincidences(params, res);
  },
  getProviderById: (req, res) => {
    const params = req.body;
    executeGetProviderById(params, res);
  },
  getRequestForProviderCoincidences: (req, res) => {
    const params = req.body;
    executeGetRequestForProviderCoincidences(params, res);
  },
  getRequestForProviderById: (req, res) => {
    const params = req.body;
    executeGetRequestForProviderById(params, res);
  },
  updateRequestForProvider: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateRequestForProvider(params, res, url);
  },
  addRequestForProvider: (req, res) => {
    const params = req.body;
    executeAddRequestForProvider(params, res);
  },
  updateMovingDialog: (req, res) => {
    const params = req.body;
    executeUpdateMovingDialog(params, res);
  },
  addIncidence: (req, res) => {
    const params = req.body;
    executeAddIncidence(params, res);
  },
  getIncidenceCoincidences: (req, res) => {
    const params = req.body;
    executeGetIncidenceCoincidences(params, res);
  },
  getIncidenceById: (req, res) => {
    const params = req.body;
    executeGetIncidenceById(params, res);
  },
  updateIncidence: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateIncidence(params, res, url);
  },
  getRequestForProviderProperties: (req, res) => {
    const params = req.body;
    executeGetRequestForProviderProperties(params, res);
  },
  getRequestForProviderPropertiesv2: (req, res) => {
    const params = req.body;
    executeGetRequestForProviderPropertiesv2(params, res);
  },
  signRequestForProvider: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSignRequestForProvider(params, res, url);
  },
  getAmountForGWTransaction: (req, res) => {
    const params = req.body;
    executeGetAmountForGWTransaction(params, res);
  },
};

module.exports = ControllerPaymentProvider;
