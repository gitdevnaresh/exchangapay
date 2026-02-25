import BankAccountService from './account/bankAccountService';
import BankKybService from './kyb/bankKybService';
import BankCommonService from './common/bankCommonService';

// Combined service that maintains backward compatibility
const BankServices = {
  // Account services
  ...BankAccountService,
  
  // KYB services  
  ...BankKybService,
  
  // Common services
  ...BankCommonService
};

export default BankServices;

// Export individual services for modular usage
export {
  BankAccountService,
  BankKybService,
  BankCommonService
};