import { get, post, put } from "../utils/ApiService";
import crashlytics from '@react-native-firebase/crashlytics';
import { OTP_PROBE_CONFIG, verifyOneTimeCode } from "../security";

/**
 * N-01: `getAccountInfo` is gone. It was the only caller of the `authApi`
 * instance, and it called the OIDC `/connect/userinfo` endpoint on
 * `tstlogin.suissebase.io` — a host that is NXDOMAIN. Identity now comes from
 * Auth0 (see the Auth0Provider wiring and `useTokenRefresh`), so that endpoint
 * has no successor here rather than a new address.
 *
 * It was also never dispatched: nothing in src/ called the `getAccountInfo`
 * thunk, so the `auth.user` slice it populated was permanently null. Deleted
 * rather than repointed, on the M-09 precedent — dead code that reaches an
 * identity endpoint has negative value, because the next developer wires it up
 * and inherits whatever is wrong with it.
 *
 * If a profile-claims lookup is needed later, take it from the Auth0 credentials
 * already in the Keychain; do not reintroduce a second identity host.
 */
const AuthService = {
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
  // M-02: the code moved out of the request line and into the body. The legacy
  // path form is kept only as a fallback for a backend that has not yet
  // deployed the body route — see src/security/otpTransport.ts.
  //
  // NOTE for whoever owns this module: grep finds no caller for
  // verifyPhoneOTP. It is kept working rather than deleted because that is a
  // product decision, not an audit one — but a dead function pointing at a
  // security endpoint is what M-09 deleted `changePassword` for. If it is
  // genuinely unused, remove it and the legacy branch goes with it.
  verifyPhoneOTP: async (code: any) => {
    return verifyOneTimeCode({
      channel: "security-phone-verification",
      secure: () =>
        post(
          `/api/v1/Security/PhoneVerification`,
          { code: String(code) },
          OTP_PROBE_CONFIG
        ),
      legacy: () =>
        get(`/api/v1/Security/PhoneVerification/${encodeURIComponent(String(code))}`),
    });
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
