export interface Card {
  id: string;
  name: string;
  delivery: string;
  logo: string;
  locationApplied: string;
  cardAssoc: string;
  cardType: string;
  supportedFlatforms: string;
  createdDate: string;
  cardKycLevl: string;
  cardFee: number;
  cardCurrency: string;
}

export interface Card {
  id: string;
  name: string;
  delivery: string;
  logo: string;
  locationApplied: string;
  cardAssoc: string;
  cardType: string;
  supportedFlatforms: string;
  createdDate: string;
  cardKycLevl: string;
  cardFee: number;
  cardCurrency: string;
  town?: string; // Optional field for town
  isAskPersonalInfo?: boolean; // Optional field for isAskPersonalInfo
}

export interface Address {
  cardholderName: string;
  phoneNumber: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  town?: string; // Optional field for town
}