const sql = require("mssql");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");
const nodemailer = require("nodemailer");

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

const executeValidatePaymentSchedule = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  try {
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
    offset = "-06:00",
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
    offset = "-06:00",
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
  const { idSystemUser, idLoginHistory, topIndex, offset = "-06:00" } = params;
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
    offset = "-06:00",
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
  const { idSystemUser, idLoginHistory, topIndex, offset = "-06:00" } = params;
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
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
    idProvider,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_dtmScheduleDate", sql.DateTime, scheduleDate);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
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
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
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
};

module.exports = ControllerPaymentProvider;
