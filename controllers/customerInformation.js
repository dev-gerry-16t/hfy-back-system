const sql = require("mssql");

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

const executeTendantCoincidences = async (params, res) => {
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
    request.execute(
      "customerSch.USPgetCustomerTendantCoincidences",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          result;
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
};

module.exports = ControllerCustomer;
