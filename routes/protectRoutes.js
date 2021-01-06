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
  "/customer/getTenantCoincidences",
  ControllerCustomer.getTenantCoincidences
);
router.post("/customer/addProperty", ControllerCustomer.addProperty);
router.post(
  "/customer/getAllProperties",
  ControllerCustomer.getCustomerProperties
);
router.post(
  "/customer/getApartments",
  ControllerCustomer.getCustomerApartments
);
router.post(
  "/customer/tenantInvitation",
  ControllerCustomer.sendTenantInvitation
);
router.post("/customer/statsCharts", ControllerCustomer.getStatsChart);

module.exports = router;
