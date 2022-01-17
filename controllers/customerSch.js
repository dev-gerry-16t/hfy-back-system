const sql = require("mssql");
const AWS = require("aws-sdk");
const Docxtemplater = require("docxtemplater");
const ImageModule = require("docxtemplater-image-module");
const PizZip = require("pizzip");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const isString = require("lodash/isString");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");
const executeMailTo = require("../actions/sendInformationUser");
const replaceConditionsDocx = require("../actions/conditions");
const executeSendSmsToUser = require("../actions/sendSmsToUser");
const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const parseDateOfBorth = (date) => {
  let month = "";
  let year = "";
  let day = "";
  if (isNil(date) === false) {
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getUTCDate();
  }
  return { year, month, day };
};

const parseEmptyInt = (param) => {
  let dataIn = param;
  if (isString(param) === true && isEmpty(param) === true) {
    dataIn = -1;
  }
  return dataIn;
};

const base64DataURLToArrayBuffer = (dataURL) => {
  const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
  if (!base64Regex.test(dataURL)) {
    return false;
  }
  const stringBase64 = dataURL.replace(base64Regex, "");
  let binaryString;
  if (typeof window !== "undefined") {
    binaryString = window.atob(stringBase64);
  } else {
    binaryString = Buffer.from(stringBase64, "base64").toString("binary");
  }
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
};

const imageOpts = {
  getImage(tag) {
    return base64DataURLToArrayBuffer(tag);
  },
  getSize() {
    return [180, 60];
  },
};

