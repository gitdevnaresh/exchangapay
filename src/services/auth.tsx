import { get, post, put } from "../utils/ApiService";
import { authApi } from "../utils/api";
import crashlytics from '@react-native-firebase/crashlytics';
const AuthService = {
  getAccountInfo: async () => {
    const { data } = await authApi.get("/connect/userinfo");
    return data;
  },
  getMemberInfo: async () => {
    try {
      const data = await get(`api/v1/Registration/App/Exchange`);

      return data;
    } catch (error: any) {
      crashlytics().recordError(error);

    }
  },
  loginLog: async (info: any) => {
    return post(`api/v1/Common/Login`, info);
  },
  logOutLog: async (info: any) => {
    return post(`api/v1/Common/Logout`, info);
  },
  getIsrefferalValid: async (body: any, customerType: any) => {
    const data = post(`api/v1/Customer/CustomerReferral/${customerType}`, body);
    return data;
  },
  putReferralCode: async (body: any, IdonthaveReferral: any) => {
    return put(`api/v1/Customer/CustomerUpdate/${IdonthaveReferral}`, body);

  },
  customerNotes: async () => {
    return get(`api/v1/Customer/Customer/StateChange/Notes`)
  },
  getPhoneOTP: async () => {
    return get(`/api/v1/Security/SendOTP/send`)
  },
  verifyPhoneOTP: async (code: any) => {
    return get(`/api/v1/Security/PhoneVerification/${code}`)
  },
  updateAccountType: async (body: any) => {
    return put(`/api/v1/Customer/Customer/AccountType`, body)
  },
  getAccountTypes: async () => {
    return get(`/api/v1/Customer/CustomerAccountTypes`)
  },
  getPhoneNumberOtp: async (body: any) => {
    return post(`/api/v1/Customer/CustomerPhoneNumberUpdate`, body)
  },
  verifyPhoneNumberOtp: async (body: any) => {
    return put(`/api/v1/Customer/OTPPhoneVerification`, body)
  },
  customerDetailsUpdate: async (body: any) => {
    return put(`api/v1/Customer/CustomerDetailsUpdate`, body)
  }

}
export default AuthService;
