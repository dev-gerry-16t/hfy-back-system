const sql = require("mssql");

const executeUserProfile = async (params, res) => {
  const { idSystemUser, token, offset = "-06:00" } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcToken", sql.NVarChar, token);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("authSch.USPgetUserProfile", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        result;
        res.status(200).send({
          response: resultRecordset[0],
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeMenuUserProfile = async (params, res) => {
  const { idSystemUser, idLoginHistory } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.execute("authSch.USPgetMenuTemplate", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        result;
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
        result;
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

const ControllerAuth = {
  userProfile: (req, res) => {
    const params = req.body;
    executeUserProfile(params, res);
  },
  userMenuProfile: (req, res) => {
    const params = req.body;
    executeMenuUserProfile(params, res);
  },
  getCustomerById: (req, res) => {
    const params = req.body;
    executeGetCustomerById(params, res);
  },
};

module.exports = ControllerAuth;
