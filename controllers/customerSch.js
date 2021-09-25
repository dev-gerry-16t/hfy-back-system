const sql = require("mssql");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");
const executeMailTo = require("../actions/sendInformationUser");

const executeGetCustomerTimeLine = async (params, res) => {
  const {
    idCustomer,
    idProperty = null,
    idApartment = null,
    idSystemUser,
    idLoginHistory,
  } = params;
  const storeProcedure = "customerSch.USPgetCustomerTimeLine";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetCustomerData = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetCustomerData";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeUpdateCustomerAccount = async (params, res, url) => {
  const {
    givenName = null,
    lastName = null,
    mothersMaidenName = null,
    dateOfBirth = null,
    taxId = null,
    citizenId = null,
    idMaritalStatus = null,
    idCountryNationality = null,
    idType = null,
    idTypeNumber = null,
    placeOfIssue = null,
    enterpriseIdCommercialSocietyType = null,
    enterprisePublicWrtitingNo = null,
    enterprisePublicBookNo = null,
    enterpriseNotaryName = null,
    enterpriseNotaryOfficeNo = null,
    enterpriseSignedAtPlace = null,
    enterpriseIdStatePublicProperty = null,
    enterpriseCommercialInvoice = null,
    legalRepGivenName = null,
    legalRepLastName = null,
    legalRepMothersMaidenName = null,
    legalRepPublicWritingNo = null,
    legalRepPublicBookNo = null,
    legalRepNotaryName = null,
    legalRepNotaryOfficeNo = null,
    legalRepSignedAtPlace = null,
    legalRepIdType = null,
    legalRepIdTypeNumber = null,
    legalRepDateOfBirth = null,
    isDataConfirmed = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPupdateCustomerAccount";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_nvcGivenName", sql.NVarChar, givenName)
        .input("p_nvcLastName", sql.NVarChar, lastName)
        .input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName)
        .input("p_datDateOfBirth", sql.Date, dateOfBirth)
        .input("p_nvcTaxId", sql.NVarChar, taxId)
        .input("p_nvcCitizenId", sql.NVarChar, citizenId)
        .input("p_intIdMaritalStatus", sql.Int, idMaritalStatus)
        .input("p_intIdCountryNationality", sql.Int, idCountryNationality)
        .input("p_intIdType", sql.Int, idType)
        .input("p_nvcIdTypeNumber", sql.NVarChar, idTypeNumber)
        .input("p_nvcPlaceOfIssue", sql.NVarChar, placeOfIssue)
        .input(
          "p_intEnterpriseIdCommercialSocietyType",
          sql.Int,
          enterpriseIdCommercialSocietyType
        )
        .input(
          "p_nvcEnterprisePublicWrtitingNo",
          sql.NVarChar,
          enterprisePublicWrtitingNo
        )
        .input(
          "p_nvcEnterprisePublicBookNo",
          sql.NVarChar,
          enterprisePublicBookNo
        )
        .input("p_nvcEnterpriseNotaryName", sql.NVarChar, enterpriseNotaryName)
        .input(
          "p_nvcEnterpriseNotaryOfficeNo",
          sql.NVarChar,
          enterpriseNotaryOfficeNo
        )
        .input(
          "p_nvcEnterpriseSignedAtPlace",
          sql.NVarChar,
          enterpriseSignedAtPlace
        )
        .input(
          "p_intEnterpriseIdStatePublicProperty",
          sql.Int,
          enterpriseIdStatePublicProperty
        )
        .input(
          "p_nvcEnterpriseCommercialInvoice",
          sql.NVarChar,
          enterpriseCommercialInvoice
        )
        .input("p_nvcLegalRepGivenName", sql.NVarChar, legalRepGivenName)
        .input("p_nvcLegalRepLastName", sql.NVarChar, legalRepLastName)
        .input(
          "p_nvcLegalRepMothersMaidenName",
          sql.NVarChar,
          legalRepMothersMaidenName
        )
        .input(
          "p_nvcLegalRepPublicWritingNo",
          sql.NVarChar,
          legalRepPublicWritingNo
        )
        .input("p_nvcLegalRepPublicBookNo", sql.NVarChar, legalRepPublicBookNo)
        .input("p_nvcLegalRepNotaryName", sql.NVarChar, legalRepNotaryName)
        .input(
          "p_nvcLegalRepNotaryOfficeNo",
          sql.NVarChar,
          legalRepNotaryOfficeNo
        )
        .input(
          "p_nvcLegalRepSignedAtPlace",
          sql.NVarChar,
          legalRepSignedAtPlace
        )
        .input("p_intLegalRepIdType", sql.Int, legalRepIdType)
        .input("p_nvcLegalRepIdTypeNumber", sql.NVarChar, legalRepIdTypeNumber)
        .input("p_datLegalRepDateOfBirth", sql.Date, legalRepDateOfBirth)
        .input("p_bitIsDataConfirmed", sql.Bit, isDataConfirmed)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetCustomerAddress = async (params, res, url) => {
  const {
    isOwn = null,
    lessorFullName = null,
    lessorPhoneNumber = null,
    currentTimeRange = null,
    currentTime = null,
    currentRent = null,
    street = null,
    streetNumber = null,
    suite = null,
    idZipCode = null,
    neighborhood = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPsetCustomerAddress";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_bitIsOwn", sql.Bit, isOwn)
        .input("p_nvcLessorFullName", sql.NVarChar, lessorFullName)
        .input("p_nvcLessorPhoneNumber", sql.NVarChar, lessorPhoneNumber)
        .input("p_chrCurrentTimeRange", sql.Char, currentTimeRange)
        .input("p_intCurrentTime", sql.Int, currentTime)
        .input("p_decCurrentRent", sql.Decimal(12, 2), currentRent)
        .input("p_nvcStreet", sql.NVarChar, street)
        .input("p_nvcStreetNumber", sql.NVarChar, streetNumber)
        .input("p_nvcSuite", sql.NVarChar, suite)
        .input("p_intIdZipCode", sql.Int, idZipCode)
        .input("p_nvcNeighborhood", sql.NVarChar, neighborhood)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetCustomerBankingAccount = async (params, res, url) => {
  const {
    idBank = null,
    bankBranch = null,
    accountHolder = null,
    accountNumber = null,
    clabeNumber = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPsetCustomerBankingAccount";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdBank", sql.NVarChar, idBank)
        .input("p_nvcBankBranch", sql.NVarChar, bankBranch)
        .input("p_nvcAccountHolder", sql.NVarChar, accountHolder)
        .input("p_nvcAccountNumber", sql.NVarChar, accountNumber)
        .input("p_nvcClabeNumber", sql.NVarChar, clabeNumber)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetCustomerWorkingInfo = async (params, res, url) => {
  const {
    idOccupationActivity = null,
    economicDependents = null,
    companyName = null,
    currentSalary = null,
    antiquityTimeRange = null,
    antiquity = null,
    bossName = null,
    bossEmailAddress = null,
    bossPhoneNumber = null,
    otherIncomes = null,
    otherIncomesDescription = null,
    hasCar = null,
    carriagePlate = null,
    nIV = null,
    isCCAccepted = null,
    cCDigitalSignature = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPsetCustomerWorkingInfo";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_intIdOccupationActivity", sql.Int, idOccupationActivity)
        .input("p_intEconomicDependents", sql.Int, economicDependents)
        .input("p_nvcCompanyName", sql.NVarChar, companyName)
        .input("p_decCurrentSalary", sql.Decimal(16, 2), currentSalary)
        .input("p_chrAntiquityTimeRange", sql.Char, antiquityTimeRange)
        .input("p_intAntiquity", sql.Int, antiquity)
        .input("p_nvcBossName", sql.NVarChar, bossName)
        .input("p_nvcBossEmailAddress", sql.NVarChar, bossEmailAddress)
        .input("p_nvcBossPhoneNumber", sql.NVarChar, bossPhoneNumber)
        .input("p_decOtherIncomes", sql.Decimal(19, 2), otherIncomes)
        .input(
          "p_nvcOtherIncomesDescription",
          sql.NVarChar,
          otherIncomesDescription
        )
        .input("p_bitHasCar", sql.Bit, hasCar)
        .input("p_nvcCarriagePlate", sql.NVarChar, carriagePlate)
        .input("p_nvcNIV", sql.NVarChar, nIV)
        .input("p_bitIsCCAccepted", sql.Bit, isCCAccepted)
        .input("p_vchCCDigitalSignature", sql.VarChar, cCDigitalSignature)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeAddCustomerDocument = async (params, res, url) => {
  const {
    idDocument = null,
    type = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPaddCustomerDocument";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdDocument", sql.NVarChar, idDocument)
        .input("p_intType", sql.Int, type)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetCustomerEndorsement = async (params, res, url) => {
  const {
    hasEndorsement = null,
    endorsementGivenName = null,
    endorsementLastName = null,
    endorsementMothersMaidenName = null,
    idEndorsementNationality = null,
    endorsementTaxId = null,
    endorsementCitizenId = null,
    idEndorsementType = null,
    idEndorsementTypeNumber = null,
    endorsementPlaceOfIssue = null,
    endorsementEmailAddress = null,
    endorsementPhoneNumber = null,
    idEndorsementMaritalStatus = null,
    idEndorsementMaritalRegime = null,
    hasAssessment = null,
    assessmentInvoice = null,
    assessmentTicket = null,
    assessmentDate = null,
    assessmentIssuedBy = null,
    endorsementAssessment = null,
    endorsementStreet = null,
    endorsementSuite = null,
    endorsementStreetNumber = null,
    endorsementIdZipCode = null,
    endorsementNeighborhood = null,
    collateralPropertyStreet = null,
    collateralPropertyStreetNumber = null,
    collateralPropertySuite = null,
    collateralPropertyIdZipCoode = null,
    collateralPropertyNeighborhood = null,
    publicPropertyRegistry = null,
    documentNumber = null,
    documentSignedAt = null,
    signedAtPlace = null,
    notaryOfficeNumber = null,
    notaryName = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPsetCustomerEndorsement";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_bitHasEndorsement", sql.Bit, hasEndorsement)
        .input("p_nvcEndorsementGivenName", sql.NVarChar, endorsementGivenName)
        .input("p_nvcEndorsementLastName", sql.NVarChar, endorsementLastName)
        .input(
          "p_nvcEndorsementMothersMaidenName",
          sql.NVarChar,
          endorsementMothersMaidenName
        )
        .input(
          "p_intIdEndorsementNationality",
          sql.Int,
          idEndorsementNationality
        )
        .input("p_nvcEndorsementTaxId", sql.NVarChar, endorsementTaxId)
        .input("p_nvcEndorsementCitizenId", sql.NVarChar, endorsementCitizenId)
        .input("p_intIdEndorsementType", sql.Int, idEndorsementType)
        .input(
          "p_nvcIdEndorsementTypeNumber",
          sql.NVarChar,
          idEndorsementTypeNumber
        )
        .input(
          "p_nvcEndorsementPlaceOfIssue",
          sql.NVarChar,
          endorsementPlaceOfIssue
        )
        .input(
          "p_nvcEndorsementEmailAddress",
          sql.NVarChar,
          endorsementEmailAddress
        )
        .input(
          "p_nvcEndorsementPhoneNumber",
          sql.NVarChar,
          endorsementPhoneNumber
        )
        .input(
          "p_intIdEndorsementMaritalStatus",
          sql.Int,
          idEndorsementMaritalStatus
        )
        .input(
          "p_intIdEndorsementMaritalRegime",
          sql.Int,
          idEndorsementMaritalRegime
        )
        .input("p_bitHasAssessment", sql.Bit, hasAssessment)
        .input("p_nvcAssessmentInvoice", sql.NVarChar, assessmentInvoice)
        .input("p_nvcAssessmentTicket", sql.NVarChar, assessmentTicket)
        .input("p_datAssessmentDate", sql.Date, assessmentDate)
        .input("p_nvcAssessmentIssuedBy", sql.NVarChar, assessmentIssuedBy)
        .input(
          "p_decEndorsementAssessment",
          sql.Decimal(19, 2),
          endorsementAssessment
        )
        .input("p_nvcEndorsementStreet", sql.NVarChar, endorsementStreet)
        .input("p_nvcEndorsementSuite", sql.NVarChar, endorsementSuite)
        .input(
          "p_nvcEndorsementStreetNumber",
          sql.NVarChar,
          endorsementStreetNumber
        )
        .input("p_intEndorsementIdZipCode", sql.Int, endorsementIdZipCode)
        .input(
          "p_nvcEndorsementNeighborhood",
          sql.NVarChar,
          endorsementNeighborhood
        )
        .input(
          "p_nvcCollateralPropertyStreet",
          sql.NVarChar,
          collateralPropertyStreet
        )
        .input(
          "p_nvcCollateralPropertyStreetNumber",
          sql.NVarChar,
          collateralPropertyStreetNumber
        )
        .input(
          "p_nvcCollateralPropertySuite",
          sql.NVarChar,
          collateralPropertySuite
        )
        .input(
          "p_intCollateralPropertyIdZipCoode",
          sql.Int,
          collateralPropertyIdZipCoode
        )
        .input(
          "p_nvcCollateralPropertyNeighborhood",
          sql.NVarChar,
          collateralPropertyNeighborhood
        )
        .input(
          "p_nvcPublicPropertyRegistry",
          sql.NVarChar,
          publicPropertyRegistry
        )
        .input("p_nvcDocumentNumber", sql.NVarChar, documentNumber)
        .input("p_datDocumentSignedAt", sql.Date, documentSignedAt)
        .input("p_nvcSignedAtPlace", sql.NVarChar, signedAtPlace)
        .input("p_nvcNotaryOfficeNumber", sql.NVarChar, notaryOfficeNumber)
        .input("p_nvcNotaryName", sql.NVarChar, notaryName)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetCustomerEmailAddress = async (params, res, url) => {
  const {
    idEmailAddress = null,
    emailAddress = null,
    code = null,
    requiresVerificationCode = null,
    isMain = null,
    isActive = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPsetCustomerEmailAddress";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdEmailAddress", sql.NVarChar, idEmailAddress)
        .input("p_nvcEmailAddress", sql.NVarChar, emailAddress)
        .input("p_nvcCode", sql.NVarChar, code)
        .input(
          "p_bitRequiresVerificationCode",
          sql.Bit,
          requiresVerificationCode
        )
        .input("p_bitIsMain", sql.Bit, isMain)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        resultRecordset.forEach((element) => {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        });
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetCustomerPhoneNumber = async (params, res, url) => {
  const {
    idPhoneNumber = null,
    idPhoneType = null,
    idCounry = null,
    phoneNumber = null,
    code = null,
    requiresVerificationCode = null,
    isMain = null,
    isActive = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPsetCustomerPhoneNumber";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdPhoneNumber", sql.NVarChar, idPhoneNumber)
        .input("p_intIdPhoneType", sql.Int, idPhoneType)
        .input("p_intIdCounry", sql.Int, idCounry)
        .input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber)
        .input("p_nvcCode", sql.NVarChar, code)
        .input(
          "p_bitRequiresVerificationCode",
          sql.Bit,
          requiresVerificationCode
        )
        .input("p_bitIsMain", sql.Bit, isMain)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        executeSlackLogCatchBackend({
          storeProcedure,
          error: resultRecordsetObject.errorMessage,
        });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeValidateCustomerPropertiesInTab = async (params, res) => {
  const {
    idCustomer,
    identifier,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPvalidateCustomerPropertiesInTab";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(identifier) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_intIdentifier", sql.Int, identifier)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetCustomerDocument = async (params, res) => {
  const {
    idCustomer,
    identifier,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "hmfUser.USPgetCustomerDocument";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(identifier) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_intIdentifier", sql.Int, identifier)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetCustomerTabById = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetCustomerTabById";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordsets;
      res.status(200).send({
        response: resultRecordset,
      });
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const ControllerCustomerSch = {
  getCustomerTimeLine: (req, res) => {
    const params = req.body;
    executeGetCustomerTimeLine(params, res);
  },
  getCustomerData: (req, res) => {
    const params = req.body;
    executeGetCustomerData(params, res);
  },
  updateCustomerAccount: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeUpdateCustomerAccount(params, res, url);
  },
  setCustomerAddress: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeSetCustomerAddress(params, res, url);
  },
  setCustomerBankingAccount: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeSetCustomerBankingAccount(params, res, url);
  },
  setCustomerWorkingInfo: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeSetCustomerWorkingInfo(params, res, url);
  },
  addCustomerDocument: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeAddCustomerDocument(params, res, url);
  },
  setCustomerEndorsement: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeSetCustomerEndorsement(params, res, url);
  },
  setCustomerEmailAddress: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeSetCustomerEmailAddress(params, res, url);
  },
  setCustomerPhoneNumber: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeSetCustomerPhoneNumber(params, res, url);
  },
  validateCustomerPropertiesInTab: (req, res) => {
    const params = req.body;
    executeValidateCustomerPropertiesInTab(params, res);
  },
  getCustomerDocument: (req, res) => {
    const params = req.body;
    executeGetCustomerDocument(params, res);
  },
  getCustomerTabById: (req, res) => {
    const params = req.body;
    executeGetCustomerTabById(params, res);
  },
};

module.exports = ControllerCustomerSch;
