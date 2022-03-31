const sql = require("mssql");
const executeMailTo = require("../actions/sendInformationUser");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");

const executeRequestRecoveryPass = async (params, res) => {
  const { offset = process.env.OFFSET, userName } = params;
  const storeProcedure = "authSch.USPrequestPasswordRecovery";

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcUsername", sql.VarChar, userName)
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
    const resultRecordset = result.recordset;
    const resultRecordsetObject = result.recordset[0];

    if (resultRecordsetObject.stateCode !== 200) {
      res.status(resultRecordsetObject.stateCode).send({
        response: {
          message: resultRecordsetObject.message,
        },
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
        result: {
          idRequestPasswordRecovery:
            resultRecordsetObject.idRequestPasswordRecovery,
          message: resultRecordsetObject.message,
        },
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

const executeVerifyCodeRecoveryPass = async (param, res) => {
  const {
    idRequestRecoveryPassword,
    code,
    offset = process.env.OFFSET,
  } = param;
  try {
    const request = new sql.Request();
    request.input(
      "p_nvcIdRequestPasswordRecovery",
      sql.NVarChar,
      idRequestRecoveryPassword
    );
    request.input("p_vchCode", sql.VarChar, code);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "authSch.USPverifyCodeForRecoveryPassword",
      (err, result) => {
        if (err) {
          console.log("error", err);
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset[0];
          if (resultRecordset.stateCode !== 200) {
            res
              .status(resultRecordset.stateCode)
              .send({ response: resultRecordset });
          } else {
            res.status(200).send({
              response: resultRecordset,
            });
          }
        }
      }
    );
  } catch (error) {}
};

const executeRecoveryPass = async (param, res, url) => {
  const { code, password, offset } = param;
  const { idRequestRecoveryPassword } = url;
  try {
    const request = new sql.Request();
    request.input(
      "p_nvcIdRequestPasswordRecovery",
      sql.NVarChar,
      idRequestRecoveryPassword
    );
    request.input("p_vchCode", sql.VarChar, code);
    request.input("p_nvcPassword", sql.VarChar, password);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("authSch.USPcompleteRecoveryPassword", (err, result) => {
      if (err) {
        console.log("error", err);
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset[0];
        if (resultRecordset.stateCode !== 200) {
          res
            .status(resultRecordset.stateCode)
            .send({ response: resultRecordset });
        } else {
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    });
  } catch (error) {}
};

const ControllerRecoveryPass = {
  requestRecoveryPass: (req, res) => {
    const params = req.body;
    executeRequestRecoveryPass(params, res);
  },
  verifyCodeRecoveryPass: (req, res) => {
    const params = req.body;
    executeVerifyCodeRecoveryPass(params, res);
  },
  recoveryPass: (req, res) => {
    const params = req.body;
    const paramsUrl = req.params;
    executeRecoveryPass(params, res, paramsUrl);
  },
};

module.exports = ControllerRecoveryPass;
