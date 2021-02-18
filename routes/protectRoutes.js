"use strict";

const express = require("express");
const router = express.Router();
const ControllerAuth = require("../controllers/authInitProfile");
const ControllerCustomer = require("../controllers/customerInformation");
const ControllerDocuments = require("../controllers/repositoryDocuments");
const ControllerMessages = require("../controllers/messagesUser");
const ControllerTypeForm = require("../controllers/typeForm");
const ControllerCatalogs = require("../controllers/catalogs");
const ControllerAdmin = require("../controllers/adminServices");

router.post("/systemUser/userProfile", ControllerAuth.userProfile);
router.post("/systemUser/menuProfile", ControllerAuth.userMenuProfile);
router.put(
  "/systemUser/setUserProfile/:idSystemUser",
  ControllerAuth.setUserProfile
);
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
router.post(
  "/customer/getCustTenantDashboardById",
  ControllerDocuments.getCustTenantDashboardById
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
router.post(
  "/typeForm/getCustomerTypeForm",
  ControllerTypeForm.getCustomerTypeForm
);
router.post("/typeForm/setTypeForm", ControllerTypeForm.setTypeForm);
router.post("/typeForm/setTypeFormOwner", ControllerTypeForm.setTypeFormOwner);
router.put(
  "/typeForm/addTypeFormDocument/:idDocument",
  ControllerTypeForm.addTypeFormDocument
);
router.post(
  "/typeForm/setTypeFormReference",
  ControllerTypeForm.setTypeFormReference
);
//TypeForm//

//Catalogos//
router.post(
  "/catalogs/getAllMaritalStatus",
  ControllerCatalogs.getAllMaritalStatus
);
router.post(
  "/catalogs/getAllPropertyTypes",
  ControllerCatalogs.getAllPropertyTypes
);
router.post("/catalogs/getAllPolicies", ControllerCatalogs.getAllPolicies);
router.post(
  "/catalogs/getAllNationalities",
  ControllerCatalogs.getAllNationalities
);
router.post("/catalogs/getAllIDTypes", ControllerCatalogs.getAllIDTypes);
router.post(
  "/catalogs/getAllOccupations",
  ControllerCatalogs.getAllOccupations
);
router.post(
  "/catalogs/getAllPolicyStatus",
  ControllerCatalogs.getAllPolicyStatus
);
//Catalogos//

//Admin//
router.post("/admin/getContractStats", ControllerAdmin.getContractStats);
router.post(
  "/admin/getContractCoincidences",
  ControllerAdmin.getContractCoincidences
);
router.post(
  "/admin/getContractIndicatorsChart",
  ControllerAdmin.getContractIndicatorsChart
);
router.post("/admin/searchCustomer", ControllerAdmin.searchCustomer);
router.post("/admin/addProspect", ControllerAdmin.addProspect);
router.put("/admin/updateContract/:idContract", ControllerAdmin.updateContract);
router.post("/admin/getByIdContract", ControllerAdmin.getByIdContract);
router.post(
  "/admin/getTenantByIdContract",
  ControllerAdmin.getTenantByIdContract
);
router.post(
  "/admin/getAgentByIdContract",
  ControllerAdmin.getAgentByIdContract
);
router.put(
  "/admin/switchCustomerInContract/:idContract",
  ControllerAdmin.switchCustomerInContract
);
//Admin//

module.exports = router;
