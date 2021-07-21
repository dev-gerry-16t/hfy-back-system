const sql = require("mssql");
const jwt = require("jsonwebtoken");
const rp = require("request-promise");
const GLOBAL_CONSTANTS = require("../constants/constants");

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
};

module.exports = ControllerLogin;
