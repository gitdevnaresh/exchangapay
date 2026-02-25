import { get } from "../ApiService";

export const AppVersions = {
    getAppVersions: async () => {
      return await get(`api/v1/MobileVersion/Cards`);
    },

}
export default AppVersions