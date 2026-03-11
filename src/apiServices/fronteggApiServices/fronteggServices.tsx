import axios from "axios";
import { getAllEnvData } from "../../../Environment";
import { accesToken, userDetails, VendorDetails } from "../../utils/helpers";
import { post, remove } from "../../utils/ApiService";
import DeviceInfo from "react-native-device-info";
import messaging from "../../services/backgroundMessageHandler";
import Keychain from "react-native-keychain";


interface VendorPostBody {
  clientId: string;
  secret?: string;
}
export const getVendorToken = async () => {
  const { oAuthConfig } = getAllEnvData();
  const body: VendorPostBody = {
    "clientId": oAuthConfig.frontEgg_ClientId,
    "secret": oAuthConfig?.frontEgg_Secret,
  };
  try {
    const response = await axios.post(
      `https://api.ca.frontegg.com/auth/vendor`,
      body,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response;
  } catch (error: any) {
    console.error('Get vendor token Error:', error.response?.data ?? error.message);
    throw error.response?.data ?? error; // Rethrow the error to be handled by the calling component
  }
};

// ----For frontegg logout-----
export const frontEggLogout = async (jwt: string) => {
  const { oAuthConfig } = getAllEnvData();
  try {
    const response = await axios.post(
      `https://api.frontegg.com/identity/resources/auth/v1/logout`,
      null, // No body is sent for logout
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'frontegg-vendor-host': oAuthConfig?.fronteggVendorHost,
        },
      }
    );
    return response;
  } catch (error: any) {
    console.error('Frontegg Logout Error:', error.response?.data ?? error.message);
    throw error.response?.data ?? error;
  }
};

// ----For frontegg signin-----

export const frontEggSignin = async (body: any) => {
  const vendorToken = await VendorDetails();
  try {
    const response = await axios.post(`https://api.ca.frontegg.com/identity/resources/auth/v1/user`, body, {
      headers: {
        Authorization: `Bearer ${vendorToken}`,
        'x-frontegg-device-model': DeviceInfo.getModel(),
        'x-frontegg-device-brand': DeviceInfo.getBrand(),
        'x-frontegg-device-os': DeviceInfo.getSystemName() + " " + DeviceInfo.getSystemVersion(),
        'x-frontegg-device-app': 'bullswipe',
        'Content-Type': 'application/json'
      }
    }
    );
    return response;
  } catch (error: any) {
    throw error.response?.data ?? error; // Rethrow the error to be handled by the calling component
  }
};
// ----For frontegg signup-----
export const frontEggSignup = async (body: any) => {
  const { oAuthConfig } = getAllEnvData();
  const vendorData = await VendorDetails();
  try {
    const response = await axios.post(`https://api.ca.frontegg.com/identity/resources/users/v1/signUp`, body,
      {
        headers: {
          Authorization: `Bearer ${vendorData}`,
          'Content-Type': 'application/json',
          'frontegg-application-id': oAuthConfig?.frontEgg_AppId,
          'frontegg-vendor-host': "https://app-rk7m05g6zv53.ca.frontegg.com",
        }
      }
    );
    return response; // FrontEgg usually returns a 200 OK with a text message like "We've just sent you an email to reset your password."
  } catch (error: any) {
    throw error.response ?? error; // Rethrow the error to be handled by the calling component
  }
};




