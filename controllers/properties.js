const sql = require("mssql");
const AWS = require("aws-sdk");
const Stripe = require("stripe");
const Docxtemplater = require("docxtemplater");
// const ImageModule = require("docxtemplater-image-module");
const PizZip = require("pizzip");
const GLOBAL_CONSTANTS = require("../constants/constants");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const isString = require("lodash/isString");
const executeSlackLogCatchBackend = require("../actions/slackLogCatchBackend");
const smtpTransporter = require("../actions/smtpTransport");
const executeMailTo = require("../actions/sendInformationUser");
const replaceConditionsDocx = require("../actions/conditions");
const executeSendSmsToUser = require("../actions/sendSmsToUser");
const {
  executeGetTokenMlUser,
  executeRefreshTokenMlUser,
  executePublicToMLM,
  executeGetTokenMl,
  executeSetAnswerToML,
  executeGetPromotionPacks,
} = require("../actions/getTokenMlUser");
const { executeSetCustomer } = require("../actions/setCustomerAccount");
const stripe = new Stripe(GLOBAL_CONSTANTS.SECRET_KEY_STRIPE);
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

const executeSetClassified = async (params) => {
  const {
    id,
    category_id,
    status,
    permalink,
    date_created,
    last_updated,
    attributes,
    pictures,
    idProperty,
    idApartment,
    idSystemUser,
    idLoginHistory,
    offset,
  } = params;
  const jsonServiceResponse = JSON.stringify(params);
  const jsonAttributes =
    isEmpty(attributes) === false ? JSON.stringify(attributes) : "[]";
  const jsonPictures =
    isEmpty(pictures) === false ? JSON.stringify(pictures) : "[]";
  const storeProcedure = "mlSch.USPsetClassified";
  try {
    const pool = await sql.connect();
    await pool
      .request()
      .input("p_uidIdProperty", sql.NVarChar, idProperty)
      .input("p_uidIdApartment", sql.NVarChar, idApartment)
      .input("p_nvcId", sql.NVarChar, id)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, jsonServiceResponse)
      .input("p_nvcCategoryId", sql.NVarChar, category_id)
      .input("p_nvcStatus", sql.NVarChar, status)
      .input("p_nvcPermalink", sql.NVarChar, permalink)
      .input("p_datDateCreated", sql.DateTime, date_created)
      .input("p_datDateUpdated", sql.DateTime, last_updated)
      .input("p_nvcJsonAttributes", sql.NVarChar, jsonAttributes)
      .input("p_nvcJsonPictures", sql.NVarChar, jsonPictures)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
  }
};

