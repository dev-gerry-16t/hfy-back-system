const sql = require("mssql");
//const imageThumbnail = require("image-thumbnail");
const pdf = require("html-pdf");

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
    const fileType = "jpg";
    s3.getObject(
      {
        Bucket: "homify-docs-users",
        Key: `8A7198C9-AE07-4ADD-AF34-60E84758296D.${fileType}`,
      },
      (err, data) => {
        const buff = new Buffer.from(data.Body, "binary");
        res.attachment("Hola.jpg");
        res.send(buff);
      }
    );
  },
  testPDF: async (req, res) => {
    const content = `
 
    <div class=WordSection1 style='font-size: 24px'>
    
    <p class=MsoNormal align=right style='mso-margin-top-alt:auto;mso-margin-bottom-alt:
    auto;text-align:right'><span lang=ES-MX style='font-family:"Arial",sans-serif;
    mso-fareast-font-family:"Times New Roman";mso-fareast-language:ES-TRAD'>FOLIO: <span
    style='color:red'>@nvcHFInvoice</span><o:p></o:p></span></p>
    <p class=MsoNormal align=center style='mso-margin-top-alt:auto;mso-margin-bottom-alt:
    auto;text-align:center;tab-stops:center 212.6pt left 387.35pt;border:none;
    mso-border-bottom-alt:solid windowtext 1.5pt;padding:0in;mso-padding-alt:0in 0in 31.0pt 0in'><b><span
    lang=ES-MX style='font-family:"Arial",sans-serif;mso-fareast-font-family:"Times New Roman";
    mso-fareast-language:ES-TRAD'>________________________________<o:p></o:p></span></b></p>
    
    <p class=MsoNormal align=center style='mso-margin-top-alt:auto;mso-margin-bottom-alt:
    auto;text-align:center;tab-stops:center 212.6pt left 387.35pt;border:none;
    mso-border-bottom-alt:solid windowtext 1.5pt;padding:0in;mso-padding-alt:0in 0in 31.0pt 0in'><b><span
    lang=ES-MX style='font-family:"Arial",sans-serif;mso-fareast-font-family:"Times New Roman";
    mso-fareast-language:ES-TRAD'>@nvcCustomerTenantFullName.<o:p></o:p></span></b></p>
    
    <p class=MsoNormal align=center style='mso-margin-top-alt:auto;mso-margin-bottom-alt:
    auto;text-align:center;tab-stops:center 212.6pt left 387.35pt;border:none;
    mso-border-bottom-alt:solid windowtext 1.5pt;padding:0in;mso-padding-alt:0in 0in 31.0pt 0in'><b><span
    lang=ES-MX style='font-family:"Arial",sans-serif;mso-fareast-font-family:"Times New Roman";
    mso-fareast-language:ES-TRAD'><o:p>&nbsp;</o:p></span></b></p>
    
    </div>
    
    <p class=MsoNormal><span lang=ES-MX><o:p>&nbsp;</o:p></span></p>
    
    </div>
    `;
    const config = {
      height: "10.5in", // allowed units: mm, cm, in, px
      width: "8in",
      format: "Legal",
      border: {
        top: "1cm", // default is 0, units: mm, cm, in, px
        right: "2cm",
        bottom: "1cm",
        left: "2cm",
      },
      zoomFactor: "2",
    };
    pdf.create(content, config).toBuffer((err, buff) => {
      console.log("err", err);
      if (err) {
        console.log(err);
        res.status(500).send({ response: "FAIL" });
      } else {
        res.attachment("test.pdf");
        res.send(buff);
      }
    });
  },
};

module.exports = ControllerTest;
