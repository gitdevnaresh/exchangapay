import ExchangeBuyService from './buy/exchangeBuyService';
import ExchangeSellService from './services/sell/exchangeSellService';
import ExchangeCommonService from './services/common/exchangeCommonService';
import ExchangeWalletService from './services/common/exchangeWalletService';

// Combined service that maintains backward compatibility
const ExchangeServices = {
  // Buy services
  ...ExchangeBuyService,
  
  // Sell services
  ...ExchangeSellService,
  
  // Common services
  ...ExchangeCommonService,
  
  // Wallet services
  ...ExchangeWalletService
};

export default ExchangeServices;

// Export individual services for modular usage
export {
  ExchangeBuyService,
  ExchangeSellService,
  ExchangeCommonService,
  ExchangeWalletService
};