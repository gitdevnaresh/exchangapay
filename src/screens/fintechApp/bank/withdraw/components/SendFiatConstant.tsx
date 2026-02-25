export const SEND_FIAT = {
  SEND: "Withdraw",
  ADD_NEW_RECIPIENT: "Add New Payee",
  SELECT_PAYEE: " Select Payee",
  ACCOUNT_ENDING_IN: "account ending with",
  YOU_SEND: "Enter Amount",
  YOU_HAVE: "You have",
  CONTINUE: "Continue",
  IN_YOUR_BALANCE: "in your account",
  PLEASE_ENTER_THE_AMOUNT: "Please enter the amount",
  INSUFICIENT_FUND: "Insuficient funds",
  SUMMARY: "Exchange Wallet Summary",
  WITHDRAW_SUMMARY: "Withdraw Summary",
  BANK_DETAILS_FOR: "bank details for",
  BANK_CODE: "Bnak code",
  ACCOUNT_NUMBER: "Account Number",
  EMAIL: "Email",
  YOUR_TRANSFER: "Your transfer",
  YOU_SENT: "You sent",
  TOTAL_FEES: "Total fees",
  GET_EXACTLLY: "get exactlly",
  RECIPIENT_DETAILS: "Recipient details",
  RECIPIENT_PHONE_NUMBER: "Recipient Phone Number *",
  RECIPIENT_PHONE_NUMBER_NON: "Recipient Phone Number",
  RECIPIENT_EMAIL: "Recipient Email *",
  RECIPIENT_EMAIL_NON: "Recipient Email",
  COUNTRY: "Country *",
  COUNTRY_NON: "Country",
  POSTAL_CODE: "Pin Code *",
  POSTAL_CODE_NON: "Pin Code *",
  CITY: "City ",
  CITY_NON: "City",
  STATE: "Select State ",
  STATE_NON: "State",
  SUCCESS: "Thank You",
  AMOUNT_SEND_SUCCESSFULLY: "Amount send Successfully",
  SEND_DETAILS_PAGE: "Send details page",
  BACK_TO_HOME: "Back to Crypto",
  PAYMENTSLINK: "Payments",
  SEND_DETAILS: "SendDetails",
  SEND_AMOUNT: "SendAmount",
  SEND_PAYEES: "Send",
  PLUSE: "plus",
  NEW: "NEW",
  TYPE_TO_SEARCH_FOR_PAYEE: "Type to search for payee",
  CHEVRON_RIGHT: "chevron-right",
  SEARCH_1: "search1",
  ADD_RECIPIENT: "AddRecipient",
  SEND_FIAT_PREVIEW: "sendFiatPreview",
  BEFORE_DISCOUNT_COMMISSION: 'Before Discount Commission',
  TIER_DISCOUNT: 'Tier Discount',
  CREDITS_USED: 'Digital Bank Credits Used',
  CHEVRON_DOWN: 'chevron-down',
  SUMMERY_DETAILS: "SummeryDetails",
  ADD_CONTACT: "Add Address",
  SELECT_ADDRESS: "Select Address",
  RECENT_ADDRESSES: "Recent Addresses",
  RECENT_PAYEES: "Recent Payees",
  ADD_PAYEE: "Add Payee",


};

export interface AddressLoadings {
  isPayeesLoading: boolean,
  isSelectedPayee: boolean,
};

export interface Payees {
  id: string,
  name: string,
  walletCode: string,
  netWork: string,
  createdDate: string,
  accoutNumber: string,
  bankName: string,
  address?: string,
  favoriteName:string
};

export interface PayeesList {
  payeesList: Payees[],
  payeesPrevList: Payees[]
};

export interface SummaryObj {
  customerId: string | undefined,
  amount: number | undefined,
  address: string | undefined,
  addressBookId: string | undefined,
  coin: string | undefined,
  currency: string | undefined,
  customerWalletId: string | undefined,
  merchantId: string | undefined,
  network: string | undefined,
}
export interface SummeyFiat {
  customerWalletId: string | undefined;
  amount: string | number | undefined;
  fiatCurrency: string | number | undefined;
};