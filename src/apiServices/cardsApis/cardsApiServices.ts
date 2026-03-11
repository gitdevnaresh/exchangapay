import { get, post, put } from "../../utils/ApiService";

export const cardsService = {
  applyCardsList: async () => {
    return await get(`api/v1/Common/Cards/NewCards`);
  },
  getMyCards: async (pageSize: any, pageNo: any) => {
    return get(`api/v1/CardsWallet/MyCards/${pageSize}/${pageNo}`)
  },
  getMyCardDetsils: async (cardId: any) => {
    return get(`api/v1/CardsWallet/Customer/Card/${cardId}`)
  },
  promoCode: async (body: any) => {
    return post(`/api/v1/CardsWallet/PromoValidate`, body)
  },
  updateCardFreezeAndUnFreeze: async (cardId: any, body: any) => {
    return put(`api/v1/CardsWallet/Customer/Card/${cardId}/FreezeUnFreeze`, body)
  },
  applycard: async (body: any) => {
    return post(`/api/v1/CardsWallet/CardApply`, body)
  },
  //security settings
  getSecuritySettings: async (cardId: string) => {
    return get(`/api/v1/CardsWallet/Securitysettings/${cardId}`)
  },
  updatePaymentTypes: async (cardId: string, body: any) => {
    return put(`api/v1/CardsWallet/PaymentTypes/${cardId}`, body)
  },
  UpdateTransactionCurrency: async (cardId: string, transactionCurrency: any) => {
    return put(`api/v1/CardsWallet/card/${cardId}/${transactionCurrency}`)
  },
  getChangeAddress: async (cardId: string) => {
    return get(`/api/v1/CardsWallet/BillingAddress/${cardId}`)
  },
  updateChangeAddress: async (cardId: string, body: any) => {
    return put(`api/v1/CardsWallet/UpdateBillingAddress`, body)
  },
  updateCardLable: async (body: any) => {
    return put(`api/v1/CardsWallet/UpdateLabel`, body)
  },
  getReplaceCard: async (cardId: any) => {
    return get(`/api/v1/CardsWallet/ReplacementInfo/${cardId}`)
  },
  replaceCard: async (cardId: any, body: any) => {
    return post(`/api/v1/CardsWallet/ReplaceCard`, body)
  },
  getDeleteCard: async (cardId: any) => {
    return get(`/api/v1/CardsWallet/DeleteCard/${cardId}`)
  },
  deleteCardSave: async (body: any) => {
    return post(`/api/v1/CardsWallet/DeleteCard`, body)
  },
  getCardLimit: async (cardId: any) => {
    return get(`api/v1/CardsWallet/CardLimit/${cardId}`)
  },
  updateCardLimit: async (type: any, body: any) => {
    return put(`api/v1/CardsWallet/${type}`, body);
  },
  cardCountryRestriction: async (cardId: any) => {
    return get(`api/v1/CardsWallet/CountryRestriction/${cardId}`)
  },
  getAllLearnList: async () => {
    return get(`api/v1/Common/GetLearns`)
  }, getLearDetails: async (id: any) => {
    return get(`api/v1/Common/GetLearnData/${id}`)
  },
  topupCurrencyList: async () => {
    return get(`api/v1/ExchangeWallet/Deposit/CryptoWallets`);
  },
  getCommonCryptoNetworks: async (coin: string) => {
    return get(`api/v1/Common/Wallets/NetWorkLUMaster/${coin}`)
  },
  getTopUpFeeComission: async (amount: any, cardId: any) => {
    return get(`api/v1/CardsWallet/DepositFeeComission/Customer/Cards/${cardId}/${amount}`);
  },
  getTopUpData: async (cardId: string, walletCode: any) => {
    return get(`api/v1/CardsWallet/Deposit/Card/${cardId}/Fee/${walletCode}`);
  },
  saveTopupData: async (Obj: any) => {
    return post(`api/v1/ExchangeTransaction/MasterDeposit/TopUp`, Obj);
  },
  // apply card kyc  requirements apis 
  getcountriesList: async () => {
    return get(`api/v1/Common/countrytownlu`);
  },
  getIdTypesLu: async (Country: any) => {
    return get(`api/v1/CardsWallet/country/Lookup/${Country}`);
  },
  getKycRequirements: async (cardId: string) => {
    return get(`api/v1/Common/Customer/ApplyCard/${cardId}/info`);
  },
  getOccupationsList: async (programId: string) => {
    return get(`api/v1/CardsWallet/Occupations/${programId}`);
  },
  getCardDocTypes: async () => {
    return get(`api/v1/CardsWallet/docTypes`);
  },
  getNoteDetails: async (type: string) => {
    return get(`/api/v1/CardsWallet/${type}`);
  },
  getFeeNetworkLookup: async (coin: string) => {
    return get(`api/v1/Common/Wallets/NetWorksLU/${coin}`)
  },
  getWithdrawCryptoCoinList: async () => {
    return get(`api/v1/ExchangeWallet/Deposit/CryptoWallets`);
  },
  getApplyCardsCustomerFeeInfo: async (cardId: string, haveCard: boolean) => {
    return get(`api/v1/Common/ApplyCard/FeeInfo/${cardId}/${haveCard}`)
    // return get(`api/v1/Common/Customer/ApplyCard/${cardId}/FeeInfo/CustomerWallet/${walletId}/${haveCard}`);
  },
  saveCustomerCardsWallet: async (body: any) => {
    return post(`api/v1/CardsWallet/CardApply`, body);
  }, getCardViewPermissions: async (cardId: any) => {
    return get(`api/v1/CardsWallet/Get/Card/Action/Permissions/${cardId}`)
  }
}
