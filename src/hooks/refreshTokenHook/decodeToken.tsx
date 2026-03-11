import { jwtDecode } from "jwt-decode";
import Keychain from "react-native-keychain";
import OnboardingService from "../../services/onboarding";
import { storeToken } from "../../services/auth0Service";
import { showAppToast } from "../../newComponents/ToasterMessages/ShowMessage";

let shouldStopRetry = false;
let failedAttempts = 0;
const maxFailedAttempts = 3;

export const getDecodedTokenExpiry = async (): Promise<number | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: "authTokens" });
    if (!credentials) return null;
    
    const parsedCredentials = JSON.parse(credentials.password);
    const accessToken = parsedCredentials.accessToken;
    if (!accessToken) return null;

    const decodedToken: any = jwtDecode(accessToken);
    return decodedToken?.exp;
  } catch (error) {
    return null;
  }
};
export const checkAndRefreshToken = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({service:"authTokens"});
    if (!credentials) {
      failedAttempts++;
      if (failedAttempts >= maxFailedAttempts) {
        shouldStopRetry = true;
      }
      return;
    }
    
    const parsedCredentials = JSON.parse(credentials.password);
    const refreshToken = parsedCredentials.refreshToken;
    if (!refreshToken) {
      failedAttempts++;
      if (failedAttempts >= maxFailedAttempts) {
        shouldStopRetry = true;
      }
      return;
    }

    const body = { refreshId: refreshToken };

    const response = await OnboardingService.refreshToken(body);
    
    if (response?.status === 200) {
      let responseData: any = response.data;
      if (typeof responseData === 'string') {
        responseData = JSON.parse(responseData);
      }
      
      if (responseData?.auth) {
        const { auth } = responseData;
        await storeToken(auth.accessToken, auth.refreshToken);
        shouldStopRetry = false;
        failedAttempts = 0;
      } else {
        failedAttempts++;
        if (failedAttempts >= maxFailedAttempts) {
          shouldStopRetry = true;
        }
        
        if (responseData?.statusCode === 401 && 
            (responseData?.message?.errorCode === 'ER-01019' || 
             responseData?.message?.errors?.includes('Refresh token is not found'))) {
          showAppToast('Refresh token not found', 'error');
        } else {
          showAppToast('Auth object missing in response', 'error');
        }
        return;
      }
    } else {
      failedAttempts++;
      if (failedAttempts >= maxFailedAttempts) {
        shouldStopRetry = true;
      }
      return;
    }
  } catch (error:any) {
    failedAttempts++;
    if (failedAttempts >= maxFailedAttempts) {
      shouldStopRetry = true;
    }
    throw error;
  }
};

export const getShouldStopRetry = () => shouldStopRetry;
export const resetStopRetry = () => { 
  shouldStopRetry = false; 
  failedAttempts = 0;
};