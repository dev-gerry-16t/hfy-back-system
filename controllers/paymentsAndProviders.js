const sql = require("mssql");
const isEmpty = require("lodash/isEmpty");
const isNil = require("lodash/isNil");

const executeValidatePaymentSchedule = async (params, res) => {
  const {
    idCustomer,
    idCustomerTenant,
    idContract,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdCustomer", sql.NVarChar, idCustomer);
    request.input("p_nvcIdCustomerTenant", sql.NVarChar, idCustomerTenant);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPvalidatePaymentSchedule", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: resultRecordset });
        } else {
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeSetProvider = async (params, res, url) => {
  const {
    idProviderType,
    idProviderPaymentForm,
    provider,
    taxId,
    phoneNumber,
    emailAddress,
    budgeAmount,
    providerBudgeInPolicy,
    collaborator,
    isActive,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  const { idProvider = null } = url;
  try {
    const request = new sql.Request();
    const tvpProvider = new sql.Table();
    const tvpCollaborator = new sql.Table();

    tvpProvider.columns.add("idProvider", sql.NVarChar);
    tvpProvider.columns.add("idPolicy", sql.NVarChar);
    tvpProvider.columns.add("budgeAmount", sql.Decimal(19, 2));
    tvpProvider.columns.add("isActive", sql.Bit);

    tvpCollaborator.columns.add("idProvider", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaborator", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaboratorType", sql.Int);
    tvpCollaborator.columns.add("collaboratorType", sql.NVarChar);
    tvpCollaborator.columns.add("givenName", sql.NVarChar);
    tvpCollaborator.columns.add("lastName", sql.NVarChar);
    tvpCollaborator.columns.add("mothersMaidenName", sql.NVarChar);
    tvpCollaborator.columns.add("phoneNumber", sql.NVarChar);
    tvpCollaborator.columns.add("emailAddress", sql.NVarChar);
    tvpCollaborator.columns.add("isActive", sql.Bit);

    if (isEmpty(providerBudgeInPolicy) === false) {
      providerBudgeInPolicy.forEach((element) => {
        tvpProvider.rows.add(
          element.idProvider,
          element.idPolicy,
          element.budgeAmount,
          element.isActive
        );
      });
    }

    if (isEmpty(collaborator) === false) {
      collaborator.forEach((element) => {
        tvpCollaborator.rows.add(
          element.idProvider,
          element.idCollaborator,
          element.idCollaboratorType,
          element.collaboratorType,
          element.givenName,
          element.lastName,
          element.mothersMaidenName,
          element.phoneNumber,
          element.emailAddress,
          element.isActive
        );
      });
    }

    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_intIdProviderType", sql.Int, idProviderType);
    request.input("p_intIdProviderPaymentForm", sql.Int, idProviderPaymentForm);
    request.input("p_nvcProvider", sql.NVarChar, provider);
    request.input("p_nvcTaxId", sql.NVarChar, taxId);
    request.input("p_nvcPhoneNumber", sql.NVarChar, phoneNumber);
    request.input("p_nvcEmailAddress", sql.NVarChar, emailAddress);
    request.input("p_decBudgeAmount", sql.Decimal(19, 2), budgeAmount);
    request.input("p_udttProviderBudgeInPolicy", tvpProvider);
    request.input("p_udttCollaborator", tvpCollaborator);
    request.input("p_bitIsActive", sql.Bit, isActive);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPsetProvider", (err, result) => {
      if (err) {
        res.status(500).send({ response: { message: err.message } });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: { message: resultRecordset[0].message } });
        } else {
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetProviderCoincidences = async (params, res) => {
  const { idSystemUser, idLoginHistory, topIndex, offset = "-06:00" } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetProviderCoincidences", (err, result) => {
      if (err) {
        res.status(500).send({ response: err });
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

const executeGetProviderById = async (params, res) => {
  const {
    idProvider,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPgetProviderById", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordsets = result.recordsets;
        res.status(200).send({
          response: {
            result1:
              isNil(resultRecordsets[0]) === false &&
              isEmpty(resultRecordsets[0]) === false &&
              isNil(resultRecordsets[0][0]) === false
                ? resultRecordsets[0][0]
                : {},
            result2:
              isNil(resultRecordsets[1]) === false ? resultRecordsets[1] : [],
            result3:
              isNil(resultRecordsets[2]) === false ? resultRecordsets[2] : [],
          },
        });
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeGetRequestForProviderCoincidences = async (params, res) => {
  const { idSystemUser, idLoginHistory, topIndex, offset = "-06:00" } = params;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_intTopIndex", sql.Int, topIndex);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetRequestForProviderCoincidences",
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

const executeGetRequestForProviderById = async (params, res) => {
  const {
    idSystemUser,
    idLoginHistory,
    idRequestForProvider,
    offset = "-06:00",
  } = params;
  try {
    const request = new sql.Request();
    request.input(
      "p_nvcIdRequestForProvider",
      sql.NVarChar,
      idRequestForProvider
    );
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPgetRequestForProviderById",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordsets = result.recordsets;
          res.status(200).send({
            response: {
              result1:
                isNil(resultRecordsets[0]) === false &&
                isEmpty(resultRecordsets[0]) === false &&
                isNil(resultRecordsets[0][0]) === false
                  ? resultRecordsets[0][0]
                  : {},
              result2:
                isNil(resultRecordsets[1]) === false ? resultRecordsets[1] : [],
            },
          });
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeUpdateRequestForProvider = async (params, res, url) => {
  const {
    idProvider,
    idRequestForProviderStatus,
    scheduleDate,
    referenceId,
    budgeAmount,
    collaborator,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  const { idRequestForProvider } = url;
  try {
    const request = new sql.Request();
    const tvpCollaborator = new sql.Table();

    tvpCollaborator.columns.add("idProvider", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaborator", sql.NVarChar);
    tvpCollaborator.columns.add("idCollaboratorType", sql.Int);
    tvpCollaborator.columns.add("collaboratorType", sql.NVarChar);
    tvpCollaborator.columns.add("givenName", sql.NVarChar);
    tvpCollaborator.columns.add("lastName", sql.NVarChar);
    tvpCollaborator.columns.add("mothersMaidenName", sql.NVarChar);
    tvpCollaborator.columns.add("phoneNumber", sql.NVarChar);
    tvpCollaborator.columns.add("emailAddress", sql.NVarChar);
    tvpCollaborator.columns.add("isActive", sql.Bit);

    if (isEmpty(collaborator) === false) {
      collaborator.forEach((element) => {
        tvpCollaborator.rows.add(
          element.idProvider,
          element.idCollaborator,
          element.idCollaboratorType,
          element.collaboratorType,
          element.givenName,
          element.lastName,
          element.mothersMaidenName,
          element.phoneNumber,
          element.emailAddress,
          element.isActive
        );
      });
    }

    request.input(
      "p_nvcIdRequestForProvider",
      sql.NVarChar,
      idRequestForProvider
    );
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input(
      "p_intIdRequestForProviderStatus",
      sql.Int,
      idRequestForProviderStatus
    );
    request.input("p_dtmScheduleDate", sql.DateTime, scheduleDate);
    request.input("p_nvcReferenceId", sql.NVarChar, referenceId);
    request.input("p_decBudgeAmount", sql.Decimal(19, 2), budgeAmount);
    request.input("p_udttCollaborator", tvpCollaborator);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute(
      "customerSch.USPupdateRequestForProvider",
      (err, result) => {
        if (err) {
          res.status(500).send({ response: "Error en los parametros" });
        } else {
          const resultRecordset = result.recordset;
          if (resultRecordset[0].stateCode !== 200) {
            res
              .status(resultRecordset[0].stateCode)
              .send({ response: { message: resultRecordset[0].message } });
          } else {
            res.status(200).send({
              response: resultRecordset,
            });
          }
        }
      }
    );
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const executeAddRequestForProvider = async (params, res) => {
  const {
    idContract,
    scheduleDate,
    idSystemUser,
    idLoginHistory,
    offset = "-06:00",
  } = params;
  const { idProvider } = url;
  try {
    const request = new sql.Request();
    request.input("p_nvcIdProvider", sql.NVarChar, idProvider);
    request.input("p_nvcIdContract", sql.NVarChar, idContract);
    request.input("p_dtmScheduleDate", sql.DateTime, scheduleDate);
    request.input("p_nvcIdSystemUser", sql.NVarChar, idSystemUser);
    request.input("p_nvcIdLoginHistory", sql.NVarChar, idLoginHistory);
    request.input("p_chrOffset", sql.Char, offset);
    request.execute("customerSch.USPaddRequestForProvider", (err, result) => {
      if (err) {
        res.status(500).send({ response: "Error en los parametros" });
      } else {
        const resultRecordset = result.recordset;
        if (resultRecordset[0].stateCode !== 200) {
          res
            .status(resultRecordset[0].stateCode)
            .send({ response: resultRecordset });
        } else {
          res.status(200).send({
            response: resultRecordset,
          });
        }
      }
    });
  } catch (err) {
    console.log("ERROR", err);
    // ... error checks
  }
};

const ControllerPaymentProvider = {
  validatePaymentSchedule: (req, res) => {
    const params = req.body;
    executeValidatePaymentSchedule(params, res);
  },
  setProvider: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeSetProvider(params, res, url);
  },
  getProviderCoincidences: (req, res) => {
    const params = req.body;
    executeGetProviderCoincidences(params, res);
  },
  getProviderById: (req, res) => {
    const params = req.body;
    executeGetProviderById(params, res);
  },
  getRequestForProviderCoincidences: (req, res) => {
    const params = req.body;
    executeGetRequestForProviderCoincidences(params, res);
  },
  getRequestForProviderById: (req, res) => {
    const params = req.body;
    executeGetRequestForProviderById(params, res);
  },
  updateRequestForProvider: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeUpdateRequestForProvider(params, res, url);
  },
  addRequestForProvider: (req, res) => {
    const params = req.body;
    const url = req.params;
    executeAddRequestForProvider(params, res, url);
  },
};

module.exports = ControllerPaymentProvider;
