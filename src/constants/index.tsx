// H-07: `StorageKey` held AsyncStorage keys for the access token, the refresh
// token and `keySK` — the personal-data encryption key. AsyncStorage is plain
// unencrypted storage, readable on any rooted device or via forensic
// extraction. The keys and their only consumer (src/utils/auth.tsx) are gone.
//
// Secrets go in the Keychain. The sanctioned paths are listed in
// src/utils/storage/storagePolicy.ts, which also enforces them at test time.
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

