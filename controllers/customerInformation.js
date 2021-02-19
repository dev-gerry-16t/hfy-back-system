const sql = require("mssql");
const nodemailer = require("nodemailer");

const executeGetCustomerById = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
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
    offset = "-06:00",
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
  const { idCustomer, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
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
    offset = "-06:00",
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
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdIncidence", sql.NVarChar, idIncidence);
    request.input("p_intIdPaymentType", sql.Int, idPaymentType);
    request.input("p_datPaymentDate", sql.Date, paymentDate);
    request.input("p_decAmount", sql.Decimal, amount);
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
    advanceRents,
    accountHolder,
    accountNumber,
    clabeNumber,
    idBank,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_intMaximumAdvanceRents", sql.Int, advanceRents);
    request.input("p_nvcAccountHolder", sql.NVarChar, accountHolder);
    request.input("p_nvcAccountNumber", sql.NVarChar, accountNumber);
    request.input("p_nvcClabeNumber", sql.NVarChar, clabeNumber);
    request.input("p_nvcIdBank", sql.NVarChar, idBank);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPrequestAdvancePymt", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: resultRecordset,
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
    offset,
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
    email,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdApartment", sql.NVarChar, idApartment);
    request.input("p_intIdPersonType", sql.Int, idPersonType);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
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
            res
              .status(resultRecordset.stateCode)
              .send({ response: resultRecordset });
          } else {
            const objectResponseDataBase = {
              ...result.recordset[0],
              offset,
              jsonServiceResponse: result.recordset[0].stateCode,
            };
            await executeEmailSentAES(objectResponseDataBase);
            res.status(200).send({
              result: resultRecordset,
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
  const { idSystemUser, idLoginHistory, offset = "-06:00" } = params;
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
    offset = "-06:00",
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
};

module.exports = ControllerCustomer;
