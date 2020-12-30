"use strict";

const express = require("express");
const router = express.Router();
const ControllerAuth = require("../controllers/authInitProfile");
const ControllerCustomer = require("../controllers/customerInformation");

router.post("/testToken", (req, res) => {
  res.json({
    error: null,
    data: {
      title: "mi ruta protegida",
      user: req.user,
    },
  });
});

router.post("/systemUser/userProfile", ControllerAuth.userProfile);
router.post("/systemUser/menuProfile", ControllerAuth.userMenuProfile);
router.post("/customer/getCustomerById", ControllerCustomer.getCustomerById);
router.post(
  "/customer/getTendantCoincidences",
  ControllerCustomer.getTendantCoincidences
);

module.exports = router;
