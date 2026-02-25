export interface PayeeDetails {
    accNoorWalletAddress: string;  
    appName: string | null;       
    asset: string;             
    bankName: string | null;       
    caseIds: string | null;       
    createdDate: string;          
    customerId: string | null;    
    favouriteName: string;     
    id: string;                   
    logo: string;               
    name: string | null;          
    network: string | null;       
    reasonForRejection: string | null; 
    routingNumber: string | null;    
    status: string;               
    transferType: string | null;     
    type: string | null;            
    whiteListStatus: string;
    isEditable?: boolean;        
  }