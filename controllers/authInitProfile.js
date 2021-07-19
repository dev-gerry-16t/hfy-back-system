const sql = require("mssql");

const executeUserProfile = async (params, res) => {
  const { idSystemUser, token, offset = process.env.OFFSET } = params;
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
    offset = process.env.OFFSET,
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

const executeSetUserProfileTheme = async (params, res, url) => {
  const { themeConfig, idLoginHistory, offset = process.env.OFFSET } = params;
  const { idSystemUser } = url;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcThemeConfig", sql.NVarChar, themeConfig)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("authSch.USPupdateUserConfig");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      res
        .status(resultRecordset[0].stateCode)
        .send({ response: { message: resultRecordset[0].message } });
    } else {
      res.status(200).send({ response: { message: "Tema guardado" } });
    }
  } catch (err) {
    res
      .status(500)
      .send({ response: { message: "Error en el sistema", typeError: err } });
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
  setUserProfileTheme: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSetUserProfileTheme(params, res, url);
  },
};

module.exports = ControllerAuth;
