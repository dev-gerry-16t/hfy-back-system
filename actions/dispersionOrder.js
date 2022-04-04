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
      await executeSetDispersionOrder({
        idDispersionOrder,
        jsonServiceResponse: JSON.stringify(response),
        ipAddress: ipPublic,
        headerAws,
      });
    }
  } catch (err) {
    await rp({
      url: GLOBAL_CONSTANTS.URL_SLACK_MESSAGE,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: {
        text: err,
      },
      rejectUnauthorized: false,
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

const executeSTPBalance = async (req, res) => {
  const offset = process.env.OFFSET;
  const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
  const headerAws = req.header("x-header-aws-key");
  try {
    //Batch
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_chrOffset", sql.Char, offset)
      .input("p_nvcIpAddress", sql.NVarChar, ip)
      .input("p_nvcXHeaderAWSKey", sql.NVarChar, headerAws)
      .execute("stpSch.USPgetBalance");
    const resultRecordset = result.recordset[0];
    const crypto = new CryptoHandler(
      {},
      GLOBAL_CONSTANTS.SECRET_KEY_ENCRYPT,
      null,
      GLOBAL_CONSTANTS.ENVIRONMENT_TEST
    );
    const cadenaPipes = `${resultRecordset.cuentaOrdenante}`;
    const orderPay = {
      cuentaOrdenante: resultRecordset.cuentaOrdenante,
      firma: crypto.getSignBalance(cadenaPipes),
    };
    const responseStp = await rp({
      url: resultRecordset.url,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: orderPay,
      rejectUnauthorized: false,
    });

    await rp({
      url: GLOBAL_CONSTANTS.URL_SLACK_MESSAGE,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: {
        text: `${JSON.stringify(responseStp, null, 2)}`,
      },
      rejectUnauthorized: false,
    });
  } catch (err) {
    await rp({
      url: GLOBAL_CONSTANTS.URL_SLACK_MESSAGE,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: {
        text: `
        Catch: stpSch.USPgetBalance

        ${JSON.stringify(err, null, 2)}`,
      },
      rejectUnauthorized: false,
    });
  }
};

module.exports = {
  executeGetDispersionOrder,
  executeValidatePaymentSchedule,
  executeValidatePaymentScheduleV2,
  executeSTPBalance,
};
