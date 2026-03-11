import { useCallback } from 'react';
import CryptoJS from "crypto-js";
import { useSelector } from 'react-redux';
import { showAppToast } from '../../newComponents/ToasterMessages/ShowMessage';

const useEncryptDecrypt = (customSecretKey?: string) => {
  const defaultSecretKey = useSelector((state: any) => state?.userReducer?.userDetails?.sk); // Redux Secret Key

  const getSecretKey = useCallback(() => {
    return customSecretKey || defaultSecretKey || '';
  }, [customSecretKey, defaultSecretKey]);

  const encryptAES = useCallback((plainText: string) => {
    try {
      const secretKey = getSecretKey()?.replace(/ |-/g, "");
      const iv = CryptoJS?.enc?.Utf8?.parse("\0"?.repeat(16));
      const encrypted = CryptoJS?.AES?.encrypt(plainText || '', CryptoJS?.enc?.Utf8?.parse(secretKey || ''), {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv,
      });
      return encrypted?.toString();
    } catch (error) {
      //  showAppToast("Encryption failed: " + error?.message,"error");
      console.log(error)
    }
  }, [getSecretKey]);

  const decryptAES = useCallback((cipherText: string) => {
    try {
      if (cipherText) {
        const secretKey = getSecretKey()?.replace(/ |-/g, "");
        const iv = CryptoJS?.enc?.Utf8?.parse("\0".repeat(16));
        const bytes = CryptoJS?.AES?.decrypt(cipherText || '', CryptoJS?.enc?.Utf8?.parse(secretKey || ''), {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
          iv: iv,
        });
        return bytes?.toString(CryptoJS?.enc?.Utf8);
      } else {
        return cipherText
      }
    } catch (error) {
      console.log(error)
      //  showAppToast("Decryption failed: " + error?.message,"error");
    }
  }, [getSecretKey]);

  return { encryptAES, decryptAES };
};

export default useEncryptDecrypt;