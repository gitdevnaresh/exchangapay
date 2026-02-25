
import axios from 'axios';
import { getAllEnvData } from '../../../Environment';
import { get,post } from '../ApiService';
import { ONBOARDING_API_ENDPOINTS } from './constants';

const OnBoardingService = {
    resendVerifyMail: async () => {
        const data = await get(ONBOARDING_API_ENDPOINTS.RESEND_VERIFY_MAIL)
        return data;
    },
    saveUserInfo: async (info:any,accType?:string) => {
        const data = await post(ONBOARDING_API_ENDPOINTS.SAVE_USER_INFO(accType),info)
        return data;
    },
    verifyMobileCode: async (otp:any,CustomerId:string) => {
        const data = await get(ONBOARDING_API_ENDPOINTS.VERIFY_MOBILE_CODE(CustomerId, otp))
        return data;
    },
    sendMobileCode: async () => {
        const data = await post(ONBOARDING_API_ENDPOINTS.SEND_MOBILE_CODE,null)
        return data;
    },
    neoMobileVersioncheck: async () => {
        const data = await get(ONBOARDING_API_ENDPOINTS.NEO_MOBILE_VERSION_CHECK)
        return data;
    },
    sumsubToken: async (userid:string) => {
        const data = await get(ONBOARDING_API_ENDPOINTS.SUMSUB_TOKEN(userid))
        return data;
    },
    getOTP: async (CustomerId:any, type:any) => {
        const  data  = await get(ONBOARDING_API_ENDPOINTS.GET_OTP(CustomerId, type));
        return data;
      },
      getOTPVerification: async (info:any) => {
        const data=await post(ONBOARDING_API_ENDPOINTS.VERIFY_MOBILE_OTP,info);
        return data;
      },
    getEmailOTP: async (type:any) => {
        const  data  = await get(ONBOARDING_API_ENDPOINTS.GET_EMAIL_OTP(type));
        return data;
      },
      sendEmailOTP: async () => {
        const data = await post(ONBOARDING_API_ENDPOINTS.SEND_EMAIL_OTP, null);
        return data;
      },

      getEmailOTPVerification: async (code:any) => {
        const  data  = await post(ONBOARDING_API_ENDPOINTS.VERIFY_EMAIL_OTP, code);
        return data;
      },
      v3resendVerifyMail: async (body:any) => {
        const data = await post(ONBOARDING_API_ENDPOINTS.V3_RESEND_VERIFY_MAIL,body)
        return data;
    },
  getMfaEnrollmentData: async (mfaToken: string) => {
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
  },
   getMfaEnrollmentApiCall: async (bady:any) => {
        const data = await post(ONBOARDING_API_ENDPOINTS.MFA_ASSOCIATE, bady);
        return data;
      },
  loginWithMFA: async (
    mfaToken: string,
    otpCode: string
  ) => {
    return await post(ONBOARDING_API_ENDPOINTS.MFA_TOKEN, {
      mfa_token: mfaToken,
      otp: otpCode,
    });
  },
    sumsubAccessToken: async (userid:string,levelName:string) => {
const  data=await get(ONBOARDING_API_ENDPOINTS.SUMSUB_ACCESS_TOKEN(userid, levelName));
return data;
    },
}
export default OnBoardingService;




















