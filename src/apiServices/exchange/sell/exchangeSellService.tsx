import { exchangeget, exchangepost } from "../../ApiService";
import { EXCHANGE_ENDPOINTS } from '../constants/exchangeConstants';

const ExchangeSellService = {
  getSelectedsellCryptoBalance: async () => {
    return exchangeget(EXCHANGE_ENDPOINTS.COMMON.SELL_BALANCES);
  },
  
  getSelectesSellMinMaxValue: async (cryptoCoin: string) => {
    return exchangeget(`${EXCHANGE_ENDPOINTS.SELL.MIN_MAX}/${cryptoCoin}`);
  },
  
  getsummarysellDetails: async (payload: any) => {
    return exchangepost(EXCHANGE_ENDPOINTS.SELL.FEE, payload);
  },
  
  sellSavsucess: async (payload: any) => {
    return exchangepost(EXCHANGE_ENDPOINTS.SELL.EXECUTE, payload);
  }
};

export default ExchangeSellService;