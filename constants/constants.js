const GLOBAL_CONSTANTS = {
  VERSION: "v0.0.125",
  PORT: 3001,
  USER_DATABASE: process.env.DB_USER,
  PASS_DATABASE: process.env.DB_HOMIFY_PASSWORD,
  SERVER_DATABASE: process.env.DB_HOMIFY_SERVER,
  DATABASE_NAME: process.env.DB_TEST_NAME,
  DATABASE_PORT: 1433,
  MASTER_KEY_PERMISSION: process.env.MASTER_KEY_TOKEN,
  ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
  OFFSET: process.env.OFFSET,
  SECRET_KEY_STRIPE: process.env.SECRET_KEY_STRIPE,
  PUBLIC_KEY_STRIPE: process.env.PUBLIC_KEY_STRIPE,
  SECRET_KEY_ENCRYPT: process.env.SECRET_KEY_ENCRYPT,
  RECAPTCHA_VERIFY_KEY: process.env.RECAPTCHA_VERIFY_KEY,
  ENVIRONMENT_TEST: process.env.ENVIRONMENT_TEST,
  URL_SLACK_MESSAGE: process.env.URL_SLACK_MESSAGE,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  APP_ENVIRONMENT: process.env.APP_ENVIRONMENT,
  USER_GET_MATI: process.env.USER_GET_MATI,
  PASS_GET_MATI: process.env.PASS_GET_MATI,
  MATI_WEBHOOK_SECRET: process.env.MATI_WEBHOOK_SECRET,
};

module.exports = GLOBAL_CONSTANTS;
