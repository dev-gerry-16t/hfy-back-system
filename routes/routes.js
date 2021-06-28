"use strict";

const express = require("express");
const ControllerLogin = require("../controllers/login");
const ControllerRegister = require("../controllers/register");
const ControllerRecover = require("../controllers/recoverPass");
const ControllerTest = require("../controllers/test");
const ControllerLeads = require("../controllers/leads");
const ControllerCatalogs = require("../controllers/catalogs");
const router = express.Router();

router.get("/", ControllerTest.test);
router.get("/test", ControllerTest.testPath);
router.post("/whatsapp", ControllerTest.whatsapp);
router.post("/testStripe", ControllerTest.testStripe);
router.post("/testStripeWebhook", ControllerTest.testStripeWebhook);
router.post(
  "/testStripeWebhookConnect",
  ControllerTest.testStripeWebhookConnect
);
router.post("/connect/dispersionOrder", ControllerTest.dispersionOrder);
router.post("/connect/collection", ControllerTest.collection);
router.get("/connect/scheduleTask/payment", ControllerTest.scheduleTask);
router.get("/viewFile/:idDocument/:bucketSource", ControllerTest.viewFiles);
router.get(
  "/viewFilesDocx/:idDocument/:bucketSource",
  ControllerTest.viewFilesDocx
);
router.get("/viewThumbnail", ControllerTest.viewThumbnail);
router.get(
  "/downloadFile/:idDocument/:bucketSource/:name/:extension",
  ControllerTest.downloadFiles
);
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
router.post("/catalogs/getAllPolicies", ControllerCatalogs.getAllPolicies);
router.put(
  "/recoveryPass/:idRequestRecoveryPassword",
  ControllerRecover.recoveryPass
);
router.post(
  "/verifyCodeRecoveryPass",
  ControllerRecover.verifyCodeRecoveryPass
);
router.get(
  "/catalogs/getAllProspectTypes/:type",
  ControllerCatalogs.getAllProspectTypes
);
router.post("/leads/addLandingProspect", ControllerLeads.addLandingProspect);

module.exports = router;
