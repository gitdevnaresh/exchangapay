
import axios from 'axios';
import { get, post, remove } from '../utils/ApiService';
import { api } from '../utils/api';
import { fcmNotification } from '../utils/FCMNotification';
const WEBHOOK_URL = "https://hook.eu2.make.com/glekogomi355qvg7u888kc9rs6clvise";
const OnBoardingService = {
    resendVerifyMail: async () => {
        return get(`/api/v1/Customer/VerifyEmail`)
    },
    saveUserInfo: async (info: any) => {
        return post(`/api/v1/Registration/Accounts`, info)
    },
    verifyMobileCode: async (otp: any) => {
        return api.get(`api/v1/Customer/PhoneVerification/${otp}`,)
    },
    sendMobileCode: async (type: string) => {
        return api.get(`api/v1/Master/SendOTP/${type}`)
    },
    neoMobileVersioncheck: async () => {
        return get(`/api/v1/Common/MobileVersion/Cards`)
    },
    sumsubToken: async (userid: string) => {
        return api.get(`api/v1/Sumsub/AccessToken1?applicantId=${userid}&levelName=basic-kyc`)
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
        const data = remove(`/api/v1/Notification/DeleteUserToken`, { token: token });
        return data

    }

}
export default OnBoardingService;




















