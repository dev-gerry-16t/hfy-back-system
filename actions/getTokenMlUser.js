const sql = require("mssql");
const rp = require("request-promise");

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

module.exports = { executeGetTokenMlUser, executeRefreshTokenMlUser };
