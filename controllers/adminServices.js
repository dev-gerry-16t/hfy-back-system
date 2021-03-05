const sql = require("mssql");
const AWS = require("aws-sdk");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const nodemailer = require("nodemailer");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const executeEmailSentAES = async (param) => {
  const {
    idEmailStatus = 1,
    idEmailTemplate = 1,
    idRequestSignUp = null,
    idUserSender = null,
    idUserReceiver = null,
    sender = null,
    receiver = null,
    subject = null,
    content = null,
    jsonServiceResponse = null,
    offset = "-06:00",
    jsonEmailServerConfig = null,
    idInvitation = null,
  } = param;
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
      } else {
        console.log("success");
      }
    });
  } catch (error) {}
};

const executeMailTo = async (params) => {
  const { receiver, content, user, pass, host, port, subject } = params;
  const transporter = nodemailer.createTransport({
    auth: {
      user,
      pass,
    },
    host,
    port,
  });
  const mailOptions = {
    from: user,
    to: receiver,
    subject,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error);
    } else {
      executeEmailSentAES(params);
    }
  });
};

const executeGetContractStats = async (params, res) => {
  const { idSystemUser, idLoginHistory, offset = "-06:00" } = params;
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
  const { idSystemUser, idLoginHistory, topIndex, offset = "-06:00" } = params;
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
  const { idSystemUser, idLoginHistory, offset = "-06:00" } = params;
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
    offset = "-06:00",
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
    offset = "-06:00",
    givenName,
    lastName,
    mothersMaidenName,
    emailAddress,
    customerTenant,
    idCustomerAgent,
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
    offset = "-06:00",
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
  const { idSystemUser, idLoginHistory, offset = "-06:00" } = params;
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
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
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

const executeAddDocument = async (resultGet, params, dataParams, file, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
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

const executeGetContract = async (params, res) => {
  const {
    download,
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
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

const executeGetContractComment = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idDigitalContract,
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = "-06:00",
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
    offset = "-06:00",
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
    download,
    bucket = "",
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdDigitalContract", sql.NVarChar, idDigitalContract);
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intType", sql.Int, type);
    request.execute("customerSch.USPgetDocumentByIdContract", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (download === true) {
          if (
            isNil(resultRecordset[0]) === false &&
            isNil(resultRecordset[0].idDocument) === false
          ) {
            const bucketSorce =
              isNil(resultRecordset[0]) === false &&
              isNil(resultRecordset[0].bucketSource) === false
                ? resultRecordset[0].bucketSource.toLowerCase()
                : bucket.toLowerCase();
            s3.getObject(
              {
                Bucket: bucketSorce,
                Key: resultRecordset[0].idDocument,
              },
              (err, data) => {
                if (err) {
                  res.status(500).send({
                    response: err,
                  });
                } else {
                  const buff = new Buffer.from(data.Body, "binary");
                  res.setHeader("Content-Type", "application/octet-stream");
                  res.setHeader(
                    "Access-Control-Allow-Origin",
                    req.headers.origin
                  );
                  res.status(200).send(buff);
                }
              }
            );
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
      }
    });
  } catch (err) {
    console.log("ERROR", err);
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
    offset = "-06:00",
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
    offset = "-06:00",
    type,
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
      sql.Date,
      scheduleSignatureDate
    );
    request.input("p_nvcCollectionDays", sql.NVarChar, collectionDays);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPsetContract", (err, result) => {
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
    offset = "-06:00",
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

const executeAddContractDocument = async (params, res, url) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
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
};

module.exports = ControllerAdmin;
