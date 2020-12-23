const sql = require("mssql");
const GLOBAL_CONSTANTS = require("../constants/constants");

const ControllerTest = {
  test: (req, res) => {
    res
      .status(200)
      .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
  },
  testPath: (req, res) => {
    console.log("Welcome to backend test, conection is successfully", sql);
    res
      .status(200)
      .send(`Bienvenido al Backend homify :) ${GLOBAL_CONSTANTS.VERSION}`);
  },
};

module.exports = ControllerTest;
