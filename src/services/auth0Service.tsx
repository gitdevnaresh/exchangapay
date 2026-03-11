import { getAllEnvData } from "../../Environment";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Keychain from "react-native-keychain";
import { get, post } from "../utils/ApiService";
const revokeRefreshToken = async (refreshToken: string) => {
  const { oAuthConfig } = getAllEnvData();
  try {
    await axios.post(
      `https://${oAuthConfig?.issuer}/oauth/revoke`,
      {
        client_id: oAuthConfig?.clientId,
        token: refreshToken,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Intentional: Silently ignore errors.
  }
};

export const handleLogout = async () => {
  const credentials = await Keychain.getGenericPassword({ service: "authTokens" });
  if (!credentials) return;
  const { refreshToken } = JSON.parse(credentials.password);
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  await Keychain.resetGenericPassword();
};
export const storeToken = async (accessToken: any, refreshToken: any) => {
  try {
    const decoded: any = jwtDecode(accessToken);
    const expiryTime = decoded.exp * 1000;
    await Keychain.setGenericPassword(
      'authTokens',
      JSON.stringify({
        accessToken,
        refreshToken,
        expiryTime,
      }), { service: 'authTokens' }
    );
  } catch (err) {
    console.error("Error storing tokens:", err);
  }
};

// create a method to store vendorToken and expiry time in keychain
export const storeVendorToken = async (vendorToken: any, expiry?: any) => {
  try {
    // const decoded: any = jwtDecode(vendorToken);
    // const expiryTime = decoded.exp * 1000;
    await Keychain.setGenericPassword(
      'vendorToken',
      JSON.stringify({
        vendorToken,

      }), { service: 'vendorToken' }
    );
  } catch (err) {
    console.error("Error storing vendor token:", err);
  }
};



export const storeMfaToken = async (mfaToken: any, deviceId?: any) => {
  try {
    await Keychain.setGenericPassword(
      'authTokens',
      JSON.stringify({
        mfaToken,
        deviceId
      }), { service: 'mfaToken' }
    );
  } catch (err) {
  }
};
export const login = async (body: any) => {
  const { oAuthConfig } = getAllEnvData();
  body = {
    "grant_type": "password",
    "client_id": oAuthConfig?.clientId,
    "username": "naresh222@yopmail.com",
    "password": "Welcome@123",
    "audience": oAuthConfig?.audience,
    "scope": "openid profile email offline_access",
    "connection": "SwokipaydevDB"
  }
  const response = await axios.post(`https://${oAuthConfig?.issuer}/oauth/token`, body);
  return response
  // return await post('api/v1/Customer/Token', body);
};

export const auth0Signup = async (body: any) => {
  const { oAuthConfig } = getAllEnvData();

  try {
    const response = await axios.post(`https://${oAuthConfig?.issuer}/dbconnections/signup`, body);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const sendOtp = async (userId: string) => {
  const { oAuthConfig } = getAllEnvData();
  return axios.post(`https://${oAuthConfig?.issuer}/mfa/send-otp`, { userId });
};

export const verifyOtp = async (userId: string, otp: string) => {
  const { oAuthConfig } = getAllEnvData();
  return axios.post(`https://${oAuthConfig?.issuer}/mfa/verify-otp`, { userId, otp });
};
interface AuthTokens {
  access_token: string;
  id_token: string;
  scope: string;
  expires_in: number;
  token_type: 'Bearer';
}
interface MfaRequiredResponse {
  mfaRequired: true;
  mfaToken: string;
}
interface SuccessResponse {
  success: true;
  tokens: AuthTokens;
}

interface FailureResponse {
  success: false;
  error: string;
}
type MfaLoginResponse = SuccessResponse | FailureResponse;

export const loginWithMfa = async (
  mfaToken: string,
  otpCode: string
) => {
  return await post(`api/v1/Customer/mfa/Token`, {
    mfa_token: mfaToken,
    otp: otpCode,
  });
};

interface MfaEnrollmentResponse {
  success: boolean;
  barcodeUri?: string;
  error?: string;
}

export const getMfaEnrollmentData = async (mfaToken: string): Promise<MfaEnrollmentResponse> => {
  console.log("Fetching MFA enrollment QR code for mfa_token:", mfaToken);
  const { oAuthConfig } = getAllEnvData();
  const body = { "authenticator_types": ["otp"] };
  try {
    const response = await axios.post(
      `https://${oAuthConfig?.issuer}/mfa/associate`,
      body,
      {
        headers: {
          Authorization: `Bearer ${mfaToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return {
      success: true,
      barcodeUri: response.data // Extract barcode_uri from the API response
    };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error_description || error.message || 'Failed to get MFA enrollment data' };
  }
};


export const startMfaEnrollment = async (mfaToken: string) => {
  const { oAuthConfig } = getAllEnvData();

  // const response = await axios.post(
  //   `https://${oAuthConfig.issuer}/mfa/associate`,
  //   {
  //     authenticator_types: ['totp'],
  //   },
  //   {
  //     headers: {
  //       Authorization: `Bearer ${mfaToken}`,
  //       'Content-Type': 'application/json',
  //     },
  //   }
  // );

  return await post('api/v1/Customer/Mfa/Associate', {
    "mfaToken": mfaToken
  });



};
// api.ts

export const verifyMFAOTP = async (otp: string, mfaToken: string) => {
  const { oAuthConfig } = getAllEnvData();
  const url = `https://${oAuthConfig.issuer}/mfa/verify`;
  const body = {
    otp,
    mfa_token: mfaToken,
  };
  const headers = {
    'Content-Type': 'application/json',
  };
  const res = await axios.post(url, body, { headers });
  return res;
};

export const requestPasswordChange = async (email: string) => {
  const { oAuthConfig } = getAllEnvData();
  const body = {
    client_id: oAuthConfig.clientId,
    email: email,
    connection: "DevArthaPay", // Or your specific Auth0 database connection name
  };

  try {
    const response = await axios.post(
      `https://${oAuthConfig.issuer}/dbconnections/change_password`,
      body,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response; // Auth0 usually returns a 200 OK with a text message like "We've just sent you an email to reset your password."
  } catch (error: any) {
    console.error('Auth0 Password Change Error:', error.response?.data ?? error.message);
    throw error.response?.data ?? error; // Rethrow the error to be handled by the calling component
  }
};

export const GetToken = async () => {
  try {
    const credentilas = await Keychain.getGenericPassword({ service: "authTokens" });
    if (credentilas) {
      const { accessToken, refreshToken } = JSON.parse(credentilas.password);
      return { accessToken, refreshToken };
    }
  } catch (e) {
    console.log(e)
  }
}
