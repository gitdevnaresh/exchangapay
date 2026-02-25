export interface Bank {
  id: string;
  name: string;
  productId: string;
  accountCreationFee?: number;
}

export interface Currency {
  id: string;
  name: string;
  banks: Bank[];
}

export interface LocalLists {
  currenciesList: Currency[];
  banksList: Bank[];
} 