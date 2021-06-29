const sql = require("mssql");
const GLOBAL_CONSTANTS = require("../constants/constants");
const CryptoHandler = require("./cryptoHandler");
const { executeSetDispersionOrder } = require("./setDataSpeiCollect");

const executeGetDispersionOrder = async (params, res) => {
  const offset = process.env.OFFSET;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_chrOffset", sql.Char, offset)
      .execute("stpSch.USPgetDispersionOrder");
    const resultRecordset = result.recordset;
    // for (const element of resultRecordset) {
    //   const {
    //     idDispersionOrder,
    //     institucionContraparte,
    //     empresa,
    //     fechaOperacion,
    //     claveRastreo,
    //     institucionOperante,
    //     monto,
    //     tipoPago,
    //     tipoCuentaOrdenante,
    //     nombreOrdenante,
    //     cuentaOrdenante,
    //     rfcCurpOrdenante,
    //     tipoCuentaBeneficiario,
    //     nombreBeneficiario,
    //     cuentaBeneficiario,
    //     rfcCurpBeneficiario,
    //     conceptoPago,
    //     referenciaNumerica,
    //   } = element;
    //   const bodyRequest = {
    //     institucionContraparte: 846,
    //     empresa,
    //     fechaOperacion,
    //     claveRastreo,
    //     institucionOperante,
    //     monto,
    //     tipoPago,
    //     tipoCuentaOrdenante,
    //     nombreOrdenante,
    //     cuentaOrdenante,
    //     rfcCurpOrdenante,
    //     tipoCuentaBeneficiario,
    //     nombreBeneficiario,
    //     cuentaBeneficiario: "846180000000000016",
    //     rfcCurpBeneficiario,
    //     conceptoPago,
    //     referenciaNumerica,
    //   };
    //   const crypto = new CryptoHandler(
    //     bodyRequest,
    //     GLOBAL_CONSTANTS.SECRET_KEY_ENCRYPT,
    //     null
    //   );
    //   const orderPay = { ...bodyRequest, firma: crypto.getSign() };
    //   //console.log("orderPay", JSON.stringify(orderPay, null, 2));
    //   const response = await rp({
    //     url: "https://demo.stpmex.com:7024/speiws/rest/ordenPago/registra",
    //     method: "PUT",
    //     headers: {
    //       encoding: "UTF-8",
    //       "Content-Type": "application/json",
    //     },
    //     json: true,
    //     body: orderPay,
    //     rejectUnauthorized: false,
    //   });
    //   //console.log("response", JSON.stringify(response, null, 2));
    //   await executeSetDispersionOrder({
    //     idDispersionOrder,
    //     jsonServiceResponse: JSON.stringify(response),
    //   });
    // }
  } catch (err) {
    throw err;
  }
};

module.exports = executeGetDispersionOrder;
