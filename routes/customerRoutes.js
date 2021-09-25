"use strict";

const express = require("express");
const router = express.Router();

const ControllerCustomerSch = require("../controllers/customerSch");

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

module.exports = router;
