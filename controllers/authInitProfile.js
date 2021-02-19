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

const executeSetUserProfile = async (params, res, url) => {
  const {
    idCustomer,
    idLoginHistory,
    documentName,
    extension,
    preview,
    thumbnail,
    offset = "-06:00",
  } = params;
  const { idSystemUser } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcDocumentName", sql.NVarChar, documentName);
    request.input("p_nvcExtension", sql.NVarChar, extension);
    request.input("p_nvcPreview", sql.NVarChar, preview);
    request.input("p_nvcThumbnail", sql.NVarChar, thumbnail);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("authSch.USPsetUserProfile", (err, result) => {
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

const ControllerAuth = {
  userProfile: (req, res) => {
    const params = req.body;
    executeUserProfile(params, res);
  },
  userMenuProfile: (req, res) => {
    const params = req.body;
    executeMenuUserProfile(params, res);
  },
  setUserProfile: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSetUserProfile(params, res, url);
  },
};

module.exports = ControllerAuth;
