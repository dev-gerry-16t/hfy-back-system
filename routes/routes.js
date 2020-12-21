"use strict";

var express = require("express");
var ControllerLogin = require("../controllers/login");
var ControllerRegister = require("../controllers/register");
var ControllerRecover = require("../controllers/recoverPass");
var ControllerTest = require("../controllers/test");

var router = express.Router();

router.get("/", ControllerTest.test);
router.get("/test", ControllerTest.testPath);
router.get("/mailto", ControllerRegister.mailto);
router.post("/loginUser", ControllerLogin.login);
router.post("/registerUser", ControllerRegister.register);
router.post("/customerType/getAllCustomer", ControllerRegister.customerType);
router.post("/personType/getAllPerson", ControllerRegister.personType);
router.post("/endorsement/getAllEndorsement", ControllerRegister.endorsement);
router.post("/requestSignUp", ControllerRegister.signUp);
router.post("/requestSignUp/verifyCode", ControllerRegister.verifyCode);

module.exports = router;
