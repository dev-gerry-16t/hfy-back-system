const sql = require("mssql");
const rp = require("request-promise");
const GLOBAL_CONSTANTS = require("../constants/constants");
const CryptoHandler = require("./cryptoHandler");
const executeMailTo = require("./sendInformationUser");
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
    for (const element of resultRecordset) {
      const {
        idDispersionOrder,
        institucionContraparte,
        empresa,
        fechaOperacion,
        claveRastreo,
        institucionOperante,
        monto,
        tipoPago,
        tipoCuentaOrdenante,
        nombreOrdenante,
        cuentaOrdenante,
        rfcCurpOrdenante,
        tipoCuentaBeneficiario,
        nombreBeneficiario,
        cuentaBeneficiario,
        rfcCurpBeneficiario,
        conceptoPago,
        referenciaNumerica,
      } = element;
      const bodyRequest = {
        institucionContraparte: 846,
        empresa,
        fechaOperacion,
        claveRastreo,
        institucionOperante,
        monto,
        tipoPago,
        tipoCuentaOrdenante,
        nombreOrdenante,
        cuentaOrdenante,
        rfcCurpOrdenante,
        tipoCuentaBeneficiario,
        nombreBeneficiario,
        cuentaBeneficiario: "846180000000000016",
        rfcCurpBeneficiario,
        conceptoPago,
        referenciaNumerica,
      };
      const crypto = new CryptoHandler(
        bodyRequest,
        GLOBAL_CONSTANTS.SECRET_KEY_ENCRYPT,
        null
      );
      const orderPay = { ...bodyRequest, firma: crypto.getSign() };
      //console.log("orderPay", JSON.stringify(orderPay, null, 2));
      const response = await rp({
        url: "https://demo.stpmex.com:7024/speiws/rest/ordenPago/registra",
        method: "PUT",
        headers: {
          encoding: "UTF-8",
          "Content-Type": "application/json",
        },
        json: true,
        body: orderPay,
        rejectUnauthorized: false,
      });
      //console.log("response", JSON.stringify(response, null, 2));
      await executeSetDispersionOrder({
        idDispersionOrder,
        jsonServiceResponse: JSON.stringify(response),
      });
    }
  } catch (err) {
    throw err;
  }
};

const executeValidatePaymentSchedule = async (params, res) => {
  const {
    idCustomer = null,
    idCustomerTenant = null,
    idContract = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = process.env.OFFSET,
  } = params;
  try {
    //Batch
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPvalidatePaymentSchedule");
    const resultRecordset = result.recordset;
    for (const element of resultRecordset) {
      if (element.canSendEmail === true) {
        const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
        await executeMailTo({
          ...element,
          ...configEmailServer,
        });
      }
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { executeGetDispersionOrder, executeValidatePaymentSchedule };
