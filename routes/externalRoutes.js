"use strict";

const express = require("express");
const router = express.Router();

const ControllerExternalSch = require("../controllers/externalSch");
const ControllerCustomerSch = require("../controllers/customerSch");

router.put(
  "/request/setRequest/:idSystemUser",
  ControllerExternalSch.setRequest
);
router.post("/request/getRequestById", ControllerExternalSch.getRequestById);
router.post(
  "/request/getRequestCoincidences",
  ControllerExternalSch.getRequestCoincidences
);
router.post(
  "/request/getRequestDocuments",
  ControllerExternalSch.getRequestDocuments
);
router.put(
  "/request/getDocumentProperties/:idRequest",
  ControllerCustomerSch.getDocumentProperties
);
router.put(
  "/request/signDocument/:idRequest",
  ControllerExternalSch.signDocument
);
router.post("/request/isOPPaid", ControllerExternalSch.isOPPaid);

module.exports = router;
