import { get } from "../ApiService";
import { ONBOARDING_API_ENDPOINTS } from './constants';



export const AuthService = {
    getMemberInfo: async () => {
        return await get(ONBOARDING_API_ENDPOINTS.GET_MEMBER_INFO);
      },
      getAccountInfo: async () => {
        return await get(ONBOARDING_API_ENDPOINTS.GET_ACCOUNT_INFO);
      },
    }