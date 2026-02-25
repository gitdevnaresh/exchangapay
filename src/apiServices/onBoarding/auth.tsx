import { authApi } from "../../utils/api";
import { get, post, put } from "../ApiService";
import { ONBOARDING_API_ENDPOINTS } from './constants';
const AuthService = {
  getAccountInfo: async () => {
    const { data } = await authApi.get(ONBOARDING_API_ENDPOINTS.GET_ACCOUNT_INFO);
    return data;
  },
  getMemberInfo: async () => {
    return await get(ONBOARDING_API_ENDPOINTS.GET_CUSTOMER);
  },
  getWeb3MemberInfo: async (address: any) => {
    return await get(ONBOARDING_API_ENDPOINTS.GET_WEB3_MEMBER_INFO(address));
  },
  loginLog: async (info: any) => {
    return post(ONBOARDING_API_ENDPOINTS.LOGIN_LOG, info);
  },
  logOutLog: async (info: any) => {
    return post(ONBOARDING_API_ENDPOINTS.LOGOUT_LOG, info);
  },
  getCustomerProfile: async (accountType: any) => {
    return await get(ONBOARDING_API_ENDPOINTS.GET_CUSTOMER_PROFILE(accountType));
  },
  getMenuItems: async () => {
    return await get(ONBOARDING_API_ENDPOINTS.GET_MENU_ITEMS);
  },
  updateBusinessLogo: async (info: any) => {
    return put(ONBOARDING_API_ENDPOINTS.UPDATE_BUSINESS_LOGO, info);
  },
  getBusinessWebUrl: async (application: any) => {
    return get(ONBOARDING_API_ENDPOINTS.GET_BUSINESS_WEB_URL(application));
  },
   getReferralCode: async (body: any) => {
    return post(`/api/v1/referrals/verify`, body);
  },
};

export default AuthService;
