import { api,transactionBankApi } from "../utils/api";

const SendServices =  {

    getSendListDetails : async (currency:any) => {
        return api.get(`api/v1/addressbook/PayeeLu/${currency}`);
      },
      confirmAmountTransfer: async (body: any) => {
        return transactionBankApi.post('api/v1/Bank/Account/AccountDetails', body);
      },
      confirmTransfer: async (body: any) => {
        return transactionBankApi.post('api/v1/Bank/Account/AccountBalanceConfirm', body);
      },
      saveTransfer: async (body: any) => {
        return transactionBankApi.post('api/v1/Bank/Transfer', body);
      },
      saveAddressbookPayee: async (body: any)=>{
        return transactionBankApi.post('api/v1/addressbook/Payee', body);
      },
       fetchIBANDetails : async(iban:any) => {
        return api.get(`api/v1/Master/GetIBANAccountDetails?ibanNumber=${iban}`);
    }
}
export default SendServices;