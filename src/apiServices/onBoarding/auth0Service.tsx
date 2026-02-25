import { getAllEnvData } from "../../../Environment";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Keychain from "react-native-keychain";
import { Logger } from '../../utils/Logger';
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
 const credentials = await Keychain.getGenericPassword({service:"authTokens"});
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
        }),{service:'authTokens'}
      );
    } catch (err) {
      Logger.error("Error storing tokens:", err);
    }
  };
  export const storeMfaToken = async (mfaToken: any) => {
    try {
      await Keychain.setGenericPassword(
        'authTokens',
        JSON.stringify({
          mfaToken
        }), { service: 'mfaToken' }
      );
    } catch (err) {
    }
  };
export const login = async (body: any) => {
  const { oAuthConfig } = getAllEnvData();
    const response = await axios.post(`https://${oAuthConfig?.issuer}/oauth/token`, body);
    return response;
};

  export const auth0Signup = async (body:any) => {
   const { oAuthConfig } = getAllEnvData();

  try {
    const response = await axios.post(`https://${oAuthConfig?.issuer}/dbconnections/signup`,body);
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


export const startMfaEnrollment = async (accessToken: string) => {
  const { oAuthConfig } = getAllEnvData();
  
  const response = await axios.post(
    `https://${oAuthConfig.issuer}/mfa/associate`,
    {
      authenticator_types: ['totp'],
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data; 


  
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
    connection: oAuthConfig.dataBase, // Or your specific Auth0 database connection name
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
    Logger.error('Auth0 Password Change Error', {
      originalError: error.response?.data ?? error.message,
      context: "PASSWORD_CHANGE_REQUEST"
    });
    throw new Error("PASSWORD_CHANGE_FAILED"); // Throw generic error for security
  }
};

export const logout = async () => {
  const { oAuthConfig } = getAllEnvData();
  const url = `https://${oAuthConfig?.issuer}/v2/logout`;
  try {
    // You may want to pass client_id and returnTo as query params if needed
    const response = await axios.get(url, {
      params: {
        client_id: oAuthConfig?.clientId,
        // returnTo: 'YOUR_RETURN_URL', // Optionally add this if you want to redirect after logout
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};