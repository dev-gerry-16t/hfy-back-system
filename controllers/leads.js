const sql = require("mssql");

const executeAddLandingProspect = async (params, res) => {
  const {
    idProspectType = null,
    givenName = null,
    lastName = null,
    mothersMaidenName = null,
    phoneNumber = null,
    emailAddress = null,
    offset = "-06:00",
    budgeAmount = null,
    idPolicy = null,
    realState = null,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_intIdProspectType", sql.Int, idProspectType);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_decBudgeAmount", sql.Decimal(19, 2), budgeAmount);
    request.input("p_nvcIdPolicy", sql.NVarChar, idPolicy);
    request.input("p_nvcRealState", sql.NVarChar, realState);
    request.execute("landingSch.USPaddLandingProspect", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: resultRecordset[0],
          });
        } else {
          res.status(200).send({
            response: resultRecordset[0],
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetLandingProspectCoincidences = async (params, res) => {
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
      "landingSch.USPgetLandingProspectCoincidences",
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

const executeUpdateLandingProspect = async (params, res, url) => {
  const {
    idProspectStatus,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  const { idLandingProspect } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdLandingProspect", sql.NVarChar, idLandingProspect);
    request.input("p_intIdProspectStatus", sql.Int, idProspectStatus);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPupdateContract", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: { message: resultRecordset[0].message },
          });
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
            response: "Solicitud procesada exitosamente",
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetLandingProspectStats = async (params, res) => {
  const { idSystemUser, idLoginHistory, offset = "-06:00" } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("landingSch.USPgetLandingProspectStats", (err, result) => {
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

const ControllerLeads = {
  addLandingProspect: (req, res) => {
    const params = req.body;
    executeAddLandingProspect(params, res);
  },
  getLandingProspectCoincidences: (req, res) => {
    const params = req.body;
    executeGetLandingProspectCoincidences(params, res);
  },
  updateLandingProspect: (req, res) => {
    const params = req.body;
    const url = req.params; //idLandingProspect
    executeUpdateLandingProspect(params, res, url);
  },
  getLandingProspectStats: (req, res) => {
    const params = req.body;
    executeGetLandingProspectStats(params, res);
  },
};

module.exports = ControllerLeads;