export const fronteggLogout = async () => {
  const FRONTEGG_LOGOUT_URL = 'https://api.ca.frontegg.com/identity/resources/auth/v1/logout';
  const { oAuthConfig } = getAllEnvData();
  const vendorData = await VendorDetails();
  const credentials = await userDetails();
  const accessToken = await accesToken();

  let client_ID = oAuthConfig.frontEgg_ClientId;
  // Convert 8-4-4-12 → 12-4-4-12 format if needed
  const parts = client_ID.split('-');
  if (parts?.length === 4 && parts[0]?.length === 8) {
    client_ID = `${parts[0]}abcd-${parts[1]}-${parts[2]}-${parts[3]}`;
  };
  try {
    const response = await axios.post(
      FRONTEGG_LOGOUT_URL,
      {},
      {
        headers: {
          Authorization: `Bearer ${vendorData}`,
          'frontegg-vendor-host': 'https://app-rk7m05g6zv53.ca.frontegg.com',
          Cookie: `fe_refresh_fd8b4d3e6b21-4f09-b4ed-cb7de7dc1af2=${credentials}`,
        },
      }

    );

    console.log('Logout success:', response.data);
    return response.data;
  } catch (error: any) {
    console.log("credentials", credentials)
    console.error('Logout failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getMFADevices = async (userId: string) => {
  const vendorToken = await VendorDetails();
  try {
    const response = await axios.get(
      'https://api.ca.frontegg.com/identity/resources/users/v1/mfa/devices',
      {
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'frontegg-user-id': userId
        },
      }
    );
    return response;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export const verifyAuthenticator = async (body: any) => {
  const vendorData = await VendorDetails();
  try {
    const response = await axios.post(`https://api.ca.frontegg.com/identity/resources/auth/v1/user/mfa/verify`, body,
      {
        headers: {
          Authorization: `Bearer ${vendorData}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response; // FrontEgg usually returns a 200 OK with a text message like "We've just sent you an email to reset your password."
  } catch (error: any) {
    throw error.response ?? error; // Rethrow the error to be handled by the calling component
  }
};
export const verifyMFACode = async (deviceId: string, body: any) => {
  const vendorData = await VendorDetails();
  try {
    const response = await axios.post(`https://api.ca.frontegg.com/identity/resources/auth/v1/user/mfa/authenticator/${deviceId}/verify`, body,
      {
        headers: {
          Authorization: `Bearer ${vendorData}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response; // FrontEgg usually returns a 200 OK with a text message like "We've just sent you an email to reset your password."
  } catch (error: any) {
    throw error.response ?? error; // Rethrow the error to be handled by the calling component
  }
};

export const EnrollFrontEggAuthenticator = async (userId: string, body: any) => {
  const vendorData = await VendorDetails();
  try {
    const response = await axios.post(`https://api.ca.frontegg.com/identity/resources/users/v1/mfa/authenticator/enroll/verify`, body,
      {
        headers: {
          Authorization: `Bearer ${vendorData}`,
          'Content-Type': 'application/json',
          'frontegg-user-id': userId
        }
      }
    );
    return response; // FrontEgg usually returns a 200 OK with a text message like "We've just sent you an email to reset your password."
  } catch (error: any) {
    throw error.response ?? error; // Rethrow the error to be handled by the calling component
  }
};

export const mfaRecoveryCode = async (body: any) => {
  const vendorData = await VendorDetails();
  try {
    const response = await axios.post(`https://api.ca.frontegg.com/identity/resources/auth/v1/user/mfa/recover`, body,
      {
        headers: {
          Authorization: `Bearer ${vendorData}`,
          'Content-Type': 'application/json',
        }
      }
    );
    return response; // FrontEgg usually returns a 200 OK with a text message like "We've just sent you an email to reset your password."
  } catch (error: any) {
    throw error.response ?? error; // Rethrow the error to be handled by the calling component
  }
};
export const updateFcmToken = async (fcmToken?: string) => {
  try {
    let token = fcmToken;
    // Get FCM token from Keychain if not provided
    if (!token) {
      const credentials = await Keychain.getGenericPassword({ service: 'fcmToken' });
      if (credentials) {
        const tokenData = JSON.parse(credentials.password);
        token = tokenData.token;
      }
    } 
    // Fallback to messaging service
    if (!token) {
      token = await messaging().getToken();
    }
    
    if (!token) {
      return null;
    }
    
    const response: any = await post(
      `/api/v1/Notification/SaveUserToken`,
      {
        token: token,
      }
    );
    return response;
  } catch (error) {
    return null;
  }
};
export const deleteFcmToken = async () => {
  try{
  const token = await messaging().getToken();
  const data = post(`/api/v1/Notification/DeleteUserToken`,
    {
      "token": token,
    }
  );
  return data
  }catch(error){
    console.log("error",error)
  }
}

export const FrontEggService = {
  userLogOut: async (body: any) => {
    return await post("/api/v1/Common/Customer/Logout", body);
  }, userMFADetail: async () => {
    return await post("/api/v1/Common/MFA/enable", {});
  },
  userSignup: async (body: any) => {
    return await post("api/v1/Common/Signup/User", body)
  },
  userSignIn: async (body: any) => {
    return await post(`/api/v1/Common/Customer/login`, body)
  },
  enrollMFAAuthenticator: async (body: any) => {
    return await post(`api/v1/Common/Verfiy/MfaEnrollment`, body)
  },
  mfaRecoveryCode: async (body: any) => {
    return await post(`/api/v1/Common/Recovery/Mfa`, body)
  }, verifyAuthenticatorCode: async (body: any) => {
    return await post(`/api/v1/Common/Verify/Mfa/During/Authentication`, body)
  }


};