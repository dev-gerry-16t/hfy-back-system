const GLOBAL_CONSTANTS = require("../constants/constants");

const {
  USER_DATABASE,
  PASS_DATABASE,
  SERVER_DATABASE,
  DATABASE_NAME,
} = GLOBAL_CONSTANTS;

const CONFIG = {
  user: USER_DATABASE,
  password: PASS_DATABASE,
  server: SERVER_DATABASE,
  database: DATABASE_NAME,
//   pool: {
//       max: 10,
//       min: 0,
//       idleTimeoutMillis: 30000
//   }
};

module.exports = CONFIG;
