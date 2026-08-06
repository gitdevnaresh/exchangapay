import { get } from "../utils/ApiService";

// N-01: this module ran entirely on `api` from utils/api, whose host
// (neowalletapi.azurewebsites.net) is NXDOMAIN — every call here failed for as
// long as the host was hardcoded. Same paths, now on the live pinned host.
const SendServices =  {

    getSendListDetails : async (currency:any) => {
        return get(`api/v1/addressbook/PayeeLu/${currency}`);
      },
       fetchIBANDetails : async(iban:any) => {
        return get(`api/v1/Master/GetIBANAccountDetails?ibanNumber=${iban}`);
    }
}
export default SendServices;
