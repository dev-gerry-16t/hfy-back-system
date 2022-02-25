"use strict";

const express = require("express");
const router = express.Router();

const ControllerProperties = require("../controllers/properties");

router.put("/addPropertyV2/:idCustomer", ControllerProperties.addPropertyV2);
router.put("/setUserConfig/:idSystemUser", ControllerProperties.setUserConfig);
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

module.exports = router;
