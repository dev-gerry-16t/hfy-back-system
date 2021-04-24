const sql = require("mssql");
const jwt = require("jsonwebtoken");
const GLOBAL_CONSTANTS = require("../constants/constants");

const executeLoginUser = async (params, res, ip, userAgent) => {
  const { email, password, offset = process.env.OFFSET } = params;
  try {
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
          const payload = {
            name: email,
            idSystemUser: idUser,
          };
          const token = jwt.sign(
            payload,
            GLOBAL_CONSTANTS.MASTER_KEY_PERMISSION,
            {
              expiresIn: tokenExpires,
            }
          );

          res.status(200).send({ response: { idSystemUser: idUser, token } });
        }
      }
    });
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
