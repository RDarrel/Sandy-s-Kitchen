const CryptoJS = require("crypto-js");

const encryptionKey = process.env.ENCRYPTION_KEY;
const ENCRYPT = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
};

const DECRYPT = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) || "";
  return decryptedData;
};

module.exports = {
  ENCRYPT,
  DECRYPT,
};
