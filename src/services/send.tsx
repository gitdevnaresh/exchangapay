import { api } from "../utils/api";

const SendServices =  {

    getSendListDetails : async (currency:any) => {
        return api.get(`api/v1/addressbook/PayeeLu/${currency}`);
      },
       fetchIBANDetails : async(iban:any) => {
        return api.get(`api/v1/Master/GetIBANAccountDetails?ibanNumber=${iban}`);
    }
}
export default SendServices;
