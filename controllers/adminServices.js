const sql = require("mssql");
const Stripe = require("stripe");
const AWS = require("aws-sdk");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const executeMailTo = require("../actions/sendInformationUser");
const replaceConditionsDocx = require("../actions/conditions");
const { executeSetCustomerAccount } = require("../actions/setCustomerAccount");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});
const stripe = new Stripe(GLOBAL_CONSTANTS.SECRET_KEY_STRIPE);

const parseDateOfBorth = (date) => {
  let month = "";
  let year = "";
  let day = "";
  if (isNil(date) === false) {
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getUTCDate();
  }
  return { year, month, day };
};

const getIdStripeDocument = async (array) => {
  const idStripe = await Promise.all(
    array.map(async (row, ix) => {
      const file = await s3
        .getObject({
          Bucket: row.bucketSource.toLowerCase(),
          Key: row.idDocument,
        })
        .promise();
      const buff = new Buffer.from(file.Body, "binary");
      const fileStripe = await stripe.files.create({
        purpose: "identity_document",
        file: {
          data: buff,
          name: row.idDocument,
          type: "application/octet-stream",
        },
      });
      return fileStripe.id;
    })
  );

  return idStripe;
};

const executeGetDataForCustomerAccount = async (params, id) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, id)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("pymtGwSch.USPgetDataForCustomerAccount");

    const {
      idContract,
      idCustomer,
      idConnectAccount,
      givenName,
      lastName,
      mothersMaidenName,
      fullName,
      type,
      country,
      emailAddress,
      phoneNumber,
      city,
      line1,
      line2,
      postal_code,
      state,
      acceptedTCAt,
      acceptedTCFromIP,
      id_number,
      accountHolder,
      accountNumber,
      clabeNumber,
      accountCurrency,
      dateOfBirth,
      mcc,
      product_description,
      idAccount,
    } = result.recordset[0];

    const { year, month, day } = parseDateOfBorth(dateOfBirth);
    const tokenIdNumber = await stripe.tokens.create({
      pii: { id_number: "000000000" },
    });
    const [front, back] = await getIdStripeDocument(result.recordsets[1]);
    const account = await stripe.accounts.create({
      type,
      country,
      email: emailAddress,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      individual: {
        address: {
          city,
          country,
          line1,
          line2,
          postal_code,
          state,
        },
        dob: {
          day,
          month,
          year,
        },
        last_name: lastName,
        id_number: tokenIdNumber.id,
        maiden_name: mothersMaidenName,
        email: emailAddress,
        first_name: givenName,
        phone: phoneNumber,
        verification: {
          document: {
            back: isNil(back) === false ? back : null,
            front: isNil(front) === false ? front : null,
          },
        },
      },
      external_account: {
        object: "bank_account",
        country: country,
        currency: accountCurrency,
        account_holder_name: accountHolder,
        account_holder_type: "individual",
        account_number: "000000001234567897",
        // isNil(clabeNumber) === false ? Number(clabeNumber) : null,
      },
      tos_acceptance: {
        date: Number(acceptedTCAt),
        ip: acceptedTCFromIP,
      },
      business_profile: {
        mcc,
        product_description,
      },
    });
    await executeSetCustomerAccount({
      idContract,
      idCustomer,
      idConnectAccount: account.id,
      idConnectAccountPerson: null,
      createdConnectAccount: account.created,
      jsonServiceResponseAccount: JSON.stringify(account),
      jsonServiceResponsePerson: null,
      isActive: true,
      idSystemUser,
      idLoginHistory,
      idAccount,
    });
  } catch (err) {
    throw err;
  }
};

const executeGetContractStats = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetContractStats", (err, result) => {
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

const executeGetContractCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.NVarChar, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetContractCoincidences", (err, result) => {
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

