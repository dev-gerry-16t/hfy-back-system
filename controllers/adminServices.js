const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
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
    request.input("p_decRating", sql.Decimal, rating);
    request.input("p_bitIsApproved", sql.Bit, isApproved);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPupdateContract", (err, result) => {
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

const executeGetContract = async (params, res) => {
  const {
    download,
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
    request.execute("customerSch.USPgetContract", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        if (download === true) {
        } else {
          const resultRecordset = result.recordset;
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
};

module.exports = ControllerAdmin;
