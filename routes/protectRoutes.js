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
const ControllerLeads = require("../controllers/leads");
const ControllerAudit = require("../controllers/audit");
const ControllerPaymentProvider = require("../controllers/paymentsAndProviders");

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
router.post(
  "/customer/getAgentIndicators",
  ControllerCustomer.getAgentIndicators
);
router.post(
  "/customer/getAgentContractCoincidences",
  ControllerCustomer.getAgentContractCoincidences
);
router.post(
  "/customer/getAgentCommissionChart",
  ControllerCustomer.getAgentCommissionChart
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
router.post("/customer/getNotifications", ControllerMessages.getNotifications);
router.put(
  "/customer/updateNotifications/:idNotification",
  ControllerMessages.updateNotifications
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
router.post(
  "/typeForm/getTypeFormProperties",
  ControllerTypeForm.getTypeFormProperties
);
//TypeForm//

//Catalogos//
router.post(
  "/catalogs/getAllMaritalStatus",
  ControllerCatalogs.getAllMaritalStatus
);
router.post(
  "/catalogs/getAllMaritalRegime",
  ControllerCatalogs.getAllMaritalRegime
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
router.post(
  "/catalogs/getAllCommercialSocietyTypes",
  ControllerCatalogs.getAllCommercialSocietyTypes
);
router.post("/catalogs/getAllStates", ControllerCatalogs.getAllStates);
router.post(
  "/catalogs/getAllProspectStatus",
  ControllerCatalogs.getAllProspectStatus
);
router.post(
  "/catalogs/getAllRelationshipTypes",
  ControllerCatalogs.getAllRelationshipTypes
);
router.post(
  "/catalogs/getAllPersonalReferenceStatus",
  ControllerCatalogs.getAllPersonalReferenceStatus
);
router.post(
  "/catalogs/getAllProviderTypes",
  ControllerCatalogs.getAllProviderTypes
);
router.post(
  "/catalogs/getAllCollaboratorTypes",
  ControllerCatalogs.getAllCollaboratorTypes
);
router.post("/catalogs/getAllProviders", ControllerCatalogs.getAllProviders);
router.post(
  "/catalogs/getAllProviderPaymentForms",
  ControllerCatalogs.getAllProviderPaymentForms
);
router.post(
  "/catalogs/getAllCollaborators",
  ControllerCatalogs.getAllCollaborators
);
router.post(
  "/catalogs/getAllRequestForProviderStatus",
  ControllerCatalogs.getAllRequestForProviderStatus
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
router.post("/admin/getContract", ControllerAdmin.getContract);
router.post("/admin/getContractComment", ControllerAdmin.getContractComment);
router.put("/admin/setContract/:idContract", ControllerAdmin.setContract);
router.put(
  "/admin/addContractComment/:idContract",
  ControllerAdmin.addContractComment
);
router.put(
  "/admin/addDigitalContractDocument/:idContract",
  ControllerAdmin.addDigitalContractDocument
);
router.put(
  "/admin/addContractDocument/:idDocument",
  ControllerAdmin.addContractDocument
);
router.post(
  "/admin/getDigitalContractDocument",
  ControllerAdmin.getDigitalContractDocument
);
router.post(
  "/admin/getDocumentByIdContract",
  ControllerAdmin.getDocumentByIdContract
);
router.post(
  "/admin/getCustomerAgentCoincidences",
  ControllerAdmin.getCustomerAgentCoincidences
);
router.post(
  "/admin/getLegalContractCoincidences",
  ControllerAdmin.getLegalContractCoincidences
);
router.put(
  "/admin/setPersonalReferenceForm/:idPersonalReference",
  ControllerAdmin.setPersonalReferenceForm
);
//Admin//

// Lead//
router.post(
  "/leads/getLandingProspectCoincidences",
  ControllerLeads.getLandingProspectCoincidences
);
router.put(
  "/leads/updateLandingProspect/:idLandingProspect",
  ControllerLeads.updateLandingProspect
);
router.post(
  "/leads/getLandingProspectStats",
  ControllerLeads.getLandingProspectStats
);
// Lead//

//Historico //
router.post("/historic/getAudit", ControllerAudit.getAudit);
//Historico //

//Providers//
router.post(
  "/providerPayment/validatePaymentSchedule",
  ControllerPaymentProvider.validatePaymentSchedule
);
router.post(
  "/providerPayment/getProviderCoincidences",
  ControllerPaymentProvider.getProviderCoincidences
);
router.post(
  "/providerPayment/getProviderById",
  ControllerPaymentProvider.getProviderById
);
router.post(
  "/providerPayment/getRequestForProviderCoincidences",
  ControllerPaymentProvider.getRequestForProviderCoincidences
);
router.post(
  "/providerPayment/getRequestForProviderById",
  ControllerPaymentProvider.getRequestForProviderById
);
router.put(
  "/providerPayment/setProvider/:idProvider",
  ControllerPaymentProvider.setProvider
);
router.put(
  "/providerPayment/updateRequestForProvider/:idRequestForProvider",
  ControllerPaymentProvider.updateRequestForProvider
);
router.put(
  "/providerPayment/addRequestForProvider/:idProvider",
  ControllerPaymentProvider.addRequestForProvider
);
//Providers//

module.exports = router;
