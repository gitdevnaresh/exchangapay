export interface CardTopUpList {
  programId: string,
  amount: number | string | null,
  cryptoWalletId: string,
}
export interface CardList {
  adminState: string | null;
  amount: number;
  assignedTo: string | null;
  cardName: string;
  createdDate: string;
  currency: string;
  customerId: string | null;
  customerName: string | null;
  id: string;
  logo: string;
  number: string;
  reMarks: string | null;
  status: string;
  type: string;
  assoc?: string;
  lable?: string;
}
export interface ApplyCardInfo {

  id: string,
  cardTypeId: string,
  logo: string,
  name: string,
  currencyType: string,
  bin: string,
  assoc: string,
  cardType: string,
  isoCountryName: string,
  rechargeFeeMin: number,
  rechargeFeeMax: number,
  atMwithdrawalFeeMin: number,
  atMwithdrawalFeeMax: number,
  maintainaceFee: number,
  atmBalanceinquiryFee: number | null,
  nonEEAConsumptionFee: number,
  accountBalanceLimit: number,
  monthlyRecharge: number,
  dailyRecharge: number,
  dailyPaymentLimit: number,
  atmWithdrawalLimit: number,
  cardCurrency: string,
  commissionCardUsingFee: number,
  exchangeIssuingFee: number,
  consumptionMethod: string,
  depositedFeeRate: number,
  spendingLimit: number,
  reviewTime: string,
  appiled: null,
  createdDate: string,
  note: string,
  addressType: number | null,
  feeCurrency: string,
  status: number | null,
  freightFee: 10,
  amountInPaid: number | null,
  estimatedPaymentAmount: number | null,
  isKycRequired: boolean,
  rules: any[],
  kycRequirements: string,
}

export interface ApplyCardList {

  name: string,
  value: string,
}
export interface NewCardFeeInfo {

  amountPaid: number,
  issuingFee: number,
  freightFee: number,
  paymentCurrency: string,
  estimatedPaymentAmount: number,
  cardType: string,
  envelopeNoRequired: any,
  needPhotoForActiveCard: any,
  additionaldocForActiveCard: any,
  firstRecharge: any,
  cardCurrency: any,

}

export interface CardSaveObj {
  customerId: string,
  cardId: string,
  personalAddressId: string,
  cryptoWalletId: string,
  paidCurrency: string,
  paidNetwork: string,
  iHaveCard: boolean,
  envelopeNumber: string,
  cardNumber: string,
  handHoldIdPhoto: string


}

export interface AssignCardObj {
  cardId: string | number;
  customerId: string | number;
  employeeId: number | string;
}
export interface SelectedEmployee {
  id: string;
  name: string;
}

export interface FreezeUnFreezeProps {
  FreezeUnFreezeRef?: any;
  activeCardDetails?: any;
  UnFreezeRef?: any;
  selectedAction?: any;
  onFreezeSuccess?: () => void;
  deleteCardRef?: any;
  onActionComplete?: any;
  activeCard?: any;
  deleteCardData?: any;
  deleteCardInfoLoader?: any;
  onError?: (error: string) => void;
  handleClose?: () => void;
}
export interface CardStatus {
  id: string;
  status: number;
  actionBy: string;
  signImage: string;
  createdBy: string; // ISO date string
}

export interface CardLimitUpdatePayload {
  cardId: string;
  limit: number;
  modifiedBy: string;
}
export const CARD_FEATURES_VIEW_MODEL = {
  quickLinks: [
    {
      id: "view",
      key: "CARD_VIEW",
      quickLink: "View",
      isDisplay: true,
      details: [],
    },
    {
      id: "freeze",
      key: "CARD_FREEZE",
      quickLink: "Freeze",
      isDisplay: true,
      details: [],
    },
    {
      id: "limit",
      key: "CARD_LIMIT",
      quickLink: "Limit",
      isDisplay: true,
      details: [],
    },
    {
      id: "settings",
      key: "CARD_SETTINGS",
      quickLink: "Settings",
      isDisplay: true,
      details: [
        {
          id: "security",
          key: "CARD_SECURITY",
          title: "Security Settings",
          isDisplay: true,
        },
        {
          id: "billing",
          key: "CARD_BILLING",
          title: "Change Billing Address",
          isDisplay: true,
        },
        {
          id: "replace",
          key: "CARD_REPLACE",
          title: "Replace Card",
          isDisplay: true,
        },
        {
          id: "delete",
          key: "CARD_DELETE",
          title: "Delete Card",
          isDisplay: true,
        },
      ],
    },
    {
      id: "topup",
      key: "CARD_TOPUP",
      quickLink: "TopUp",
      isDisplay: true,
      details: [],
    },
  ],
};

