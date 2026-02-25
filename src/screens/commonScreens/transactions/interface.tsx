export interface StatusItem {
    name: string;
    code: string;
    logo: string | null;  // Can be null if there's no logo
    recorder: number;
}

export interface MemberShip {
    id: string;
    name: string;
    state: string;
  }


  export interface Transaction {
    name: string;
    txId: string;
    value: string;
    isCount: boolean;
    transactionId: string;
    transactionDate: string; 
    vaultCardName: string;
    transactionType: string;
    wallet: string | null;
    network?: string;  
    amount?: number;   
    state: string;     
    walletAddress: string | null; 
    fee?: string | null;  
    customerName: string;
    referralName: string;
  }
  
 
  export interface TransactionData {
    data: Transaction[];
  }

  export interface TransactionComponents {
  withdrawcrypto?: JSX.Element;
  withdrawfiat?: JSX.Element;
  depositfiat?: JSX.Element;
  depositcrypto?: JSX.Element;
  payincrypto?: JSX.Element;
  [key: string]: JSX.Element | undefined; // allows flexibility for future types
}