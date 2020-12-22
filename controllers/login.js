const sql = require("mssql");

const executeLoginUser = async (params, res) => {
  const {
    email,
    password,
    ip = "192.168.100.1",
    userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    offset = "-06:00",
  } = params;
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
          res.status(500).send({ response: result.recordset });
        } else if (result) {
          res.status(200).send({ response: result.recordset });
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
    executeLoginUser(params, res);
  },
};

module.exports = ControllerLogin;
