import { bankget, get } from '../ApiService';

const TransferService = {
  getTransferDetails: async (id: any) => {
    const data = await get(`api/v1/Common/Payee/fiat/${id}`);
    return data;
  },
}
export default TransferService;

export const bankService = {
  getBanks: async (currency: any) => {
    const data = await bankget(`/api/v1/accounts/${currency}?type=deposit`);
    return data;
  },
  getWalletsBanks: async (currency: any) => {
    const data = await get(`/api/v1/wallets/${currency}/fiat/bank/deposit`);
    return data;
  },
    getFiatVaultsList: async() => {
         const data = await  get('api/v1/Wallets/fiat')
       return data;
    },
}





