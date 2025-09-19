import { get, post, put } from "../utils/ApiService";
const CardsModuleService = {
  getCardBalance: async (id: any) => {
    return get(`api/v1/Cards/cardbalance/${id}`);
  },
  getAllCards: async (id: any) => {
    return get(`api/v1/Cards/GetAllCards/${id}`);
  },
  createCards: async (id: any, body: any) => {
    return post(`api/v1/Cards/CreateCards/${id}`, body);
  },
  saveCards: async (body: any) => {
    return post(`api/v1/Cards/TopupCard`, body);
  },
  getCardsById: async (customerId: any, cardId: any) => {
    return get(`api/v1/Cards/GetCardById/${customerId}/${cardId}`);
  },
  getFetchCVV: async (customerId: any, cardId: any) => {
    return get(`api/v1/Cards/FetchCVV/${customerId}/${cardId}`);
  },
  getFreezCard: async (body: any) => {
    return put(`api/v1/Cards/FreezeCard`, body);
  },
  getUnFreezCard: async (body: any) => {
    return put(`api/v1/Cards/UnFreezeCard`, body);
  },
  saveterminateCard: async (body: any) => {
    return put(`api/v1/Cards/UnFreezeCard`, body);
  },
  getReissueCard: async (id: any) => {
    return get(`api/v1/Cards/ReActivateCard/${id}`);
  },
  savesetcardpin: async (body: any) => {
    return put(`api/v1/Cards/setcardpin`, body);
  },
  savegetcardpin: async (id: any) => {
    return get(`api/v1/Cards/GetCardPin/${id}`);
  },
  getTopupBalance: async (customerId: string) => {
    return get(`api/v1/Cards/GetWallet/${customerId}`);
  },
  getTerminateCard: async (body: any) => {
    return put(`api/v1/Cards/terminateCard`, body);
  },
  saveCardNotes: async (body: any) => {
    return put("api/v1/Cards/NoteSave", body);
  },
  getMycards: async () => {
    return get(`api/v1/CardsWallet/MyCards`);
  },
  getCards: async () => {
    return get(`api/v1/ExchangeTransaction/CardsLu`);
  },
  getAllMycards: async (pageSize: any, pageNo: any) => {
    return get(`api/v1/CardsWallet/MyCards/${pageSize}/${pageNo}`);
  },
  getAvilableCards: async () => {
    return get(`api/v1/Common/Cards/NewCards`);
  },
  getMyCardDetails: async (cardId: string) => {
    return get(`api/v1/CardsWallet/Customer/Card/${cardId}`);
  },
  getDeposit: async (cardId: string, cardAmount: string) => {
    return get(`api/v1/Deposit/customer/Card/${cardId}/Fee/${cardAmount}`);
  },
  saveResetPin: async (cardId: string, body: any) => {
    return put(`api/v1/CardsWallet/Customer/Card/${cardId}/Resendpin`, body);
  },
  saveReplacecard: async (cardId: string, body: any) => {
    return put(`api/v1/CardsWallet/Customer/Card/${cardId}/Replacecard`, body);
  },
  saveReportLoss: async (cardId: string, body: any) => {
    return put(`api/v1/CardsWallet/Customer/Card/${cardId}/ReportLoss`, body);
  },
  saveFreezeUnFreeze: async (cardId: string, body: any) => {
    return put(`/api/v1/CardsWallet/Customer/Card/${cardId}/FreezeUnFreeze`, body);
  },
  getDepositData: async (cardId: string, walletCode: any) => {
    return get(`api/v1/CardsWallet/Deposit/Card/${cardId}/Fee/${walletCode}`);
  },
  getDepositFeeComission: async (amount: any, cardId: any) => {
    return get(`api/v1/CardsWallet/DepositFeeComission/Customer/Cards/${cardId}/${amount}`);
  },
  saveDeposit: async (Obj: any) => {
    return post(`api/v1/ExchangeTransaction/Deposit/TopUp`, Obj);
  },
  getAllTopCards: async (pageSize: any, pageNo: any) => {
    return get(`api/v1/Common/Cards/NewCards/${pageSize}/${pageNo}`);
  },
  getApplyCardDeatils: async (cardId: string) => {
    return get(`api/v1/Common/Card/ApplyCard/${cardId}`);
  },
  getApplyCardsCustomerInfo: async (cardId: string) => {
    return get(`api/v1/Common/Customer/ApplyCard/${cardId}/info`);
  },
  getApplyCardsCustomerFeeInfo: async (cardId: string, walletId: string, haveCard: boolean) => {
    return get(`api/v1/Common/Customer/ApplyCard/${cardId}/FeeInfo/CustomerWallet/${walletId}/${haveCard}`);
  },
  getApplyCardStatus: async (cardId: string) => {
    return get(`api/v1/CardsWallet/CustomerCardStatus/${cardId}`);
  },
  getPersonalCustomerInfoAddress: async () => {
    return get(`api/v1/Common/Customer/Address`);
  },
  saveCustomerCardsWallet: async (body: any) => {
    return post(`api/v1/CardsWallet/Customer/ApplyCard`, body);
  },
  saveCommonCustomerAddress: async (customerId: string, body: any) => {
    return post(`api/v1/Common/Customer/${customerId}/Address`, body);
  },
  saveCommonCustomerEditAddress: async (customerId: string, body: any) => {
    return put(`api/v1/Common/Customer/${customerId}/Address`, body);
  },
  getPersonalCustomerViewDetails: async (addressId: string) => {
    return get(`api/v1/Common/Customer/Address/${addressId}`);
  },
  getPersonalAddressLu: async () => {
    return get(`api/v1/Common/AddressLu`);
  },
  getCountryLu: async () => {
    return get(`api/v1/Common/CountryLu`);
  },
  getCustomerCradsCount: async () => {
    return get(`api/v1/CardsWallet/CustomerCradsCount`);
  },
  getCustomerTransactions: async (type: string, page: number, pageSize: number, cardId: string, screenName: string) => {
    if (cardId && screenName === "Wallets") {
      return get(`api/v1/ExchangeTransaction/Customer/Wallets/Transactions/${cardId}/History/${type}?page=${page}&pageSize=${pageSize}`);
    }
    else if (cardId) {
      return get(`/api/v1/ExchangeTransaction/Customer/Card/${cardId}/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`);
    }
    else {
      return get(`/api/v1/ExchangeTransaction/Customer/Card/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`);
    }
  },
  getCollectPayTransactions: async (customerId: any,
    type: string,
    page: number,
    pageSize: number,
    cardId: string
  ) => {
    if (cardId) {
      return get(
        `/api/v1/ExchangeTransaction/Customer/${customerId}/Card/${cardId}/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`
      );
    } else {
      return get(
        `/api/v1/ExchangeTransaction/Customer/${customerId}/Card/Transactions/History/${type}?page=${page}&pageSize=${pageSize}`
      );
    }
  },
  getCustomerApplicatioinTransactions: async (
    type: string,
    cardId: string,
    page: number,
    pageSize: number
  ) => {
    if (cardId) {
      return get(
        `/api/v1/ExchangeTransaction/Customer/Card/${cardId}/ApplicationRecords/${type}?page=${page}&pageSize=${pageSize}`
      );
    } else {
      return get(
        `/api/v1/ExchangeTransaction/Customer/Card/ApplicationRecords/${type}?page=${page}&pageSize=${pageSize}`
      );
    }
  },
  getTransactionDownlodBill: async (cardId: string, type: string, fromDate: any, toDate: any) => {
    if (cardId) {
      return get(`api/v1/ExchangeTransaction/CustomerTransactionTemplate/Cards/${cardId}/${type}/${fromDate}/${toDate}`);
    } else {
      return get(`api/v1/ExchangeTransaction/CustomerTransactionTemplate/${type}/${fromDate}/${toDate}`);
    }
  },
  getApplyCardFAQs: async () => {
    return get(`api/v1/Common/Faqs`);
  },
  getTransactionDetails: async (transd: string) => {
    return get(`api/v1/ExchangeTransaction/GetTransactionDetail/${transd}`);
  },
  postCardDetails: async (body: any) => {
    return post(`api/v1/CardsWallet/Customer/Cards/QuickLinks`, body)
  },
  getQuickLinkApplicationInfo: async (cardId: any) => {
    return get(`/api/v1/Common/Customer/Card/${cardId}/KYCInformation`)
  },
  getWalletCards: async () => {
    return get(`api/v1/CardsWallet/Customer/PhysicalCards`)
  },
  getCardsApplicationInfo: async (cardId: any) => {
    return get(`/api/v1/Common/Customer/Physical/ApplicationInformation/${cardId}`)
  },
  postKycInformation: async (body: any) => {
    return post(`api/v1/CardsWallet/Customer/Physical/ApplyCard`, body)
  },
  getcardPin: async (body: any) => {
    return post(`/api/v1/CardsWallet/Customer/Card/ShowPin`, body)
  },
  getHelpCenterContent: async () => {
    return get(`api/v1/Common/TemplateContent/HelpCenter`)
  },
  getPersonalInfo: async () => {
    return get(`api/v1/Customer/PersonalInfo`)
  },
  getTowns: async () => {
    return get(`api/v1/Common/countrytownlu`);
  },
  updateKyc: async (body: any) => {
    return put(`api/v1/CardsWallet/kycUpdate`, body)
  },
  customerTransactionTypes: async () => {
    return get(`/api/v1/Common/Customer/TransactionTypes`)
  },
  addPersonalInformation: async (body: any) => {
    return post(`api/v1/Common/Customer/PersonalAddress`, body)
  },
  updatePersonalInformation: async (body: any) => {
    return put(`api/v1/Common/Update/Customer/PersonalAddress`, body)
  },
  getAccountInformation: async () => {
    return get(`/api/v1/Common/CustomerInformation}`)
  }, updateAccountInformation: async (body: any) => {
    return put(`api/v1/Common/Update/CustomerInformation`, body)
  },
  getCountries: async () => {
    return get(`api/v1/Common/countrytownlu`);
  }, getOccupationLookup: async () => {
    return get(`/api/v1/Common/OccupationsLU`);
  },
  getTownsLookup: async (cardId: any,countryCode:any) => {
    return get(`/api/v1/Common/CardTownLu/${cardId}/${countryCode}`);
  }
}


export default CardsModuleService;