const handlerPublishedMLM = async (params) => {
  const {
    idProperty,
    idApartment,
    isPublished,
    idSystemUser,
    idLoginHistory,
    offset,
  } = params;
  const storeProcedure = "mlSch.USPgetPropertyAttributes";
  try {
    const responsePackage = await executeGetPromotionPacks({
      idSystemUser,
      idLoginHistory,
      offset,
    });
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdProperty", sql.NVarChar, idProperty)
      .input(
        "p_nvcJsonPromotionPackageResponse",
        sql.NVarChar(sql.MAX),
        responsePackage
      )
      .input("p_uidIdApartment", sql.NVarChar, idApartment)
      .input("p_bitIsPublished", sql.Bit, isPublished)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
    const resultRecordsetObject =
      isNil(result.recordset) === false && isNil(result.recordset[0]) === false
        ? result.recordset[0]
        : {};
    const classified =
      isEmpty(resultRecordsetObject) === false &&
      isNil(resultRecordsetObject.classified) === false &&
      isEmpty(resultRecordsetObject.classified) === false
        ? JSON.parse(resultRecordsetObject.classified)
        : {};
    const pictures =
      isEmpty(resultRecordsetObject) === false &&
      isNil(resultRecordsetObject.pictures) === false &&
      isEmpty(resultRecordsetObject.pictures) === false
        ? JSON.parse(resultRecordsetObject.pictures)
        : [];
    const seller_contact =
      isEmpty(resultRecordsetObject) === false &&
      isNil(resultRecordsetObject.seller_contact) === false &&
      isEmpty(resultRecordsetObject.seller_contact) === false
        ? JSON.parse(resultRecordsetObject.seller_contact)
        : {};
    const location =
      isEmpty(resultRecordsetObject) === false &&
      isNil(resultRecordsetObject.location) === false &&
      isEmpty(resultRecordsetObject.location) === false
        ? JSON.parse(resultRecordsetObject.location)
        : {};
    const attributes =
      isEmpty(resultRecordsetObject) === false &&
      isNil(resultRecordsetObject.attributes) === false &&
      isEmpty(resultRecordsetObject.attributes) === false
        ? JSON.parse(resultRecordsetObject.attributes)
        : [];
    const token = await executeGetTokenMl({
      token: null,
      refreshToken: null,
      tokenType: null,
      expires: null,
      userId: null,
      codeId: null,
      idSystemUser,
      idLoginHistory,
      offset,
    });

    const responseML = await executePublicToMLM({
      ...resultRecordsetObject,
      classified,
      pictures,
      seller_contact,
      location,
      attributes,
      token,
      isPublished,
    });

    await executeSetClassified({
      idProperty,
      idApartment,
      idSystemUser,
      idLoginHistory,
      offset,
      ...responseML,
    });
    return {
      link:
        isNil(responseML) === false &&
        isEmpty(responseML.permalink) === false &&
        isNil(responseML.permalink) === false
          ? responseML.permalink
          : "",
    };
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: error,
      body: params,
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
    isPublished = null,
    title = null,
    description = null,
    idLandAccess = null,
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
        .input("p_intIdLandAccess", sql.Int, idLandAccess)
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
    sites = null,
    isActive = null,
    apartmentDocuments = [],
    title = null,
    description = null,
    isPropertyConfiguered = null,
    idLandAccess = null,
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
        .input("p_nvcSites", sql.NVarChar, sites)
        .input("p_bitIsActive", sql.Bit, isActive)
        .input("p_nvcTitle", sql.NVarChar, title)
        .input("p_nvcDescription", sql.NVarChar, description)
        .input("p_bitIsPropertyConfiguered", sql.Bit, isPropertyConfiguered)
        .input("p_intIdLandAccess", sql.Int, idLandAccess)
        .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
        .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordset = result.recordset;
      const resultRecordsetObject = result.recordset[0];
      let objectResult = [];
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
        if (isEmpty(resultRecordsetObject.sites) === false) {
          const getToPublicPlatform = JSON.parse(resultRecordsetObject.sites);
          for (const element of getToPublicPlatform) {
            if (element.idSite == "MLM") {
              const permalink = await handlerPublishedMLM({
                idApartment,
                idProperty,
                idSystemUser,
                idLoginHistory,
                offset,
                isPublished: element.isPublished,
              });
              objectResult.push({
                idSite: element.idSite,
                link:
                  isNil(permalink) === false && isNil(permalink.link) === false
                    ? permalink.link
                    : null,
              });
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
            piblicIn: objectResult,
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
        if (isEmpty(resultRecordsetObject.sites) === false) {
          const getToPublicPlatform = JSON.parse(resultRecordsetObject.sites);
          for (const element of getToPublicPlatform) {
            if (element.idSite == "MLM") {
              await handlerPublishedMLM({
                idApartment,
                idProperty,
                idSystemUser,
                idLoginHistory,
                offset,
                isPublished: element.isPublished,
              });
            }
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
        if (isEmpty(resultRecordsetObject.sites) === false) {
          const getToPublicPlatform = JSON.parse(resultRecordsetObject.sites);
          for (const element of getToPublicPlatform) {
            if (element.idSite == "MLM") {
              await handlerPublishedMLM({
                idApartment,
                idProperty,
                idSystemUser,
                idLoginHistory,
                offset,
                isPublished: element.isPublished,
              });
            }
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

const executeUpdatePropertyInApplicationMethod = async (params, res, url) => {
  const {
    idApartment,
    idPolicy = null,
    idPolicyPaymentMethod = null,
    idApplicationMethod = null,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idProperty } = url;
  const storeProcedure = "customerSch.USPupdatePropertyInApplicationMethod";
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
        .input("p_uidIdPolicy", sql.NVarChar, idPolicy)
        .input("p_intIdPolicyPaymentMethod", sql.Int, idPolicyPaymentMethod)
        .input("p_intIdApplicationMethod", sql.Int, idApplicationMethod)
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

const executeValidateClassified = async (params, res) => {
  const {
    idProperty = null,
    idApartment = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "mlSch.USPvalidateClassified";
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
      const responsePackage = await executeGetPromotionPacks({
        offset,
        idSystemUser,
        idLoginHistory,
      });
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input(
          "p_nvcJsonPromotionPackageResponse",
          sql.NVarChar(sql.MAX),
          responsePackage
        )
        .input("p_uidIdProperty", sql.NVarChar, idProperty)
        .input("p_uidIdApartment", sql.NVarChar, idApartment)
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

const executeGetSubscriptionConfig = async (params) => {
  const {
    idSubscriptionType,
    idMethod,
    isActive,
    idSystemUser,
    idLoginHistory,
    offset,
  } = params;
  const storeProcedure = "pymtGwSch.USPgetSubscriptionConfig";
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_intIdSubscriptionType", sql.Int, idSubscriptionType)
      .input("p_intIdMethod", sql.Int, idMethod)
      .input("p_bitIsActive", sql.Bit, isActive)
      .input("p_uidIdSystemUser", sql.NVarChar, idSystemUser)
      .input("p_uidIdLoginHistory", sql.NVarChar, idLoginHistory)
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
    const resultRecordsetObject =
      isEmpty(result.recordset) === false &&
      isNil(result.recordset[0]) === false &&
      isEmpty(result.recordset[0]) === false
        ? result.recordset[0]
        : {};
    if (isEmpty(resultRecordsetObject) === false) {
      const {
        customer_id,
        subscription_id,
        name,
        email,
        price_id,
        billing_cycle_anchor,
        proration_behavior,
        trial_end,
        metadata,
        collection_method,
        days_until_due,
      } = resultRecordsetObject;
      let customerId = customer_id;
      if (isNil(customer_id) === true) {
        const customer = await stripe.customers.create({
          name,
          email,
          metadata:
            isNil(metadata) === false && isEmpty(metadata) === false
              ? JSON.parse(metadata)
              : {},
        });
        await executeSetCustomer({
          id:
            isNil(customer) === false && isNil(customer.id) === false
              ? customer.id
              : null,
          created:
            isNil(customer) === false && isNil(customer.created) === false
              ? customer.created
              : null,
          jsonServiceResponse:
            isEmpty(customer) === false ? JSON.stringify(customer) : "{}",
          idSystemUser,
          idLoginHistory,
          offset,
        });
        customerId = customer.id;
      }
      if (isNil(subscription_id) === true) {
        const body = {};
        if (isNil(proration_behavior) === false) {
          body.proration_behavior = proration_behavior;
        }
        if (isNil(trial_end) === false) {
          body.trial_end = trial_end;
        }
        if (isNil(billing_cycle_anchor) === false) {
          body.billing_cycle_anchor = billing_cycle_anchor;
        }
        if (isNil(days_until_due) === false) {
          body.days_until_due = days_until_due;
        }
        if (isNil(collection_method) === false) {
          body.collection_method = collection_method;
        }
        await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: price_id,
            },
          ],
          ...body,
        });
      }
      if (isNil(customer_id) === false && isNil(subscription_id) === false) {
        const body = {};
        if (isNil(proration_behavior) === false) {
          body.proration_behavior = proration_behavior;
        }
        if (isNil(trial_end) === false) {
          body.trial_end = trial_end;
        }
        if (isNil(billing_cycle_anchor) === false) {
          body.billing_cycle_anchor = billing_cycle_anchor;
        }
        if (isNil(days_until_due) === false) {
          body.days_until_due = days_until_due;
        }
        if (isNil(collection_method) === false) {
          body.collection_method = collection_method;
        }
        if (isNil(price_id) === false) {
          const subscription = await stripe.subscriptions.retrieve(
            subscription_id
          );
          body.items = [
            {
              id: subscription.items.data[0].id,
              price: price_id,
            },
          ];
        }
        await stripe.subscriptions.update(subscription_id, {
          ...body,
        });
      }
      return "";
    }
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error,
      body: params,
    });
    return "";
  }
};

const executeSetSubscription = async (params, res, url) => {
  const {
    idSubscriptionType,
    idMethod,
    isTrial = null,
    isCanceled = null,
    acceptedCode = null,
    requiresPymt = null,
    idCustomerStripe = null,
    returnToUrl = null,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const { idSystemUser } = url;
  const storeProcedure = "subscriptionSch.USPsetSubscription";
  try {
    if (requiresPymt === true) {
      const session = await stripe.billingPortal.sessions.create({
        customer: idCustomerStripe,
        return_url: `${GLOBAL_CONSTANTS.PATH_FRONT_URL}${returnToUrl}`,
      });
      res.status(200).send({
        response: {
          message: "Para esta acción se requiere de un método de pago",
          idProperty: null,
          idApartment: null,
          url: session.url,
        },
      });
      return true;
    }
    if (
      isNil(idSystemUser) === true ||
      isNil(idLoginHistory) === true ||
      isNil(idSubscriptionType) === true ||
      isNil(idMethod) === true ||
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
        .input("p_intIdSubscriptionType", sql.Int, idSubscriptionType)
        .input("p_intIdMethod", sql.Int, idMethod)
        .input("p_bitIsTrial", sql.Bit, isTrial)
        .input("p_bitIsCanceled", sql.Bit, isCanceled)
        .input("p_nvcAcceptedCode", sql.NVarChar, acceptedCode)
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
          response: {
            message: resultRecordsetObject.message,
            errorMessage: resultRecordsetObject.errorMessage,
          },
        });
      } else {
        let url = "";
        if (resultRecordsetObject.requiresSubsConfig === true) {
          url = await executeGetSubscriptionConfig({
            idSubscriptionType: resultRecordsetObject.idSubscriptionType,
            idMethod: resultRecordsetObject.idMethod,
            isActive: resultRecordsetObject.isActive,
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
            idProperty: resultRecordsetObject.idProperty,
            idApartment: resultRecordsetObject.idApartment,
            url,
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

const executeGetSuscriptionDetail = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "subscriptionSch.USPgetSuscriptionDetail";
  try {
    if (
      isNil(offset) === true ||
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

const executeCancelSubscription = async (params, res) => {
  const {
    name,
    email,
    userType,
    reason,
    comment,
    idSubscription,
    cancel_at,
    reactive,
  } = params;
  if (isNil(idSubscription) === false && isEmpty(idSubscription) === false) {
    await stripe.subscriptions.update(idSubscription, {
      cancel_at,
    });
    res.status(200).send({
      response: {
        message:
          reactive === true
            ? "Tu suscripción se activo correctamente"
            : "Tu suscripción se canceló correctamente",
      },
    });
  } else {
    res.status(500).send({
      response: { message: "Tu suscripción no pudo cancelarse" },
    });
  }
  try {
  } catch (error) {}
};

const executeRequestPolicy = async (params, res) => {
  const { content } = params;

  try {
    await smtpTransporter.sendMail({
      from: "Homify <no-reply@homify.ai>",
      bcc:
        GLOBAL_CONSTANTS.APP_ENVIRONMENT === "Prod"
          ? "ejimenez@homify.ai,asgomez@homify.ai,rpando@homify.ai"
          : "gagonzalez@homify.ai,lnhinojosa@homify.ai",
      subject: "Solicitud de póliza jurídica",
      html: content,
    });

    res.status(200).send({
      response: {
        message: "Información enviada correctamente",
      },
    });
  } catch (error) {
    res.status(500).send({
      response: {
        message: "No se pudo enviar tu información",
        errorMessage: error,
      },
    });
  }
};

const ControllerProperties = {
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
  updatePropertyInApplicationMethod: (req, res) => {
    const params = req.body;
    const url = req.params; //idProperty
    executeUpdatePropertyInApplicationMethod(params, res, url);
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
  validateClassified: (req, res) => {
    const params = req.body;
    executeValidateClassified(params, res);
  },
  setSubscription: (req, res) => {
    const params = req.body;
    const url = req.params; //idSystemUser
    executeSetSubscription(params, res, url);
  },
  getSuscriptionDetail: (req, res) => {
    const params = req.body;
    executeGetSuscriptionDetail(params, res);
  },
  setAnswerToML: (req, res) => {
    const params = req.body;
    executeSetAnswerToML(params, res);
  },
  cancelSubscription: (req, res) => {
    const params = req.body;
    executeCancelSubscription(params, res);
  },
  requestPolicy: (req, res) => {
    const params = req.body;
    executeRequestPolicy(params, res);
  },
};

module.exports = ControllerProperties;
