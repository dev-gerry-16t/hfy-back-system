const sql = require("mssql");
const AWS = require("aws-sdk");
const GLOBAL_CONSTANTS = require("../constants/constants");

const s3 = new AWS.S3({
  accessKeyId: "AKIAJZ2VBYROHPNFRTKA",
  secretAccessKey: "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",
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
    const fileType = "jpg";
    //const response = await s3.listObjectsV2({ Bucket: "homify-docs-users" }).promise();
    s3.getObject(
      {
        Bucket: "homify-docs-users",
        Key: `8A7198C9-AE07-4ADD-AF34-60E84758296D.${fileType}`,
      },
      (err, data) => {
        let buff = new Buffer.from(data.Body);
        let base64data = buff.toString("base64");
        res.send(
          `<img src="data:image/png;base64,${base64data}" alt="logo type="file">`
        );
      }
    );
    debugger;
  },
};

module.exports = ControllerTest;
