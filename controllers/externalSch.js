const sql = require("mssql");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");
const executeMailTo = require("../actions/sendInformationUser");

const executeSetRequest = async (params, res, url) => {
  const {
    idRequest = null,
    startedAt = null,
    scheduleAt = null,
    isFaceToFace = null,
    jsonUserImplicated = null,
    idProperty = null,
    idApartment = null,
    jsonProperty = null,
    requiresLegalAdvice = null,
    isActive = null,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idSystemUser } = url;
  const storeProcedure = "externalSch.USPsetRequest";

  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_datStartedAt", sql.Date, startedAt)
        .input("p_dtmScheduleAt", sql.DateTime, scheduleAt)
        .input("p_bitIsFaceToFace", sql.Bit, isFaceToFace)
        .input("p_nvcJsonUserImplicated", sql.NVarChar, jsonUserImplicated)
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_nvcJsonProperty", sql.NVarChar, jsonProperty)
        .input("p_bitRequiresLegalAdvice", sql.Bit, requiresLegalAdvice)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
          body: params,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
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
          response: {
            message: resultRecordsetObject.message,
            idRequest: resultRecordsetObject.idRequest,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetTenant = async (params, res, url, ip) => {
  const {
    idUserInRequest,
    givenName,
    lastName,
    mothersMaidenName,
    idCountryNationality,
    taxId,
    citizenId,
    idType,
    idTypeNumber,
    street,
    streetNumber,
    suite,
    idZipCode,
    neighborhood,
    isConfirmed,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idRequest } = url;
  const storeProcedure = "externalSch.USPsetTenant";

  try {
    if (
      isNil(idUserInRequest) === true ||
      isNil(idRequest) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdUserInRequest", sql.NVarChar, idUserInRequest)
        .input("p_nvcGivenName", sql.NVarChar, givenName)
        .input("p_nvcLastName", sql.NVarChar, lastName)
        .input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName)
        .input("p_intIdCountryNationality", sql.Int, idCountryNationality)
        .input("p_nvcTaxId", sql.NVarChar, taxId)
        .input("p_nvcCitizenId", sql.NVarChar, citizenId)
        .input("p_intIdType", sql.Int, idType)
        .input("p_nvcIdTypeNumber", sql.NVarChar, idTypeNumber)
        .input("p_nvcStreet", sql.NVarChar, street)
        .input("p_nvcStreetNumber", sql.NVarChar, streetNumber)
        .input("p_nvcSuite", sql.NVarChar, suite)
        .input("p_intIdZipCode", sql.Int, idZipCode)
        .input("p_nvcNeighborhood", sql.NVarChar, neighborhood)
        .input("p_bitIsConfirmed", sql.Bit, isConfirmed)
        .input("p_vchIp", sql.VarChar, ip)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
          body: params,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
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
          response: {
            message: resultRecordsetObject.message,
            idRequest: resultRecordsetObject.idRequest,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetOwner = async (params, res, url, ip) => {
  const {
    idUserInRequest,
    givenName,
    lastName,
    mothersMaidenName,
    idCountryNationality,
    taxId,
    citizenId,
    idType,
    idTypeNumber,
    street,
    streetNumber,
    suite,
    idZipCode,
    neighborhood,
    isInCash,
    idBank,
    bankBranch,
    accountHolder,
    accountNumber,
    clabeNumber,
    isConfirmed,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idRequest } = url;
  const storeProcedure = "externalSch.USPsetOwner";

  try {
    if (
      isNil(idUserInRequest) === true ||
      isNil(idRequest) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdUserInRequest", sql.NVarChar, idUserInRequest)
        .input("p_nvcGivenName", sql.NVarChar, givenName)
        .input("p_nvcLastName", sql.NVarChar, lastName)
        .input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName)
        .input("p_intIdCountryNationality", sql.Int, idCountryNationality)
        .input("p_nvcTaxId", sql.NVarChar, taxId)
        .input("p_nvcCitizenId", sql.NVarChar, citizenId)
        .input("p_intIdType", sql.Int, idType)
        .input("p_nvcIdTypeNumber", sql.NVarChar, idTypeNumber)
        .input("p_nvcStreet", sql.NVarChar, street)
        .input("p_nvcStreetNumber", sql.NVarChar, streetNumber)
        .input("p_nvcSuite", sql.NVarChar, suite)
        .input("p_intIdZipCode", sql.Int, idZipCode)
        .input("p_nvcNeighborhood", sql.NVarChar, neighborhood)
        .input("p_bitIsInCash", sql.Bit, isInCash)
        .input("p_uidIdBank", sql.NVarChar, idBank)
        .input("p_nvcBankBranch", sql.NVarChar, bankBranch)
        .input("p_nvcAccountHolder", sql.NVarChar, accountHolder)
        .input("p_nvcAccountNumber", sql.NVarChar, accountNumber)
        .input("p_nvcClabeNumber", sql.NVarChar, clabeNumber)
        .input("p_bitIsConfirmed", sql.Bit, isConfirmed)
        .input("p_vchIp", sql.VarChar, ip)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
          body: params,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
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
          response: {
            message: resultRecordsetObject.message,
            idRequest: resultRecordsetObject.idRequest,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetRequestById = async (params, res) => {
  const { idRequest, idSystemUser, idLoginHistory, offset = null } = params;
  const storeProcedure = "externalSch.USPgetRequestById";
  try {
    if (
      isNil(idRequest) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetRequestCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    jsonConditions = null,
    pagination = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "externalSch.USPgetRequestCoincidences";
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_nvcJsonConditions", sql.NVarChar(sql.MAX), jsonConditions)
        .input("p_nvcPagination", sql.NVarChar(256), pagination)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetTenantById = async (params, res) => {
  const {
    idRequest,
    idUserInRequest,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "externalSch.USPgetTenantById";
  try {
    if (
      isNil(idRequest) === true ||
      isNil(idUserInRequest) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdUserInRequest", sql.NVarChar, idUserInRequest)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetOwnerById = async (params, res) => {
  const {
    idRequest,
    idUserInRequest,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "externalSch.USPgetOwnerById";
  try {
    if (
      isNil(idRequest) === true ||
      isNil(idUserInRequest) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdUserInRequest", sql.NVarChar, idUserInRequest)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeValidateProperties = async (params, res) => {
  const {
    idRequest,
    idUserInRequest,
    identifier = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "externalSch.USPvalidateProperties";
  try {
    if (
      isNil(idRequest) === true ||
      isNil(idUserInRequest) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdUserInRequest", sql.NVarChar, idUserInRequest)
        .input("p_intIdentifier", sql.Int, identifier)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetRequestDocuments = async (params, res) => {
  const {
    idRequest,
    idUserInRequest,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "externalSch.USPgetRequestDocuments";
  try {
    if (isNil(idRequest) === true || isNil(offset) === true) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdUserInRequest", sql.NVarChar, idUserInRequest)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSignDocument = async (params, res, url, ip) => {
  const {
    idUserInRequest = null,
    signature,
    type,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idRequest } = url;
  const storeProcedure = "externalSch.USPsignDocument";

  try {
    if (
      isNil(idRequest) === true ||
      isNil(signature) === true ||
      isNil(type) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdRequest", sql.NVarChar, idRequest)
        .input("p_uidIdUserInRequest", sql.NVarChar, idUserInRequest)
        .input("p_vchSignature", sql.VarChar, signature)
        .input("p_intType", sql.Int, type)
        .input("p_vchIp", sql.VarChar, ip)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
          body: params,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
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
          response: {
            message: resultRecordsetObject.message,
            idRequest: resultRecordsetObject.idRequest,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeIsOPPaid = async (params, res) => {
  const {
    idOrderPayment,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "paymentSch.USPisOPPaid";
  try {
    if (
      isNil(idOrderPayment) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdOrderPayment", sql.NVarChar, idOrderPayment)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const ControllerExternalSch = {
  setRequest: (req, res) => {
    const params = req.body;
    const url = req.params; //idSystemUser
    executeSetRequest(params, res, url);
  },
  getRequestById: (req, res) => {
    const params = req.body;
    executeGetRequestById(params, res);
  },
  getRequestCoincidences: (req, res) => {
    const params = req.body;
    executeGetRequestCoincidences(params, res);
  },
  getTenantById: (req, res) => {
    const params = req.body;
    executeGetTenantById(params, res);
  },
  getOwnerById: (req, res) => {
    const params = req.body;
    executeGetOwnerById(params, res);
  },
  setTenant: (req, res) => {
    const params = req.body;
    const url = req.params; //idRequest
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeSetTenant(params, res, url, ipPublic);
  },
  setOwner: (req, res) => {
    const params = req.body;
    const url = req.params; //idRequest
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeSetOwner(params, res, url, ipPublic);
  },
  validateProperties: (req, res) => {
    const params = req.body;
    executeValidateProperties(params, res);
  },
  getRequestDocuments: (req, res) => {
    const params = req.body;
    executeGetRequestDocuments(params, res);
  },
  signDocument: (req, res) => {
    const params = req.body;
    const url = req.params; //idRequest
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeSignDocument(params, res, url, ipPublic);
  },
  isOPPaid: (req, res) => {
    const params = req.body;
    executeIsOPPaid(params, res);
  },
};

module.exports = ControllerExternalSch;
