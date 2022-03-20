const sql = require("mssql");
const rp = require("request-promise");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const executeSlackLogCatchBackend = require("./slackLogCatchBackend");
const GLOBAL_CONSTANTS = require("../constants/constants");

const executeGetTokenMlUser = async (params) => {
  const { appId, clientSecret, codeId, redirectUrl } = params;
  try {
    const response = await rp({
      url: "https://api.mercadolibre.com/oauth/token",
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
      form: {
        grant_type: "authorization_code",
        client_id: appId,
        client_secret: clientSecret,
        code: codeId,
        redirect_uri: redirectUrl,
      },
      rejectUnauthorized: false,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const executeRefreshTokenMlUser = async (params) => {
  const { appId, refreshToken, clientSecret } = params;
  try {
    const response = await rp({
      url: "https://api.mercadolibre.com/oauth/token",
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
      form: {
        grant_type: "refresh_token",
        client_id: appId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      },
      rejectUnauthorized: false,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const handlerGetLocationObject = async (dataLocation, token) => {
  const {
    address_line,
    country_id,
    zip_code,
    neighborhood,
    latitude,
    longitude,
  } = dataLocation;

  let objectParse = {
    address_line,
    zip_code,
    latitude,
    longitude,
  };
  try {
    let arrayNeighborhoods = [];
    if (isEmpty(zip_code) === false && isEmpty(country_id) === false) {
      const response = await rp({
        url: `https://api.mercadolibre.com/countries/${country_id}/zip_codes/${zip_code}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        json: true,
        rejectUnauthorized: false,
      });
      if (
        isEmpty(response) === false &&
        isNil(response.city) === false &&
        isEmpty(response.city) === false &&
        isNil(response.city.id) === false
      ) {
        const responseNeighborhood = await rp({
          url: `https://api.mercadolibre.com/classified_locations/cities/${response.city.id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          json: true,
          rejectUnauthorized: false,
        });
        arrayNeighborhoods =
          isEmpty(responseNeighborhood) === false &&
          isNil(responseNeighborhood.neighborhoods) === false &&
          isEmpty(responseNeighborhood.neighborhoods) === false
            ? responseNeighborhood.neighborhoods
            : [];
      }

      const neighborhoodId = arrayNeighborhoods.find((row) => {
        return row.name == neighborhood;
      });

      objectParse = {
        address_line,
        zip_code,
        neighborhood: isNil(neighborhoodId) === false ? neighborhoodId : {},
        city: response.city,
        state: response.state,
        country: response.country,
        latitude,
        longitude,
      };
    }
    return objectParse;
  } catch (error) {
    return objectParse;
  }
};

const handlerValidatePublication = async (body, token) => {
  try {
    const response = await rp({
      url: "https://api.mercadolibre.com/items/validate",
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      json: true,
      body,
      rejectUnauthorized: false,
    });
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure: "Validación de objeto ML",
      error: { message: error.message, error: error.error, cause: error.cause },
      body,
    });
  }
};

const executePublicToMLM = async (params) => {
  const {
    idProperty,
    idApartment,
    idSite,
    operationType,
    idClassified,
    status,
    classified,
    pictures,
    seller_contact,
    location,
    attributes,
    token = "",
    isPublished,
  } = params;
  const {
    title,
    category_id,
    price,
    currency_id,
    available_quantity,
    buyingMode,
    listing_type_id,
    condition,
    description,
    buying_modes,
  } = classified;
  try {
    const parseLocation =
      isEmpty(location) === false
        ? await handlerGetLocationObject(location, token)
        : {};
    if (operationType == "publish") {
      const body = {
        title,
        category_id,
        price,
        currency_id,
        available_quantity,
        buying_mode: buying_modes,
        listing_type_id,
        condition,
        video_id: null,
        pictures,
        seller_contact,
        location: parseLocation,
        attributes,
      };
      //await handlerValidatePublication(body, token);
      const response = await rp({
        url: "https://api.mercadolibre.com/items",
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        json: true,
        body,
        rejectUnauthorized: false,
      });

      const responseDescription = await rp({
        url: `https://api.mercadolibre.com/items/${response.id}/description`,
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        json: true,
        body: {
          plain_text: description,
        },
        rejectUnauthorized: false,
      });

      return response;
    } else if (operationType == "update") {
      let body = {};
      if (isEmpty(seller_contact) === false) {
        body.seller_contact = seller_contact;
      }
      if (isEmpty(parseLocation) === false) {
        body.location = parseLocation;
      }
      if (isEmpty(attributes) === false) {
        body.attributes = attributes;
      }
      if (isPublished === false) {
        body.status = status;
      }
      if (isEmpty(classified) === false) {
        if (isNil(title) === false) {
          body.title = title;
        }
        if (isNil(category_id) === false) {
          body.category_id = category_id;
        }
        if (isNil(price) === false) {
          body.price = price;
        }
        if (isNil(currency_id) === false) {
          body.currency_id = currency_id;
        }
        if (isNil(available_quantity) === false) {
          body.available_quantity = available_quantity;
        }
        if (isNil(listing_type_id) === false) {
          body.listing_type_id = listing_type_id;
        }
        if (isNil(condition) === false) {
          body.condition = condition;
        }
        if (isNil(description) === false) {
          const responseDescription = await rp({
            url: `https://api.mercadolibre.com/items/${idClassified}/description`,
            method: "PUT",
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            json: true,
            body: {
              plain_text: description,
            },
            rejectUnauthorized: false,
          });
        }
        if (isNil(buying_modes) === false) {
          body.buying_mode = buying_modes;
        }
      }
      const response = await rp({
        url: `https://api.mercadolibre.com/items/${idClassified}`,
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        json: true,
        body,
        rejectUnauthorized: false,
      });
      if (isPublished === false) {
        await rp({
          url: `https://api.mercadolibre.com/items/${idClassified}`,
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          json: true,
          body: {
            deleted: "true",
          },
          rejectUnauthorized: false,
        });
      }
      return response;
    }
  } catch (error) {
    throw error;
  }
};

const executeSetUserConfig = async (params) => {
  const {
    token = null,
    refreshToken = null,
    tokenType = null,
    expires = null,
    userId = null,
    codeId = null,
    idSystemUser = null,
    idLoginHistory = null,
    offset,
  } = params;
  const storeProcedure = "mlSch.USPsetUserConfig";
  try {
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
      .input(
        "p_nvcPassPhrase",
        sql.NVarChar,
        GLOBAL_CONSTANTS.WEBHOOK_PASS_ML_DB
      )
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
    const resultRecordsetObject =
      isEmpty(result.recordset) === false &&
      isNil(result.recordset[0]) === false &&
      isEmpty(result.recordset[0]) === false
        ? result.recordset[0]
        : {};
    return resultRecordsetObject;
  } catch (err) {
    throw err;
  }
};

const executeGetTokenMl = async (params) => {
  const { idSystemUser, idLoginHistory, offset } = params;
  try {
    const oneResponse = await executeSetUserConfig(params);
    const {
      canGenerateToken,
      canRefreshToken,
      appId,
      clientSecret,
      codeId,
      redirectUrl,
      refreshToken,
      token,
    } = oneResponse;
    let tokenActive = null;
    if (canGenerateToken === true) {
      const responseToken = await executeGetTokenMlUser({
        appId,
        clientSecret,
        codeId,
        redirectUrl,
      });
      const { access_token, token_type, expires_in, user_id, refresh_token } =
        responseToken;
      await executeSetUserConfig({
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
      tokenActive = access_token;
    } else if (canRefreshToken === true) {
      const responseRefreshToken = await executeRefreshTokenMlUser({
        appId,
        refreshToken,
        clientSecret,
      });
      const { access_token, token_type, expires_in, user_id, refresh_token } =
        responseRefreshToken;
      await executeSetUserConfig({
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
      tokenActive = access_token;
    } else {
      tokenActive = token;
    }
    return tokenActive;
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure: "algún error en el getToken",
      error,
      body: params,
    });
    throw error;
  }
};

const executeGetTokenMlWithUserId = async (params) => {
  const { idSystemUser, idLoginHistory, offset } = params;
  try {
    const oneResponse = await executeSetUserConfig(params);
    const {
      canGenerateToken,
      canRefreshToken,
      appId,
      clientSecret,
      codeId,
      redirectUrl,
      refreshToken,
      token,
      userId,
    } = oneResponse;
    let tokenActive = {
      token: null,
      userId: null,
    };
    if (canGenerateToken === true) {
      const responseToken = await executeGetTokenMlUser({
        appId,
        clientSecret,
        codeId,
        redirectUrl,
      });
      const { access_token, token_type, expires_in, user_id, refresh_token } =
        responseToken;
      await executeSetUserConfig({
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
      tokenActive = { token: access_token, userId: user_id };
    } else if (canRefreshToken === true) {
      const responseRefreshToken = await executeRefreshTokenMlUser({
        appId,
        refreshToken,
        clientSecret,
      });
      const { access_token, token_type, expires_in, user_id, refresh_token } =
        responseRefreshToken;
      await executeSetUserConfig({
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
      tokenActive = { token: access_token, userId: user_id };
    } else {
      tokenActive = { token, userId };
    }
    return tokenActive;
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure: "algún error en el getToken",
      error,
      body: params,
    });
    throw error;
  }
};

const executeSetMLMWebhook = async (params, offset) => {
  const { resource, user_id, topic } = params;
  const storeProcedure = "mlSch.USPsetMLMWebhook";
  try {
    const token = await executeGetTokenMl({ offset, userId: user_id });
    const response = await rp({
      url: `https://api.mercadolibre.com${resource}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
      rejectUnauthorized: false,
    });
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_nvcJsonServiceResponse", sql.NVarChar, JSON.stringify(params))
      .input("p_nvcJsonRequestResponse", sql.NVarChar, JSON.stringify(response))
      .input("p_nvcTopic", sql.NVarChar, topic)
      .input("p_bitWasFound", sql.Bit, null)
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
    const resultRecordsetObject =
      isEmpty(result.recordset) === false &&
      isNil(result.recordset[0]) === false &&
      isEmpty(result.recordset[0]) === false
        ? result.recordset[0]
        : {};
    return resultRecordsetObject;
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: params,
    });
  }
};

const executeSetMLMPicture = async (params, offset) => {
  const storeProcedure = "mlSch.USPsetMLMPicture";
  try {
    const pool = await sql.connect();
    await pool
      .request()
      .input("p_nvcIdClassified", sql.NVarChar, params.id)
      .input("p_nvcJsonServiceResponse", sql.NVarChar, JSON.stringify(params))
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

const executeGetPropertyPictures = async (offset) => {
  const storeProcedure = "mlSch.USPgetPropertyPictures";
  try {
    let hasMore = true;
    while (hasMore === true) {
      const pool = await sql.connect();
      const result = await pool
        .request()
        .input("p_chrOffset", sql.Char, offset)
        .execute(storeProcedure);
      const resultRecordsetObject =
        isEmpty(result.recordset) === false &&
        isNil(result.recordset[0]) === false &&
        isEmpty(result.recordset[0]) === false
          ? result.recordset[0]
          : {};
      if (isEmpty(resultRecordsetObject) === false) {
        const token = await executeGetTokenMl({
          offset,
          userId: resultRecordsetObject.user_id,
        });
        const pictures =
          isEmpty(resultRecordsetObject) === false &&
          isNil(resultRecordsetObject.pictures) === false &&
          isEmpty(resultRecordsetObject.pictures) === false
            ? JSON.parse(resultRecordsetObject.pictures)
            : [];
        const idClassified =
          isEmpty(resultRecordsetObject) === false &&
          isNil(resultRecordsetObject.idClassified) === false &&
          isEmpty(resultRecordsetObject.idClassified) === false
            ? resultRecordsetObject.idClassified
            : "";
        const response = await rp({
          url: `https://api.mercadolibre.com/items/${idClassified}`,
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          json: true,
          body: {
            pictures,
          },
          rejectUnauthorized: false,
        });
        await executeSetMLMPicture(response, offset);
        hasMore =
          isEmpty(resultRecordsetObject) === false &&
          isNil(resultRecordsetObject.hasMore) === false
            ? resultRecordsetObject.hasMore
            : "";
      } else {
        hasMore = false;
      }
    }
  } catch (err) {
    executeSlackLogCatchBackend({
      storeProcedure,
      error: err,
      body: {},
    });
  }
};

const executeSetAnswerToML = async (params, res) => {
  const {
    question_id,
    answer,
    idSystemUser,
    idLoginHistory,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  try {
    const token = await executeGetTokenMl({
      offset,
      userId: null,
      idSystemUser,
      idLoginHistory,
    });
    const response = await rp({
      url: `https://api.mercadolibre.com/answers`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
      rejectUnauthorized: false,
      body: {
        question_id,
        text: answer,
      },
    });
    res.status(200).send({
      response: {
        message: "Respuesta enviada",
      },
    });
  } catch (error) {
    res.status(500).send({
      response: {
        message:
          isNil(error) === false &&
          isNil(error.error) === false &&
          isNil(error.error.error) === false
            ? error.error.error
            : "Error, no se pudo enviar la respuesta",
      },
    });
    executeSlackLogCatchBackend({
      storeProcedure: "answer enviado a mercado libre con error",
      error: error,
      body: {
        question_id,
        text: answer,
      },
    });
  }
};

const executeGetPromotionPacks = async (params) => {
  try {
    const { token, userId } = await executeGetTokenMlWithUserId({
      ...params,
      userId: null,
    });
    const response = await rp({
      url: `https://api.mercadolibre.com/users/${userId}/classifieds_promotion_packs?package_content=ALL`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      json: true,
      rejectUnauthorized: false,
    });
    return isEmpty(response) === false ? JSON.stringify(response) : "{}";
  } catch (error) {
    executeSlackLogCatchBackend({
      storeProcedure: "Consulta de paquetes",
      error: error,
      body: {},
    });
    return "{}";
  }
};

module.exports = {
  executeGetTokenMlUser,
  executeRefreshTokenMlUser,
  executePublicToMLM,
  executeGetTokenMl,
  executeSetMLMWebhook,
  executeGetPropertyPictures,
  executeSetAnswerToML,
  executeGetPromotionPacks,
};
