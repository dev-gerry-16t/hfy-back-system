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
const {
  executeGetTokenMlUser,
  executeRefreshTokenMlUser,
} = require("../actions/getTokenMlUser");
const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.SECRET_ACCESS_KEY,
});

const parseEmptyInt = (param) => {
  let dataIn = param;
  if (isString(param) === true && isEmpty(param) === true) {
    dataIn = -1;
  }
  return dataIn;
};

const executeSecondSetUserConfig = async (params) => {
  const {
    token = null,
    refreshToken = null,
    tokenType = null,
    expires = null,
    userId = null,
    codeId,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "mlSch.USPsetUserConfig";
  try {
    const pool = await sql.connect();
    await pool
      .request()
      .input("p_nvcToken", sql.NVarChar(sql.MAX), token)
      .input("p_nvcRefreshToken", sql.NVarChar(sql.MAX), refreshToken)
      .input("p_nvcTokenType", sql.NVarChar, tokenType)
      .input("p_intExpires", sql.Int, expires)
      .input("p_nvcUserId", sql.NVarChar, userId)
      .input("p_nvcCodeId", sql.NVarChar, codeId)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
  } catch (err) {
    throw err;
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
    isPublished = null,
    title = null,
    description = null,
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
        .input("p_bitIsPublished", sql.Bit, isPublished)
        .input("p_nvcTitle", sql.NVarChar, title)
        .input("p_nvcDescription", sql.NVarChar, description)
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
    ownerPhoneNumber = null,
    isPublished = null,
    sites = null,
    isActive = null,
    apartmentDocuments = [],
    title = null,
    description = null,
    isPropertyConfiguered = null,
    landAccess = null,
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
        .input("p_nvcOwnerPhoneNumber", sql.NVarChar, ownerPhoneNumber)
        .input("p_bitIsPublished", sql.Bit, isPublished)
        .input("p_nvcSites", sql.NVarChar, sites)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_nvcTitle", sql.NVarChar, title)
        .input("p_nvcDescription", sql.NVarChar, description)
        .input("p_bitIsPropertyConfiguered", sql.Bit, isPropertyConfiguered)
        .input("p_intIdLandAccess", sql.Int, landAccess)
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

const executeUpdatePropertyAddress = async (params, res, url) => {
  const {
    idApartment,
    street = null,
    streetNumber = null,
    suite = null,
    idZipCode = null,
    neighborhood = null,
    isExactLocation = null,
    jsonCoordinates = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPupdatePropertyAddress";
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
        .input("p_nvcStreet", sql.NVarChar, street)
        .input("p_nvcStreetNumber", sql.NVarChar, streetNumber)
        .input("p_nvcSuite", sql.NVarChar, suite)
        .input("p_intIdZipCode", sql.Int, idZipCode)
        .input("p_nvcNeighborhood", sql.NVarChar, neighborhood)
        .input("p_bitIsExactLocation", sql.Bit, isExactLocation)
        .input("p_nvcJsonCoordinates", sql.NVarChar, jsonCoordinates)
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

const executeUpdatePropertyCharAndAmen = async (params, res, url) => {
  const {
    idApartment,
    propertyAmenities = null,
    propertyGeneralCharacteristics = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPupdatePropertyCharAndAmen";
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

const executeSetUserConfig = async (params, res, url) => {
  const {
    token = null,
    refreshToken = null,
    tokenType = null,
    expires = null,
    userId = null,
    codeId,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idSystemUser } = url;
  const storeProcedure = "mlSch.USPsetUserConfig";
  try {
    if (
      isNil(idSystemUser) === true ||
      isNil(codeId) === true ||
      isNil(idLoginHistory) === true ||
      isNil(offset) === true
    ) {
      res.status(400).send({
        response: {
          message: "Error en los parámetros de entrada",
        },
      });
    } else {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_nvcToken", sql.NVarChar(sql.MAX), token)
        .input("p_nvcRefreshToken", sql.NVarChar(sql.MAX), refreshToken)
        .input("p_nvcTokenType", sql.NVarChar, tokenType)
        .input("p_intExpires", sql.Int, expires)
        .input("p_nvcUserId", sql.NVarChar, userId)
        .input("p_nvcCodeId", sql.NVarChar, codeId)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      if (resultRecordsetObject.stateCode !== 200) {
        res.status(resultRecordsetObject.stateCode).send({
          response: { message: resultRecordsetObject.message },
        });
      } else {
        const {
          canGenerateToken,
          canRefreshToken,
          appId,
          clientSecret,
          codeId,
          redirectUrl,
          refreshToken,
        } = resultRecordsetObject;
        if (canGenerateToken === true) {
          const responseToken = await executeGetTokenMlUser({
            appId,
            clientSecret,
            codeId,
            redirectUrl,
          });
          const {
            access_token,
            token_type,
            expires_in,
            user_id,
            refresh_token,
          } = responseToken;
          await executeSecondSetUserConfig({
            token: access_token,
            refreshToken: refresh_token,
            tokenType: token_type,
            expires: expires_in,
            userId: user_id,
            codeId,
            idSystemUser,
            idLoginHistory,
            offset,
          });
        }
        if (canRefreshToken === true) {
          const responseRefreshToken = await executeRefreshTokenMlUser({
            appId,
            refreshToken,
            clientSecret,
          });
          const {
            access_token,
            token_type,
            expires_in,
            user_id,
            refresh_token,
          } = responseRefreshToken;
          await executeSecondSetUserConfig({
            token: access_token,
            refreshToken: refresh_token,
            tokenType: token_type,
            expires: expires_in,
            userId: user_id,
            codeId,
            idSystemUser,
            idLoginHistory,
            offset,
          });
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

const ControllerProperties = {
  setUserConfig: (req, res) => {
    const params = req.body;
    const url = req.params; //idSystemUser
    executeSetUserConfig(params, res, url);
  },
  addPropertyV2: (req, res) => {
    const params = req.body;
    const url = req.params; //idCustomer
    executeAddPropertyV2(params, res, url);
  },
  updatePropertyAddress: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeUpdatePropertyAddress(params, res, url);
  },
  updatePropertyCharAndAmen: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeUpdatePropertyCharAndAmen(params, res, url);
  },
  updateProperty: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeUpdateProperty(params, res, url);
  },
  getPropertyById: (req, res) => {
    const params = req.body;
    executeGetPropertyById(params, res);
  },
};

module.exports = ControllerProperties;
