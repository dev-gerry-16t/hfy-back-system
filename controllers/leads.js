const sql = require("mssql");
const XLSX = require("xlsx");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");
const rp = require("request-promise");
const executeMailTo = require("../actions/sendInformationUser");
const executeUpdateShortMessageService = require("../actions/updateShortMessageService");
const GLOBAL_CONSTANTS = require("../constants/constants");
const accountSid = GLOBAL_CONSTANTS.TWILIO_ACCOUNT_SID;
const authToken = GLOBAL_CONSTANTS.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const executeAddLandingProspect = async (params, res, ip) => {
  const {
    idProspectType = null,
    givenName = null,
    lastName = null,
    mothersMaidenName = null,
    phoneNumber = null,
    emailAddress = null,
    offset = process.env.OFFSET,
    budgeAmount = null,
    idPolicy = null,
    realState = null,
    captchaToken,
    code = null,
    requiresCall = null,
    scheduleAt = null,
    comment = null,
  } = params;
  try {
    const responseGoogle = await rp({
      url: `https://www.google.com/recaptcha/api/siteverify`,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
      body: `secret=${GLOBAL_CONSTANTS.RECAPTCHA_VERIFY_KEY}&response=${captchaToken}`,
      rejectUnauthorized: false,
    });
    const { success, score } = responseGoogle;
    // if (success === true && score > 0.5) {
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
    request.input("p_nvcRealEstate", sql.NVarChar, realState);
    request.input("p_nvcIpAddress", sql.NVarChar, ip);
    request.input("p_decScore", sql.Decimal(5, 2), score);
    request.input("p_vchCode", sql.VarChar, code);
    request.input("p_bitRequiresCall", sql.Bit, requiresCall);
    request.input("p_dtmScheduleAt", sql.DateTime, scheduleAt);
    request.input("p_nvcComment", sql.NVarChar, comment);
    request.execute("landingSch.USPaddLandingProspect", (err, result) => {
      if (err) {
        console.log("err", err);
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(resultRecordset[0].stateCode).send({
            response: {
              message: resultRecordset[0].message,
              idLandingProspect: resultRecordset[0].idLandingProspect,
            },
          });
        } else {
          result.recordset.forEach((element) => {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            executeMailTo({
              ...element,
              ...configEmailServer,
            });
          });
          res.status(200).send({
            response: {
              stateCode: resultRecordset[0].stateCode,
              message: resultRecordset[0].message,
            },
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

const executeGenerateVerificationCode = async (params, res) => {
  const {
    phoneNumber,
    idCountry,
    latitude = 0,
    longitude = 0,
    uRLGMaps = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber)
      .input("p_intIdCountry", sql.Int, idCountry)
      .input("p_nvcLatitude", sql.NVarChar, `${latitude}`)
      .input("p_nvcLongitude", sql.NVarChar, `${longitude}`)
      .input("p_nvcURLGMaps", sql.NVarChar, uRLGMaps)
      .input("p_chrOffset", sql.Char, offset)
      .execute("landingSch.USPgenerateVerificationCode");
    const resultRecordset = result.recordset[0];
    if (resultRecordset.stateCode !== 200) {
      res.status(resultRecordset.stateCode).send({
        response: {
          message: resultRecordset.message,
          idPhoneVerification: resultRecordset.idPhoneVerification,
        },
      });
    } else {
      await client.messages.create({
        to: `${resultRecordset.countryCode}${resultRecordset.phoneNumber}`,
        from: resultRecordset.from,
        body: resultRecordset.content,
      });
      res.status(200).send({
        response: {
          message: resultRecordset.message,
          idPhoneVerification: resultRecordset.idPhoneVerification,
        },
      });
    }
  } catch (error) {
    await rp({
      url: GLOBAL_CONSTANTS.URL_SLACK_MESSAGE,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: {
        text: `
        accountSid:${accountSid}
        authToken:${authToken}
        `,
      },
      rejectUnauthorized: false,
    });
    res
      .status(500)
      .send({ response: { message: "Error de sistema", messageType: error } });
  }
};

const executeGetAllCountries = async (params, res) => {
  const { idSystemUser = null, idLoginHistory = null, type = null } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_intType", sql.Int, type)
      .execute("addressSch.USPgetAllCountries");
    const resultRecordset = result.recordset;
    res.status(200).send({
      response: resultRecordset,
    });
  } catch (error) {
    res
      .status(500)
      .send({ response: { message: "Error de sistema", messageType: error } });
  }
};

const executeGetLandingProspectCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex = null,
    offset = process.env.OFFSET,
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
    offset = process.env.OFFSET,
    givenName = null,
    lastName = null,
    mothersMaidenName = null,
    emailAddress = null,
    budgeAmount = null,
    idPolicy = null,
    realEstate = null,
    additionalComment = null,
    scheduleAt = null,
    comment = null,
    assignedToUser = null,
  } = params;
  const { idLandingProspect } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdLandingProspect", sql.NVarChar, idLandingProspect);
    request.input("p_intIdProspectStatus", sql.Int, idProspectStatus);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_decBudgeAmount", sql.Decimal(19, 2), budgeAmount);
    request.input("p_uidIdPolicy", sql.NVarChar, idPolicy);
    request.input("p_nvcRealEstate", sql.NVarChar, realEstate);
    request.input("p_nvcAdditionalComment", sql.NVarChar, additionalComment);
    request.input("p_dtmScheduleAt", sql.DateTime, scheduleAt);
    request.input("p_nvcComment", sql.NVarChar, comment);
    request.input("p_uidAssignedToUser", sql.NVarChar, assignedToUser);
    request.execute(
      "landingSch.USPupdateLandingProspect",
      async (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          if (resultRecordset[0].stateCode !== 200) {
            res.status(resultRecordset[0].stateCode).send({
              response: { message: resultRecordset[0].message },
            });
          } else {
            for (const element of resultRecordset) {
              if (element.canSendEmail === true) {
                const configEmailServer = JSON.parse(
                  element.jsonEmailServerConfig
                );
                await executeMailTo({
                  ...element,
                  ...configEmailServer,
                });
              }
            }
            res.status(200).send({
              response: "Solicitud procesada exitosamente",
            });
          }
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetLandingProspectStats = async (params, res) => {
  const { idSystemUser, idLoginHistory, offset = process.env.OFFSET } = params;
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

const executeBulkPotentialAgent = async (params, res, file) => {
  const { idSystemUser, idLoginHistory, offset = process.env.OFFSET } = params;
  try {
    const excel = XLSX.read(file.buffer, { type: "buffer" });
    const namePage = excel.SheetNames;
    const dataJson = XLSX.utils.sheet_to_json(excel.Sheets[namePage[0]]);
    const pool = await sql.connect();
    const tvpPotentialAgent = new sql.Table();

    tvpPotentialAgent.columns.add("id", sql.Int);
    tvpPotentialAgent.columns.add("countryCode", sql.VarChar(6));
    tvpPotentialAgent.columns.add("contactsPublicDisplayName", sql.NVarChar);
    tvpPotentialAgent.columns.add("phoneNumber", sql.NVarChar);

    if (isEmpty(dataJson) === false) {
      dataJson.forEach((element, ix) => {
        tvpPotentialAgent.rows.add(
          ix + 1,
          element["Country Code \t"],
          element["Saved Name \t\t\t\t\t"],
          element["Phone Number \t\t\t\t\t"]
        );
      });
    }

    const result = await pool
      .request()
      .input("p_udttPotentialAgent", tvpPotentialAgent)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("landingSch.USPbulkPotentialAgent");
    const resultRecordset = result.recordset;
    if (isEmpty(resultRecordset) === false) {
      if (resultRecordset[0].stateCode !== 200) {
        res.status(resultRecordset[0].stateCode).send({
          response: {
            message: resultRecordset[0].message,
            messageType: resultRecordset[0].errorMessage,
          },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendMessage === true) {
            const url = `https://api.chat-api.com/instance${element.instanceId}/message?token=${element.token}`;
            const response = await rp({
              url,
              method: "POST",
              headers: {
                encoding: "UTF-8",
                "Content-Type": "application/json",
              },
              json: true,
              body: {
                phone: element.phoneNumber,
                body: element.content,
              },
              rejectUnauthorized: false,
            });
            const { id } = response;
            await executeUpdateShortMessageService({
              idShortMessageService: element.idShortMessageService,
              idService: id,
              jsonServiceResponse: JSON.stringify(response),
              idSystemUser,
              idLoginHistory,
            });
          }
        }

        res.status(200).send({
          response: {
            message: "Solicitud procesada exitosamente",
          },
        });
      }
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).send({
      response: { message: "Error en el sistema", messageType: error },
    });
  }
};

const executeGetPotentialAgentCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
    topIndex,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intTopIndex", sql.Int, topIndex)
      .execute("landingSch.USPgetPotentialAgentCoincidences");
    const resultRecordset = result.recordset;
    res.status(200).send({
      response: resultRecordset,
    });
  } catch (error) {
    res
      .status(500)
      .send({ response: { message: "Error de sistema", messageType: error } });
  }
};

const executeGetLandingProspectById = async (params, res) => {
  const {
    idLandingProspect,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdLandingProspect", sql.NVarChar, idLandingProspect)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("landingSch.USPgetLandingProspectById");
    const resultRecordset = result.recordsets;
    res.status(200).send({
      response: resultRecordset,
    });
  } catch (error) {
    res
      .status(500)
      .send({ response: { message: "Error de sistema", messageType: error } });
  }
};

const ControllerLeads = {
  addLandingProspect: (req, res) => {
    const params = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeAddLandingProspect(params, res, ipPublic);
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
  bulkPotentialAgent: (req, res) => {
    const params = JSON.parse(req.body.fileProperties);
    const fileParams = req.file;
    executeBulkPotentialAgent(params, res, fileParams);
  },
  getPotentialAgentCoincidences: (req, res) => {
    const params = req.body;
    executeGetPotentialAgentCoincidences(params, res);
  },
  generateVerificationCode: (req, res) => {
    const params = req.body;
    executeGenerateVerificationCode(params, res);
  },
  getAllCountries: (req, res) => {
    const params = req.body;
    executeGetAllCountries(params, res);
  },
  getLandingProspectById: (req, res) => {
    const params = req.body;
    executeGetLandingProspectById(params, res);
  },
};

module.exports = ControllerLeads;
