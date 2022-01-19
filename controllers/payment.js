const sql = require("mssql");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const GLOBAL_CONSTANTS = require("../constants/constants");

const executeGetOrderPaymentById = async (params, res) => {
  const {
    idOrderPayment,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "paymentSch.USPgetOrderPaymentById";
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

const ControllerPaymentSch = {
  getOrderPaymentById: (req, res) => {
    const params = req.body;
    executeGetOrderPaymentById(params, res);
  },
};

module.exports = ControllerPaymentSch;
