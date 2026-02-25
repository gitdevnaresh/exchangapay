import CryptoJS from "crypto-js";
 
export const decryptAES = (cipherText,secretKey) => {
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey.replace(/ |-/g, ""));
    const iv = CryptoJS.enc.Utf8.parse("\0".repeat(16));
 
    const bytes = CryptoJS.AES.decrypt(cipherText, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: iv,
    });
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error("Decryption failed: " + error.message);
  }
};
 
export const encryptAES = (plainText,secretKey) => {
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey.replace(/ |-/g, ""));
    const iv = CryptoJS.enc.Utf8.parse("\0".repeat(16));
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: iv,
    });
    return encrypted.toString();
  } catch (error) {
    throw new Error("Encryption failed: " + error.message);
  }
};