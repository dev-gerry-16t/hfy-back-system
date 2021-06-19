const crypto = require("crypto");
const sign = crypto.createSign("SHA256");
const fs = require("fs");

class CryptoHandler {
  constructor(ordenPagoWs, phrase) {
    this.phrase = phrase;
    this.cadenaPrimaria = "";
    for (const property in ordenPagoWs) {
      this.cadenaPrimaria += `${ordenPagoWs[property]}|`;
    }
    this.cadenaOriginal = `||${this.cadenaPrimaria}||`;
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
