const sql = require("mssql");
const nodemailer = require("nodemailer");

const executeMailTo = async (params, res) => {
  const { receiver, content, user, pass, host, port, subject } = params;
  const transporter = nodemailer.createTransport({
    auth: {
      user,
      pass,
    },
    host,
    port,
  });
  const mailOptions = {
    from: user,
    to: receiver,
    subject,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error);
      res
        .status(500)
        .send({ result: "El sistema de envío de correos ha fallado" });
    } else {
      res.status(200).send({
        result: {
          idRequestPasswordRecovery: params.idRequestPasswordRecovery,
          message: params.message,
        },
      });
    }
  });
};

const executeRequestRecoveryPass = async (params, res) => {
  const { offset = "-06:00", userName } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcUsername", sql.VarChar, userName);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("authSch.USPrequestPasswordRecovery", (err, result) => {
      if (err) {
        res.status(500).send({ result: "Error en el sistema" });
      } else {
        const resultRecorset = result.recordset[0];
        if (resultRecorset.canSendEmail === true) {
          const configEmailServer = JSON.parse(
            resultRecorset.jsonEmailServerConfig
          );
          executeMailTo(
            {
              ...resultRecorset,
              ...configEmailServer,
            },
            res
          );
        } else if (resultRecorset.canSendEmail === false) {
          res.status(500).send({ result: resultRecorset200 });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeVerifyCodeRecoveryPass = async (param, res) => {
  const { idRequestRecoveryPassword, code, offset = "-06:00" } = param;
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
