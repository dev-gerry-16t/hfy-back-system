const GLOBAL_CONSTANTS = {
  VERSION: "v0.0.91",
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
};

module.exports = GLOBAL_CONSTANTS;
