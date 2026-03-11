import { get, put } from "../utils/ApiService";
const SecurityService = {
  
  changePassword: async (pass:any) => {
    try {
      const data:any = await put(`api/v1/Customer/ChangePWD`,pass);
      return data;
    } catch (error:any) {
      // crashlytics().recordError(error);
      // console.log("error of change password >>> ", error);
    }
  },
   getSecurityVerifications: async () => {
          return get(`api/v1/Common/Security/Verifications`);
      },
      enableFingerPrint: async (data:any) => {
        return put(`api/v1/Security/FaceRecognition`, data );
      },
      verifyGoogleAuthentication: async (code:any) => {
        return put(`/api/v1/Security/VerifyGoogleAuthenticator/${code}`);
      },
};
export default SecurityService;
