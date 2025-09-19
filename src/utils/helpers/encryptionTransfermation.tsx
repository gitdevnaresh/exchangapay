import createTransform from "redux-persist/es/createTransform";
import { decryptAES, encryptAES } from "./encryptionDecryption";
import * as Keychain from "react-native-keychain";

const getSecretKey = async (): Promise<string | null> => {
    try {
        const credentials = await Keychain.getGenericPassword({ service: "userInfoService" });
        if (credentials) {
            const userInfo = JSON.parse(credentials.password);
            return userInfo;
        }
        return null;
    } catch (err) {
        console.error("Error retrieving secret key:", err);
        return null;
    }
};

const encryptTransform = createTransform(
    async (inboundState, key) => {
        try {
            const KEY: any = await getSecretKey();
            const stringified = JSON.stringify(inboundState);
            return encryptAES(stringified, KEY.sk);
        } catch (e) {
            return inboundState;
        }
    },

    async (outboundState, key) => {
        try {
            const KEY: any = await getSecretKey();
            const decrypted = decryptAES(outboundState, KEY.sk);
            return JSON.parse(decrypted);
        } catch (e) {
            return {};
        }
    }
);

export default encryptTransform;