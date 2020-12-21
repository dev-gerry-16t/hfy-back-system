const sql = require("mssql");

const executeLoginUser = async (params, res) => {
  const { email, password } = params;
  try {
    const request = new sql.Request();
    request.input("email", sql.VarChar, email);
    request.input("pass", sql.VarChar, password);
    request.execute("SPLoginUserv2", (err, result) => {
      if (email === null || password === null) {
        res
          .status(400)
          .send({ response: "Los parametros de entrada son incorrectos" });
      } else {
        if (err) {
          res.status(500).send({ response: "Error de servidor" });
        } else if (result.recordset.length === 0) {
          res
            .status(500)
            .send({ response: "Usuario o contraseña incorrectos" });
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
