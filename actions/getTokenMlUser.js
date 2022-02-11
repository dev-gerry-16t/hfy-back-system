const sql = require("mssql");
const rp = require("request-promise");

const executeGetTokenMlUser = async (params) => {
  const {} = params;
  const app_id = "2169250693153406";
  const client_secret = "ji3ARh9kFM5pjjYrFDObp7MfUpVIXQjN";
  const code_id = "TG-6203071c5c52ee001a0fe913-1066839489";
  const redirect_url = "https://apptest.homify.ai";
  try {
    const response = await rp({
      url: "https://api.mercadolibre.com/oauth/token",
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
      body: `grant_type=authorization_code&client_id=${app_id}&client_secret=${client_secret}&code=${code_id}&redirect_uri=${redirect_url}`,
      rejectUnauthorized: false,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const executeRefreshTokenMlUser = async (params) => {
  const { refresh_token } = params;
  const app_id = "2169250693153406";
  const client_secret = "ji3ARh9kFM5pjjYrFDObp7MfUpVIXQjN";
  try {
    const response = await rp({
      url: "https://api.mercadolibre.com/oauth/token",
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
      body: `grant_type=refresh_token&client_id=${app_id}&client_secret=${client_secret}&refresh_token${refresh_token}`,
      rejectUnauthorized: false,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = { executeGetTokenMlUser, executeRefreshTokenMlUser };
