import { get } from '../utils/ApiService';
const DepositeService = {
  getDepositCurrecies: async () => {
    return get(`/api/v1/ExchangeWallet/Deposit/CryptoWallets`)
  },
   getDepositData: async (coin:string,network:string|undefined) => {
    return get(`/api/v1/ExchangeWallet/DepositCrypto/${coin}/${network}`)
  },
}
export default DepositeService;
