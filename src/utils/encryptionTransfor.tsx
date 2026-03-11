import createTransform from "redux-persist/es/createTransform";
import { decryptAES, encryptAES } from "./encryptionDecryption";
import { getAllEnvData } from "../../Environment";
const SECRET_KEY = getAllEnvData().reduxEncryptKey;
const encryptTransform = createTransform(
  (inboundState, key) => {
    try {
      const stringified = JSON.stringify(inboundState);
      return encryptAES(stringified, SECRET_KEY);
    } catch (e) {
      console.error("Encryption failed:", e);
      return inboundState;
    }
  },
  (outboundState, key) => {
    try {
      const decrypted = decryptAES(outboundState, SECRET_KEY);
      return JSON.parse(decrypted);

    } catch (e) {
      console.error("Decryption--- failed:", e);
      return {};
    }
  }
);

export default encryptTransform;