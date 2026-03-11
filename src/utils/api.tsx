import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "apisauce";
import { getTokenData } from "./helpers";
var access_token = null;
export const setToken = async () => {
  access_token = await getTokenData();
};
const transactionApi = create({
  baseURL: "https://digitalbankapi.azurewebsites.net/",
});
const transactionBankApi = create({
  baseURL: "https://digitalbankapi.azurewebsites.net/",
});
const authApi = create({
  baseURL: "https://tstlogin.suissebase.io",
});

const api = create({
  baseURL: "https://digitalbankapi.azurewebsites.net/",
});
const uploadapi = create({
  baseURL: "https://digitalbankapi.azurewebsites.net/",
});

const marketApi = create({
  baseURL: "https://api.coingecko.com/",
  headers: {},
});

const cardApi = create({
  baseURL: "https://digitalbankapi.azurewebsites.net/",
  
});

const coingico = create({
  baseURL: "https://api.coingecko.com/api/v3/",
  
});

export { transactionApi, authApi, marketApi, api, transactionBankApi, cardApi, coingico,uploadapi };