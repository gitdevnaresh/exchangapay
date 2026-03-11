import { get } from '../utils/ApiService';

const TransferService = {
  getTransferDetails: async (id: any) => {
    const data = await get(`api/v1/Common/Payee/fiat/${id}`);
    return data;
  },
}
export default TransferService;
export const bankService = {
  getBanks: async (customerId: any, currency: any, appName: any, type: any) => {
    const data = await get(`api/v1/Customer/Bank/BanksLu/${customerId}/${currency}/${appName}/${type}`);
    return data;
  },
}
export const bankDetailsService = {
  getBankDetails: async (currency: any, customerId: any) => {
    const data = await get(`api/v1/Customer/AccountDetails/${currency}/${customerId}`);
    return data;
  },
}




