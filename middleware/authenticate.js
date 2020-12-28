const jwt = require("jsonwebtoken");
const GLOBAL_CONSTANTS = require("../constants/constants");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("token", token);
  if (!token) return res.status(401).json({ error: "Acceso denegado" });
  try {
    const verified = jwt.verify(token, GLOBAL_CONSTANTS.MASTER_KEY_PERMISSION);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: "Access Unauthorized" });
  }
};

module.exports = verifyToken;
