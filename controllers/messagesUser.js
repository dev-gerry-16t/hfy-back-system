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
    offset = "-06:00",
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

const executeGetCustomerMessage = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
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
};

module.exports = ControllerMessages;
