import { authApi } from "../utils/api";
import { get, post } from "../utils/ApiService";
const AuthService = {
  getAccountInfo: async () => {
    const { data } = await authApi.get("/connect/userinfo");
    return data;
  },
  getMemberInfo: async () => {
    return await get(`api/v1/Registration/App/Exchange`);
  },
  getWeb3MemberInfo: async (address:any) => {
   return await get(`api/v1/Customer/customerCreation/${address}`);
   
  },
    loginLog: async (info:any) => {
      return post(`api/v1/Common/Login`,info);
    },
    logOutLog: async (info:any) => {
      return post(`api/v1/Common/Logout`,info);
    },
    getCustomerProfile:async(accountType:any)=>{
      return await get(`api/v1/customers/profile/${accountType}`);
    },
};

export default AuthService;
