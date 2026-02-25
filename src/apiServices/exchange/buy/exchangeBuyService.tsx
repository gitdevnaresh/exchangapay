import { exchangeget, exchangepost } from "../../ApiService";
import { EXCHANGE_ENDPOINTS } from '../constants/exchangeConstants';

const ExchangeBuyService = {
  getSelecteMinMaxValue: async (cryptoCoin: string) => {
    return exchangeget(`${EXCHANGE_ENDPOINTS.BUY.MIN_MAX}/${cryptoCoin}`);
  },
  
  getsummaryDetails: async (payload: any) => {
    return exchangepost(EXCHANGE_ENDPOINTS.BUY.FEE, payload);
  },
  
  buysavesucess: async (payload: any) => {
    return exchangepost(EXCHANGE_ENDPOINTS.BUY.EXECUTE, payload);
  }
};

export default ExchangeBuyService;