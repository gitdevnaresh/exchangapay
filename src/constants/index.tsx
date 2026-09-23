// H-07: `StorageKey` held AsyncStorage keys for the access token, the refresh
// token and `keySK` — the personal-data encryption key. AsyncStorage is plain
// unencrypted storage, readable on any rooted device or via forensic
// extraction. The keys and their only consumer (src/utils/auth.tsx) are gone.
//
// Secrets go in the Keychain. The sanctioned paths are listed in
// src/utils/storage/storagePolicy.ts, which also enforces them at test time.
// Remote brand assets. `swokistoragespace` was deleted (NXDOMAIN) and took
// every icon hosted on it down; `prdexchangapaystorage` is the live account.
// One base constant, so the next host change is a one-line edit.
export const REMOTE_ASSET_BASE =
  'https://prdexchangapaystorage.blob.core.windows.net/images';

export const REMOTE_ASSETS = {
  logoOrange: `${REMOTE_ASSET_BASE}/logox_orange.svg`,
  logoWhite: `${REMOTE_ASSET_BASE}/logox_white.svg`,
  send: `${REMOTE_ASSET_BASE}/send.svg`,
  withdraw: `${REMOTE_ASSET_BASE}/withdraw.svg`,
  notifications: `${REMOTE_ASSET_BASE}/Notifications-icon.svg`,
  cardHolding: `${REMOTE_ASSET_BASE}/card_holding.svg`,
  cardOrange: `${REMOTE_ASSET_BASE}/card_orange.svg`,
  pinShow: `${REMOTE_ASSET_BASE}/pinshow.svg`,
  success: `${REMOTE_ASSET_BASE}/success_image.png`,
  upload: `${REMOTE_ASSET_BASE}/upload.svg`,
  uploadIcon: `${REMOTE_ASSET_BASE}/uploadicon.svg`,
  usdt: `${REMOTE_ASSET_BASE}/usdt.svg`,
  usdc: `${REMOTE_ASSET_BASE}/usdc.svg`,
};

export const RequestStatus = {
  idle: 'idle',
  pending: 'pending',
  fulfilled: 'fulfilled',
  rejected: 'rejected',
};
export const CurrencySymbols = {
  USD: '$', // US Dollar
  EUR: '€', // Euro
  CRC: '₡', // Costa Rican Colón
  GBP: '£', // British Pound Sterling
  ILS: '₪', // Israeli New Sheqel
  INR: '₹', // Indian Rupee
  JPY: '¥', // Japanese Yen
  KRW: '₩', // South Korean Won
  NGN: '₦', // Nigerian Naira
  PHP: '₱', // Philippine Peso
  PLN: 'zł', // Polish Zloty
  PYG: '₲', // Paraguayan Guarani
  THB: '฿', // Thai Baht
  UAH: '₴', // Ukrainian Hryvnia
  VND: '₫', // Vietnamese Dong
};

