"use strict";

const express = require("express");
const router = express.Router();

const ControllerExternalSch = require("../controllers/externalSch");

router.put(
  "/request/setRequest/:idSystemUser",
  ControllerExternalSch.setRequest
);
router.post("/request/getRequestById", ControllerExternalSch.getRequestById);
router.post(
  "/request/getRequestCoincidences",
  ControllerExternalSch.getRequestCoincidences
);

module.exports = router;
