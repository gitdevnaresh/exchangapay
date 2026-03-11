
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getAllEnvData } from "../../../Environment";

const GetToken = async () => {
  const token = await AsyncStorage.getItem('Token');
  return token;

};
const getUrl = (path: string) => {
  const envList = getAllEnvData('tst');
  return envList?.apiUrls[path];
}
const geAuthConfig = (path: string) => {
  const envList = getAllEnvData('tst');
  return envList?.oAuthConfig[path];
}
const baseURL = getUrl('apiUrl');
const issuerUrl = geAuthConfig('issuer');

export const api = axios.create({
    baseURL
  });
export const uploadapi = axios.create({
  baseURL
});
export const IdentityIssuer = axios.create({
  baseURL
});
const idenityIssuer = axios.create({
  baseURL: getUrl('apiUrls')?.loginPassServices,
  withCredentials: true,
});
api.interceptors.request.use(async (config: any) => {
    const token = await GetToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
    return config;
  });
  uploadapi.interceptors.request.use(async (config: any) => {
    const token = await GetToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
    return config;
  });
