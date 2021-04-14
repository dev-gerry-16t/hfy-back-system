const sql = require("mssql");

const executeGetAllMaritalStatus = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant = null,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllMaritalStatus", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllMaritalRegime = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant = null,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllMaritalRegime", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllPropertyTypes = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant = null,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllPropertyTypes", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllNationalities = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant = null,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllNationalities", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllIDTypes = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant = null,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllIDTypes", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllOccupationActivities = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant = null,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllOccupationActivities",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllPolicies = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant = null,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllPolicies", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllPolicyStatus = async (params, res) => {
  const { idContract, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllPolicyStatus", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllCommercialSocietyTypes = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllCommercialSocietyTypes",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllStates = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("addressSch.USPgetAllStates", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetAllProspectTypes = async (params, url, res) => {
  const { type } = url;
  try {
    const request = new sql.Request();
    request.input("p_intType", sql.Int, type);
    request.execute("catLandingSch.USPgetAllProspectTypes", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (error) {}
};

const executeGetAllProspectStatus = async (params, res) => {
  const { idSystemUser, idLoginHistory, idLandingProspect, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_nvcIdLandingProspect", sql.NVarChar, idLandingProspect);
    request.input("p_intType", sql.Int, type);
    request.execute("catLandingSch.USPgetAllProspectStatus", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (error) {}
};

const executeGetAllRelationshipTypes = async (params, res) => {
  const { idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllRelationshipTypes",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (error) {}
};

const executeGetAllPersonalReferenceStatus = async (params, res) => {
  const { idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllPersonalReferenceStatus",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (error) {}
};

const executeGetAllProviderTypes = async (params, res) => {
  const { idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllProviderTypes", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (error) {}
};

const executeGetAllCollaboratorTypes = async (params, res) => {
  const { idProvider, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllCollaboratorTypes",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (error) {}
};

const executeGetAllProviders = async (params, res) => {
  const {
    idContract,
    idSystemUser,
    idLoginHistory,
    type,
    idProviderType = null,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.input("p_intIdProviderType", sql.Int, idProviderType);
    request.execute("catCustomerSch.USPgetAllProviders", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (error) {}
};

const executeGetAllProviderPaymentForms = async (params, res) => {
  const { idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllProviderPaymentForms",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (error) {}
};

const executeGetAllCollaborators = async (params, res) => {
  const {
    idProvider,
    idCollaboratorType,
    idSystemUser,
    idLoginHistory,
    type,
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_intIdCollaboratorType", sql.Int, idCollaboratorType);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllCollaborators", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (error) {}
};

const executeGetAllRequestForProviderStatus = async (params, res) => {
  const { idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllRequestForProviderStatus",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (error) {}
};

const executeGetAllIncidenceTypes = async (params, res) => {
  const { idContract, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute("catCustomerSch.USPgetAllIncidenceTypes", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (error) {}
};

const executeGetAllIncidenceStatus = async (params, res) => {
  const { idContract, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllIncidenceStatus",
      (err, result) => {
        console.log("err", err);
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (error) {}
};

const executeGetCustomerForIncidence = async (params, res) => {
  const { idIncidence, idSystemUser, idLoginHistory } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdIncidence", sql.NVarChar, idIncidence);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.execute("customerSch.USPgetCustomerForIncidence", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        res.status(200).send({
          response: resultRecordset,
        });
      }
    });
  } catch (error) {}
};

const executeGetAllIncidenePaymentMethods = async (params, res) => {
  const { idIncidence, idSystemUser, idLoginHistory, type } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdIncidence", sql.NVarChar, idIncidence);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intType", sql.Int, type);
    request.execute(
      "catCustomerSch.USPgetAllIncidenePaymentMethods",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    );
  } catch (error) {}
};

const ControllerCatalogs = {
  getAllMaritalStatus: (req, res) => {
    const params = req.body;
    executeGetAllMaritalStatus(params, res);
  },
  getAllPropertyTypes: (req, res) => {
    const params = req.body;
    executeGetAllPropertyTypes(params, res);
  },
  getAllPolicies: (req, res) => {
    const params = req.body;
    executeGetAllPolicies(params, res);
  },
  getAllNationalities: (req, res) => {
    const params = req.body;
    executeGetAllNationalities(params, res);
  },
  getAllIDTypes: (req, res) => {
    const params = req.body;
    executeGetAllIDTypes(params, res);
  },
  getAllOccupations: (req, res) => {
    const params = req.body;
    executeGetAllOccupationActivities(params, res);
  },
  getAllPolicyStatus: (req, res) => {
    const params = req.body;
    executeGetAllPolicyStatus(params, res);
  },
  getAllMaritalRegime: (req, res) => {
    const params = req.body;
    executeGetAllMaritalRegime(params, res);
  },
  getAllCommercialSocietyTypes: (req, res) => {
    const params = req.body;
    executeGetAllCommercialSocietyTypes(params, res);
  },
  getAllStates: (req, res) => {
    const params = req.body;
    executeGetAllStates(params, res);
  },
  getAllProspectTypes: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeGetAllProspectTypes(params, url, res);
  },
  getAllProspectStatus: (req, res) => {
    const params = req.body;
    executeGetAllProspectStatus(params, res);
  },
  getAllRelationshipTypes: (req, res) => {
    const params = req.body;
    executeGetAllRelationshipTypes(params, res);
  },
  getAllPersonalReferenceStatus: (req, res) => {
    const params = req.body;
    executeGetAllPersonalReferenceStatus(params, res);
  },
  getAllProviderTypes: (req, res) => {
    const params = req.body;
    executeGetAllProviderTypes(params, res);
  },
  getAllCollaboratorTypes: (req, res) => {
    const params = req.body;
    executeGetAllCollaboratorTypes(params, res);
  },
  getAllProviders: (req, res) => {
    const params = req.body;
    executeGetAllProviders(params, res);
  },
  getAllProviderPaymentForms: (req, res) => {
    const params = req.body;
    executeGetAllProviderPaymentForms(params, res);
  },
  getAllCollaborators: (req, res) => {
    const params = req.body;
    executeGetAllCollaborators(params, res);
  },
  getAllRequestForProviderStatus: (req, res) => {
    const params = req.body;
    executeGetAllRequestForProviderStatus(params, res);
  },
  getAllIncidenceTypes: (req, res) => {
    const params = req.body;
    executeGetAllIncidenceTypes(params, res);
  },
  getAllIncidenceTypes: (req, res) => {
    const params = req.body;
    executeGetAllIncidenceTypes(params, res);
  },
  getAllIncidenceStatus: (req, res) => {
    const params = req.body;
    executeGetAllIncidenceStatus(params, res);
  },
  getCustomerForIncidence: (req, res) => {
    const params = req.body;
    executeGetCustomerForIncidence(params, res);
  },
  getAllIncidenePaymentMethods: (req, res) => {
    const params = req.body;
    executeGetAllIncidenePaymentMethods(params, res);
  },
};

module.exports = ControllerCatalogs;
