import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../index";

export const ENCRYPT = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const DECRYPT = (encryptedData) => {
  if (!encryptedData) return false;
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};
