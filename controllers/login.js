const sql = require("mssql");
const AWS = require("aws-sdk");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module");
const PizZip = require("pizzip");
const jwt = require("jsonwebtoken");
const rp = require("request-promise");
const isNil = require("lodash/isNil");
const GLOBAL_CONSTANTS = require("../constants/constants");
const executeMailTo = require("../actions/sendInformationUser");
const replaceConditionsDocx = require("../actions/conditions");

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const base64DataURLToArrayBuffer = (dataURL) => {
  const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) {
    return false;
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  let binaryString;
  if (typeof window !== "undefined") {
    binaryString = window.atob(stringBase64);
  } else {
    binaryString = Buffer.from(stringBase64, "base64").toString("binary");
  }
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
};

const imageOpts = {
  getImage(tag) {
    return base64DataURLToArrayBuffer(tag);
  },
  getSize() {
    return [300, 100];
  },
};

const executeLoginUser = async (params, res, ip, userAgent) => {
  const { email, password, captchaToken, offset = process.env.OFFSET } = params;
  try {
    const responseGoogle = await rp({
      url: `https://www.google.com/recaptcha/api/siteverify`,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
      body: `secret=${GLOBAL_CONSTANTS.RECAPTCHA_VERIFY_KEY}&response=${captchaToken}&remoteip=${ip}`,
      rejectUnauthorized: false,
    });
    const { success, score } = responseGoogle;
    // if (success === true && score > 0.5) {
    const request = new sql.Request();
    request.input("p_nvcUsername", sql.VarChar, email);
    request.input("p_nvcPasssword", sql.VarChar, password);
    request.input("p_nvcIP", sql.VarChar, ip);
    request.input("p_nvcUserAgent", sql.VarChar, userAgent);
    request.input("p_chrOffset", sql.VarChar, offset);
    request.execute("authSch.USPvalidateLogIn", (err, result) => {
      if (email === null || password === null) {
        res
          .status(400)
          .send({ response: "Los parametros de entrada son incorrectos" });
      } else {
        if (err) {
          console.log("error usp", err);
          res.status(500).send({ response: "Error de servidor" });
        } else if (
          result.recordset.length === 0 ||
          result.recordset[0].stateCode === 500
        ) {
          res.status(500).send({ response: result.recordset[0] });
        } else if (result) {
          const idUser = result.recordset[0].idSystemUser;
          const tokenExpires = result.recordset[0].tokenExpiration;
          const publicKeyStripe = GLOBAL_CONSTANTS.PUBLIC_KEY_STRIPE;
          const payload = {
            name: email,
            idSystemUser: idUser,
            publicKeyStripe,
          };
          const token = jwt.sign(
            payload,
            GLOBAL_CONSTANTS.MASTER_KEY_PERMISSION,
            {
              expiresIn: tokenExpires,
            }
          );

          res.status(200).send({
            response: { idSystemUser: idUser, token, publicKeyStripe },
          });
        }
      }
    });
    // } else {
    //   res.status(500).send({
    //     response: "Detectamos un problema de seguridad, intenta nuevamente",
    //   });
    // }
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetContractPropertiesv2 = async (params) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
  } = params;
  try {
    const pool = await sql.connect();

    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPgetDigitalContractProperties");
    let resultRecordset = [];
    if (type !== 4) {
      resultRecordset = result.recordset;
    } else {
      resultRecordset = result.recordsets[1];
    }
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeAddExternalDCDocument = async (params) => {
  const {
    idContract,
    idDigitalContract,
    idDocument,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdDigitalContract", sql.NVarChar, idDigitalContract)
      .input("p_nvcIdDocument", sql.NVarChar, idDocument)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPaddExternalDCDocument");
    const resultRecordset = result.recordset;
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeAddDocumentv2 = async (params) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    documentName = null,
    extension = "docx",
    preview = null,
    thumbnail = null,
    bucket = "",
    idDocumentType,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_nvcDocumentName", sql.NVarChar, documentName)
      .input("p_nvcExtension", sql.NVarChar, extension)
      .input("p_nvcPreview", sql.NVarChar, preview)
      .input("p_nvcThumbnail", sql.NVarChar, thumbnail)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intIdDocumentType", sql.Int, idDocumentType)
      .execute("documentSch.USPaddDocument");
    const resultRecordset = result.recordset;
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeGetRequestExternalDS = async (params, res, ip) => {
  const { idExternalUserInDC, type, offset = GLOBAL_CONSTANTS.OFFSET } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdExternalUserInDC", sql.NVarChar, idExternalUserInDC)
      .input("p_intType", sql.Int, type)
      .input("p_nvcIP", sql.NVarChar, ip)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPgetRequestExternalDS");
    const resultRecordset = result.recordset[0];
    if (isNil(type) === true) {
      res.status(200).send({
        response: {
          documentList: resultRecordset.documentList,
          idExternalUserInDC: resultRecordset.idExternalUserInDC,
          idDocument: null,
          bucketSource: null,
          isEditable: resultRecordset.isEditable,
        },
      });
    } else {
      const bucketSource = resultRecordset.bucketSource.toLowerCase();
      const file = await s3
        .getObject({
          Bucket: bucketSource,
          Key: resultRecordset.idDocument,
        })
        .promise();
      const buff = new Buffer.from(file.Body, "binary");
      const dataProperties = await executeGetContractPropertiesv2({
        idCustomer: null,
        idCustomerTenant: null,
        idContract: resultRecordset.idContract,
        idSystemUser: resultRecordset.idSystemUser,
        idLoginHistory: null,
        type,
      });
      let objectParams = {};
      if (type !== 4) {
        objectParams =
          isNil(dataProperties[0]) === false ? dataProperties[0] : {};
      } else {
        objectParams = {
          payments: isNil(dataProperties) === false ? dataProperties : [],
        };
      }
      const dataAddDocument = await executeAddDocumentv2({
        idCustomer: null,
        idSystemUser: resultRecordset.idSystemUser,
        idLoginHistory: null,
        documentName: null,
        extension: "docx",
        preview: null,
        thumbnail: null,
        bucket: "",
        idDocumentType: resultRecordset.idDocumentType,
      });
      const resultObjectAddDocument = dataAddDocument[0];
      if (resultObjectAddDocument.stateCode !== 200) {
        res.status(resultObjectAddDocument.stateCode).send({
          response: { message: resultObjectAddDocument.message },
        });
      } else {
        await executeAddExternalDCDocument({
          idContract: resultRecordset.idContract,
          idDigitalContract: resultRecordset.idDigitalContract,
          idDocument: resultObjectAddDocument.idDocument,
          type,
        });
        const zip = new PizZip(buff);
        let doc;
        const imageModule = new ImageModule(imageOpts);
        doc = await new Docxtemplater(zip, {
          modules: [imageModule],
          parser: replaceConditionsDocx,
          nullGetter: () => {
            return "";
          },
        });
        await doc.setData(objectParams);
        await doc.render();
        const fileDocument = await doc
          .getZip()
          .generate({ type: "nodebuffer" });
        const bucketSorce =
          isNil(resultObjectAddDocument) === false &&
          isNil(resultObjectAddDocument.bucketSource) === false
            ? resultObjectAddDocument.bucketSource.toLowerCase()
            : bucket.toLowerCase();
        const idDocument = resultObjectAddDocument.idDocument;
        const params2 = {
          Bucket: bucketSorce,
          Key: idDocument,
          Body: fileDocument,
        };
        await s3.upload(params2).promise();

        if (isNil(resultRecordset.idPreviousDocument) === false) {
          const params1 = {
            Bucket: bucketSorce,
            Key: resultRecordset.idPreviousDocument,
          };
          await s3.deleteObject(params1).promise();
        }
        res.status(200).send({
          response: {
            documentList: resultRecordset.documentList,
            idExternalUserInDC: resultRecordset.idExternalUserInDC,
            idDocument: idDocument,
            bucketSource: bucketSorce,
            isEditable: resultRecordset.isEditable,
            url: `/api/viewFilesDocx/${idDocument}/${bucketSorce}`,
          },
        });
      }
    }
  } catch (err) {
    res.status(500).send({
      response: { message: "Error en los parametros", messageType: `${err}` },
    });
    // ... error checks
  }
};

const executeSetRequestExternalDS = async (params, res, url, ip) => {
  const {
    digitalSignature,
    rejectRequest,
    isBadData,
    comment,
    phoneNumber,
    type,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idExternalUserInDC } = url;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdExternalUserInDC", sql.NVarChar, idExternalUserInDC)
      .input("p_vchDigitalSignature", sql.NVarChar, digitalSignature)
      .input("p_bitRejectRequest", sql.Bit, rejectRequest)
      .input("p_bitIsBadData", sql.Bit, isBadData)
      .input("p_nvcComment", sql.NVarChar, comment)
      .input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber)
      .input("p_intType", sql.Int, type)
      .input("p_nvcIP", sql.NVarChar, ip)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPsetRequestExternalDS");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      res.status(resultRecordset[0].stateCode).send({
        response: { message: resultRecordset[0].message },
      });
    } else {
      resultRecordset.forEach((element) => {
        if (element.canSendEmail === true) {
          const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
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
  } catch (err) {
    res.status(500).send({
      response: { message: "Error en los parametros", messageType: `${err}` },
    });
    // ... error checks
  }
};

const ControllerLogin = {
  login: (req, res) => {
    const params = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    const userAgent = req.header("User-Agent");
    executeLoginUser(params, res, ipPublic, userAgent);
  },
  getRequestExternalDS: (req, res) => {
    const params = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeGetRequestExternalDS(params, res, ipPublic);
  },
  setRequestExternalDS: (req, res) => {
    const params = req.body;
    const url = req.params; //idExternalUserInDC
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeSetRequestExternalDS(params, res, url, ipPublic);
  },
};

module.exports = ControllerLogin;