const executeGetContractIndicatorsChart = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetContractIndicatorsChart",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          res.status(200).send({
            response: result.recordset,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeSearchCustomer = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    dataFiltered,
    idCustomer,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcDataFiltered", sql.NVarChar, dataFiltered);
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_intType", sql.Int, type);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPsearchCustomer", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        res.status(200).send({
          response: result.recordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddProspect = async (params, res) => {
  const {
    idCustomer,
    idPersonType,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    givenName,
    lastName,
    mothersMaidenName,
    emailAddress,
    customerTenant,
    idCustomerAgent,
    CAGivenName,
    CALastName,
    CAMothersMaidenName,
    CAEmailAddress,
  } = params;
  try {
    const request = new sql.Request();
    const tvp = new sql.Table();

    tvp.columns.add("id", sql.Int);
    tvp.columns.add("idCustomerTenant", sql.UniqueIdentifier);
    tvp.columns.add("idCustomerType", sql.Int);
    tvp.columns.add("idPersonType", sql.Int);
    tvp.columns.add("givenName", sql.NVarChar(512));
    tvp.columns.add("lastName", sql.NVarChar(256));
    tvp.columns.add("mothersMaidenName", sql.NVarChar(256));
    tvp.columns.add("emailAddress", sql.NVarChar(sql.MAX));
    tvp.columns.add("phoneNumber", sql.NVarChar(sql.MAX));

    if (isEmpty(customerTenant) === false) {
      customerTenant.forEach((element) => {
        tvp.rows.add(
          element.id,
          element.idCustomerTenant,
          element.idCustomerType,
          element.idPersonType,
          element.givenName,
          element.lastName,
          element.mothersMaidenName,
          element.emailAddress,
          element.phoneNumber
        );
      });
    }

    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_intIdPersonType", sql.Int, idPersonType);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_udttCustomerTenant", tvp);
    request.input("p_nvcIdCustomerAgent", sql.NVarChar, idCustomerAgent);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcCAGivenName", sql.NVarChar, CAGivenName);
    request.input("p_nvcCALastName", sql.NVarChar, CALastName);
    request.input(
      "p_nvcCAMothersMaidenName",
      sql.NVarChar,
      CAMothersMaidenName
    );
    request.input("p_nvcCAEmailAddress", sql.NVarChar, CAEmailAddress);

    request.execute("customerSch.USPaddProspect", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        if (result.recordset[0].stateCode !== 200) {
          res.status(result.recordset[0].stateCode).send({
            response: { message: result.recordset[0].message },
          });
        } else {
          result.recordset.forEach((element) => {
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
            response: "Solicitud procesado exitosamente",
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeUpdateContract = async (params, res, url) => {
  const {
    idCustomer,
    idCustomerTenant,
    idPolicyStatus,
    rating,
    isApproved,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    idRejectionReason = null,
    rejectionReason = null,
  } = params;

  const { idContract } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_intIdPolicyStatus", sql.Int, idPolicyStatus);
    request.input("p_decRating", sql.Decimal(5, 2), rating);
    request.input("p_bitIsApproved", sql.Bit, isApproved);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intIdRejectionReason", sql.Int, idRejectionReason);
    request.input("p_nvcRejectionReason", sql.NVarChar, rejectionReason);
    request.execute("customerSch.USPupdateContract", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: { message: resultRecordset[0].message },
          });
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
          // shouldAccountBeReactivated
          if (
            resultRecordset[0].shouldAccountBeCreated === 1 ||
            resultRecordset[0].shouldAccountBeCreated === true
          ) {
            executeGetDataForCustomerAccount(params, idContract);
          }
          res.status(200).send({
            response: "Solicitud procesada exitosamente",
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeSwitchCustomerInContract = async (params, res, url) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idContract } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPswitchCustomerInContract",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          if (resultRecordset[0].stateCode !== 200) {
            res.status(resultRecordset[0].stateCode).send({
              response: resultRecordset[0].message,
            });
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
              response: "Solicitud procesada exitosamente",
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

const executeGetByIdContract = async (params, res) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetCustomerByIdContract", (err, result) => {
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

const executeGetTenantByIdContract = async (params, res) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetCustomerTenantByIdContract",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordsets;
          res.status(200).send({
            response1: resultRecordset[0],
            response2: resultRecordset[1],
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAgentByIdContract = async (params, res) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetCustomerAgentByIdContract",
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

const executeGetContractProperties = async (params, callback) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "customerSch.USPgetDigitalContractProperties",
      (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          let resultRecordset = [];
          if (type !== 4) {
            resultRecordset = result.recordset;
          } else {
            resultRecordset = result.recordsets[1];
          }
          callback(null, resultRecordset);
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    throw err;
  }
};

const executeGetContractPropertiesv2 = async (params) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPgetDigitalContractProperties");
    let resultRecordset = [];
    if (type !== 4) {
      resultRecordset = result.recordset;
    } else {
      resultRecordset = result.recordsets[1];
    }
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeGetContractPropertiesv3 = async (params) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPgetDigitalContractProperties");
    let resultRecordset = [];
    if (type !== 4) {
      resultRecordset = result.recordset;
    } else {
      resultRecordset = result.recordsets[1];
    }
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeAddDocument = async (resultGet, params, dataParams, file, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    documentName = null,
    extension = "docx",
    preview = null,
    thumbnail = null,
    bucket = "",
  } = params;

  const { idPreviousDocument, idDocumentType } = resultGet;

  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcDocumentName", sql.NVarChar, documentName);
    request.input("p_nvcExtension", sql.NVarChar, extension);
    request.input("p_nvcPreview", sql.NVarChar, preview);
    request.input("p_nvcThumbnail", sql.NVarChar, thumbnail);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intIdDocumentType", sql.Int, idDocumentType);
    request.execute("documentSch.USPaddDocument", async (err, result) => {
      if (err) {
        res.status(500).send({ response: err });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: resultRecordset[0],
          });
        } else {
          const zip = new PizZip(file);
          let doc;
          try {
            doc = new Docxtemplater(zip, {
              parser: replaceConditionsDocx,
              nullGetter: () => {
                return "";
              },
            });
          } catch (error) {
            res.status(500).send({ response: "Fail replace vars" });
          }
          doc.setData(dataParams);
          try {
            await doc.render();
          } catch (error) {
            res.status(500).send({ response: "Fail render vars" });
          }

          const fileDocument = await doc
            .getZip()
            .generate({ type: "nodebuffer" });
          const bucketSorce =
            isNil(resultRecordset[0]) === false &&
            isNil(resultRecordset[0].bucketSource) === false
              ? resultRecordset[0].bucketSource.toLowerCase()
              : bucket.toLowerCase();
          const idDocument = resultRecordset[0].idDocument;
          const params = {
            Bucket: bucketSorce,
            Key: idDocument,
            Body: fileDocument,
          };

          if (isNil(idPreviousDocument) === false) {
            const params1 = {
              Bucket: bucketSorce,
              Key: idPreviousDocument,
            };
            s3.deleteObject(params1, (err, data) => {
              if (err) {
                console.log("fail delete object in bucket aws");
              } else {
                console.log("Success delete object in bucket aws");
              }
            });
          }
          s3.upload(params, (err, data) => {
            if (err) {
              res.status(500).send({
                response: err,
              });
            } else {
              res.status(200).send({
                response: [
                  {
                    ...resultGet,
                    url: `/api/viewFilesDocx/${idDocument}/${bucketSorce}`,
                    idDocument,
                  },
                ],
              });
            }
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddDocumentv2 = async (resultGet, params) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    documentName = null,
    extension = "docx",
    preview = null,
    thumbnail = null,
    bucket = "",
  } = params;

  const { idPreviousDocument, idDocumentType } = resultGet;

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

const processFileToUpload = async (resultObject, params, res) => {
  try {
    const bucketSource = resultObject.bucketSource.toLowerCase();
    s3.getObject(
      {
        Bucket: bucketSource,
        Key: resultObject.idDocument,
      },
      async (err, data) => {
        try {
          if (err) {
            throw err;
          } else {
            const buff = new Buffer.from(data.Body, "binary");
            await executeGetContractProperties(
              params,
              async (error, result) => {
                try {
                  let objectParams = {};
                  if (error) {
                    throw error;
                  } else {
                    if (params.type !== 4) {
                      objectParams =
                        isNil(result[0]) === false ? result[0] : {};
                    } else {
                      objectParams = {
                        payments: isNil(result) === false ? result : [],
                      };
                    }
                    await executeAddDocument(
                      resultObject,
                      params,
                      objectParams,
                      buff,
                      res
                    );
                  }
                } catch (error) {
                  res.status(500).send({ response: "Error en los parametros" });
                }
              }
            );
          }
        } catch (error) {
          throw error;
        }
      }
    );
  } catch (error) {
    throw error;
  }
};

const executeAddContractDocument = async (params, res, url) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
  } = params;
  const { idDocument } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdDocument", sql.NVarChar, idDocument);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intType", sql.Int, type);
    request.execute("customerSch.USPaddContractDocument", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: resultRecordset[0].message,
          });
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

const executeGetContract = async (params, res) => {
  const {
    download,
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
    url,
    process,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intType", sql.Int, type);
    request.execute("customerSch.USPgetContract", async (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (
          isEmpty(resultRecordset) === false &&
          isNil(resultRecordset[0]) === false
        ) {
          const resultObject = resultRecordset[0];
          if (download === true) {
            if (isNil(resultObject.idPreviousDocument) === false) {
              s3.getObject(
                {
                  Bucket: resultObject.bucketSource.toLowerCase(),
                  Key: resultObject.idPreviousDocument,
                },
                (err, data) => {
                  if (err) {
                    res.status(500).send({
                      response: {
                        statusText:
                          "No encontramos tu documento, intenta mas tarde",
                      },
                    });
                  } else {
                    const buff = new Buffer.from(data.Body, "binary");
                    res.send(buff);
                  }
                }
              );
            } else {
              res.status(500).send({
                response: {
                  statusText:
                    "Antes de poder descargar tu documento haz clic en Ver",
                },
              });
            }
          } else if (process === true) {
            try {
              await processFileToUpload(resultObject, params, res);
            } catch (error) {
              throw error;
            }
          } else {
            res.status(200).send({
              response: [{ ...resultObject, url }],
            });
          }
        } else {
          res.status(200).send({
            response: [],
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    res.status(500).send({ response: "Error en los parametros" });
  }
};

const executeAddContractDocumentV2 = async (params) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
    idDocument,
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
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPaddContractDocument");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      throw new Error(resultRecordset[0].message);
    }
    return result;
  } catch (err) {
    throw err;
  }
};

const executeGetContractV2 = async (params, res) => {
  const {
    download,
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
    url,
    process,
    bucket = "",
  } = params;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPgetContract");
    const resultRecordset = result.recordset;
    if (
      isEmpty(resultRecordset) === false &&
      isNil(resultRecordset[0]) === false
    ) {
      const resultObject = resultRecordset[0];
      if (download === true || process === true) {
        //Obtenemos el bucketSource en donde esta almacenado el template word
        const bucketSource = resultObject.bucketSource.toLowerCase();

        //Obtenemos el buffer del documento a ser procesado
        const file = await s3
          .getObject({
            Bucket: bucketSource,
            Key: resultObject.idDocument,
          })
          .promise();

        //Obtenemos el buffer y pasamos a binario
        const buff = new Buffer.from(file.Body, "binary");

        //Ejecutamos el USP que nos traerá las variables para remplazar el template
        const dataProperties = await executeGetContractPropertiesv2(params);

        //Cuando el documento es un pagare viene en el set 2 del sp y su id es 4
        let objectParams = {};
        if (type !== 4) {
          //Extraemos las variables de reemplazo del set 1 como objeto para pólizas y contratos
          objectParams =
            isNil(dataProperties[0]) === false ? dataProperties[0] : {};
        } else {
          //Extraemos las variables de reemplazo del set 2 como array para el pagaré
          objectParams = {
            payments: isNil(dataProperties) === false ? dataProperties : [],
          };
        }

        //Ejecutamos el USPaddDocument para saber en donde  y con que nombre guardar el nuevo documento a ser reemplazado por las variables
        const dataAddDocument = await executeAddDocumentv2(
          resultObject,
          params
        );

        //obtenemos el objeto de respuesta del usp
        const resultObjectAddDocument = dataAddDocument[0];

        //Si existe un error arrogado por la base de datos lo informamos
        if (resultObjectAddDocument.stateCode !== 200) {
          res.status(resultObjectAddDocument.stateCode).send({
            response: { message: resultObjectAddDocument.message },
          });
        } else {
          //Si no existe un error arrogado por la base de datos continuamos

          //Procesamiento de Docxtemplater
          const zip = new PizZip(buff);
          let doc;
          doc = await new Docxtemplater(zip, {
            parser: replaceConditionsDocx,
            nullGetter: () => {
              return "";
            },
          });
          await doc.setData(objectParams);
          await doc.render();

          //El documento procesado lo obtenemos en buffer
          const fileDocument = await doc
            .getZip()
            .generate({ type: "nodebuffer" });

          //Almacenamos el bucketSource en donde se almacenara el nuevo documento procesado
          const bucketSorce =
            isNil(resultObjectAddDocument) === false &&
            isNil(resultObjectAddDocument.bucketSource) === false
              ? resultObjectAddDocument.bucketSource.toLowerCase()
              : bucket.toLowerCase();

          //Almacenamos el nombre de como se llamara el documento procesado
          const idDocument = resultObjectAddDocument.idDocument;
          const params2 = {
            Bucket: bucketSorce,
            Key: idDocument,
            Body: fileDocument,
          };

          //Subimos a amazon el nuevo documento procesado
          await s3.upload(params2).promise();

          if (isNil(resultObject.idPreviousDocument) === false) {
            //Si existe un documento previo procesado lo eliminaremos, por que ya tenemos uno nuevo
            const params1 = {
              Bucket: bucketSorce,
              Key: resultObject.idPreviousDocument,
            };

            //Lo eliminamos con las funciones de amazon
            await s3.deleteObject(params1).promise();
          }

          if (download === true) {
            // si descargamos mandamos el buffer o binario y asociamos el id al contrato
            await executeAddContractDocumentV2({
              idContract,
              idSystemUser,
              idLoginHistory,
              offset,
              type,
              idDocument,
            });
            res.send(fileDocument);
          } else {
            //Respondemos que todo salio bien
            res.status(200).send({
              response: [
                {
                  ...resultObject,
                  url: `/api/viewFilesDocx/${idDocument}/${bucketSorce}`,
                  idDocument,
                },
              ],
            });
          }
        }
      } else {
        res.status(200).send({
          response: [{ ...resultObject, url }],
        });
      }
    } else {
      res.status(200).send({
        response: [],
      });
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      response: { message: "Error al generar el documento", typeError: err },
    });
  }
};

const executeGetContractComment = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idDigitalContract,
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdDigitalContract", sql.NVarChar, idDigitalContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetContractComment", (err, result) => {
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

const executeGetDigitalContractDocument = async (params, res) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    type,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "customerSch.USPgetDigitalContractDocument",
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

const executeGetDocumentByIdContract = async (params, res, req) => {
  const {
    idContract,
    idDigitalContract = null,
    idCustomer,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    type,
    typeProcess,
    download,
    bucket = "",
    offset = GLOBAL_CONSTANTS.OFFSET,
    onlyView = false,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdDigitalContract", sql.NVarChar, idDigitalContract)
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPgetDocumentByIdContract");

    const resultRecordset = result.recordset;

    if (download === true) {
      if (
        isNil(resultRecordset[0]) === false &&
        isNil(resultRecordset[0].idDocument) === false
      ) {
        if (resultRecordset[0].canGenerateDocument === true) {
          const bucketSource = resultRecordset[0].bucketSource.toLowerCase();
          const file = await s3
            .getObject({
              Bucket: bucketSource,
              Key: resultRecordset[0].idDocument,
            })
            .promise();
          const buff = new Buffer.from(file.Body, "binary");
          const dataProperties = await executeGetContractPropertiesv3({
            ...params,
            type: typeProcess,
          });
          let objectParams = {};
          if (typeProcess !== 4) {
            objectParams =
              isNil(dataProperties[0]) === false ? dataProperties[0] : {};
          } else {
            objectParams = {
              payments: isNil(dataProperties) === false ? dataProperties : [],
            };
          }
          const dataAddDocument = await executeAddDocumentv2(
            resultRecordset[0],
            params
          );
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
            await doc.setData(objectParams);
            await doc.render();
            const fileDocument = await doc
              .getZip()
              .generate({ type: "nodebuffer" });
            const bucketSorce =
              isNil(resultObjectAddDocument) === false &&
              isNil(resultObjectAddDocument.bucketSource) === false
                ? resultObjectAddDocument.bucketSource.toLowerCase()
                : bucket.toLowerCase();
            const idDocument = resultObjectAddDocument.idDocument;
            const params2 = {
              Bucket: bucketSorce,
              Key: idDocument,
              Body: fileDocument,
            };
            await s3.upload(params2).promise();

            if (isNil(resultRecordset[0].idPreviousDocument) === false) {
              const params1 = {
                Bucket: bucketSorce,
                Key: resultRecordset[0].idPreviousDocument,
              };
              await s3.deleteObject(params1).promise();
            }
            if (onlyView === false) {
              res.setHeader("Content-Type", "application/octet-stream");
              res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
              res.status(200).send(fileDocument);
            } else {
              res.status(200).send({
                response: {
                  url: `/api/viewFilesDocx/${idDocument}/${bucketSorce}`,
                },
              });
            }
          }
        } else {
          const bucketSorce =
            isNil(resultRecordset[0]) === false &&
            isNil(resultRecordset[0].bucketSource) === false
              ? resultRecordset[0].bucketSource.toLowerCase()
              : bucket.toLowerCase();
          const dataDocument = await s3
            .getObject({
              Bucket: bucketSorce,
              Key: resultRecordset[0].idDocument,
            })
            .promise();
          const buff = new Buffer.from(dataDocument.Body, "binary");
          res.setHeader("Content-Type", "application/octet-stream");
          res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
          res.status(200).send(buff);
        }
      } else {
        res.status(500).send({
          response: "No encontramos idDocument y content",
        });
      }
    } else {
      if (
        isNil(resultRecordset[0]) === false &&
        isNil(resultRecordset[0].idDocument) === false
      ) {
        res.status(200).send({ extension: resultRecordset[0].extension });
      } else {
        res.status(500).send({
          response: "No encontramos idDocument y content",
        });
      }
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send({
      response: { message: "Error en los parametros", errorType: err },
    });
  }
};

const executeGetRequestAdvancePymtById = async (params, res) => {
  const {
    idRequestAdvancePymt,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdRequestAdvancePymt", sql.NVarChar, idRequestAdvancePymt)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetRequestAdvancePymtById");
    const resultRecordset = result.recordsets;
    res.status(200).send({
      response: resultRecordset,
    });
  } catch (err) {
    res.status(500).send({
      response: { message: "Error en los parametros", messageType: err },
    });
    // ... error checks
  }
};

const executeUpdateRequestAdvancePymt = async (params, res, url) => {
  const {
    idRequestAdvancePymtStatus,
    digitalSignature = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idRequestAdvancePymt } = url;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdRequestAdvancePymt", sql.NVarChar, idRequestAdvancePymt)
      .input(
        "p_intIdRequestAdvancePymtStatus",
        sql.Int,
        idRequestAdvancePymtStatus
      )
      .input("p_nvcDigitalSignature", sql.NVarChar, digitalSignature)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPupdateRequestAdvancePymt");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      res.status(resultRecordset[0].stateCode).send({
        response: { message: resultRecordset[0].message },
      });
    } else {
      resultRecordset.forEach((element) => {
        if (element.canSendEmail === true) {
          const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
          executeMailTo({
            ...element,
            ...configEmailServer,
          });
        }
      });
      res.status(200).send({
        response: "Solicitud procesada exitosamente",
      });
    }
  } catch (err) {
    res.status(500).send({
      response: { message: "Error en los parametros", messageType: err },
    });
    // ... error checks
  }
};

const executeAddDigitalContractDocument = async (params, res, url) => {
  const {
    idDigitalContract,
    idDocument,
    idSystemUser,
    idLoginHistory,
    type,
    requiresDigitalSignature,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idContract } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdDigitalContract", sql.NVarChar, idDigitalContract);
    request.input("p_nvcIdDocument", sql.NVarChar, idDocument);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.input(
      "p_bitRequiresDigitalSignature",
      sql.Bit,
      requiresDigitalSignature
    );
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPaddDigitalContractDocument",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          if (result.recordset[0].stateCode !== 200) {
            res.status(result.recordset[0].stateCode).send({
              response: result.recordset[0].message,
            });
          } else {
            result.recordset.forEach((element) => {
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
              response: "Solicitud procesado exitosamente",
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

const executeSetContract = async (params, res, url) => {
  const {
    idCustomer,
    idCustomerTenant,
    idPolicy = null,
    digitalSignature = null,
    anex2 = null,
    startedAt = null,
    scheduleSignatureDate = null,
    collectionDays = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
    isFaceToFace,
  } = params;
  const { idContract } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdPolicy", sql.NVarChar, idPolicy);
    request.input("p_vchDigitalSignature", sql.VarChar, digitalSignature);
    request.input("p_nvcAnex2", sql.NVarChar, anex2);
    request.input("p_datStartedAt", sql.Date, startedAt);
    request.input("p_intType", sql.Int, type);
    request.input(
      "p_datScheduleSignatureDate",
      sql.DateTime,
      scheduleSignatureDate
    );
    request.input("p_nvcCollectionDays", sql.NVarChar, collectionDays);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_bitIsFaceToFace", sql.Bit, isFaceToFace);
    request.execute("customerSch.USPsetContract", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        if (result.recordset[0].stateCode !== 200) {
          res.status(result.recordset[0].stateCode).send({
            response: { message: result.recordset[0].message },
          });
        } else {
          result.recordset.forEach((element) => {
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
            response: "Solicitud procesada exitosamente",
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddContractComment = async (params, res, url) => {
  const {
    idCustomer,
    idCustomerTenant,
    idDigitalContract,
    comment,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idContract } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdDigitalContract", sql.NVarChar, idDigitalContract);
    request.input("p_nvcComment", sql.NVarChar, comment);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPaddContractComment", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: resultRecordset[0].message,
          });
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
            response: resultRecordset[0].message,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetCustomerAgentCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.NVarChar, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetCustomerAgentCoincidences",
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

const executeGetLegalContractCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.NVarChar, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetLegalContractCoincidences",
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

const executeGetRequestAdvancePymtCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.NVarChar, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetRequestAdvancePymtCoincidences",
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

const executeSetPersonalReferenceForm = async (params, res, url) => {
  const {
    idRelationshipType,
    currentTimeRange,
    currentTime,
    isRecommended,
    observations,
    idPersonalReferenceStatus,
    rating,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idPersonalReference } = url;
  try {
    const request = new sql.Request();
    request.input(
      "p_nvcIdPersonalReference",
      sql.NVarChar,
      idPersonalReference
    );
    request.input("p_intIdRelationshipType", sql.Int, idRelationshipType);
    request.input("p_chrCurrentTimeRange", sql.Char, currentTimeRange);
    request.input("p_intCurrentTime", sql.Int, currentTime);
    request.input("p_bitIsRecommended", sql.Bit, isRecommended);
    request.input("p_nvcObservations", sql.NVarChar, observations);
    request.input(
      "p_intIdPersonalReferenceStatus",
      sql.Int,
      idPersonalReferenceStatus
    );
    request.input("p_decRating", sql.Decimal(5, 2), rating);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPsetPersonalReferenceForm",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          if (resultRecordset[0].stateCode !== 200) {
            res.status(resultRecordset[0].stateCode).send({
              response: { message: resultRecordset[0].message },
            });
          } else {
            res.status(200).send({
              response: resultRecordset,
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

const ControllerAdmin = {
  getContractStats: (req, res) => {
    const params = req.body;
    executeGetContractStats(params, res);
  },
  getContractCoincidences: (req, res) => {
    const params = req.body;
    executeGetContractCoincidences(params, res);
  },
  getContractIndicatorsChart: (req, res) => {
    const params = req.body;
    executeGetContractIndicatorsChart(params, res);
  },
  searchCustomer: (req, res) => {
    const params = req.body;
    executeSearchCustomer(params, res);
  },
  addProspect: (req, res) => {
    const params = req.body;
    executeAddProspect(params, res);
  },
  updateContract: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateContract(params, res, url);
  },
  getByIdContract: (req, res) => {
    const params = req.body;
    executeGetByIdContract(params, res);
  },
  getTenantByIdContract: (req, res) => {
    const params = req.body;
    executeGetTenantByIdContract(params, res);
  },
  getAgentByIdContract: (req, res) => {
    const params = req.body;
    executeGetAgentByIdContract(params, res);
  },
  switchCustomerInContract: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSwitchCustomerInContract(params, res, url);
  },
  getContract: (req, res) => {
    const params = req.body;
    executeGetContract(params, res);
  },
  getContractV2: (req, res) => {
    const params = req.body;
    executeGetContractV2(params, res);
  },
  getContractComment: (req, res) => {
    const params = req.body;
    executeGetContractComment(params, res);
  },
  setContract: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSetContract(params, res, url);
  },
  addContractComment: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeAddContractComment(params, res, url);
  },
  addContractDocument: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeAddContractDocument(params, res, url);
  },
  getDigitalContractDocument: (req, res) => {
    const params = req.body;
    executeGetDigitalContractDocument(params, res);
  },
  addDigitalContractDocument: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeAddDigitalContractDocument(params, res, url);
  },
  getDocumentByIdContract: (req, res) => {
    const params = req.body;
    executeGetDocumentByIdContract(params, res, req);
  },
  getRequestAdvancePymtById: (req, res) => {
    const params = req.body;
    executeGetRequestAdvancePymtById(params, res, req);
  },
  updateRequestAdvancePymt: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateRequestAdvancePymt(params, res, url);
  },
  getCustomerAgentCoincidences: (req, res) => {
    const params = req.body;
    executeGetCustomerAgentCoincidences(params, res);
  },
  getLegalContractCoincidences: (req, res) => {
    const params = req.body;
    executeGetLegalContractCoincidences(params, res);
  },
  setPersonalReferenceForm: (req, res) => {
    const params = req.body;
    const url = req.params; //idPersonalReference
    executeSetPersonalReferenceForm(params, res, url);
  },
  getRequestAdvancePymtCoincidences: (req, res) => {
    const params = req.body;
    executeGetRequestAdvancePymtCoincidences(params, res);
  },
};

module.exports = ControllerAdmin;
