const sql = require("mssql");

const executeAddDocument = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
    documentName,
    extension,
    preview,
    thumbnail,
    idDocumentType,
  } = params;
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
    request.input("p_intIdDocumentType", sql.Int, idDocumentType);
    request.execute("documentSch.USPaddDocument", (err, result) => {
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

const ControllerDocuments = {
  addDocument: (req, res) => {
    const params = req.body;
    executeAddDocument(params, res);
  },
};

module.exports = ControllerDocuments;
