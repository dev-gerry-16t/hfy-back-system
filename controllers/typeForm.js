const sql = require("mssql");

const executeGetTypeForm = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetTypeForm", (err, result) => {
      console.log("err, result", err, result);
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

const executeSetTypeForm = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
    idTypeForm,
    givenName,
    lastName,
    mothersMaidenName,
    phoneNumber,
    emailAddress,
    taxId,
    citizenId,
    hasCar,
    carriagePlate,
    street,
    suite,
    streetNumber,
    idZipCode,
    neighborhood,
    isOwn,
    currentTimeRange,
    currentTime,
    jobPosition,
    economicDependents,
    companyName,
    currentSalary,
    antiquityTimeRange,
    antiquity,
    bossName,
    bossEmailAddress,
    hasEndorsement,
    endorsementGivenName,
    endorsementLastName,
    endorsementMothersMaidenName,
    endorsementEmailAddress,
    endorsementPhoneNumber,
    collateralPropertyStreet,
    collateralPropertySuite,
    collateralPropertyStreetNumber,
    collateralPropertyIdZipCoode,
    collateralPropertyNeighborhood,
    documentNumber,
    documentSignedAt,
    notaryOfficeNumber,
    notaryName,
    signedAtPlace,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.input("p_nvcIdtTypeForm", sql.NVarChar, idTypeForm);
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
    request.input("p_nvcJobPosition", sql.NVarChar, jobPosition);
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

    request.execute("customerSch.USPsetTypeForm", (err, result) => {
      console.log("err, result", err, result);
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
  setTypeForm: (req, res) => {
    const params = req.body;
    executeSetTypeForm(params, res);
  },
};

module.exports = ControllerTypeForm;
