"use strict";

var express = require("express");
var ControllerLogin = require("../controllers/login");
var ControllerRegister = require("../controllers/register");
var ControllerRecover = require("../controllers/recoverPass");
var ControllerTest = require("../controllers/test");

var router = express.Router();

router.get("/", ControllerTest.test);
router.get("/test", ControllerTest.testPath);
router.get("/viewFile/:idDocument/:bucketSource", ControllerTest.viewFiles);
router.get("/viewFilesDocx/:idDocument/:bucketSource", ControllerTest.viewFilesDocx);
router.get("/viewThumbnail", ControllerTest.viewThumbnail);
router.get("/downloadFile", ControllerTest.downloadFiles);
router.get("/testPDF", ControllerTest.testPDF);
router.post("/uploadBucket", ControllerTest.upload);
router.get("/mailto", ControllerRegister.mailto);
router.post("/systemUser/validateLogin", ControllerLogin.login);
router.post("/registerUser", ControllerRegister.register);
router.post("/customerType/getAllCustomer", ControllerRegister.customerType);
router.post("/personType/getAllPerson", ControllerRegister.personType);
router.post("/endorsement/getAllEndorsement", ControllerRegister.endorsement);
router.post("/requestSignUp", ControllerRegister.signUp);
router.post("/requestSignUp/verifyCode", ControllerRegister.verifyCode);
router.get(
  "/customerType/getInvitation/:idInvitation",
  ControllerRegister.getInvitation
);
router.post("/requestRecoveryPass", ControllerRecover.requestRecoveryPass);
router.put(
  "/recoveryPass/:idRequestRecoveryPassword",
  ControllerRecover.recoveryPass
);
router.post(
  "/verifyCodeRecoveryPass",
  ControllerRecover.verifyCodeRecoveryPass
);

module.exports = router;
