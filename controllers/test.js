const sql = require("mssql");
const rp = require("request-promise");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");
//const imageThumbnail = require("image-thumbnail");
const AWS = require("aws-sdk");
const GLOBAL_CONSTANTS = require("../constants/constants");
const executeUpdateShortMessageService = require("../actions/updateShortMessageService");
const Stripe = require("stripe");
const executeAddGWTransaction = require("../actions/addGWTransaction");
const {
  executesetConnectAccountWH,
  executeMatiWebHook,
} = require("../actions/setCustomerAccount");
const {
  executeSetDispersionOrder,
  executeSetCollection,
} = require("../actions/setDataSpeiCollect");
const {
  executeGetDispersionOrder,
  executeValidatePaymentSchedule,
  executeSentReminders,
} = require("../actions/dispersionOrder");
const executeSetWAMessage = require("../actions/setWAMMessage");
const executeTestMailToNotification = require("../actions/testMailTo");
const endpointSecret = process.env.END_POINT_SECRET_KEY;
const executeMailToNotification = require("../actions/sendInformationLog");
const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});
const accountSid = GLOBAL_CONSTANTS.TWILIO_ACCOUNT_SID;
const authToken = GLOBAL_CONSTANTS.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const { getTestMail } = require("./audit");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");
const {
  executeSetMLMWebhook,
  executeGetPropertyPictures,
} = require("../actions/getTokenMlUser");
const executeSetSubscriptionWebhook = require("../actions/subscriptionPlatform");
const executeMailTo = require("../actions/sendInformationUser");

const executeGetZipCodeGoogle = async (location) => {
  try {
    const responseMaps = await rp({
      url: `https://maps.googleapis.com/maps/api/geocode/json?&latlng=${location.latitude},${location.longitude}&key=AIzaSyBwWOmV2W9QVm7lN3EBK4wCysj2sLzPhiQ`,
      method: "GET",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      rejectUnauthorized: false,
    });
    const responseResult = responseMaps.results;

    let arrayGetZipCode = null;
    if (isEmpty(responseResult) === false) {
      for (const iterator of responseResult) {
        const addressComponent =
          isNil(iterator["address_components"]) === false
            ? iterator["address_components"]
            : [];
        const filterZipCode = addressComponent.find((row) => {
          return isNil(row.types[0]) === false && row.types[0] == "postal_code";
        });
        if (
          isNil(filterZipCode) === false &&
          isEmpty(filterZipCode) === false
        ) {
          arrayGetZipCode = filterZipCode.short_name;
          break;
        }
      }
    }
    return arrayGetZipCode;
  } catch (error) {
    throw error;
  }
};

const executeUploadFiles = async (arrayImages) => {
  try {
    if (isEmpty(arrayImages) === false) {
      for (const element of arrayImages) {
        const { url, bucketSource, idDocument } = element;
        const response = await rp({
          url: url,
          method: "GET",
          encoding: null,
          resolveWithFullResponse: true,
        });
        const bufferFile = Buffer.from(response.body, "utf8");
        const paramsFileAws = {
          Bucket: bucketSource,
          Key: idDocument,
          Body: bufferFile,
        };
        await s3.upload(paramsFileAws).promise();
      }
    }
  } catch (error) {
    throw error;
  }
};

const getPropertiesOfEasyBrokerId = async (params) => {
  const {
    urlThumb,
    idCustomer,
    id,
    key,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;

  try {
    const pool = await sql.connect();
    let responseProperty = await rp({
      url: `https://api.easybroker.com/v1/properties/${id}`,
      method: "GET",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
        "X-Authorization": key,
      },
      json: true,
      rejectUnauthorized: false,
    });

    const location =
      isNil(responseProperty) === false &&
      isEmpty(responseProperty) === false &&
      isNil(responseProperty.location) === false &&
      isEmpty(responseProperty.location) === false
        ? responseProperty.location
        : {};
    let zipCode = null;
    if (isEmpty(location) === false && isNil(location.latitude) === false) {
      zipCode = location.postal_code;
      if (isEmpty(zipCode) === true) {
        zipCode = await executeGetZipCodeGoogle(location);
      }
    }
    const result = await pool
      .request()
      .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcZipCode", sql.NVarChar, zipCode)
      .input("p_nvcTitle_image_thumb", sql.NVarChar, urlThumb)
      .input(
        "p_nvcResponseBody",
        sql.NVarChar,
        JSON.stringify(responseProperty)
      )
      .input("p_chrOffset", sql.Char, offset)
      .execute("customerSch.USPimportProperty");
    const recordset1 = result.recordsets[0][0];
    const recordset2 = result.recordsets[1];
    if (recordset1.stateCode === 200) {
      await executeUploadFiles(recordset2);
    } else {
      throw "Base de datos rechazó la subida";
    }
    return true;
  } catch (error) {
    throw error;
  }
};

