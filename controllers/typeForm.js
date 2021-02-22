const sql = require("mssql");

const executeGetTypeForm = async (params, res) => {
  const {
    idCustomer,
    idContract,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetTypeForm", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset1 = result.recordsets[0];
        const resultRecordset2 = result.recordsets[1];
        res.status(200).send({
          response1: resultRecordset1,
          response2: resultRecordset2,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetCustomerTypeForm = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    idContract = null,
    offset = "-06:00",
  } = params;

  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetCustomerTypeForm", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeSetTypeFormReference = async (params, res) => {
  const {
    idCustomer,
    idTypeForm,
    idCustomerTenant,
    idPersonalReference = null,
    givenName = null,
    lastName = null,
    mothersMaidenName = null,
    phoneNumber = null,
    emailAddress = null,
    street = null,
    suite = null,
    streetNumber = null,
    idZipCode = null,
    neighborhood = null,
    isActive = null,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdTypeForm", sql.NVarChar, idTypeForm);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input(
      "p_nvcIdPersonalReference",
      sql.NVarChar,
      idPersonalReference
    );
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_nvcStreet", sql.NVarChar, street);
    request.input("p_nvcSuite", sql.NVarChar, suite);
    request.input("p_nvcStreetNumber", sql.NVarChar, streetNumber);
    request.input("p_intIdZipCode", sql.Int, idZipCode);
    request.input("p_nvcNeighborhood", sql.NVarChar, neighborhood);
    request.input("p_bitIsActive", sql.Bit, isActive);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPsetPersonalReference", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeSetTypeForm = async (params, res) => {
  const {
    idCustomer = null,
    idCustomerTenant = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = "-06:00",
    idCountryNationality = null,
    idType = null,
    idTypeNumber = null,
    placeOfIssue = null,
    idOccupationActivity = null,
    idTypeForm = null,
    givenName = null,
    lastName = null,
    mothersMaidenName = null,
    phoneNumber = null,
    emailAddress = null,
    taxId = null,
    citizenId = null,
    hasCar = null,
    carriagePlate = null,
    street = null,
    suite = null,
    streetNumber = null,
    idZipCode = null,
    neighborhood = null,
    isOwn = null,
    currentTimeRange = null,
    currentTime = null,
    economicDependents = null,
    companyName = null,
    currentSalary = null,
    antiquityTimeRange = null,
    antiquity = null,
    bossName = null,
    bossEmailAddress = null,
    hasEndorsement = null,
    endorsementGivenName = null,
    endorsementLastName = null,
    endorsementMothersMaidenName = null,
    endorsementEmailAddress = null,
    endorsementPhoneNumber = null,
    collateralPropertyStreet = null,
    collateralPropertySuite = null,
    collateralPropertyStreetNumber = null,
    collateralPropertyIdZipCoode = null,
    collateralPropertyNeighborhood = null,
    documentNumber = null,
    documentSignedAt = null,
    notaryOfficeNumber = null,
    notaryName = null,
    signedAtPlace = null,
    idEndorsementNationality = null,
    idEndorsementType = null,
    idEndorsementTypeNumber = null,
    endorsementCitizenId = null,
    publicPropertyRegistry = null,
    endorsementPlaceOfIssue = null,
  } = params;

  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_intIdCountryNationality", sql.Int, idCountryNationality);
    request.input("p_intIdType", sql.Int, idType);
    request.input("p_nvcIdTypeNumber", sql.NVarChar, idTypeNumber);
    request.input("p_nvcPlaceOfIssue", sql.NVarChar, placeOfIssue);
    request.input("p_intIdOccupationActivity", sql.Int, idOccupationActivity);
    request.input("p_nvcIdTypeForm", sql.NVarChar, idTypeForm);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_nvcTaxId", sql.NVarChar, taxId);
    request.input("p_nvcCitizenId", sql.NVarChar, citizenId);
    request.input("p_bitHasCar", sql.Bit, hasCar);
    request.input("p_nvcCarriagePlate", sql.NVarChar, carriagePlate);
    request.input("p_nvcStreet", sql.NVarChar, street);
    request.input("p_nvcSuite", sql.NVarChar, suite);
    request.input("p_nvcStreetNumber", sql.NVarChar, streetNumber);
    request.input("p_intIdZipCode", sql.Int, idZipCode);
    request.input("p_nvcNeighborhood", sql.NVarChar, neighborhood);
    request.input("p_bitIsOwn", sql.Bit, isOwn);
    request.input("p_chrCurrentTimeRange", sql.Char, currentTimeRange);
    request.input("p_intCurrentTime", sql.Int, currentTime);
    request.input("p_intEconomicDependents", sql.Int, economicDependents);
    request.input("p_nvcCompanyName", sql.NVarChar, companyName);
    request.input("p_decCurrentSalary", sql.Decimal, currentSalary);
    request.input("p_chrAntiquityTimeRange", sql.Char, antiquityTimeRange);
    request.input("p_intAntiquity", sql.Int, antiquity);
    request.input("p_nvcBossName", sql.NVarChar, bossName);
    request.input("p_nvcBossEmailAddress", sql.NVarChar, bossEmailAddress);
    request.input("p_bitHasEndorsement", sql.Bit, hasEndorsement);
    request.input(
      "p_nvcEndorsementGivenName",
      sql.NVarChar,
      endorsementGivenName
    );
    request.input(
      "p_nvcEndorsementLastName",
      sql.NVarChar,
      endorsementLastName
    );
    request.input(
      "p_nvcEndorsementMothersMaidenName",
      sql.NVarChar,
      endorsementMothersMaidenName
    );
    request.input(
      "p_nvcEndorsementEmailAddress",
      sql.NVarChar,
      endorsementEmailAddress
    );
    request.input(
      "p_nvcEndorsementPhoneNumber",
      sql.NVarChar,
      endorsementPhoneNumber
    );
    request.input(
      "p_nvcCollateralPropertyStreet",
      sql.NVarChar,
      collateralPropertyStreet
    );
    request.input(
      "p_nvcCollateralPropertySuite",
      sql.NVarChar,
      collateralPropertySuite
    );
    request.input(
      "p_nvcCollateralPropertyStreetNumber",
      sql.NVarChar,
      collateralPropertyStreetNumber
    );
    request.input(
      "p_intCollateralPropertyIdZipCoode",
      sql.Int,
      collateralPropertyIdZipCoode
    );
    request.input(
      "p_nvcCollateralPropertyNeighborhood",
      sql.NVarChar,
      collateralPropertyNeighborhood
    );
    request.input("p_nvcDocumentNumber", sql.NVarChar, documentNumber);
    request.input("p_datDocumentSignedAt", sql.Date, documentSignedAt);
    request.input("p_nvcNotaryOfficeNumber", sql.NVarChar, notaryOfficeNumber);
    request.input("p_nvcNotaryName", sql.NVarChar, notaryName);
    request.input("p_nvcSignedAtPlace", sql.NVarChar, signedAtPlace);

    request.input(
      "p_intIdEndorsementNationality",
      sql.Int,
      idEndorsementNationality
    );
    request.input("p_intIdEndorsementType", sql.Int, idEndorsementType);
    request.input(
      "p_nvcIdEndorsementTypeNumber",
      sql.NVarChar,
      idEndorsementTypeNumber
    );
    request.input(
      "p_nvcEndorsementCitizenId",
      sql.NVarChar,
      endorsementCitizenId
    );
    request.input(
      "p_nvcPublicPropertyRegistry",
      sql.NVarChar,
      publicPropertyRegistry
    );
    request.input(
      "p_nvcEndorsementPlaceOfIssue",
      sql.NVarChar,
      endorsementPlaceOfIssue
    );

    request.execute("customerSch.USPsetTypeForm", (err, result) => {
      console.log("err", err);
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeSetTypeFormOwner = async (params, res) => {
  const {
    idCustomer = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = "-06:00",
    idTypeForm = null,
    isOwner = null,
    givenName = null,
    lastName = null,
    mothersMaidenName = null,
    phoneNumber = null,
    emailAddress = null,
    taxId = null,
    citizenId = null,
    idMaritalStatus = null,
    street = null,
    suite = null,
    streetNumber = null,
    idZipCode = null,
    neighborhood = null,
    streetProperty = null,
    suiteProperty = null,
    streetNumberProperty = null,
    idZipCodeProperty = null,
    neighborhoodProperty = null,
    idPropertyType = null,
    isFurnished = null,
    currentRent = null,
    maintenanceAmount = null,
    totalParkingSpots = null,
    idBank = null,
    bankBranch = null,
    accountHolder = null,
    clabeNumber = null,
    signingAvailabilityAt = null,
    idPolicy = null,
    idContract = null,
    idCountryNationality = null,
    idType = null,
    idTypeNumber = null,
    placeOfIssue = null,
    accountNumber = null,
    hasInsurance = null,
  } = params;

  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_intIdCountryNationality", sql.Int, idCountryNationality);
    request.input("p_intIdType", sql.Int, idType);
    request.input("p_nvcIdTypeNumber", sql.NVarChar, idTypeNumber);
    request.input("p_nvcPlaceOfIssue", sql.NVarChar, placeOfIssue);
    request.input("p_nvcAccountNumber", sql.NVarChar, accountNumber);
    request.input("p_nvcIdTypeForm", sql.NVarChar, idTypeForm);
    request.input("p_bitIsOwner", sql.Bit, isOwner);
    request.input("p_nvcGivenName", sql.NVarChar, givenName);
    request.input("p_nvcLastName", sql.NVarChar, lastName);
    request.input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName);
    request.input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_nvcTaxId", sql.NVarChar, taxId);
    request.input("p_nvcCitizenId", sql.NVarChar, citizenId);
    request.input("p_intIdMaritalStatus", sql.Int, idMaritalStatus);
    request.input("p_nvcStreet", sql.NVarChar, street);
    request.input("p_nvcSuite", sql.NVarChar, suite);
    request.input("p_nvcStreetNumber", sql.NVarChar, streetNumber);
    request.input("p_intIdZipCode", sql.Int, idZipCode);
    request.input("p_nvcNeighborhood", sql.NVarChar, neighborhood);
    request.input("p_nvcStreetProperty", sql.NVarChar, streetProperty);
    request.input("p_nvcSuiteProperty", sql.NVarChar, suiteProperty);
    request.input(
      "p_nvcStreetNumberProperty",
      sql.NVarChar,
      streetNumberProperty
    );
    request.input("p_intIdZipCodeProperty", sql.Int, idZipCodeProperty);
    request.input(
      "p_nvcNeighborhoodProperty",
      sql.NVarChar,
      neighborhoodProperty
    );
    request.input("p_intIdPropertyType", sql.Int, idPropertyType);
    request.input("p_bitIsFurnished", sql.Bit, isFurnished);
    request.input("p_decCurrentRent", sql.Decimal, currentRent);
    request.input("p_decMaintenanceAmount", sql.Decimal, maintenanceAmount);
    request.input("p_intTotalParkingSpots", sql.Int, totalParkingSpots);
    request.input("p_nvcIdBank", sql.NVarChar, idBank);
    request.input("p_nvcBankBranch", sql.NVarChar, bankBranch);
    request.input("p_nvcAccountHolder", sql.NVarChar, accountHolder);
    request.input("p_nvcClabeNumber", sql.NVarChar, clabeNumber);
    request.input(
      "p_datSigningAvailabilityAt",
      sql.Date,
      signingAvailabilityAt
    );
    request.input("p_nvcIdPolicy", sql.NVarChar, idPolicy);
    request.input("p_bitHasInsurance", sql.Bit, hasInsurance);

    request.execute("customerSch.USPsetCustomerTypeForm", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddTypeFormDocument = async (params, res, url) => {
  const {
    idCustomer,
    idTypeForm,
    idCustomerTenant,
    type,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  const { idDocument } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdTypeForm", sql.NVarChar, idTypeForm);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdDocument", sql.NVarChar, idDocument);
    request.input("p_intType", sql.Int, type);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPaddTypeFormDocument", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const ControllerTypeForm = {
  getTypeForm: (req, res) => {
    const params = req.body;
    executeGetTypeForm(params, res);
  },
  getCustomerTypeForm: (req, res) => {
    const params = req.body;
    executeGetCustomerTypeForm(params, res);
  },
  setTypeForm: (req, res) => {
    const params = req.body;
    executeSetTypeForm(params, res);
  },
  setTypeFormOwner: (req, res) => {
    const params = req.body;
    executeSetTypeFormOwner(params, res);
  },
  addTypeFormDocument: (req, res) => {
    const params = req.body;
    const paramsUrl = req.params;
    executeAddTypeFormDocument(params, res, paramsUrl);
  },
  setTypeFormReference: (req, res) => {
    const params = req.body;
    executeSetTypeFormReference(params, res);
  },
};

module.exports = ControllerTypeForm;