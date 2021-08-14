const sql = require("mssql");
const executeMailTo = require("../actions/sendInformationUser");

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

const executeGetTestMail = async (params, res) => {
  const { idEmailTemplate = null } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdEmailTemplate", sql.NVarChar, idEmailTemplate)
      .execute("comSch.USPsentTestEA");
    const resultRecordset = result.recordset;
    for (const element of resultRecordset) {
      if (element.canSendEmail === true) {
        const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
        await executeMailTo({
          ...element,
          ...configEmailServer,
        });
      }
    }
    res.status(200).send({
      response: "ok",
    });
  } catch (error) {
    res.status(500).send({
      response: { error: `${error}` },
    });
  }
};

const ControllerAudit = {
  getAudit: (req, res) => {
    const params = req.body;
    executeGetAudit(params, res);
  },
  getTestMail: (req, res) => {
    const params = req.body;
    const paramsUrl = req.params;
    executeGetTestMail(paramsUrl, res);
  },
};

module.exports = ControllerAudit;
