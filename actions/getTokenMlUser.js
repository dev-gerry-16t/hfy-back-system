const sql = require("mssql");
const rp = require("request-promise");
const isNil = require("lodash/isNil");
const isEmpty = require("lodash/isEmpty");
const executeSlackLogCatchBackend = require("./slackLogCatchBackend");

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
      body: `grant_type=authorization_code&client_id=${appId}&client_secret=${clientSecret}&code=${codeId}&redirect_uri=${redirectUrl}`,
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
      body: `grant_type=refresh_token&client_id=${appId}&client_secret=${clientSecret}&refresh_token${refreshToken}`,
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
    console.log("error", error);
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
    console.log("response", response);
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
    const parseLocation = await handlerGetLocationObject(location, token);
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
      description: {
        plain_text: description,
      },
      pictures,
      seller_contact,
      location: parseLocation,
      attributes,
    };

    await handlerValidatePublication(body, token);
    if (operationType == "publish") {
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

      console.log("response", response);

      return response;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  executeGetTokenMlUser,
  executeRefreshTokenMlUser,
  executePublicToMLM,
};
