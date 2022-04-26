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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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

const ControllerExternalSch = {
  setRequest: (req, res) => {
    const params = req.body;
    const url = req.params; //idSystemUser
    executeSetRequest(params, res, url);
  },
};

module.exports = ControllerExternalSch;
