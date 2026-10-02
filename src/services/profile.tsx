
import { filepost, get, post, put } from "../utils/ApiService";
import crashlytics from "@react-native-firebase/crashlytics";
import { OTP_PROBE_CONFIG, verifyOneTimeCode } from "../security";
const ProfileService = {
  uploadFile: async (imgdata: any) => {
    return filepost(`UploadFile`, imgdata);
  },
  uploadSingnitureFile: async (body: any) => {
    return post(`BytesToImageConveter`, body);
  },
  profileAvathar: async (imgdata: any) => {
    return await filepost(`UploadProfile`, imgdata);
  },
  partnerRefferel: async () => {
    try {
      // N-01: was `api` (neowalletapi.azurewebsites.net, NXDOMAIN).
      const data: any = await get(
        `api/v1/Partner/getReferralDetails/customer`
      );
      return data;
    } catch (error: any) {
      crashlytics().recordError(error);
    }
  },
  updateSecurity: async (security: any) => {
    return put(`api/v1/Master/UpdateSecurity`, security);
  },
  getSeccurityInfo: async () => {
    return get(`api/v1/Security/SecurityInformation`);
  },
  // M-02: the value in this path was a live TOTP code — a second factor, not a
  // one-shot SMS digit. Body first, legacy path only until the backend route
  // exists. See src/security/otpTransport.ts.
  varificationGoogleAuthenticate: async (code: number) => {
    return verifyOneTimeCode({
      channel: "google-authenticator-verification",
      secure: () =>
        put(
          `api/v1/Security/VerifyGoogleAuthenticator`,
          { code: String(code) },
          OTP_PROBE_CONFIG
        ),
      legacy: () =>
        put(
          `api/v1/Security/VerifyGoogleAuthenticator/${encodeURIComponent(String(code))}`,
          null
        ),
    });
  },
  setGoogleAuthenticateSwitch: async () => {
    return put(`api/v1/Security/EnableGoogleAuth`, {});
  },
  setGoogleAuthenticateEnable: async (payload: object) => {
    return put(`api/v1/Security/GoogleAuthenticator`, payload);
  },

  setFaceRecognisationSwitch: async (body: any) => {
    return put(`/api/v1/Security/FaceRecognition`, body);
  },
  setSequrityQuationsSwitch: async (body: any) => {
    return put(`/api/v1/Security/SecurityQuestionsEnable`, body);
  },
  getSecurityQuestions: async () => {
    return get(`api/v1/Common/SecurityQuestionsLu`);
  },
  getProfileEditView: async () => {
    return get(`api/v1/Common/ProfileView`);
  },
  updateProfile: async (custmerId: any, Obj: any) => {
    return put(`api/v1/Common/UpdateProfile/${custmerId}`, Obj);
  },
  getprofileEditLookups: async () => {
    return get(`api/v1/Common/GetProfileControlCodes`);
  },
  getSecurityQuestionsdata: async () => {
    return get(`/api/v1/Security/SecurityQuestions`);
  },
  saveSecurityQuestionsdata: async (body: any) => {
    return post(`/api/v1/Security/SecurityQuestions`, body);
  },
  updateSecurityQuestionsdata: async (body: any) => {
    return put(`/api/v1/Security/UpdateSecurityQuestions`, body);
  },
  deleteAccount: async () => {
    return post(`api/v1/Customer/Customer/Delete`, {});
  },
  getUserReferral: async () => {
    return get(`/api/v1/Security/getReferralDetails/customer`)
  },
  getAllReferrals: async (ReferralId: any, pageNo: number, pageSize: number) => {
    return get(`api/v1/Customer/referral?referralId=${ReferralId}&page=${pageNo}&pageSize=${pageSize}`)
  }, saveCustomerKycInformation: async (body: any) => {
    return put(`/api/v1/Common/Update/CustomerProfile`, body)
  },
  updateKycDocuments: async (data: any) => {
    return put(`api/v1/Common/CustomerKycUpdate`, data)
  }, updateGoogleAuthenticateSwitch: async (data: any) => {
    return get(`api/v1/Common/TwoFactorAuthentication/${data}`);
  },
  // The backend identifies the customer from the bearer token, builds the
  // Make.com payload and forwards it. The webhook address lives only there.
  sendCustomerEvent: async (queryType: string) => {
    return post(`api/v1/Common/CustomerEvent`, { queryType });
  },
};

export default ProfileService;