const executeGetCustomerTimeLine = async (params, res) => {
  const {
    idCustomer = null,
    idProperty = null,
    idApartment = null,
    idSystemUser,
    idLoginHistory,
    offset = null,
  } = params;
  const storeProcedure = "customerSch.USPgetCustomerTimeLine";
  try {
    if (isNil(idSystemUser) === true || isNil(idLoginHistory) === true) {
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
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
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
      body: params,
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
    boundSolidarityGivenName = null,
    boundSolidarityEmailAddress = null,
    hasBoundSolidarity = null,
    sendReminderBoundSolidarity = null,
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
        .input(
          "p_nvcBoundSolidarityGivenName",
          sql.NVarChar,
          boundSolidarityGivenName
        )
        .input(
          "p_nvcBoundSolidarityEmailAddress",
          sql.NVarChar,
          boundSolidarityEmailAddress
        )
        .input("p_bitHasBoundSolidarity", sql.Bit, hasBoundSolidarity)
        .input(
          "p_bitSendReminderBoundSolidarity",
          sql.Bit,
          sendReminderBoundSolidarity
        )
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetCustomerAddress = async (params, res, url) => {
  const {
    isOwn = null,
    idPropertyState = null,
    qtyDescription = null,
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
        .input("p_intIdPropertyState", sql.Int, idPropertyState)
        .input("p_decQtyDescription", sql.Decimal(19, 2), qtyDescription)
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
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
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
    password = null,
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
        .input("p_nvcPassword", sql.NVarChar, password)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
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
    hasOtherIncomes = null,
    hasCar = null,
    carriagePlate = null,
    nIV = null,
    isCCAccepted = null,
    cCDigitalSignature = null,
    childrenNo = null,
    hasAdditionalIncomes = null,
    additionalIncomes = null,
    idIncomePeriod = null,
    idIncomeWay = null,
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
        .input("p_intChildrenNo", sql.Int, childrenNo)
        .input("p_nvcCompanyName", sql.NVarChar, companyName)
        .input("p_decCurrentSalary", sql.Decimal(16, 2), currentSalary)
        .input("p_chrAntiquityTimeRange", sql.Char, antiquityTimeRange)
        .input("p_intAntiquity", sql.Int, antiquity)
        .input("p_nvcBossName", sql.NVarChar, bossName)
        .input("p_nvcBossEmailAddress", sql.NVarChar, bossEmailAddress)
        .input("p_nvcBossPhoneNumber", sql.NVarChar, bossPhoneNumber)
        .input("p_decOtherIncomes", sql.Decimal(19, 2), otherIncomes)
        .input("p_bitHasOtherIncomes", sql.Bit, hasOtherIncomes)
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
        .input("p_bitHasAdditionalIncomes", sql.Bit, hasAdditionalIncomes)
        .input(
          "p_decHasAdditionalIncomes",
          sql.Decimal(19, 2),
          additionalIncomes
        )
        .input("p_intIdIncomePeriod", sql.Int, idIncomePeriod)
        .input("p_intIdIncomeWay", sql.Int, idIncomeWay)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetPersonalReference = async (params, res, url) => {
  const {
    idPersonalReference = null,
    idCustomerTenant = null,
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
    idContract = null,
    idSystemUser,
    idLoginHistory,
    offset = process.env.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPsetPersonalReference";
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
        .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
        .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
        .input("p_nvcIdPersonalReference", sql.NVarChar, idPersonalReference)
        .input("p_nvcGivenName", sql.NVarChar, givenName)
        .input("p_nvcLastName", sql.NVarChar, lastName)
        .input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName)
        .input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber)
        .input("p_nvcEmailAddress", sql.NVarChar, emailAddress)
        .input("p_nvcStreet", sql.NVarChar, street)
        .input("p_nvcSuite", sql.NVarChar, suite)
        .input("p_nvcStreetNumber", sql.NVarChar, streetNumber)
        .input("p_intIdZipCode", sql.Int, idZipCode)
        .input("p_nvcNeighborhood", sql.NVarChar, neighborhood)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .input("p_nvcIdContract", sql.NVarChar, idContract)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeAddCustomerDocument = async (params, res, url) => {
  const {
    idDocument,
    type,
    idSystemUser,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
    idVerificationProcess = null,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPaddCustomerDocument";
  try {
    if (
      isNil(idCustomer) === true ||
      isNil(type) === true ||
      isNil(idDocument) === true ||
      isNil(idSystemUser) === true ||
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
        .input(
          "p_uidIdVerificationProcess",
          sql.NVarChar,
          idVerificationProcess
        )
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
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
    collateralPropertyIdZipCode = null,
    collateralPropertyNeighborhood = null,
    publicPropertyRegistry = null,
    documentNumber = null,
    documentSignedAt = null,
    signedAtPlace = null,
    notaryOfficeNumber = null,
    notaryName = null,
    idSystemUser,
    idLoginHistory,
    isCollPropSame,
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
        .input("p_bitIsCollPropSame", sql.Bit, isCollPropSame)
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
          "p_intCollateralPropertyIdZipCode",
          sql.Int,
          collateralPropertyIdZipCode
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
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
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
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
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
      body: params,
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
      const resultRecordset = result.recordset;
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendSMS === true) {
            await executeSendSmsToUser({
              ...element,
            });
          }
        }
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeValidateCustomerPropertiesInTab = async (params, res) => {
  const {
    idCustomer,
    identifier = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPvalidateCustomerPropertiesInTab";
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
      body: params,
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
    idIncomePeriod = null,
    idIncomeWay = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetCustomerDocument";
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
        .input("p_intIdentifier", sql.Int, identifier)
        .input("p_intIdIncomePeriod", sql.Int, idIncomePeriod)
        .input("p_intIdIncomeWay", sql.Int, idIncomeWay)
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
      body: params,
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeValidateIdentity = async (params, res, url) => {
  const {
    idVerificationIdentityStatus,
    idRejectionReason = null,
    rejectionReason = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idVerificationIdentity } = url;
  const storeProcedure = "customerSch.USPvalidateIdentity";
  try {
    if (
      isNil(idVerificationIdentity) === true ||
      isNil(idVerificationIdentityStatus) === true ||
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
        .input(
          "p_uidIdVerificationIdentity",
          sql.NVarChar,
          idVerificationIdentity
        )
        .input(
          "p_intIdVerificationIdentityStatus",
          sql.Int,
          idVerificationIdentityStatus
        )
        .input("p_intIdRejectionReason", sql.Int, idRejectionReason)
        .input("p_nvcRejectionReason", sql.NVarChar, rejectionReason)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetVerificationIdentityCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetVerificationIdentityCoincidences";
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(topIndex) === true ||
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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_intTopIndex", sql.Int, topIndex)
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetUserCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetUserCoincidences";
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(topIndex) === true ||
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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_intTopIndex", sql.Int, topIndex)
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetProspectCoincidences = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetProspectCoincidences";
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(topIndex) === true ||
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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_intTopIndex", sql.Int, topIndex)
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetVerificationIdentityById = async (params, res) => {
  const {
    idVerificationIdentity,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetVerificationIdentityById";
  try {
    if (
      isNil(idVerificationIdentity) === true ||
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
        .input(
          "p_uidIdVerificationIdentity",
          sql.NVarChar,
          idVerificationIdentity
        )
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetInvestigationProcessCoincidences = async (params, res) => {
  const { idSystemUser, idLoginHistory, topIndex, offset } = params;
  const storeProcedure = "customerSch.USPgetInvestigationProcessCoincidences";
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(topIndex) === true ||
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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_intTopIndex", sql.Int, topIndex)
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetInvestigationProcessById = async (params, res) => {
  const {
    idInvestigationProcess,
    idSystemUser,
    idLoginHistory,
    topIndex,
    offset,
  } = params;
  const storeProcedure = "customerSch.USPgetInvestigationProcessById";
  try {
    if (
      isNil(idInvestigationProcess) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(topIndex) === true ||
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
        .input(
          "p_uidIdInvestigationProcess",
          sql.NVarChar,
          idInvestigationProcess
        )
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_intTopIndex", sql.Int, topIndex)
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetCustomerDataByTab = async (params, res) => {
  const {
    idCustomer,
    idInvestigationProcess = null,
    identifier,
    idSystemUser,
    idLoginHistory,
    offset,
  } = params;
  const storeProcedure = "customerSch.USPgetCustomerDataByTab";
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
        .input(
          "p_uidIdInvestigationProcess",
          sql.NVarChar,
          idInvestigationProcess
        )
        .input("p_intIdentifier", sql.Int, identifier)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeUpdateInvestigationProcess = async (params, res, url) => {
  const {
    idCustomer,
    idInvestigationStatus = null,
    switchCustomer = null,
    score = null,
    isApproved = null,
    idRejectionReason = null,
    rejectionReason = null,
    paymentCapacity = null,
    policiesApproved = null,
    comment = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idInvestigationProcess } = url;
  const storeProcedure = "customerSch.USPupdateInvestigationProcess";
  try {
    if (
      isNil(idInvestigationProcess) === true ||
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
        .input(
          "p_uidIdInvestigationProcess",
          sql.NVarChar,
          idInvestigationProcess
        )
        .input("p_intIdInvestigationStatus", sql.Int, idInvestigationStatus)
        .input("p_bitSwitchCustomer", sql.Bit, switchCustomer)
        .input("p_decScore", sql.Decimal(5, 2), score)
        .input("p_bitIsApproved", sql.Bit, isApproved)
        .input("p_intIdRejectionReason", sql.Int, idRejectionReason)
        .input("p_nvcRejectionReason", sql.NVarChar, rejectionReason)
        .input("p_decPaymentCapacity", sql.Decimal(19), paymentCapacity)
        .input("p_nvcPoliciesApproved", sql.NVarChar, policiesApproved)
        .input("p_nvcComment", sql.NVarChar, comment)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetPropertyCoincidencesV2 = async (params, res) => {
  const {
    idSystemUser,
    jsonConditions = null,
    pagination = null,
    idLoginHistory,
    type = null,
    offset,
  } = params;
  const storeProcedure = "customerSch.USPgetPropertyCoincidencesV2";
  try {
    if (
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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_nvcJsonConditions", sql.NVarChar, jsonConditions)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_nvcPagination", sql.NVarChar, pagination)
        .input("p_intType", sql.Int, type)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeAddPropertyV2 = async (params, res, url) => {
  const {
    idOperationType = null,
    idPropertyType = null,
    idCommercialActivity = null,
    currentRent = null,
    idCurrency = null,
    priceBasedBy = null,
    totalBedrooms = null,
    totalBathrooms = null,
    totalHalfBathrooms = null,
    totalParkingSpots = null,
    totalSquareMetersBuilt = null,
    totalSquareMetersLand = null,
    totalFloors = null,
    floorDescription = null,
    maintenanceAmount = null,
    isFurnished = null,
    idCustomerOwner = null,
    ownerEmailAddress = null,
    ownerPhoneNumber = null,
    ownerGivenName = null,
    ownerLastName = null,
    street = null,
    streetNumber = null,
    suite = null,
    idZipCode = null,
    neighborhood = null,
    isExactLocation = null,
    jsonCoordinates = null,
    propertyAmenities = null,
    propertyGeneralCharacteristics = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idCustomer } = url;
  const storeProcedure = "customerSch.USPaddPropertyV2";
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
        .input("p_intIdOperationType", sql.Int, idOperationType)
        .input("p_intIdPropertyType", sql.Int, idPropertyType)
        .input("p_intIdCommercialActivity", sql.Int, idCommercialActivity)
        .input("p_decCurrentRent", sql.Decimal(19, 2), currentRent)
        .input("p_uidIdCurrency", sql.NVarChar, idCurrency)
        .input("p_tynPriceBasedBy", sql.TinyInt(3), priceBasedBy)
        .input("p_intTotalBedrooms", sql.Int, totalBedrooms)
        .input("p_intTotalBathrooms", sql.Int, totalBathrooms)
        .input("p_intTotalHalfBathrooms", sql.Int, totalHalfBathrooms)
        .input("p_intTotalParkingSpots", sql.Int, totalParkingSpots)
        .input(
          "p_decTotalSquareMetersBuilt",
          sql.Decimal(19, 2),
          parseEmptyInt(totalSquareMetersBuilt)
        )
        .input(
          "p_decTotalSquareMetersLand",
          sql.Decimal(19, 2),
          parseEmptyInt(totalSquareMetersLand)
        )
        .input("p_vchTotalFloors", sql.VarChar, totalFloors)
        .input("p_vchFloorDescription", sql.VarChar, floorDescription)
        .input("p_decMaintenanceAmount", sql.Decimal(19, 2), maintenanceAmount)
        .input("p_bitIsFurnished", sql.Bit, isFurnished)
        .input("p_uidIdCustomerOwner", sql.NVarChar, idCustomerOwner)
        .input("p_nvcOwnerEmailAddress", sql.NVarChar, ownerEmailAddress)
        .input("p_nvcOwnerPhoneNumber", sql.NVarChar, ownerPhoneNumber)
        .input("p_nvcOwnerGivenName", sql.NVarChar, ownerGivenName)
        .input("p_nvcOwnerLastName", sql.NVarChar, ownerLastName)
        .input("p_nvcStreet", sql.NVarChar, street)
        .input("p_nvcStreetNumber", sql.NVarChar, streetNumber)
        .input("p_nvcSuite", sql.NVarChar, suite)
        .input("p_intIdZipCode", sql.Int, idZipCode)
        .input("p_nvcNeighborhood", sql.NVarChar, neighborhood)
        .input("p_bitIsExactLocation", sql.Bit, isExactLocation)
        .input("p_nvcJsonCoordinates", sql.NVarChar, jsonCoordinates)
        .input("p_nvcPropertyAmenities", sql.NVarChar, propertyAmenities)
        .input(
          "p_nvcPropertyGeneralCharacteristics",
          sql.NVarChar,
          propertyGeneralCharacteristics
        )
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetPropertyDocument = async (params, res, url) => {
  const {
    jsonDocument,
    isActive,
    idApartment,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPsetPropertyDocument";
  try {
    if (
      isNil(idProperty) === true ||
      isNil(idApartment) === true ||
      isNil(jsonDocument) === true ||
      isNil(isActive) === true ||
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
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_nvcJsonDocument", sql.NVarChar, jsonDocument)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        if (resultRecordsetObject.canDeleteDocument === true) {
          const params1 = {
            Bucket: resultRecordsetObject.bucketSource,
            Key: resultRecordsetObject.idDocument,
          };
          await s3.deleteObject(params1).promise();
          const parseDocument = JSON.parse(jsonDocument);
          const findIsMain = parseDocument.find((fd) => {
            return fd.isMain === true;
          });
          if (isNil(findIsMain) === false && findIsMain.isMain === true) {
            const paramsThumb = {
              Bucket: resultRecordsetObject.bucketSource,
              Key: resultRecordsetObject.idDocument + "_thumb",
            };
            await s3.deleteObject(paramsThumb).promise();
          }
        }

        res.status(200).send({
          response: { message: resultRecordsetObject.message },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetPropertyById = async (params, res) => {
  const {
    idProperty = null,
    idApartment = null,
    identifier = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetPropertyById";
  try {
    if (isNil(offset) === true) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_vchIdentifier", sql.VarChar, identifier)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeUpdateProperty = async (params, res, url) => {
  const {
    idApartment,
    idOperationType = null,
    idPropertyType = null,
    idCommercialActivity = null,
    idPolicy = null,
    idPolicyPaymentMethod = null,
    idApplicationMethod = null,
    currentRent = null,
    idCurrency = null,
    priceBasedBy = null,
    totalBedrooms = null,
    totalBathrooms = null,
    totalHalfBathrooms = null,
    totalParkingSpots = null,
    totalSquareMetersBuilt = null,
    totalSquareMetersLand = null,
    totalFloors = null,
    floorDescription = null,
    maintenanceAmount = null,
    isFurnished = null,
    idCustomerOwner = null,
    ownerEmailAddress = null,
    ownerGivenName = null,
    ownerLastName = null,
    street = null,
    streetNumber = null,
    suite = null,
    idZipCode = null,
    neighborhood = null,
    isExactLocation = null,
    jsonCoordinates = null,
    propertyAmenities = null,
    propertyGeneralCharacteristics = null,
    isPublished = null,
    isActive = null,
    apartmentDocuments = [],
    title = null,
    description = null,
    isPropertyConfiguered = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPupdateProperty";
  try {
    if (
      isNil(idApartment) === true ||
      isNil(idProperty) === true ||
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
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_intIdOperationType", sql.Int, idOperationType)
        .input("p_intIdPropertyType", sql.Int, idPropertyType)
        .input("p_intIdCommercialActivity", sql.Int, idCommercialActivity)
        .input("p_uidIdPolicy", sql.NVarChar, idPolicy)
        .input("p_intIdPolicyPaymentMethod", sql.Int, idPolicyPaymentMethod)
        .input("p_intIdApplicationMethod", sql.Int, idApplicationMethod)
        .input("p_decCurrentRent", sql.Decimal(19, 2), currentRent)
        .input("p_uidIdCurrency", sql.NVarChar, idCurrency)
        .input("p_tynPriceBasedBy", sql.TinyInt(3), priceBasedBy)
        .input("p_intTotalBedrooms", sql.Int, totalBedrooms)
        .input("p_intTotalBathrooms", sql.Int, totalBathrooms)
        .input("p_intTotalHalfBathrooms", sql.Int, totalHalfBathrooms)
        .input("p_intTotalParkingSpots", sql.Int, totalParkingSpots)
        .input(
          "p_decTotalSquareMetersBuilt",
          sql.Decimal(19, 2),
          parseEmptyInt(totalSquareMetersBuilt)
        )
        .input(
          "p_decTotalSquareMetersLand",
          sql.Decimal(19, 2),
          parseEmptyInt(totalSquareMetersLand)
        )
        .input("p_vchTotalFloors", sql.VarChar, totalFloors)
        .input("p_vchFloorDescription", sql.VarChar, floorDescription)
        .input("p_decMaintenanceAmount", sql.Decimal(19, 2), maintenanceAmount)
        .input("p_bitIsFurnished", sql.Bit, isFurnished)
        .input("p_uidIdCustomerOwner", sql.NVarChar, idCustomerOwner)
        .input("p_nvcOwnerEmailAddress", sql.NVarChar, ownerEmailAddress)
        .input("p_nvcOwnerGivenName", sql.NVarChar, ownerGivenName)
        .input("p_nvcOwnerLastName", sql.NVarChar, ownerLastName)
        .input("p_nvcStreet", sql.NVarChar, street)
        .input("p_nvcStreetNumber", sql.NVarChar, streetNumber)
        .input("p_nvcSuite", sql.NVarChar, suite)
        .input("p_intIdZipCode", sql.Int, idZipCode)
        .input("p_nvcNeighborhood", sql.NVarChar, neighborhood)
        .input("p_bitIsExactLocation", sql.Bit, isExactLocation)
        .input("p_nvcJsonCoordinates", sql.NVarChar, jsonCoordinates)
        .input("p_nvcPropertyAmenities", sql.NVarChar, propertyAmenities)
        .input(
          "p_nvcPropertyGeneralCharacteristics",
          sql.NVarChar,
          propertyGeneralCharacteristics
        )
        .input("p_bitIsPublished", sql.Bit, isPublished)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_nvcTitle", sql.NVarChar, title)
        .input("p_nvcDescription", sql.NVarChar, description)
        .input("p_bitIsPropertyConfiguered", sql.Bit, isPropertyConfiguered)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        if (isActive === false && isEmpty(apartmentDocuments) === false) {
          for (const element of apartmentDocuments) {
            await s3
              .deleteObject({
                Bucket: element.bucketSource,
                Key: element.idDocument,
              })
              .promise();
            if (element.isMain === true) {
              await s3
                .deleteObject({
                  Bucket: element.bucketSource,
                  Key: element.idDocument + "_thumb",
                })
                .promise();
            }
          }
        }
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetPropertyAssociation = async (params, res, url) => {
  const {
    idPropertyParent = null,
    idApartmentParent = null,
    isAccepted,
    method = null,
    idApartment,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPsetPropertyAssociation";
  try {
    if (
      isNil(isAccepted) === true ||
      isNil(idProperty) === true ||
      isNil(idApartment) === true ||
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
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_uidIdPropertyParent", sql.NVarChar, idPropertyParent)
        .input("p_uidIdApartmentParent", sql.NVarChar, idApartmentParent)
        .input("p_bitIsAccepted", sql.Bit, isAccepted)
        .input("p_intMethod", sql.TinyInt, method)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetAdviserInProperty = async (params, res, url) => {
  const {
    idApartment,
    idCustomer = null,
    givenName,
    lastName = null,
    mothersMaidenName = null,
    emailAddress,
    commissionAmount = null,
    isActive = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPsetAdviserInProperty";
  try {
    if (
      isNil(givenName) === true ||
      isNil(emailAddress) === true ||
      isNil(idProperty) === true ||
      isNil(idApartment) === true ||
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
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_nvcGivenName", sql.NVarChar, givenName)
        .input("p_nvcLastName", sql.NVarChar, lastName)
        .input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName)
        .input("p_nvcEmailAddress", sql.NVarChar, emailAddress)
        .input("p_decCommissionAmount", sql.Decimal(19, 2), commissionAmount)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSendTenantInvitation = async (params, res, url) => {
  const {
    idCustomer = null,
    idSystemUser,
    idLoginHistory,
    givenName,
    emailAddress,
    offset = GLOBAL_CONSTANTS.OFFSET,
    lastName = null,
    mothersMaidenName = null,
  } = params;
  const { idApartment } = url;
  const storeProcedure = "customerSch.USPsendTenantInvitation";
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(givenName) === true ||
      isNil(emailAddress) === true ||
      isNil(offset) === true ||
      isNil(idApartment) === true
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
        .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
        .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_nvcIdApartment", sql.NVarChar, idApartment)
        .input("p_nvcGivenName", sql.NVarChar, givenName)
        .input("p_nvcEmailAddress", sql.NVarChar, emailAddress)
        .input("p_chrOffset", sql.Char, offset)
        .input("p_nvcLastName", sql.NVarChar, lastName)
        .input("p_nvcMothersMaidenName", sql.NVarChar, mothersMaidenName)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idInvitation: resultRecordsetObject.idInvitation,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetApplicant = async (params, res, url) => {
  const {
    idApartment,
    idCustomer = null,
    idInvitation = null,
    isAccepted = null,
    deleteInvitation = null,
    resendInvitation = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPsetApplicant";
  try {
    if (
      isNil(idProperty) === true ||
      isNil(idApartment) === true ||
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
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_uidIdCustomer", sql.NVarChar, idCustomer)
        .input("p_uidIdInvitation", sql.NVarChar, idInvitation)
        .input("p_bitIsAccepted", sql.Bit, isAccepted)
        .input("p_bitDeleteInvitation", sql.Bit, deleteInvitation)
        .input("p_bitResendInvitation", sql.Bit, resendInvitation)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeApplyToProperty = async (params, res, url) => {
  const {
    idApartment,
    identifier,
    isAccepted = null,
    isGivingUp = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPapplyToProperty";
  try {
    if (
      isNil(idProperty) === true ||
      isNil(idApartment) === true ||
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
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_vchIdentifier", sql.VarChar, identifier)
        .input("p_bitIsAccepted", sql.Bit, isAccepted)
        .input("p_bitIsGivingUp", sql.Bit, isGivingUp)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetFavoriteProperty = async (params, res, url) => {
  const {
    idApartment,
    identifier,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPsetFavoriteProperty";
  try {
    if (
      isNil(idProperty) === true ||
      isNil(identifier) === true ||
      isNil(idApartment) === true ||
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
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
        .input("p_vchIdentifier", sql.VarChar, identifier)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetContract = async (params, res, url) => {
  const {
    idCustomer = null,
    idCustomerTenant = null,
    idPolicy = null,
    digitalSignature = null,
    anex2 = null,
    startedAt = null,
    scheduleSignatureDate = null,
    collectionDays = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
    isFaceToFace = null,
  } = params;
  const { idContract } = url;
  const storeProcedure = "customerSch.USPsetContract";

  try {
    if (
      isNil(idContract) === true ||
      isNil(type) === true ||
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
        .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
        .input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant)
        .input("p_nvcIdContract", sql.NVarChar, idContract)
        .input("p_nvcIdPolicy", sql.NVarChar, idPolicy)
        .input("p_vchDigitalSignature", sql.VarChar, digitalSignature)
        .input("p_nvcAnex2", sql.NVarChar, anex2)
        .input("p_datStartedAt", sql.Date, startedAt)
        .input("p_intType", sql.Int, type)
        .input(
          "p_datScheduleSignatureDate",
          sql.DateTime,
          scheduleSignatureDate
        )
        .input("p_nvcCollectionDays", sql.NVarChar, collectionDays)
        .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .input("p_bitIsFaceToFace", sql.Bit, isFaceToFace)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idContract: resultRecordsetObject.idContract,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeAddDocumentv2 = async (params) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    documentName = null,
    extension = "docx",
    preview = null,
    thumbnail = null,
    idDocumentType,
    bucket = "",
  } = params;

  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdCustomer", sql.NVarChar, idCustomer)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_nvcDocumentName", sql.NVarChar, documentName)
      .input("p_nvcExtension", sql.NVarChar, extension)
      .input("p_nvcPreview", sql.NVarChar, preview)
      .input("p_nvcThumbnail", sql.NVarChar, thumbnail)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intIdDocumentType", sql.Int, idDocumentType)
      .execute("documentSch.USPaddDocument");
    const resultRecordset = result.recordset;
    return resultRecordset;
  } catch (err) {
    throw err;
  }
};

const executeAddContractDocumentV2 = async (params) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
    type,
    idDocument,
  } = params;
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcIdContract", sql.NVarChar, idContract)
      .input("p_nvcIdDocument", sql.NVarChar, idDocument)
      .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .input("p_intType", sql.Int, type)
      .execute("customerSch.USPaddContractDocument");
    const resultRecordset = result.recordset;
    if (resultRecordset[0].stateCode !== 200) {
      throw new Error(resultRecordset[0].message);
    }
    return result;
  } catch (err) {
    throw err;
  }
};

const executeGenerateDocument = async (params, res, url) => {
  const {
    idDocument,
    idPreviousDocument = null,
    idDocumentType,
    bucketSource,
    previousBucketSource = null,
    canGenerateDocument,
    type,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idContract } = url;
  const storeProcedure = "customerSch.USPgetDigitalContractProperties";

  try {
    if (
      isNil(idContract) === true ||
      isNil(idDocument) === true ||
      isNil(idDocumentType) === true ||
      isNil(bucketSource) === true ||
      isNil(type) === true ||
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true ||
      isNil(canGenerateDocument) === true
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
        .input("p_nvcIdCustomer", sql.NVarChar, null)
        .input("p_nvcIdCustomerTenant", sql.NVarChar, null)
        .input("p_nvcIdContract", sql.NVarChar, idContract)
        .input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .input("p_intType", sql.Int, type)
        .execute(storeProcedure);
      let resultRecordset = [];
      if (type === 4 || type === 5) {
        resultRecordset = result.recordsets[1];
      } else {
        resultRecordset = result.recordset;
      }

      if (canGenerateDocument === true) {
        const file = await s3
          .getObject({
            Bucket: bucketSource,
            Key: idDocument,
          })
          .promise();
        const buff = new Buffer.from(file.Body, "binary");
        let objectParams = {};
        if (type === 4 || type === 5) {
          objectParams = {
            payments: isNil(resultRecordset) === false ? resultRecordset : [],
          };
        } else {
          objectParams =
            isNil(resultRecordset[0]) === false ? resultRecordset[0] : {};
        }
        const dataAddDocument = await executeAddDocumentv2({
          idCustomer: null,
          idSystemUser,
          idLoginHistory,
          offset,
          documentName: null,
          extension: "docx",
          preview: null,
          thumbnail: null,
          idDocumentType,
        });
        const resultObjectAddDocument = dataAddDocument[0];
        if (resultObjectAddDocument.stateCode !== 200) {
          executeSlackLogCatchBackend({
            storeProcedure,
            error: resultObjectAddDocument.errorMessage,
          });
          res.status(resultObjectAddDocument.stateCode).send({
            response: { message: resultObjectAddDocument.message },
          });
        } else {
          const zip = new PizZip(buff);
          let doc;
          const imageModule = new ImageModule(imageOpts);
          doc = await new Docxtemplater(zip, {
            modules: [imageModule],
            parser: replaceConditionsDocx,
            nullGetter: () => {
              return "";
            },
          });
          await doc.setData(objectParams);
          await doc.render();
          const fileDocument = await doc
            .getZip()
            .generate({ type: "nodebuffer" });
          const newBucketSorce =
            isNil(resultObjectAddDocument) === false &&
            isNil(resultObjectAddDocument.bucketSource) === false
              ? resultObjectAddDocument.bucketSource.toLowerCase()
              : bucket.toLowerCase();
          const newIdDocument = resultObjectAddDocument.idDocument;
          const params2 = {
            Bucket: newBucketSorce,
            Key: newIdDocument,
            Body: fileDocument,
          };
          await s3.upload(params2).promise();
          await executeAddContractDocumentV2({
            idContract,
            idSystemUser,
            idLoginHistory,
            offset,
            type,
            idDocument: newIdDocument,
          });
          if (
            isNil(idPreviousDocument) === false &&
            isNil(previousBucketSource) === false
          ) {
            const params1 = {
              Bucket: previousBucketSource,
              Key: idPreviousDocument,
            };
            await s3.deleteObject(params1).promise();
          }
          res.status(200).send({
            response: {
              url: `/api/viewFilesDocx/${newIdDocument}/${newBucketSorce}`,
              idContract,
              newIdDocument,
              newBucketSorce,
              message: "Tu documento está listo para poder ser revisado",
            },
          });
        }
      } else {
        res.status(200).send({
          response: {
            url: `/api/viewFilesDocx/${idDocument}/${bucketSource}`,
            idContract,
            newIdDocument: idDocument,
            newBucketSorce: bucketSource,
            message: "Tu documento está listo para poder ser revisado",
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: JSON.stringify(err, null, 2),
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeDeactivateCustomerDocument = async (params, res, url) => {
  const {
    idCustomer,
    bucketSource,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idDocument } = url;
  const storeProcedure = "customerSch.USPdeactivateCustomerDocument";

  try {
    if (
      isNil(idCustomer) === true ||
      isNil(bucketSource) === true ||
      isNil(idDocument) === true ||
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
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        const params1 = {
          Bucket: bucketSource,
          Key: idDocument,
        };
        await s3.deleteObject(params1).promise();
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idContract: resultRecordsetObject.idContract,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetLocationFilter = async (params, res) => {
  const {
    value,
    type,
    idSystemUser = null,
    idLoginHistory = null,
    idOperationType = null,
  } = params;
  const storeProcedure = "catCustomerSch.USPgetLocationFilter";
  try {
    if (isNil(value) === true) {
      res.status(400).send({
        response: {
          message: "Error en los parametros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_nvcValue", sql.NVarChar, value)
        .input("p_intIdOperationType", sql.Int, idOperationType)
        .input("p_intType", sql.Int, type)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
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
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeProcessInvitation = async (params, res, url, ip) => {
  const {
    isAccepted = null,
    isReported = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idInvitation } = url;
  const storeProcedure = "customerSch.USPprocessInvitation";

  try {
    if (
      isNil(idInvitation) === true ||
      isNil(ip) === true ||
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
        .input("p_uidIdInvitation", sql.NVarChar, idInvitation)
        .input("p_bitIsAccepted", sql.Bit, isAccepted)
        .input("p_bitIsReported", sql.Bit, isReported)
        .input("p_nvcRequestedFromIP", sql.NVarChar, ip)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
            idInvitation: resultRecordsetObject.idInvitation,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeSetContractApprovement = async (params, res, url) => {
  const {
    idContract,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idSystemUser } = url;
  const storeProcedure = "customerSch.USPsetContractApprovement";

  try {
    if (
      isNil(idContract) === true ||
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
        .input("p_uidIdContract", sql.NVarChar, idContract)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        //executeSlackLogCatchBackend({
        // storeProcedure,
        //error: resultRecordsetObject.errorMessage,
        // });
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        for (const element of resultRecordset) {
          if (element.canSendEmail === true) {
            const configEmailServer = JSON.parse(element.jsonEmailServerConfig);
            await executeMailTo({
              ...element,
              ...configEmailServer,
            });
          }
        }
        res.status(200).send({
          response: {
            message: resultRecordsetObject.message,
          },
        });
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
    res.status(500).send({
      response: { message: "Error en el sistema" },
    });
  }
};

const executeGetCustomerDetailById = async (params, res) => {
  const {
    idCustomer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "customerSch.USPgetCustomerDetailById";
  try {
    if (isNil(offset) === true) {
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
      body: params,
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
  setPersonalReference: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeSetPersonalReference(params, res, url);
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
  validateIdentity: (req, res) => {
    const params = req.body;
    const url = req.params; //idVerificationIdentity
    executeValidateIdentity(params, res, url);
  },
  getVerificationIdentityCoincidences: (req, res) => {
    const params = req.body;
    executeGetVerificationIdentityCoincidences(params, res);
  },
  getVerificationIdentityById: (req, res) => {
    const params = req.body;
    executeGetVerificationIdentityById(params, res);
  },
  getInvestigationProcessCoincidences: (req, res) => {
    const params = req.body;
    executeGetInvestigationProcessCoincidences(params, res);
  },
  getUserCoincidences: (req, res) => {
    const params = req.body;
    executeGetUserCoincidences(params, res);
  },
  getProspectCoincidences: (req, res) => {
    const params = req.body;
    executeGetProspectCoincidences(params, res);
  },
  getInvestigationProcessById: (req, res) => {
    const params = req.body;
    executeGetInvestigationProcessById(params, res);
  },
  getCustomerDataByTab: (req, res) => {
    const params = req.body;
    executeGetCustomerDataByTab(params, res);
  },
  updateInvestigationProcess: (req, res) => {
    const params = req.body;
    const url = req.params; //idInvestigationProcess
    executeUpdateInvestigationProcess(params, res, url);
  },
  getPropertyCoincidencesV2: (req, res) => {
    const params = req.body;
    executeGetPropertyCoincidencesV2(params, res);
  },
  addPropertyV2: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeAddPropertyV2(params, res, url);
  },
  setPropertyDocument: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeSetPropertyDocument(params, res, url);
  },
  getPropertyById: (req, res) => {
    const params = req.body;
    executeGetPropertyById(params, res);
  },
  updateProperty: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeUpdateProperty(params, res, url);
  },
  setPropertyAssociation: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeSetPropertyAssociation(params, res, url);
  },
  setAdviserInProperty: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeSetAdviserInProperty(params, res, url);
  },
  sendTenantInvitation: (req, res) => {
    const params = req.body;
    const url = req.params; //idApartment
    executeSendTenantInvitation(params, res, url);
  },
  setApplicant: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeSetApplicant(params, res, url);
  },
  applyToProperty: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeApplyToProperty(params, res, url);
  },
  setFavoriteProperty: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeSetFavoriteProperty(params, res, url);
  },
  setContract: (req, res) => {
    const params = req.body;
    const url = req.params; //idContract
    executeSetContract(params, res, url);
  },
  generateDocument: (req, res) => {
    const params = req.body;
    const url = req.params; //idContract
    executeGenerateDocument(params, res, url);
  },
  deactivateCustomerDocument: (req, res) => {
    const params = req.body;
    const url = req.params; //idDocument
    executeDeactivateCustomerDocument(params, res, url);
  },
  getLocationFilter: (req, res) => {
    const params = req.body;
    executeGetLocationFilter(params, res);
  },
  processInvitation: (req, res) => {
    const params = req.body;
    const url = req.params; //idInvitation
    const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    let ipPublic = "";
    if (ip) {
      ipPublic = ip.split(",")[0];
    }
    executeProcessInvitation(params, res, url, ipPublic);
  },
  setContractApprovement: (req, res) => {
    const params = req.body;
    const url = req.params; //idSystemUser
    executeSetContractApprovement(params, res, url);
  },
  getCustomerDetailById: (req, res) => {
    const params = req.body;
    executeGetCustomerDetailById(params, res);
  },
};

module.exports = ControllerCustomerSch;
