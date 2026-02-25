// Exchange API Types
export interface BuyPayload {
  fromAssetId?: string;
  fromAsset: string;
  fromValue: number;
  toAssetId?: string;
  toAsset: string;
  toValue: number;
}

export interface SellPayload {
  fromAssetId?: string;
  fromAsset: string;
  fromValue: number;
  toAssetId?: string;
  toAsset: string;
  toValue: number;
}

export interface ExchangeRateParams {
  fromAsset: string;
  toAsset: string;
  fromAssetValue: number;
  type: string;
}

export interface WalletSendPayload {
  customerId: string;
  coin: string;
  network: string;
  amount: number;
  address: string;
}

export interface CryptoPayeeParams {
  network: string;
  search?: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data: T;
  message?: string;
  status?: number;
}

export interface PaginationParams {
  pageNo: number;
  pageSize: number;
}

export interface GraphParams {
  days: number | string;
}