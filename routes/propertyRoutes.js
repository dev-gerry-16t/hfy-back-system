"use strict";

const express = require("express");
const router = express.Router();

const ControllerProperties = require("../controllers/properties");

router.put("/addPropertyV2/:idCustomer", ControllerProperties.addPropertyV2);
router.put("/updateProperty/:idProperty", ControllerProperties.updateProperty);
router.put(
  "/updatePropertyAddress/:idProperty",
  ControllerProperties.updatePropertyAddress
);
router.put(
  "/updatePropertyCharAndAmen/:idProperty",
  ControllerProperties.updatePropertyCharAndAmen
);
router.put(
  "/updatePropertyInApplicationMethod/:idProperty",
  ControllerProperties.updatePropertyInApplicationMethod
);
router.post("/getPropertyById", ControllerProperties.getPropertyById);
router.post("/validateClassified", ControllerProperties.validateClassified);
router.put(
  "/setSubscription/:idSystemUser",
  ControllerProperties.setSubscription
);
router.post("/getSuscriptionDetail", ControllerProperties.getSuscriptionDetail);
router.post("/setAnswerToML", ControllerProperties.setAnswerToML);
router.post("/cancelSubscription", ControllerProperties.cancelSubscription);

module.exports = router;
