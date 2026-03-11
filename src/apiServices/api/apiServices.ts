import { getAllEnvData } from "../../../Environment";
import { api, uploadapi } from "./api";

export const get = async (url: string) => {
    return api.get(url);
  };
  
  export const post = async (url: string, data: any) => {
    return api.post(url, data);
  };
  
  export const put = async (url: string, data?: any) => {
    return api.put(url, data);
  };
  
  export const remove = (url: string, data: any) => {
    return api.delete(url, data);
  };
  export const fileget = async (url: string) => {
    return uploadapi.get(url);
  };
  
  export const filepost = async (url: string, data: any) => {
    return uploadapi.post(url, data);
  };
  
  export const fileput = async (url: string, data: any) => {
    return uploadapi.put(url, data);
  };
  
  export const fileremove = (url: string, data: any) => {
    return uploadapi.delete(url, data);
  };
  
  const getLoginData = (username:string, password:string) => {
    const { oAuthConfig } = getAllEnvData('tst');
    const formData = {
      grant_type: 'password',
      scope: oAuthConfig.scope,
      username: username,
      password: password,
      client_id: oAuthConfig.clientId,
    };
  
    if (oAuthConfig.clientSecret) formData['client_secret'] = oAuthConfig.clientSecret;
  
    return Object.entries(formData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  };