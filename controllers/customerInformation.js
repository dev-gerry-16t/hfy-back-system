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

const executeTendantCoincidences = async (params, res) => {
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
    zipCode,
    firstStreetReference,
    secondStreetReference,
    totalSuites,
    departament,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcStreet", sql.NVarChar, street);
    request.input("p_nvcSuite", sql.NVarChar, suite);
    request.input("p_nvcStreetNumber", sql.NVarChar, streetNumber);
    request.input("p_nvcNeighborhood", sql.NVarChar, neighborhood);
    request.input("p_nvcState", sql.NVarChar, state);
    request.input("p_nvcCity", sql.NVarChar, city);
    request.input("p_nvcZipCode", sql.NVarChar, zipCode);
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
    request.input("p_nvcDepartment", sql.NVarChar, departament);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.execute("customerSch.USPaddProperty", (err, result) => {
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
            const {
              sender,
              receiver,
              content,
              subject,
              jsonEmailServerConfig,
            } = resultRecordset;
            const configEmailServer = JSON.parse(jsonEmailServerConfig);
            await executeMailTo({
              sender,
              receiver,
              content,
              subject,
              offset,
              ...configEmailServer,
            });
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

const ControllerCustomer = {
  getCustomerById: (req, res) => {
    const params = req.body;
    executeGetCustomerById(params, res);
  },
  getTendantCoincidences: (req, res) => {
    const params = req.body;
    executeTendantCoincidences(params, res);
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
};

module.exports = ControllerCustomer;
