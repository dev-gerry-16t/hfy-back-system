"use strict";

const express = require("express");
const router = express.Router();

const ControllerCustomerSch = require("../controllers/customerSch");
const ControllerPaymentSch = require("../controllers/payment");

router.post(
  "/timeLine/getCustomerTimeLine",
  ControllerCustomerSch.getCustomerTimeLine
);
router.post("/customer/getCustomerData", ControllerCustomerSch.getCustomerData);
router.put(
  "/customer/updateCustomerAccount/:idCustomer",
  ControllerCustomerSch.updateCustomerAccount
);
router.put(
  "/address/setCustomerAddress/:idCustomer",
  ControllerCustomerSch.setCustomerAddress
);
router.put(
  "/account/setCustomerBankingAccount/:idCustomer",
  ControllerCustomerSch.setCustomerBankingAccount
);
router.put(
  "/typeForm/setCustomerWorkingInfo/:idCustomer",
  ControllerCustomerSch.setCustomerWorkingInfo
);
router.put(
  "/personalReferences/setPersonalReference/:idCustomer",
  ControllerCustomerSch.setPersonalReference
);
router.put(
  "/customerDocument/addCustomerDocument/:idCustomer",
  ControllerCustomerSch.addCustomerDocument
);
router.put(
  "/endorsement/setCustomerEndorsement/:idCustomer",
  ControllerCustomerSch.setCustomerEndorsement
);
router.put(
  "/customerEmailAddress/setCustomerEmailAddress/:idCustomer",
  ControllerCustomerSch.setCustomerEmailAddress
);
router.put(
  "/customerPhoneNumber/setCustomerPhoneNumber/:idCustomer",
  ControllerCustomerSch.setCustomerPhoneNumber
);
router.post(
  "/customer/validateCustomerPropertiesInTab",
  ControllerCustomerSch.validateCustomerPropertiesInTab
);
router.post(
  "/customer/getCustomerDocument",
  ControllerCustomerSch.getCustomerDocument
);
router.post(
  "/customer/getCustomerTabById",
  ControllerCustomerSch.getCustomerTabById
);
router.post(
  "/verificationIdentity/getVerificationIdentityCoincidences",
  ControllerCustomerSch.getVerificationIdentityCoincidences
);
router.post(
  "/verificationIdentity/getVerificationIdentityById",
  ControllerCustomerSch.getVerificationIdentityById
);
router.put(
  "/verificationIdentity/validateIdentity/:idVerificationIdentity",
  ControllerCustomerSch.validateIdentity
);
router.post(
  "/investigation/getInvestigationProcessCoincidences",
  ControllerCustomerSch.getInvestigationProcessCoincidences
);
router.post(
  "/customer/getUserCoincidences",
  ControllerCustomerSch.getUserCoincidences
);
router.post(
  "/prospect/getProspectCoincidences",
  ControllerCustomerSch.getProspectCoincidences
);
router.post(
  "/investigation/getInvestigationProcessById",
  ControllerCustomerSch.getInvestigationProcessById
);
router.post(
  "/investigation/getCustomerDataByTab",
  ControllerCustomerSch.getCustomerDataByTab
);
router.put(
  "/customer/updateInvestigationProcess/:idInvestigationProcess",
  ControllerCustomerSch.updateInvestigationProcess
);
router.post(
  "/property/getPropertyCoincidencesV2",
  ControllerCustomerSch.getPropertyCoincidencesV2
);
router.put(
  "/property/addPropertyV2/:idCustomer",
  ControllerCustomerSch.addPropertyV2
);
router.put(
  "/property/setPropertyDocument/:idProperty",
  ControllerCustomerSch.setPropertyDocument
);
router.post("/property/getPropertyById", ControllerCustomerSch.getPropertyById);
router.post(
  "/property/getPropertyPictures",
  ControllerCustomerSch.getPropertyPictures
);
router.post(
  "/property/getApplicantsByProperty",
  ControllerCustomerSch.getApplicantsByProperty
);
router.post(
  "/property/getAmenitiesByProperty",
  ControllerCustomerSch.getAmenitiesByProperty
);
router.post(
  "/property/getDocumentsByProperty",
  ControllerCustomerSch.getDocumentsByProperty
);
router.post(
  "/property/getAdvisersInProperty",
  ControllerCustomerSch.getAdvisersInProperty
);
router.put(
  "/property/updateProperty/:idProperty",
  ControllerCustomerSch.updateProperty
);
router.put(
  "/property/setPropertyAssociation/:idProperty",
  ControllerCustomerSch.setPropertyAssociation
);
router.put(
  "/property/setAdviserInProperty/:idProperty",
  ControllerCustomerSch.setAdviserInProperty
);
router.put(
  "/property/sendTenantInvitation/:idApartment",
  ControllerCustomerSch.sendTenantInvitation
);
router.put(
  "/property/setApplicant/:idProperty",
  ControllerCustomerSch.setApplicant
);
router.put(
  "/property/applyToProperty/:idProperty",
  ControllerCustomerSch.applyToProperty
);
router.put(
  "/property/setFavoriteProperty/:idProperty",
  ControllerCustomerSch.setFavoriteProperty
);
router.put(
  "/property/setContract/:idContract",
  ControllerCustomerSch.setContract
);
router.put(
  "/property/generateDocument/:idContract",
  ControllerCustomerSch.generateDocument
);
router.put(
  "/customerDocument/deactivateCustomerDocument/:idDocument",
  ControllerCustomerSch.deactivateCustomerDocument
);
router.post(
  "/zipCode/getLocationFilter",
  ControllerCustomerSch.getLocationFilter
);
router.post(
  "/orderPayment/getOrderPaymentById",
  ControllerPaymentSch.getOrderPaymentById
);
router.post("/payment/getServiceFee", ControllerPaymentSch.getServiceFee);
router.put(
  "/invitation/processInvitation/:idInvitation",
  ControllerCustomerSch.processInvitation
);
router.put(
  "/contract/setContractApprovement/:idSystemUser",
  ControllerCustomerSch.setContractApprovement
);
router.post(
  "/customer/getCustomerDetailById",
  ControllerCustomerSch.getCustomerDetailById
);
router.put(
  "/property/requestPropertyContact/:idProperty",
  ControllerCustomerSch.requestPropertyContact
);
router.post("/customer/getAdviserStats", ControllerCustomerSch.getAdviserStats);
router.post("/loginHistory/getUserStats", ControllerCustomerSch.getUserStats);
router.post(
  "/customer/getAdviserRanking",
  ControllerCustomerSch.getAdviserRanking
);
router.post(
  "/propertyDocument/getDocRequiredByProperty",
  ControllerCustomerSch.getDocRequiredByProperty
);
router.put(
  "/propertyDocument/addPropertyDocument/:idDocument",
  ControllerCustomerSch.addPropertyDocument
);
router.put(
  "/propertyDocument/deactivatePropertyDocument/:idDocument",
  ControllerCustomerSch.deactivatePropertyDocument
);

module.exports = router;
