"use strict";

const express = require("express");
const router = express.Router();
const ControllerAuth = require("../controllers/authInitProfile");
const ControllerCustomer = require("../controllers/customerInformation");
const ControllerDocuments = require("../controllers/repositoryDocuments");
const ControllerMessages = require("../controllers/messagesUser");
const ControllerTypeForm = require("../controllers/typeForm");

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
router.post(
  "/customer/getCustomerTenants",
  ControllerCustomer.getCustomerTenants
);
router.post("/customer/getAllBanks", ControllerCustomer.getAllBanks);
router.post("/customer/requestAdvancement", ControllerCustomer.requestAdvance);
router.post("/customer/getAdressZipCode", ControllerCustomer.getAdressZipCode);
router.post(
  "/customer/getCustomerTenantsById",
  ControllerCustomer.getCustomerTenantsById
);
router.post("/customer/getAllPayments", ControllerCustomer.getAllPayments);
router.post(
  "/customer/getAllPaymentInContract",
  ControllerCustomer.getAllPaymentInContract
);

//Documents//
router.post("/addDocument", ControllerDocuments.addDocument);
router.post(
  "/customer/getAllDocumentTypes",
  ControllerDocuments.getAllDocumentTypes
);
router.post(
  "/customer/getPaymentInContractDocument",
  ControllerDocuments.getPaymentInContractDocument
);
router.post(
  "/typeForm/getTypeFormDocument",
  ControllerDocuments.getTypeFormDocument
);
//Documents//

//Messages//
router.post(
  "/customer/addCustomerMessage",
  ControllerMessages.addCustomerMessage
);
router.post(
  "/customer/getCustomerMessage",
  ControllerMessages.getCustomerMessage
);
//Messages//

//TypeForm//
router.post("/typeForm/getTypeForm", ControllerTypeForm.getTypeForm);
router.post("/typeForm/setTypeForm", ControllerTypeForm.setTypeForm);
//TypeForm//

module.exports = router;
