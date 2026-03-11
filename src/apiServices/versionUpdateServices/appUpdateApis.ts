import { get } from "../../utils/ApiService";

export const AppVersions = {
    getAppVersions: async () => {
      return await get(`api/v1/Common/MobileVersion/Cards`);
    },

}
export default AppVersions