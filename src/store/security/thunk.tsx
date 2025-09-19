import SecurityServices from "../../services/security";
import crashlytics from '@react-native-firebase/crashlytics';

export const changePassword = async (pass:any) => {
    try {
      const data = await SecurityServices.changePassword(pass);
      return data;
    } catch (error:any) {
      crashlytics().recordError(error);
      return {
        status: false,
      };
    }
  };