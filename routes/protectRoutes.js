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
router.put(
  "/systemUser/setUserProfileTheme/:idSystemUser",
  ControllerAuth.setUserProfileTheme
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
router.post(
  "/customer/getRequestAdvancePymtPlan",
  ControllerCustomer.getRequestAdvancePymtPlan
);
router.post(
  "/customer/getRequestAdvancePymtProperties",
  ControllerCustomer.getRequestAdvancePymtProperties
);
router.put(
  "/customer/updateInvitation/:idInvitation",
  ControllerCustomer.updateInvitation
);
router.put(
  "/customer/updateCustomerLoan/:idContract",
  ControllerCustomer.updateCustomerLoan
);
router.post(
  "/customer/getPropertyCoincidences",
  ControllerCustomer.getPropertyCoincidences
);
router.post("/customer/getCustomerLoan", ControllerCustomer.getCustomerLoan);
router.post(
  "/customer/getCustomerLoanProperties",
  ControllerCustomer.getCustomerLoanProperties
);
router.get(
  "/customer/getDispersionOrder",
  ControllerCustomer.getDispersionOrder
);
router.get(
  "/customer/getConfigForCollAndDisp",
  ControllerCustomer.getConfigForCollAndDisp
);
router.put(
  "/customer/forgiveInterest/:idContract",
  ControllerCustomer.forgiveInterest
);
router.post(
  "/customer/getTransactionsByUser",
  ControllerCustomer.getTransactionsByUser
);
//Documents//
router.post("/addDocument", ControllerDocuments.addDocument);
router.post("/addDocumentThumb", ControllerDocuments.addDocumentThumb);
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
router.post(
  "/typeForm/validateTypeFormProperties",
  ControllerTypeForm.validateTypeFormProperties
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
router.post(
  "/catalogs/getAllIncidenceTypes",
  ControllerCatalogs.getAllIncidenceTypes
);
router.post(
  "/catalogs/getAllIncidenceStatus",
  ControllerCatalogs.getAllIncidenceStatus
);
router.post(
  "/catalogs/getCustomerForIncidence",
  ControllerCatalogs.getCustomerForIncidence
);
router.post(
  "/catalogs/getAllIncidenePaymentMethods",
  ControllerCatalogs.getAllIncidenePaymentMethods
);
router.post(
  "/catalogs/getAllPolicyPaymentMethods",
  ControllerCatalogs.getAllPolicyPaymentMethods
);
router.post(
  "/catalogs/getAllRejectionReasons",
  ControllerCatalogs.getAllRejectionReasons
);
router.post(
  "/catalogs/getAllCommercialActivities",
  ControllerCatalogs.getAllCommercialActivities
);
router.post(
  "/catalogs/getAllRequestAdvancePymtStatus",
  ControllerCatalogs.getAllRequestAdvancePymtStatus
);
router.post(
  "/catalogs/getAllInvPymtMethods",
  ControllerCatalogs.getAllInvPymtMethods
);
router.post(
  "/catalogs/getUsersForAssignment",
  ControllerCatalogs.getUsersForAssignment
);
router.post("/catalogs/getAllPhoneTypes", ControllerCatalogs.getAllPhoneTypes);
router.post(
  "/catalogs/getAllVerificationIdentityStatus",
  ControllerCatalogs.getAllVerificationIdentityStatus
);
router.post(
  "/catalogs/getAllPropertyStates",
  ControllerCatalogs.getAllPropertyStates
);
router.post(
  "/catalogs/getAllInvestigationStatus",
  ControllerCatalogs.getAllInvestigationStatus
);
router.post(
  "/catalogs/getAllPropertyAmenities",
  ControllerCatalogs.getAllPropertyAmenities
);
router.post(
  "/catalogs/getAllPropertyGeneralCharacteristics",
  ControllerCatalogs.getAllPropertyGeneralCharacteristics
);
router.post(
  "/catalogs/getAllApplicationMethods",
  ControllerCatalogs.getAllApplicationMethods
);
router.post("/catalogs/getAllProperties", ControllerCatalogs.getAllProperties);
router.post("/catalogs/getAllCurrencies", ControllerCatalogs.getAllCurrencies);
router.post("/catalogs/getAllSites", ControllerCatalogs.getAllSites);
router.post("/catalogs/getAllLandAccess", ControllerCatalogs.getAllLandAccess);
router.post(
  "/catalogs/getAllSubscriptionTypes",
  ControllerCatalogs.getAllSubscriptionTypes
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
router.post("/admin/getContract/v2", ControllerAdmin.getContractV2);
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
  "/admin/getRequestAdvancePymtById",
  ControllerAdmin.getRequestAdvancePymtById
);
router.put(
  "/admin/updateRequestAdvancePym/:idRequestAdvancePymt",
  ControllerAdmin.updateRequestAdvancePymt
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
router.post(
  "/admin/getRequestAdvancePymtCoincidences",
  ControllerAdmin.getRequestAdvancePymtCoincidences
);
router.put(
  "/admin/updateProspectInvitation/:idProspect",
  ControllerAdmin.updateProspectInvitation
);
router.post("/admin/getTransactions", ControllerAdmin.getTransactions);
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
router.post("/leads/bulkPotentialAgent", ControllerLeads.bulkPotentialAgent);
router.post(
  "/leads/getPotentialAgentCoincidences",
  ControllerLeads.getPotentialAgentCoincidences
);
router.post(
  "/leads/getLandingProspectById",
  ControllerLeads.getLandingProspectById
);
// Lead//

//Historico //
router.post("/historic/getAudit", ControllerAudit.getAudit);
//Historico //

//Providers//
router.post(
  "/providerPayment/getRequestForProviderProperties/v2",
  ControllerPaymentProvider.getRequestForProviderPropertiesv2
);
router.post(
  "/providerPayment/getRequestForProviderProperties",
  ControllerPaymentProvider.getRequestForProviderProperties
);
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
  "/providerPayment/signRequestForProvider/:idRequestForProvider",
  ControllerPaymentProvider.signRequestForProvider
);
router.put(
  "/providerPayment/updateRequestForProvider/:idRequestForProvider",
  ControllerPaymentProvider.updateRequestForProvider
);
router.post(
  "/providerPayment/addRequestForProvider",
  ControllerPaymentProvider.addRequestForProvider
);
router.post(
  "/providerPayment/updateMovingDialog",
  ControllerPaymentProvider.updateMovingDialog
);
router.post(
  "/providerPayment/addIncidence",
  ControllerPaymentProvider.addIncidence
);
router.post(
  "/providerPayment/getIncidenceCoincidences",
  ControllerPaymentProvider.getIncidenceCoincidences
);
router.post(
  "/providerPayment/getIncidenceById",
  ControllerPaymentProvider.getIncidenceById
);
router.put(
  "/providerPayment/updateIncidence/:idIncidence",
  ControllerPaymentProvider.updateIncidence
);
router.post(
  "/providerPayment/getAmountForGWTransaction",
  ControllerPaymentProvider.getAmountForGWTransaction
);
router.post(
  "/providerPayment/getAmountForGWTransactionCard",
  ControllerPaymentProvider.getAmountForGWTransactionCard
);
router.post(
  "/providerPayment/getCatalogAmountForGWTransaction",
  ControllerPaymentProvider.getCatalogAmountForGWTransaction
);
router.post(
  "/providerPayment/getConfirmPaymentIntent",
  ControllerPaymentProvider.getConfirmPaymentIntent
);
router.post(
  "/providerPayment/getConfirmRetrievePaymentIntent",
  ControllerPaymentProvider.getConfirmRetrievePaymentIntent
);
//Providers//

module.exports = router;