const ControllerTest = {
  testMail: (req, res) => {
    getTestMail(req, res);
  },
  test: (req, res) => {
    res.status(200).send({
      message: `Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`,
    });
  },
  testPath: (req, res) => {
    console.log("Welcome to backend test, conection is successfully", sql);
    res.status(200).send({
      message: `Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`,
    });
  },
  sendWhatsappTwilio: async (req, res) => {
    const params = req.body;
    const message = await client.messages.create({
      to: "525562100512",
      from: "12244083019",
      body: "Tu codigo de verificación es el: 358545",
    });
    res.status(200).send({ message: message.sid });
  },
  sendWhatsapp: async (req, res) => {
    const params = req.body;
    const token = "ks92j20frl42bwxi";
    const instanceId = "299354";
    const url = `https://api.chat-api.com/instance${instanceId}/message?token=${token}`;
    const data = params;
    const response = await rp({
      url,
      method: "POST",
      headers: {
        encoding: "UTF-8",
        "Content-Type": "application/json",
      },
      json: true,
      body: data,
      rejectUnauthorized: false,
    });

    res.status(200).send({ message: "ok" });
  },
  whatsapp: async (req, res) => {
    const params = req.body;
    if (isNil(params.ack) === false && isEmpty(params.ack) === false) {
      for (const element of params.ack) {
        await executeSetWAMessage({
          idShortMessageService: null,
          idService: element.id,
          idChat: element.chatId,
          jsonACKResponse: JSON.stringify(params),
          jsonMessageResponse: null,
          jsonServiceResponse: null,
        });
      }
    }
    if (
      isNil(params.messages) === false &&
      isEmpty(params.messages) === false
    ) {
      for (const element of params.messages) {
        if (
          element.fromMe === false &&
          (element.chatId === "5215611278220@c.us" ||
            element.chatId === "5215571946460@c.us")
        ) {
          await executeSetWAMessage({
            idShortMessageService: null,
            idService: element.id,
            idChat: element.chatId,
            jsonACKResponse: null,
            jsonMessageResponse: JSON.stringify(params),
            jsonServiceResponse: null,
          });
        }
      }
    }
    res.status(200).send({ message: "ok" });
  },
  upload: (req, res) => {
    const fileName = req.file.originalname.split(".");
    const fileType = fileName[fileName.length - 1];
    const params = {
      Bucket: "homify-docs-users", // pass your bucket name
      Key: `8A7198C9-AE07-4ADD-AF34-60E84758296D.${fileType}`, // file will be saved as testBucket/contacts.csv
      Body: req.file.buffer,
    };
    s3.upload(params, (err, data) => {
      if (err) {
        res.send({ error: " No document attachment" });
      }
      res.status(200).send({ message: data });
    });
  },
  viewFiles: async (req, res) => {
    try {
      const params = req.params;
      if (
        isNil(params.idDocument) === true ||
        isNil(params.bucketSource) === true
      ) {
        res.send({ error: "No document attachment" });
      } else {
        const splitParam = params.bucketSource.split(".");
        const bucketSource =
          isNil(splitParam[0]) === false ? splitParam[0].toLowerCase() : "";
        const file = await s3
          .getObject({
            Bucket: bucketSource,
            Key: params.idDocument,
          })
          .promise();

        const buff = new Buffer.from(file.Body, "binary");
        res.writeHead(200, {
          "Content-Length": buff.length,
          "Content-Type": "image/jpeg",
        });
        res.end(buff);
      }
    } catch (error) {
      res.status(400).send({ error: "no file attachment" });
    }
  },
  viewVideo: async (req, res) => {
    try {
      const params = req.params;
      if (
        isNil(params.idDocument) === true ||
        isNil(params.bucketSource) === true
      ) {
        res.send({ error: "No document attachment" });
      } else {
        const bucketSource = params.bucketSource.toLowerCase();
        const file = await s3
          .getObject({
            Bucket: bucketSource,
            Key: params.idDocument,
          })
          .promise();

        const buff = new Buffer.from(file.Body, "binary");
        res.writeHead(200, {
          "Content-Length": buff.length,
          "Content-Type": `video/${params.type}`,
        });
        res.end(buff);
      }
    } catch (error) {
      res.status(400).send({ error: "no file attachment" });
    }
  },
  viewFilesType: async (req, res) => {
    try {
      const params = req.params;
      if (
        isNil(params.idDocument) === true ||
        isNil(params.bucketSource) === true
      ) {
        res.send({ error: "No document attachment" });
      } else {
        let headerType = "";
        if (params.type === "docx" || params.type === "pdf") {
          headerType = `application/${params.type}`;
        } else {
          headerType = `image/${params.type}`;
        }
        const bucketSource = params.bucketSource.toLowerCase();
        const file = await s3
          .getObject({
            Bucket: bucketSource,
            Key: params.idDocument,
          })
          .promise();

        const buff = new Buffer.from(file.Body, "binary");
        res.writeHead(200, {
          "Content-Type": headerType,
          "Content-Length": buff.length,
        });
        res.end(buff);
      }
    } catch (error) {
      res.status(400).send({ error: "no file attachment" });
    }
  },
  viewFilesTypeDownload: async (req, res) => {
    try {
      const params = req.params;
      const queryParams = req.query;
      const nameFile =
        isEmpty(queryParams) === false &&
        isNil(queryParams.name) === false &&
        isEmpty(queryParams.name) === false
          ? queryParams.name
          : "";
      if (
        isNil(params.idDocument) === true ||
        isNil(params.bucketSource) === true
      ) {
        res.send({ error: "No document attachment" });
      } else {
        let headerType = "";
        if (params.type === "docx" || params.type === "pdf") {
          headerType =
            params.type === "docx"
              ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              : `application/${params.type}`;
        } else {
          headerType = `image/${params.type}`;
        }
        const bucketSource = params.bucketSource.toLowerCase();
        const file = await s3
          .getObject({
            Bucket: bucketSource,
            Key: params.idDocument,
          })
          .promise();

        const buff = new Buffer.from(file.Body, "binary");
        res.writeHead(200, {
          "Content-Type": headerType,
          "Content-Length": buff.length,
          "Content-Disposition": `attachment;filename=${
            isEmpty(nameFile) === false ? nameFile : "Document"
          }.${params.type}`,
        });
        res.end(buff);
      }
    } catch (error) {
      res.status(400).send({ error: "no file attachment" });
    }
  },
  viewFilesDocx: async (req, res) => {
    try {
      const params = req.params;
      const bucketSource = params.bucketSource.toLowerCase();

      const file = await s3
        .getObject({
          Bucket: bucketSource,
          Key: params.idDocument,
        })
        .promise();

      const buff = new Buffer.from(file.Body, "binary");
      res.writeHead(200, {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Length": buff.length,
      });
      res.end(buff);
    } catch (error) {
      res.status(400).send({ error: "no file attachment" });
    }
  },
  viewThumbnail: async (req, res) => {
    // const fileType = "jpg";
    // s3.getObject(
    //   {
    //     Bucket: "homify-docs-users",
    //     Key: `8A7198C9-AE07-4ADD-AF34-60E84758296D.${fileType}`,
    //   },
    //   async (err, data) => {
    //     const options = {
    //       width: 30,
    //       responseType: "buffer",
    //       jpegOptions: { force: false, quality: 50 },
    //     };
    //     const thumbnail = await imageThumbnail(data.Body, options);
    //     console.log(thumbnail);
    //     const buff = new Buffer.from(thumbnail, "binary");
    //     res.writeHead(200, {
    //       "Content-Type": "image/png",
    //       "Content-Length": buff.length,
    //     });
    //     res.end(buff);
    //   }
    // );
  },
  downloadFiles: async (req, res) => {
    const params = req.params;
    const name = params.name;
    const extension = params.extension;
    const bucketSource = params.bucketSource.toLowerCase();
    try {
      const file = await s3
        .getObject({
          Bucket: bucketSource,
          Key: params.idDocument,
        })
        .promise();
      const buff = new Buffer.from(file.Body, "binary");
      res.attachment(`${name}.${extension}`);
      res.send(buff);
    } catch (error) {
      res.status(400).send({ error: "no file attachment" });
    }
  },
  testStripe: async (req, res) => {
    try {
      const params = req.body;
      const stripe = new Stripe(GLOBAL_CONSTANTS.SECRET_KEY_STRIPE);
      const payment = await stripe.paymentIntents.create({
        ...params,
        currency: "MXN",
        confirm: true,
      });
      res.status(200).send({ message: payment });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  },
  testStripeWebhook: async (req, res) => {
    const payment = req.body;
    const stripe = new Stripe(GLOBAL_CONSTANTS.SECRET_KEY_STRIPE);
    const sig = req.headers["stripe-signature"];
    try {
      await stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        GLOBAL_CONSTANTS.STRIPE_WEBHOOK_SECRET
      );
      if (
        isNil(payment.data.object.payment_method_types) === false &&
        isNil(payment.data.object.payment_method_types[0]) === false &&
        payment.data.object.payment_method_types[0] === "oxxo"
      ) {
        console.log("oxxo");
        await executeAddGWTransaction({
          idPaymentInContract: null,
          idOrderPayment: null,
          serviceIdPI: payment.data.object.id,
          serviceIdPC: null,
          amount: payment.data.object.amount,
          last4: null,
          type: payment.data.object.payment_method_types[0],
          status: payment.data.object.status,
          funding: null,
          network: null,
          created: payment.data.object.created,
          jsonServiceResponse: JSON.stringify(payment),
          idSystemUser: null,
          idLoginHistory: null,
        });
      } else {
        await executeAddGWTransaction({
          idPaymentInContract: null,
          idOrderPayment: null,
          serviceIdPI: payment.data.object.id,
          serviceIdPC:
            isEmpty(payment.data.object.charges.data) === false
              ? payment.data.object.charges.data[0].id
              : null,
          amount: payment.data.object.amount,
          last4:
            isEmpty(payment.data.object.charges.data) === false
              ? payment.data.object.charges.data[0].payment_method_details.card
                  .last4
              : null,
          type: payment.data.object.payment_method_types[0],
          status: payment.data.object.status,
          funding:
            isEmpty(payment.data.object.charges.data) === false
              ? payment.data.object.charges.data[0].payment_method_details.card
                  .funding
              : null,
          network:
            isEmpty(payment.data.object.charges.data) === false
              ? payment.data.object.charges.data[0].payment_method_details.card
                  .network
              : null,
          created: payment.data.object.created,
          jsonServiceResponse: JSON.stringify(payment),
          idSystemUser: null,
          idLoginHistory: null,
        });
      }
      res.status(200).send({ received: true });
    } catch (error) {
      executeSlackLogCatchBackend({
        storeProcedure: "pymtGwSch.USPaddGWTransaction",
        error: error.message,
      });
      res.status(500).send({ error: `${error.message}` });
    }
  },
  webhookStripeSubscription: async (req, res) => {
    const params = req.body;
    const stripe = new Stripe(GLOBAL_CONSTANTS.SECRET_KEY_STRIPE);
    const sig = req.headers["stripe-signature"];
    try {
      await stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        GLOBAL_CONSTANTS.STRIPE_WEBHOOK_SUBSCRIPTION_SECRET
      );
      executeSetSubscriptionWebhook(params, GLOBAL_CONSTANTS.OFFSET);
      res.status(200).send({ message: "received" });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  },
  testStripeWebhookConnect: async (req, res) => {
    const payment = req.body;
    //console.log("payment", JSON.stringify(payment, null, 2));
    try {
      executesetConnectAccountWH({
        idConnectAccount: payment.account,
        idBankAccount:
          isEmpty(payment.data.object.external_accounts) === false &&
          isEmpty(payment.data.object.external_accounts.data) === false
            ? payment.data.object.external_accounts.data[0].id
            : null,
        created:
          isEmpty(payment.data) === false &&
          isEmpty(payment.data.object) === false
            ? payment.data.object.created
            : null,
        isActive: null,
        jsonServiceResponse: JSON.stringify(payment),
      });
      res.status(200).send({ received: true });
    } catch (error) {
      res.status(500).send({ error: `${error}` });
    }
  },
  dispersionOrder: async (req, res) => {
    const payment = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    executeMailToNotification({
      subject: "Log",
      content: `
      <div>
      <ul>
      <li>fecha: ${new Date()}</li>
      <li>ip: ${ip}</li>
      <li>headers: ${JSON.stringify(req.headers, null, 2)}</li>
      <li>Action: dispersionOrder</li>
      </ul>
      </div>
      `,
    });
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    try {
      if (isEmpty(payment) === false) {
        const response = await executeSetDispersionOrder({
          idDispersionOrder: null,
          jsonServiceResponse: JSON.stringify(payment),
          ipAddress: ipPublic,
        });
        const { stateCode, message } = response;
        if (stateCode === 200) {
          res.status(stateCode).send({ mensaje: message });
        } else {
          res.status(stateCode).send({ message });
        }
      } else {
        res.status(400).send({ mensaje: "Error en los parámetros de entrada" });
      }
    } catch (error) {}
  },
  collection: async (req, res) => {
    const payment = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    executeMailToNotification({
      subject: "Log",
      content: `
      <div>
      <ul>
      <li>fecha: ${new Date()}</li>
      <li>ip: ${ip}</li>
      <li>headers: ${JSON.stringify(req.headers, null, 2)}</li>
      <li>Action: Collection</li>
      </ul>
      </div>
      `,
    });
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    try {
      if (isEmpty(payment) === false) {
        const response = await executeSetCollection({
          jsonServiceResponse: JSON.stringify(payment),
          ipAddress: ipPublic,
        });
        const { id, stateCode, message } = response;
        if (stateCode === 200) {
          res.status(stateCode).send({ mensaje: message });
        } else if (stateCode === 500) {
          res.status(stateCode).send({ id });
        } else {
          res.status(stateCode).send({ message });
        }
      } else {
        res.status(400).send({ mensaje: "Error en los parámetros de entrada" });
      }
    } catch (error) {}
  },
  scheduleTaskDispersion: async (req, res) => {
    try {
      executeGetDispersionOrder(req, res);
      res.status(200).send({ message: "ok" });
    } catch (error) {
      res.status(500).send({ error: `${error}` });
    }
  },
  scheduleTaskPayment: async (req, res) => {
    try {
      executeValidatePaymentSchedule({}, res);
      res.status(200).send({ message: "ok" });
    } catch (error) {
      res.status(500).send({ error: `${error}` });
    }
  },
  SentReminders: async (req, res) => {
    try {
      executeSentReminders({}, res);
      res.status(200).send({ message: "ok" });
    } catch (error) {
      res.status(500).send({ error: `${error}` });
    }
  },
  matiWebhookHomify: async (req, res) => {
    executeMatiWebHook(req);
    res.status(200).send({ message: "ok" });
  },
  getPropertiesOfEasyBroker: async (req, res) => {
    const params = req.body;

    try {
      let url =
        "https://api.easybroker.com/v1/properties?search[statuses][]=published";

      const response = await rp({
        url,
        method: "GET",
        headers: {
          encoding: "UTF-8",
          "Content-Type": "application/json",
          "X-Authorization": params.key,
        },
        json: true,
        rejectUnauthorized: false,
      });
      if (
        isEmpty(response) === false &&
        isNil(response.pagination) === false &&
        isEmpty(response.pagination) === false
      ) {
        let nextPage = url;
        while (isNil(nextPage) === false) {
          let responseWhile = await rp({
            url: nextPage,
            method: "GET",
            headers: {
              encoding: "UTF-8",
              "Content-Type": "application/json",
              "X-Authorization": params.key,
            },
            json: true,
            rejectUnauthorized: false,
          });
          if (
            isEmpty(responseWhile) === false &&
            isNil(responseWhile.content) === false &&
            isEmpty(responseWhile.content) === false
          ) {
            let resultContentWhile = responseWhile.content;
            for (const element of resultContentWhile) {
              try {
                await getPropertiesOfEasyBrokerId({
                  id: element.public_id,
                  key: params.key,
                  idCustomer: params.idCustomer,
                  urlThumb: element.title_image_thumb,
                });
              } catch (error) {
                // console.log("error", error);
                // executeSlackLogCatchBackend({
                //   storeProcedure: "customerSch.USPimportProperty",
                //   error: error,
                // });
              }
            }
          }

          nextPage = responseWhile.pagination.next_page;
        }
      }

      res.status(200).send({ message: "finish" });
    } catch (error) {
      res.status(500).send({ message: "error", error: JSON.stringify(error) });
    }
  },
  getPropertiesOfEasyBrokerId: async (req, res) => {
    const params = req.body;
    const {
      idCustomer,
      id,
      key,
      offset = GLOBAL_CONSTANTS.OFFSET,
      urlThumb = null,
    } = params;

    try {
      const pool = await sql.connect();
      let responseProperty = await rp({
        url: `https://api.easybroker.com/v1/properties/${id}`,
        method: "GET",
        headers: {
          encoding: "UTF-8",
          "Content-Type": "application/json",
          "X-Authorization": key,
        },
        json: true,
        rejectUnauthorized: false,
      });
      const location =
        isNil(responseProperty) === false &&
        isEmpty(responseProperty) === false &&
        isNil(responseProperty.location) === false &&
        isEmpty(responseProperty.location) === false
          ? responseProperty.location
          : {};
      let zipCode = null;
      // console.log("result1", JSON.stringify(location, null, 2));

      if (isEmpty(location) === false && isNil(location.latitude) === false) {
        zipCode = location.postal_code;
        if (isEmpty(zipCode) === true) {
          zipCode = await executeGetZipCodeGoogle(location);
        }
      }
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_nvcZipCode", sql.NVarChar, zipCode)
        .input("p_nvcTitle_image_thumb", sql.NVarChar, urlThumb)
        .input(
          "p_nvcResponseBody",
          sql.NVarChar,
          JSON.stringify(responseProperty)
        )
        .input("p_chrOffset", sql.Char, offset)
        .execute("customerSch.USPimportProperty");
      const recordset1 = result.recordsets[0][0];
      const recordset2 = result.recordsets[1];
      if (recordset1.stateCode === 200) {
        await executeUploadFiles(recordset2);
      } else {
        throw "Base de datos rechazó la subida";
      }

      res.status(200).send({ message: "ok" });
    } catch (error) {
      console.log("error", error);
      res.status(200).send({ message: "error", error: JSON.stringify(error) });
    }
  },
  setMLMWebhook: async (req, res) => {
    try {
      const params = req.body;
      executeSetMLMWebhook(params, GLOBAL_CONSTANTS.OFFSET);
      res.status(200).send({ message: "received" });
    } catch (error) {}
  },
  getPropertyPictures: async (req, res) => {
    try {
      executeGetPropertyPictures(GLOBAL_CONSTANTS.OFFSET);
      res.status(200).send({ message: "ok" });
    } catch (error) {}
  },
  testMailToNotification: async (req, res) => {
    try {
      executeTestMailToNotification({});
      res.status(200).send({ message: "received" });
    } catch (error) {}
  },
  addExternalProspect: async (req, res) => {
    const params = req.body;
    const {
      givenName,
      lastName = null,
      phoneNumber = null,
      emailAddress = null,
      rentAmount = null,
      comment = null,
    } = params;
    try {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_nvcGivenName", sql.NVarChar, givenName)
        .input("p_nvcLastName", sql.NVarChar, lastName)
        .input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber)
        .input("p_nvcEmailAddress", sql.NVarChar, emailAddress)
        .input("p_decRentAmount", sql.Decimal(19), rentAmount)
        .input("p_nvcComment", sql.NVarChar, comment)
        .input("p_chrOffset", sql.Char, GLOBAL_CONSTANTS.OFFSET)
        .execute("landingSch.USPaddExternalProspect");
      const resultRecordsetObject = result.recordset[0];
      const resultRecordset = result.recordset;
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure: "landingSch.USPaddExternalProspect",
          error: resultRecordsetObject.errorMessage,
          body: params,
        });
        return res.status(resultRecordsetObject.stateCode).send({
          response: {
            message: resultRecordsetObject.message,
            errorMessage: resultRecordsetObject.errorMessage,
          },
        });
      } else {
        for (const element of resultRecordset) {
          const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
          await executeMailTo({
            ...element,
            ...configEmailServer,
          });
        }
      }
      return res.status(200).send({ message: "Lead received" });
    } catch (error) {
      executeSlackLogCatchBackend({
        storeProcedure: "landingSch.USPaddExternalProspect",
        error: error,
        body: params,
      });
      res.status(500).send({ message: "Not lead submit", error });
    }
  },
};

module.exports = ControllerTest;
