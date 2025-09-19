import { create } from "apisauce";
import { getTokenData } from "./helpers";
var access_token = null;
export const setToken = async () => {
  access_token = await getTokenData();
};
const transactionApi = create({
  baseURL: "https://neowalletgrid.azurewebsites.net/",
});
const transactionBankApi = create({
  baseURL: "https://neobank.azurewebsites.net/",
});
const authApi = create({
  baseURL: "https://tstlogin.suissebase.io",
});

const api = create({
  baseURL: "https://neowalletapi.azurewebsites.net/",
});
const uploadapi = create({
  baseURL: "https://api.exchangapay.com/",
});

const marketApi = create({
  baseURL: "https://api.coingecko.com/",
  headers: {},
});

const cardApi = create({
  baseURL: "https://api.exchangapay.com/",

});

const coingico = create({
  baseURL: "https://api.coingecko.com/api/v3/",

});
const memberInfoAPI = "https://api.exchangapay.com/api/v1/Registration/App/Exchange";
export { transactionApi, authApi, marketApi, api, transactionBankApi, cardApi, coingico, uploadapi, memberInfoAPI };