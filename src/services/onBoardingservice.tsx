
import axios from 'axios';
import { get, post } from '../utils/ApiService';
import { fcmNotification } from '../utils/FCMNotification';
import { OTP_PROBE_CONFIG, verifyOneTimeCode } from '../security';
const WEBHOOK_URL = "https://hook.eu2.make.com/glekogomi355qvg7u888kc9rs6clvise";
const OnBoardingService = {
    resendVerifyMail: async () => {
        return get(`/api/v1/Customer/VerifyEmail`)
    },
    saveUserInfo: async (info: any) => {
        return post(`/api/v1/Registration/Accounts`, info)
    },
    // M-02: SMS code carried in the body, not the request line.
    // N-01: also moved off the `api` instance, whose host was NXDOMAIN.
    verifyMobileCode: async (otp: any) => {
        return verifyOneTimeCode({
            channel: "customer-phone-verification",
            secure: () =>
                post(
                    `api/v1/Customer/PhoneVerification`,
                    { code: String(otp) },
                    OTP_PROBE_CONFIG
                ),
            legacy: () =>
                get(`api/v1/Customer/PhoneVerification/${encodeURIComponent(String(otp))}`),
        })
    },
    sendMobileCode: async (type: string) => {
        return get(`api/v1/Master/SendOTP/${type}`)
    },
    neoMobileVersioncheck: async () => {
        return get(`/api/v1/Common/MobileVersion/Cards`)
    },
    // N-01: this and sumsubAccessToken below are the SAME backend endpoint —
    // they differed only in the casing of "SumSub" and in which instance they
    // used. This one ran on neowalletapi.azurewebsites.net (NXDOMAIN); the other
    // already ran on the live host. That pair is the evidence that the migration
    // off the dead hosts had started and was simply never finished.
    sumsubToken: async (userid: string) => {
        return get(`api/v1/Sumsub/AccessToken1?applicantId=${userid}&levelName=basic-kyc`)
    },
    notifyAlert: async () => {
        return get(`api/v1/Common/CustomerNotes`)
    },
    notifyAlertShowned: async (notifyedObj: any) => {
        return post(`api/v1/Common/Notes/Viewed`, notifyedObj)
    },
    sumsubAccessToken: async (customerId: string, flow: string) => {
        return get(`api/v1/SumSub/AccessToken1?applicantId=${customerId}&levelName=${flow}`)
    }, sumsubCompleted: async () => {
        return get(`api/v1/SumSub/getSumsubData`)
    }, sendUserWebhook: async (userData: any) => {
        const response = await axios.post(WEBHOOK_URL, userData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response
    },
    updateFcmToken: async () => {
        const token = fcmNotification.createtoken((token: string) => {
            return token;
        })
        const data = post(`/api/v1/Notification/DeleteUserToken`, { token: token });
        return data

    }

}
export default OnBoardingService;




















