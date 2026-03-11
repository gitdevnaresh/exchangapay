
import { get,post } from '../utils/ApiService';

const OnBoardingService = {
    resendVerifyMail: async () => {
        const data = await get(`api/v1/Customer/VerifyEmail`)
        return data;
    },
    saveUserInfo: async (info:any,accType?:string) => {
        const data = await post(`api/v1/customers/register/${accType}`,info)
        return data;
    },
    verifyMobileCode: async (otp:any,CustomerId:string) => {
        const data = await get(`api/v1/Security/PhoneVerification/${CustomerId}/${otp}`,)
        return data;
    },
    sendMobileCode: async () => {
        const data = await post(`api/v1/confirmations/phone/send`,null)

        return data;
    },
    neoMobileVersioncheck: async () => {
        const data = await get(`api/v1/Common/AppVersions/NeoMobileBank`)
        return data;
    },
    sumsubToken: async (userid:string) => {
        const data = await get(`api/v1/Sumsub/AccessToken1?applicantId=${userid}&levelName=basic-kyc`)
        return data;
    },
    getOTP: async (CustomerId:any, type:any) => {
        const  data  = await get(`api/v1/Security/SendOTP/${CustomerId}/${type}`);
        return data;
      },
      getOTPVerification: async (info:any) => {
        const data=await post(`api/v1/confirmations/phone/verify`,info);
        return data;
      },
    getEmailOTP: async (type:any) => {
        const  data  = await get(`api/v1/ExchangeWallet/SendEmailOTP/${type}`);
        return data;
      },
      getEmailOTPVerification: async (code:any) => {
        const  data  = await get(`api/v1/ExchangeWallet/EmailOTPVerification/${code}`);
        return data;
      },
      v3resendVerifyMail: async (body:any) => {
        const data = await post(`api/v1/verifications/email/resend`,body)
        return data;
    },
}
export default OnBoardingService;




















