import { bankget } from '../../ApiService';
import { BANK_ENDPOINTS } from '../constants/bankConstants';

const BankKybService = {
  kybInfoDetails: async (programId: string) => {
    return bankget(`${BANK_ENDPOINTS.KYB.REQUIREMENTS}/${programId}/kycrequirements`);
  },
  
  getSelectedUboDetails: async (programId: string) => {
    return bankget(`${BANK_ENDPOINTS.KYB.UBO_DETAILS}?id=${programId}`);
  },
  
  getSectorsLu: async () => {
    return bankget(BANK_ENDPOINTS.KYB.SECTORS);
  },
  
  gettypesLu: async () => {
    return bankget(BANK_ENDPOINTS.KYB.TYPES);
  },
  
  getbeneficiaryTypeDetails: async (type: string) => {
    return bankget(`${BANK_ENDPOINTS.KYB.BENEFICIARIES}?beneficiaryType=${type}`);
  },
  
  getDynamicpaymentSchemeLookup: async (currency: string, selectedPayeeId: string) => {
    return bankget(BANK_ENDPOINTS.COMMON.PAYMENT_SCHEME(currency, selectedPayeeId));
  }
};

export default BankKybService;