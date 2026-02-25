export interface CardTopUpList {
  programId: string,
  amount: number | string | null,
  cryptoWalletId: string,
  concurrencyStamp: string,
}
export interface CardWithdarwList {
  // programId: string,
  amount: number | string | null,
  // cryptoWalletId:string,
  // concurrencyStamp: string,
  cardId: string,
}
export interface AssignCardObj {
  programId: string | number;
  employeeId: number | string;
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
  image: string;
  number: string;
  reMarks: string | null;
  status: string;
  type: string;
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
export interface KycDetails {
    customerId: string;
    cardId: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
    town: string;
    idType: string;
    idNumber: string;
    profilePicFront: string;
    profilePicBack: string;
    signature: string;
    docExpiryDate: string;
    docIssueDate: string;
    dob: string;
    biometric: string;
    backDocImage: string;
    gender: string;
    kycRequirements: string;
    email: string;
    mobileCode: string;
    mobile: string;
    faceImage: string;
    handHoldingIDPhoto: string;
    emergencyContactName: string;
    postalCode: string;
    cardHandHoldingIDPhoto: string;
    occupation: string;
    ipAddress: string;
    annualSalary: number;
    accountPurpose: string;
    expectedMonthlyVolume: number;
    addressId?: string;
}
export interface ApplyCardData {
    KycUpdateModel?: KycDetails;

}
export interface UserDetailsInfo {
    id: string;
    userName: string;
    kycStatus: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | null;
    country: string;
    phoneNo: string;
    email: string; // This appears to be encrypted
    phonecode: string;
    accountType?: string | null;
}
export interface RootState {
    userReducer: {
        userDetails: UserDetailsInfo | null;
        applyCardData?: ApplyCardData | null;
        kycRequiredWhileApplyCard?: any;
        kybApplyCardData?: any;
        cardHolderStatusId?: string;
    };
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
export interface CardDetails {
  cardId: string;
  envelopeNumber: string | null;
  cardLastFourDigits: string;
  expiryDate: string;
  pin: string | null;
  activationCode: string | null;
  handHoldingIdPhoto: string | null;
}
