const crypto = require("crypto");
const fs = require("fs");

class CryptoHandler {
  constructor(ordenPagoWs, phrase, original) {
    this.phrase = phrase;
    this.cadenaOriginal = "";
    if (original) {
      this.cadenaOriginal = original;
    } else {
      this.cadenaPrimaria = "";
      for (const property in ordenPagoWs) {
        if (property === "fechaOperacion") {
          this.cadenaPrimaria += `${ordenPagoWs[property]}||`;
        } else if (property === "rfcCurpBeneficiario") {
          this.cadenaPrimaria += `${ordenPagoWs[property]}||||||`;
        } else if (property === "conceptoPago") {
          this.cadenaPrimaria += `${ordenPagoWs[property]}||||||`;
        } else if (property === "referenciaNumerica") {
          this.cadenaPrimaria += `${ordenPagoWs[property]}||||||`;
        } else {
          this.cadenaPrimaria += `${ordenPagoWs[property]}|`;
        }
      }
      this.cadenaOriginal = `||${this.cadenaPrimaria}||`;
    }
  }

  getSign() {
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(this.cadenaOriginal);
    sign.end();
    const key = fs.readFileSync(__dirname + `/key.pem`);
    const signature_b64 = sign.sign({ key, passphrase: this.phrase }, "base64");
    return signature_b64;
  }
}

module.exports = CryptoHandler;
