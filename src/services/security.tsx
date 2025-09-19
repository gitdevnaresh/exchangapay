import { get } from "../utils/ApiService";
import { api, cardApi } from "../utils/api";
import crashlytics from '@react-native-firebase/crashlytics';
const SecurityService = {

  changePassword: async (pass: any) => {
    try {
      const data: any = await api.put(`api/v1/Customer/ChangePWD`, pass);
      return data;
    } catch (error: any) {
      crashlytics().recordError(error);
    }
  },
  getResetPassword: async () => {
    return get(`api/v1/Security/ResetPWD`);
  },

};
export default SecurityService;
