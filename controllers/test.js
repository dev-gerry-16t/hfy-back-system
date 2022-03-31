const sql = require("mssql");
const isEmpty = require("lodash/isEmpty");
//const imageThumbnail = require("image-thumbnail");
const AWS = require("aws-sdk");
const GLOBAL_CONSTANTS = require("../constants/constants");
const executeUpdateShortMessageService = require("../actions/updateShortMessageService");
const {
  executeSetDispersionOrder,
  executeSetCollection,
} = require("../actions/setDataSpeiCollect");
const {
  executeGetDispersionOrder,
  executeValidatePaymentSchedule,
  executeValidatePaymentScheduleV2,
  executeSTPBalance,
} = require("../actions/dispersionOrder");
const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const ControllerTest = {
  test: (req, res) => {
    res.status(200).send({
      message: `Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`,
    });
  },
  testPath: (req, res) => {
    console.log("Welcome to backend test, conection is successfully");
    res.status(200).send({
      message: `Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`,
    });
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
  dispersionOrder: async (req, res) => {
    const payment = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
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
          return res.status(stateCode).send({ mensaje: message });
        } else {
          return res.status(stateCode).send({ message });
        }
      } else {
        return res
          .status(400)
          .send({ mensaje: "Error en los parámetros de entrada" });
      }
    } catch (error) {
      res.status(400).send({ mensaje: "Error de servidor" });
    }
  },
  collection: async (req, res) => {
    const payment = req.body;
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
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
  scheduleTaskPaymentV2: async (req, res) => {
    try {
      executeValidatePaymentScheduleV2({}, res);
      res.status(200).send({ message: "ok" });
    } catch (error) {
      res.status(500).send({ error: `${error}` });
    }
  },
  getSTPBalance: async (req, res) => {
    try {
      executeSTPBalance(req, res);
      res.status(200).send({ message: "ok" });
    } catch (error) {
      res.status(500).send({ error: `${error}` });
    }
  },
};

module.exports = ControllerTest;
