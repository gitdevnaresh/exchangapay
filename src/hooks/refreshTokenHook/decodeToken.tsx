import { jwtDecode } from "jwt-decode";
import { getAllEnvData } from "../../../Environment";
import axios from "axios";
import Keychain from "react-native-keychain";
import { storeToken } from "../../apiServices/onBoarding/auth0Service";
import { Logger } from '../../utils/Logger';

export const getDecodedTokenExpiry = async (): Promise<number | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: "authTokens" });
      if (!credentials) {
        throw new Error("TOKEN_CREDENTIALS_NOT_FOUND");
      }
      
      let accessToken;
      try {
        const parsedCredentials = JSON.parse(credentials.password);
        accessToken = parsedCredentials.accessToken;
      } catch (parseError) {
        throw new Error("TOKEN_PARSE_FAILED");
      }

      if (!accessToken) {
        throw new Error("ACCESS_TOKEN_MISSING");
      }

      const decodedToken: any = jwtDecode(accessToken);
      const expiryTime = decodedToken?.exp;
      
      if (!expiryTime) {
        throw new Error("TOKEN_EXPIRY_MISSING");
      }
      
      return expiryTime;
    } catch (error) {
      Logger.error("Error decoding token expiry", {
        originalError: error.message,
        context: "TOKEN_DECODE_EXPIRY"
      });
      
      // Throw error to halt execution (fail-closed)
      throw new Error("SECURE_SESSION_FAILED");
    }
  };
  export const checkAndRefreshToken = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({service:"authTokens"});
      if (!credentials) {
        throw new Error("AUTH_TOKEN_CREDENTIALS_NOT_FOUND");
      }
      let refreshToken;
      try {
        const parsedCredentials = JSON.parse(credentials.password);
        refreshToken = parsedCredentials.refreshToken;
      } catch (parseError) {
        throw parseError; // Propagate error
      }

      if (!refreshToken) {
        // This is a state where re-authentication is needed.
        // Throwing an error will stop the refresh loop.
        throw new Error("REFRESH_TOKEN_MISSING");
      }
      const { oAuthConfig } = getAllEnvData();
      if (!oAuthConfig?.issuer || !oAuthConfig?.clientId) {
        // Logger.error("checkAndRefreshToken: Auth0 configuration (issuer or clientId) is missing.");
        throw new Error("AUTH0_CONFIG_MISSING");
      }
      const tokenEndpoint = `https://${oAuthConfig.issuer}/oauth/token`;
      const response = await axios.post(tokenEndpoint, {
        grant_type: "refresh_token",
        client_id: oAuthConfig.clientId,
        refresh_token: refreshToken,
      });
      const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data;
      // Auth0 may return a new refresh token (token rotation). It's best practice to store it.
      await storeToken(newAccessToken, newRefreshToken || refreshToken);
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        // Unauthorized or Forbidden. The refresh token is likely invalid or revoked.
        // This is a critical failure. Clear the tokens to force a re-login.
        Logger.error("Refresh token failed, clearing stored tokens:", error.response?.data);
        await Keychain.resetGenericPassword({ service: "authTokens" });
      } else if (axios.isAxiosError(error)) {
        Logger.error("checkAndRefreshToken: Axios error during token refresh:", error.response?.data || error.message);
      } else {
        Logger.error("checkAndRefreshToken: General error during token refresh:", error);
      }
      // Re-throwing the error is crucial. It allows the calling function (`useTokenRefresh`)
      // to catch it and stop the refresh loop, preventing an infinite loop on persistent failure.
      throw error;
    }
  };