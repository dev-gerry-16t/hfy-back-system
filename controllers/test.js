const sql = require("mssql");
//const imageThumbnail = require("image-thumbnail");
const AWS = require("aws-sdk");
const GLOBAL_CONSTANTS = require("../constants/constants");

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
};

module.exports = ControllerTest;
