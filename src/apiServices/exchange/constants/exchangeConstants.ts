// Exchange API Endpoints - Only used endpoints
export const EXCHANGE_ENDPOINTS = {
  // Buy endpoints
  BUY: {
    MIN_MAX: '/api/v1/assets/buy',
    FEE: 'api/v1/asset/buy/fee',
    EXECUTE: 'api/v1/buy'
  },
  
  // Sell endpoints
  SELL: {
    MIN_MAX: '/api/v1/assets/sell',
    FEE: 'api/v1/asset/sell/fee',
    EXECUTE: 'api/v1/sell'
  },
  
  // Common endpoints
  COMMON: {
    ASSETS: '/api/v1/assets',
    BUY_BALANCES: '/api/v1/assets/buy/balances',
    SELL_BALANCES: '/api/v1/assets/sell/balances',
    EXCHANGE_RATE: '/api/v1/asset/ExchangeRate',
    KPI: 'api/v1/exchange/kpi',
    GRAPH: 'api/v1/summary/transactions'
  },
  
  // Wallet endpoints
  WALLET: {
    ASSETS: 'api/v1/Wallets',
    VAULTS: '/api/v1/Vaults/wallets',
    CRYPTO_PAYEES: 'api/v1/payees/crypto',
    WITHDRAW_FEE: 'api/v1/withdraw/crypto/fee'
  }
};

// Action types
export const ACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw'
};