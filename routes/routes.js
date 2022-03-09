"use strict";

const express = require("express");
const ControllerLogin = require("../controllers/login");
const ControllerRegister = require("../controllers/register");
const ControllerRecover = require("../controllers/recoverPass");
const ControllerTest = require("../controllers/test");
const ControllerLeads = require("../controllers/leads");
const ControllerCatalogs = require("../controllers/catalogs");
const ControllerCustomer = require("../controllers/customerInformation");
const ControllerCustomerSch = require("../controllers/customerSch");
const router = express.Router();
router.get("/", ControllerTest.test);
router.get("/test", ControllerTest.testPath);
router.get("/testMail/:idEmailTemplate", ControllerTest.testMail);
router.post("/whatsapp", ControllerTest.whatsapp);
router.post(
  "/getPropertiesOfEasyBroker",
  ControllerTest.getPropertiesOfEasyBroker
);
router.post(
  "/getPropertiesOfEasyBrokerId",
  ControllerTest.getPropertiesOfEasyBrokerId
);
router.post("/sendWhatsapp", ControllerTest.sendWhatsapp);
router.get("/sendWhatsappTwilio", ControllerTest.sendWhatsappTwilio);
router.post("/testStripe", ControllerTest.testStripe);
router.post("/connect/matiWebhookHomify", ControllerTest.matiWebhookHomify);
router.post("/connect/setMLMWebhook", ControllerTest.setMLMWebhook);
router.get("/connect/getPropertyPictures", ControllerTest.getPropertyPictures);
router.post("/testStripeWebhook", ControllerTest.testStripeWebhook);
router.post(
  "/testStripeWebhookConnect",
  ControllerTest.testStripeWebhookConnect
);
router.post("/connect/dispersionOrder", ControllerTest.dispersionOrder);
router.post("/connect/collection", ControllerTest.collection);
router.get(
  "/connect/scheduleTask/dispersion",
  ControllerTest.scheduleTaskDispersion
);
router.get("/connect/scheduleTask/payment", ControllerTest.scheduleTaskPayment);
router.get("/connect/scheduleTask/reminder", ControllerTest.SentReminders);
router.get(
  "/customer/getConfigForCollAndDisp",
  ControllerCustomer.getConfigForCollAndDisp
);
router.get("/viewFile/:idDocument/:bucketSource", ControllerTest.viewFiles);
router.get(
  "/viewVideo/:idDocument/:bucketSource/:type",
  ControllerTest.viewVideo
);
router.get(
  "/viewFile/:idDocument/:bucketSource/:type",
  ControllerTest.viewFilesType
);
router.get(
  "/viewFileDownload/:idDocument/:bucketSource/:type",
  ControllerTest.viewFilesTypeDownload
);
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
//Login
router.post("/systemUser/validateLogin", ControllerLogin.login);
router.post(
  "/systemUser/getRequestExternalDS",
  ControllerLogin.getRequestExternalDS
);
router.put(
  "/systemUser/setRequestExternalDS/:idExternalUserInDC",
  ControllerLogin.setRequestExternalDS
);
//Login
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
router.post(
  "/leads/generateVerificationCode",
  ControllerLeads.generateVerificationCode
);
router.post("/leads/catalog/getAllCountries", ControllerLeads.getAllCountries);

//customersch//
router.post("/property/getPropertyById", ControllerCustomerSch.getPropertyById);
router.put(
  "/invitation/processInvitation/:idInvitation",
  ControllerCustomerSch.processInvitation
);
//customersch//

module.exports = router;
