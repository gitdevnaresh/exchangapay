import { useCallback } from 'react';
import CryptoJS from "crypto-js";
import { useSelector } from 'react-redux';
import { Logger } from '../../utils/Logger';
 
const useEncryptDecrypt = (customSecretKey?:string) => {
  const defaultSecretKey = useSelector((state:any) => state.userReducer.userDetails?.clientSecretKey); // Redux Secret Key
 
  const getSecretKey = useCallback(() => {
    return customSecretKey || defaultSecretKey || '';
  }, [customSecretKey, defaultSecretKey]);
 
  const encryptAES = useCallback((plainText:string) => {
    try {
      const secretKey = getSecretKey().replace(/ |-/g, "");
      
      // Validate inputs before encryption
      if (!plainText) {
        throw new Error("ENCRYPTION_INPUT_MISSING");
      }
      if (!secretKey) {
        throw new Error("ENCRYPTION_KEY_MISSING");
      }
      
      const iv = CryptoJS.enc.Utf8.parse("\0".repeat(16));
      const encrypted = CryptoJS.AES.encrypt(plainText, CryptoJS?.enc?.Utf8?.parse(secretKey), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      });
      return encrypted.toString();
    } catch (error) {
      // Send sanitized error to Sentry for monitoring
      Logger.error("Encryption failed", {
        originalError: error.message,
        context: "AES_ENCRYPTION",
        hasPlaintext: !!plainText,
        hasSecretKey: !!getSecretKey()
      });
      
      // Throw generic error to halt execution (fail-closed)
      throw new Error("SECURE_SESSION_FAILED");
    }
  }, [getSecretKey]);
 
  const decryptAES = useCallback((cipherText:string, keyOverride?: string) => {
    try {
      // Handle empty/null/undefined inputs gracefully
      if (!cipherText || cipherText.trim() === '') {
        return ''; // Return empty string for empty input
      }
      
      const secretKey = (keyOverride || getSecretKey()).replace(/ |-/g, "");
      
      if (!secretKey) {
        throw new Error("DECRYPTION_KEY_MISSING");
      }
      
      const iv = CryptoJS?.enc?.Utf8?.parse("\0".repeat(16));
      const bytes = CryptoJS?.AES?.decrypt(cipherText, CryptoJS?.enc?.Utf8?.parse(secretKey), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      });
      
      // Check if decryption was successful by verifying the result
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      
      // If decryption results in empty string or invalid UTF-8, fail securely
      if (!decryptedString || decryptedString === '') {
        throw new Error("DECRYPTION_RESULT_INVALID");
      }
      
      return decryptedString;
    } catch (error) {
      // Send sanitized error to Sentry for monitoring
      Logger.error("Decryption failed", {
        originalError: error.message,
        context: "AES_DECRYPTION",
        hasCipherText: !!cipherText,
        hasSecretKey: !!(keyOverride || getSecretKey())
      });
      
      // Throw generic error to halt execution (fail-closed)
      throw new Error("SECURE_SESSION_FAILED");
    }
  }, [getSecretKey]);
 
  return { encryptAES, decryptAES };
};
 
export default useEncryptDecrypt;