const sql = require("mssql");

const executeGetAudit = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idPersonalReference,
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = process.env.OFFSET,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input(
      "p_nvcIdPersonalReference",
      sql.NVarChar,
      idPersonalReference
    );
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intType", sql.Int, type);
    request.execute("auditSch.USPgetAudit", (err, result) => {
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

const ControllerAudit = {
  getAudit: (req, res) => {
    const params = req.body;
    executeGetAudit(params, res);
  },
};

module.exports = ControllerAudit;
