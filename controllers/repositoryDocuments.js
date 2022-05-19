const sql = require("mssql");
const AWS = require("aws-sdk");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const executeAddDocument = async (params, res, file) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    documentName,
    extension,
    preview,
    thumbnail,
    bucket = "",
    idDocumentType,
    idProperty = null,
  } = params;

  const fileName = documentName.split(".");
  const fileType = fileName[fileName.length - 1];
  try {
    const request = new sql.Request();
    request.input("p_uidIdProperty", sql.NVarChar, idProperty);
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcDocumentName", sql.NVarChar, documentName);
    request.input("p_nvcExtension", sql.NVarChar, fileType);
    request.input("p_nvcPreview", sql.NVarChar, preview);
    request.input("p_nvcThumbnail", sql.NVarChar, thumbnail);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intIdDocumentType", sql.Int, idDocumentType);
    request.execute("documentSch.USPaddDocument", (err, result) => {
      if (err) {
        res.status(500).send({ response: err });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: resultRecordset[0],
          });
        } else {
          const bucketSorce =
            isNil(resultRecordset[0]) === false &&
            isNil(resultRecordset[0].bucketSource) === false
              ? resultRecordset[0].bucketSource.toLowerCase()
              : bucket.toLowerCase();
          const idDocument = resultRecordset[0].idDocument;
          const params = {
            Bucket: bucketSorce,
            Key: idDocument,
            Body: file.buffer,
          };
          s3.upload(params, (err, data) => {
            if (err) {
              res.status(500).send({
                response: err,
              });
            } else {
              res.status(200).send({
                response: resultRecordset[0],
              });
            }
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddDocumentThumb = async (params, res, file) => {
  const { idDocument, bucketSource } = params;
  try {
    const paramsAws = {
      Bucket: bucketSource,
      Key: idDocument + "_thumb",
      Body: file.buffer,
    };
    await s3.upload(paramsAws).promise();
    res.status(200).send({
      response: "ok",
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllDocumentTypes = async (params, res) => {
  const { idCustomer, idCustomerTenant, idSystemUser, idLoginHistory, type } =
    params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catDocumentSch.USPgetAllDocumentTypes", (err, result) => {
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

const executeGetPaymentInContractDocument = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    filterDate,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    idDocumentType,
    topIndex,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcFilterDate", sql.NVarChar, filterDate);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intIdDocumentType", sql.Int, idDocumentType);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.execute(
      "paymentSch.USPgetPaymentInContractDocument",
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

const executeGetTypeFormDocument = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idTypeForm,
    type,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    isFirstTime,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdTypeForm", sql.NVarChar, idTypeForm);
    request.input("p_intType", sql.Int, type);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_bitIsFirstTime", sql.Bit, isFirstTime);
    request.execute("customerSch.USPgetTypeFormDocument", (err, result) => {
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

const executeGetCustTenantDashboardById = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetCustTenantDashboardById",
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

const ControllerDocuments = {
  addDocument: (req, res) => {
    const params = JSON.parse(req.body.fileProperties);
    const fileParams = req.file;
    executeAddDocument(params, res, fileParams);
  },
  addDocumentThumb: (req, res) => {
    const params = JSON.parse(req.body.fileProperties);
    const fileParams = req.file;
    executeAddDocumentThumb(params, res, fileParams);
  },

  getAllDocumentTypes: (req, res) => {
    const params = req.body;
    executeGetAllDocumentTypes(params, res);
  },
  getPaymentInContractDocument: (req, res) => {
    const params = req.body;
    executeGetPaymentInContractDocument(params, res);
  },
  getTypeFormDocument: (req, res) => {
    const params = req.body;
    executeGetTypeFormDocument(params, res);
  },
  getCustTenantDashboardById: (req, res) => {
    const params = req.body;
    executeGetCustTenantDashboardById(params, res);
  },
};

module.exports = ControllerDocuments;
