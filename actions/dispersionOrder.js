const sql = require("mssql");
const rp = require("request-promise");
const GLOBAL_CONSTANTS = require("../constants/constants");
const CryptoHandler = require("./cryptoHandler");
const executeMailToNotification = require("./sendInformationLog");
const executeMailTo = require("./sendInformationUser");
const { executeSetDispersionOrder } = require("./setDataSpeiCollect");

const executeGetDispersionOrder = async (req, res) => {
  const offset = process.env.OFFSET;
  const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
  const headerAws = req.header("x-header-aws-key");
  let ipPublic = "";
  if (ip) {
    ipPublic = ip.split(",")[0];
  }
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_chrOffset", sql.Char, offset)
      .input("p_nvcIpAddress", sql.NVarChar, ipPublic)
      .input("p_nvcXHeaderAWSKey", sql.NVarChar, headerAws)
      .execute("stpSch.USPgetDispersionOrder");
    const resultRecordset = result.recordset;
    for (const element of resultRecordset) {
      const {
        url,
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
      };
      const crypto = new CryptoHandler(
        bodyRequest,
        GLOBAL_CONSTANTS.SECRET_KEY_ENCRYPT,
        null,
        GLOBAL_CONSTANTS.ENVIRONMENT_TEST
      );
      const orderPay = { ...bodyRequest, firma: crypto.getSign() };
      //console.log("orderPay", JSON.stringify(orderPay, null, 2));
      const response = await rp({
        url,
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
      executeMailToNotification({
        subject: "Body",
        content: `
        <div>
        <div>Petición</div><br/>
          ${JSON.stringify(orderPay, null, 2)}<br/><br/>
          <div>Respuesta de stp</div><br/>
          ${JSON.stringify(response, null, 2)}<br/>
        Action: stpSch.USPgetDispersionOrder
        </div>
        `,
      });
      await executeSetDispersionOrder({
        idDispersionOrder,
        jsonServiceResponse: JSON.stringify(response),
        ipAddress: ipPublic,
        headerAws,
      });
    }
  } catch (err) {
    executeMailToNotification({
      subject: "Catch",
      content: `
      <div>
        ${err}
      Action: stpSch.USPgetDispersionOrder
      </div>
      `,
    });
    throw err;
  }
};

const executeValidatePaymentSchedule = async (params, res) => {
  const { offset = process.env.OFFSET } = params;
  try {
    //Batch
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_chrOffset", sql.Char, offset)
      .execute("comSch.USPsentNotifications");
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

const executeValidatePaymentScheduleV2 = async (params, res) => {
  const { offset = process.env.OFFSET } = params;
  try {
    //Batch
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_chrOffset", sql.Char, offset)
      .execute("comSch.USPsentNotificationsV2");
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
    console.log("err", err);
    throw err;
  }
};

module.exports = {
  executeGetDispersionOrder,
  executeValidatePaymentSchedule,
  executeValidatePaymentScheduleV2,
};
