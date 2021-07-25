const sql = require("mssql");

const executeAddCustomerMessage = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    visibilityRule,
    idCustomerMessages,
    customerMessages,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_intIdMessageVisibilityRule", sql.Int, visibilityRule);
    request.input("p_nvcIdCustomerMessage", sql.NVarChar, idCustomerMessages);
    request.input("p_nvcCustomerMessage", sql.NVarChar, customerMessages);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("comSch.USPaddCustomerMessage", (err, result) => {
      if (err) {
        res.status(500).send({
          response: {
            message: "Error en los parametros",
            messageType: `${err}`,
          },
        });
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
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
    res.status(500).send({
      response: { message: "Error en el sistema", messageType: `${err}` },
    });
  }
};

const executeGetNotifications = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    type = 1,
    topIndex = null,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_intType", sql.Int, type);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("comSch.USPgetNotifications", (err, result) => {
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
    res.status(500).send({
      response: { message: "Error en el sistema", messageType: `${err}` },
    });
  }
};

const executeUpdateNotifications = async (params, res, url) => {
  const { idSystemUser, idLoginHistory, offset = process.env.OFFSET } = params;
  const { idNotification } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdNotification", sql.NVarChar, idNotification);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("comSch.USPupdateNotification", (err, result) => {
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
    res.status(500).send({
      response: { message: "Error en el sistema", messageType: `${err}` },
    });
  }
};

const executeGetCustomerMessage = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    topIndex,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.execute("comSch.USPgetCustomerMessage", (err, result) => {
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
    res.status(500).send({
      response: { message: "Error en el sistema", messageType: `${err}` },
    });
  }
};

const ControllerMessages = {
  addCustomerMessage: (req, res) => {
    const params = req.body;
    executeAddCustomerMessage(params, res);
  },
  getCustomerMessage: (req, res) => {
    const params = req.body;
    executeGetCustomerMessage(params, res);
  },
  getNotifications: (req, res) => {
    const params = req.body;
    executeGetNotifications(params, res);
  },
  updateNotifications: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateNotifications(params, res, url);
  },
};

module.exports = ControllerMessages;
