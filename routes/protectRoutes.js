"use strict";

var express = require("express");

var router = express.Router();

router.post("/testToken", (req, res) => {
  res.json({
    error: null,
    data: {
      title: "mi ruta protegida",
      user: req.user,
    },
  });
});

module.exports = router;
