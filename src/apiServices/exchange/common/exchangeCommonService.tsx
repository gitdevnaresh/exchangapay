import { exchangeget } from "../../ApiService";
import { EXCHANGE_ENDPOINTS } from '../constants/exchangeConstants';

const ExchangeCommonService = {
  getexchangeCryptoList: async (pageNo: number, pageSize: number) => {
    return exchangeget(`${EXCHANGE_ENDPOINTS.COMMON.ASSETS}?pageNo=${pageNo}&pageSize=${pageSize}`);
  },
  
  getSelecteCryptoBalance: async () => {
    return exchangeget(EXCHANGE_ENDPOINTS.COMMON.BUY_BALANCES);
  },
  

  
  getEnteredCryptoFiatValue: async (fromAsset: string, toAsset: string, fromAssetValue: number, type: string) => {
    return exchangeget(`${EXCHANGE_ENDPOINTS.COMMON.EXCHANGE_RATE}/${fromAsset}/${toAsset}?fromAssetValue=${fromAssetValue}&type=${type}`);
  },
  
  getTotalFiatandCryptoBalances: async () => {
    return exchangeget(EXCHANGE_ENDPOINTS.COMMON.KPI);
  },
  
  getExchangeGraph: async (days: number | string) => {
    return exchangeget(`${EXCHANGE_ENDPOINTS.COMMON.GRAPH}?days=${days}`);
  }
};

export default ExchangeCommonService;