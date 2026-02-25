import createTransform from "redux-persist/es/createTransform";
import { decryptAES, encryptAES } from "./encryptionDecryption";
import { getAllEnvData } from "../../Environment";
import { Logger } from './Logger';
const SECRET_KEY = getAllEnvData().reduxEncryptKey;
const encryptTransform = createTransform(
  (inboundState, key) => {
    try {
      const stringified = JSON.stringify(inboundState);
      return encryptAES(stringified, SECRET_KEY);
    } catch (e) {
      Logger.error("Encryption failed:", e);
      return inboundState;
    }
  },
  (outboundState, key) => {
    try {
      const decrypted = decryptAES(outboundState, SECRET_KEY);
      return JSON.parse(decrypted);

    } catch (e) {
      Logger.error("Decryption--- failed:", e);
      return {};
    }
  }
);

export default encryptTransform;