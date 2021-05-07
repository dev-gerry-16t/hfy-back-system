const sql = require("mssql");
const isEmpty = require("lodash/isEmpty");
const CryptoJS = require("crypto-js");
//const imageThumbnail = require("image-thumbnail");
const AWS = require("aws-sdk");
const GLOBAL_CONSTANTS = require("../constants/constants");
const executeUpdateShortMessageService = require("../actions/updateShortMessageService");
const Stripe = require("stripe");
const executeAddGWTransaction = require("../actions/addGWTransaction");
const endpointSecret = process.env.END_POINT_SECRET_KEY;

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const ControllerTest = {
  test: (req, res) => {
    res
      .status(200)
      .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
  },
  testPath: (req, res) => {
    console.log("Welcome to backend test, conection is successfully", sql);
    res
      .status(200)
      .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
  },
  whatsapp: async (req, res) => {
    const params = req.body;
    const { SmsSid, SmsStatus, AccountSid, MessageSid } = params;
    await executeUpdateShortMessageService({
      idSystemUser: null,
      idLoginHistory: null,
      idShortMessageService: null,
      serviceSID: SmsSid,
      serviceAccountSID: AccountSid,
      serviceChatSID: null,
      status: SmsStatus,
      sentAt: null,
      jsonServiceResponse: JSON.stringify(params),
    });
    res.status(200).send(`ok`);
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
      if (err) throw err;
      res.status(200).send({ message: data });
    });
  },
  viewFiles: async (req, res) => {
    try {
      const params = req.params;
      const fileType = "jpg";
      const bucketSource = params.bucketSource.toLowerCase();
      s3.getObject(
        {
          Bucket: bucketSource,
          Key: params.idDocument,
        },
        (err, data) => {
          if (err) throw err;
          const buff = new Buffer.from(data.Body, "binary");
          res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": buff.length,
          });
          res.end(buff);
        }
      );
    } catch (error) {}
  },
  viewFilesDocx: async (req, res) => {
    try {
      const params = req.params;
      const fileType = "jpg";
      const bucketSource = params.bucketSource.toLowerCase();
      s3.getObject(
        {
          Bucket: bucketSource,
          Key: params.idDocument,
        },
        (err, data) => {
          if (err) throw err;
          const buff = new Buffer.from(data.Body, "binary");
          res.writeHead(200, {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Content-Length": buff.length,
          });
          res.end(buff);
        }
      );
    } catch (error) {}
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
    s3.getObject(
      {
        Bucket: bucketSource,
        Key: params.idDocument,
      },
      (err, data) => {
        const buff = new Buffer.from(data.Body, "binary");
        res.attachment(`${name}.${extension}`);
        res.send(buff);
      }
    );
  },
  testStripe: async (req, res) => {
    try {
      const params = req.body;
      const stripe = new Stripe(process.env.SECRET_KEY_STRIPE);
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
    // switch (params.type) {
    //   case "payment_intent.succeeded":
    //     const paymentIntent = params.data.object;
    //     // Then define and call a method to handle the successful payment intent.
    //     // handlePaymentIntentSucceeded(paymentIntent);
    //     break;
    //   case "payment_method.attached":
    //     const paymentMethod = params.data.object;
    //     // Then define and call a method to handle the successful attachment of a PaymentMethod.
    //     // handlePaymentMethodAttached(paymentMethod);
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${params.type}`);
    // }
    //console.log("payment", JSON.stringify(payment, null, 2));
    try {
      if (payment.data.object.payment_method_types[0] === "oxxo") {
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
      res.status(500).send({ error: `${error}` });
    }
  },
};

module.exports = ControllerTest;
