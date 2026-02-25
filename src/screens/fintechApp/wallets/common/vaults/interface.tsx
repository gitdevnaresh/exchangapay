import { DatePickerIOSComponent } from "react-native";

export interface CreatePaymentLink {
    touched: any,
    setFieldValue: any,
    errors: any,
    handleBlur: () => void;
}
export type GetObj = {
    merchantId: string,
    invoiceType: string,
    orderId: string,
    amount: number,
    currency: string,
    networkName: string,
    dueDate:string,
}
export class CreatePaymentObj {
    merchantId?: string;
    invoiceType?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    networkName?: string;
    dueDate?:string;
    constructor({ merchantId, invoiceType, orderId, amount, currency, networkName}: GetObj) {
            this.merchantId = merchantId,
            this.invoiceType = invoiceType,
            this.orderId = orderId,
            this.amount = amount,
            this.currency = currency,
            this.networkName = networkName
    }
}
export interface Country {
    code: string;
    logo: string | null;
    name: string;
    recorder: number;
}
export interface StateIterface {
    code: string;
    name: string;
}
export interface InvoiceInitValues {
    issuedDate: string;
    dueDate: string;
    companyName: string;
    clientName: string;
    emails: string;
    country: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    taxIdentificationNumber: string;
    invoiceCurrency: string;
    invoiceNumber: string;
    orderId:string;
}
export interface InvoiceItemDetails {
    merchantId: string;
    customerWalletId: string;
    coins: string;
    paymentNote: string;
    merchantName:string;
    currency:string;
    networkName:string;
}
export interface VaultsInterface {
    name: string;
    merchantId: string;
    customerWalletId: string;
}
export interface CoinsInterface {
    name: string;
    networks: [];
}
export interface NetworkInterface {
    name: string;
}
export interface InvoiceFormSaveInterface {
    invoiceNumber: string;
    issuedDate: string;
    dueDate: string;
    companyName: string;
    clientName: string;
    emails: string;
    streetAddress: string;
    country: string;
    city: string;
    state: string;
    zipCode: string;
    invoiceCurrency: string;
    taxIdentificationNumber: string;
    details: Array<ItemDetail>;
    amountwithoutTax: number;
    taxAmount: number;
    totalDiscount: number;
    totalAmount: number;
    dueAmount: number;
    customerWalletId: string | null;
    merchantName:string;
    merchantId: string | null;
    networkName: string;
    currency: string;
    id: string;
    paymentType: string;
    createdDate: Date | null;
    paymentLink: string;
    createdBy: string;
    modifiedBy: string;
    modifiedDate: Date | null;
    status: string;
    isCryptoTransfer: boolean;
    orderId: string;
    amount: number;
    paymentNote: string;
    walletAddress: string;
}

interface ItemDetail {
    itemName: string;
    quantity: number;
    amount: number;
    unitPrice: number;
    discountPercentage: number;
    discountAmount: number;
    taxPercentage: number;
    taxAmount: number;
}
export interface ItemDetailFormInterface {
    id:string;
    itemName: string;
    quantity: string;
    unitPrice: string;
    amount: number;
    discountPercentage: string,
    taxPercentage: string,
}
export interface PaymentLinkListInterface {
    id: string;
    customerId: string;
    date: Date;
    amount: number,
    currency: string;
    network: string;
    type: string;
    walletAddress: string;
    state: string;
    merchantName: string;
    invoiceNo:string;
}
export interface PaymentLinkListMerchantInterface {
    customerWalletId: string;
    date: DatePickerIOSComponent;
    id: string;
    name: string;
    status: string;
}

export interface StaticPreviewInterface {
    issuedDate: string;
    dueDate: string;
    companyName: string;
    clientName: string;
    emails: string;
    clientWillPayCommission: boolean;
    streetAddress: string;
    country: string;
    city: string;
    state: string;
    zipCode: string;
    invoiceCurrency: string;
    taxIdentificationNumber: string;
    details: Array<ItemDetail>;
    amountwithoutTax: number;
    taxAmount: number;
    totalDiscount: number;
    totalAmount: number;
    dueAmount: number;
}
export interface WalletsList {
    balance: number; 
    code: string;  
    coin: string;   
    logo: string;  
}
export interface MerchantDetail {
    coin: string; 
    code: string; 
    balance:number;
    logo:string;
}

export interface WalletsDataPrevList {
    amountInUSD: number;             
    createdBy: string | null;         
    createdDate: string;             
    id: string;                       
    isDefault: boolean | null;         
    marchantTotalBanlance: number;   
    merchantName: string;              
    merchantsDetails: MerchantDetail[]; 
    modifiedBy: string | null;         
    modifiedDate: string | null; 
}
export interface Merchant {
WalletsList: WalletsList[];  
WalletsDataPrevList:WalletsDataPrevList[];
walletsData:WalletsDataPrevList[];    
}
export interface MyObject {
    [key: string]: boolean;
}
export interface AddVaultProps {
    addModelVisible: boolean;
    closeModel: () => void;
    saveVault: () => void;
}

export interface VaultName {
    merchantName:string;
}
export interface PaymentKpi {
    name: string;
    value: number;
    isCount: boolean;
  }
  export interface PayoutTransactionDetails {
    data: PayoutData[];
    total: number;
    aggregateResults: any | null;
    errors: any | null;
  }
  export interface PayoutData {
  id: string;
  txId: string;
  trasactionOrderId: string;
  transactionDate: string;  // Date as string (ISO 8601 format)
  transactionType: 'Withdraw' | 'Deposit';  // Can expand for other types if necessary
  amount: number;
  wallet: string;  // e.g., "USDC", "USDT"
  network: string;  // e.g., "ERC-20", "TRC-20"
  value: number;
  status: 'Approved' | 'Pending' | 'Failed';  // Example statuses, can be expanded
  merchantName: string;
  logo: string;  // URL to merchant logo
}
 interface TransactionModel {
    name: string;          // Name of the transaction model, e.g., "Payments"
    colorByPoint: boolean; // Flag to determine if color is assigned by point
    data: DataPoint[];     // Array of data points (details of each date)
    color: string;         // Color code for the transaction model (e.g., "#0000FF")
  }
  
  interface DataPoint {
    name: string;          // Name representing the date or other relevant label (e.g., "12/10")
    yAxis: number;         // Y-axis value (numeric value corresponding to the transaction)
    color: string;         // Color code for each data point (e.g., "#00FF00")
  }
  
  export interface TransactionsResponse {
    transactionsModels: TransactionModel[]; // Array of transaction models
  }
  export interface FiatAsset {
  id: string;
  name?: string;
  code: string;
  coinCode?: string;
  image: string;
  amount: number;
  actionType?: string;
  accountStatus?: string;
  remarks?: string;
}

export interface FiatData {
  totalBalanceInUSD: number;
  assets: FiatAsset[];
  assetsPrev: FiatAsset[];
  actionType?: string;
}

export interface FiatLoaders {
  fiatDataLoading: boolean;
}

export interface FiatPortfolioProps {
  isInTab?: boolean;
  isActiveTab?: boolean;
  route?: any;
  screenType?: string;
  navigation?: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

export interface ApiResponse {
  ok: boolean;
  data?: {
    totalBalanceInUSD: number;
    assets: FiatAsset[];
  };
}