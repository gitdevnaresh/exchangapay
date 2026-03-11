import { cardsGet, cardsPost, cardsPut, get, post, put } from '../utils/ApiService';
import { CARDS_SERVICE_CONSTANTS } from './serviceConstants';

const CardsModuleService = {
    getCardBalance: async (customerId: any) => {
        const data = await get(`api/v1/ExchangeWallet/M/TotalWalletAmount/${customerId}`)
        return data;
    },
    getAllCards: async () => {
        const data = await get(`api/v1/CardsWallet/MyCards`);
        return data;
    }, 
     totalBalance: async () => {
        return cardsGet(`api/v1/cards/balances/summary`);
    },
    getAddressLu: async () => {
        return get(`api/v1/addresses/lookup`);
    },
    createCards: async (id: any, body: any) => {
        const data = await post(`api/v1/Cards/CreateCards/${id}`, body);
        return data;
    },
    saveDeposit: async (Obj: any) => {
        return cardsPost(`api/v1/cards/topup`, Obj);
    },
   getCardsById: async ( cardId: any) => {
        const data = await cardsGet(`api/v1/cards/${cardId}/reveal`);
        return data;
    },
    getFetchCVV: async (customerId: any, cardId: any) => {
        const data = await get(`api/v1/Cards/FetchCVV/${customerId}/${cardId}`);
        return data;
    },
    getFreezCard: async (body: any) => {
        const data = await put(`api/v1/Cards/FreezeCard`, body);
        return data;
    },
    getUnFreezCard: async (body: any) => {
        const data = await put(`api/v1/Cards/UnFreezeCard`, body);
        return data;
    },
    saveFreezeUnFreeze: async (cardId: string, action:string,body: any) => {
        return cardsPut(`api/v1/cards/${cardId}/${action}`, body);
    },
    saveReissuecard: async (customerId: string, cardId: string, body: any) => {
        return put(`api/v1/CardsWallet/Customer/${customerId}/Card/${cardId}/Replacecard`, body);
    },
    saveTerminateCard: async (customerId: string, cardId: string, body: any) => {
        return put(`api/v1/CardsWallet/Customer/${customerId}/Card/${cardId}/ReportLoss`, body);
    },
    saveterminateCard: async (body: any) => {
        const data = await put(`api/v1/Cards/UnFreezeCard`, body);
        return data;
    },
    getReissueCard: async (id: any) => {
        const data = await get(`api/v1/Cards/ReActivateCard/${id}`);
        return data;
    },
    savesetcardpin: async (customerId: any, cardId: any, body: any) => {
        const data = await put(`/api/v1/CardsWallet/M/Admin/${customerId}/Card/${cardId}/SetPin`, body);
        return data;
    },
    savegetcardpin: async (id: any, customerId: any) => {
        const data = await get(`api/v1/Cards/GetCardPin/${id}/${customerId}`);
        return data;
    },
    getTopupBalance: async (customerId: any, cardId: any) => {
        const data = await get(`api/v1/CardsWallet/Deposit/${customerId}/Card/${cardId}/Fee`);
        return data;
    },
    getDepositFeeComission: async (amount: any, cardId: any,coin:any) => {
        return cardsGet(`api/v1/cards/${cardId}/estimatefee?amount=${amount}&Currency=${coin}`);
    },

    getTerminateCard: async (body: any) => {
        const data = await put(`api/v1/Cards/terminateCard`, body);
        return data;
    },
    saveCardNotes: async (body: any) => {
        const data = await put('api/v1/Cards/NoteSave', body);
        return data;
    },
    getAllCardsInfo: async (pageSize: any, pageNo: any, customerId: any) => {
        return get(`api/v1/Common/Cards/NewCards/${pageSize}/${pageNo}/${customerId}`);
    },
    getApplyCards: async ( pageSize: number, pageNo: number) => {
        return cardsGet(`api/v1/cards/available?pagesize=${pageSize}&pageno=${pageNo}`);
    },
    getMyCardsInfo: async (customerId: any) => {
        return get(`api/v1/CardsWallet/MyCards/${customerId}`);
    },
    getAllMyCards: async (accountType:any,pageSize: any, pageNo: any,isChecked:boolean) => {
        const url=accountType==="Business"?`${accountType}/MyCards/${pageSize}/${pageNo}/${isChecked}`:
        `cards?pageSize=${pageSize}&pageNo=${pageNo}`
        return  cardsGet(`api/v1/${url}`);    
    },

    getApplyCardDeatils: async ( cardId: string) => {
        return cardsGet(`api/v1/cards/${cardId}/apply`);
    },
    getApplyCardFaq: async () => {
        return get(`api/v1/faq`);
    },
    getSupportPlaforms: async (customerId: any, pageSize: any, pageNo: any) => {
        return get(`api/v1/CardsWallet/AllCards/${customerId}/${pageSize}/${pageNo}`);
    },
    getApplyCardsRequirements: async ( cardId: string) => {
        return cardsGet(`/api/v1/cards/${cardId}/kycrequirements`);
    },
    getApplyCardsCustomerFeeInfo: async ( cardId: string, walletId: string, haveCard: boolean) => {
        return cardsGet(`api/v1/applycards/${cardId}/info/${walletId}/${haveCard}`);
    },
    saveCustomerCardsWallet: async (body: any) => {
        return post(`api/v1/CardsWallet/Customer/ApplyCard`, body);

    },
    getApplyCardStatus: async (cardId: string) => {
        return get(`api/v1/CardsWallet/CustomerCardStatus/${cardId}`);
    },
    applyCardPostService: async (body: any) => {
        const data = await post(`api/v1/CardsWallet/Customer/ApplyCard`, body);
        return data;
    },
    getCardTotalAmount: async (customerId: any) => {
        const data = await get(`api/v1/ExchangeWallet/MyCardsInfo/${customerId}`)
        return data;
    },
    cardsAddressGet: async (page: any,pageSize:any) => {
        const data=await get (`api/v1/customer/addresses?page=${page}&pageSize=${pageSize}`)
        return data;
    },
    getListOfCountries: async () => {
        return get('api/v1/Common/CountryLu');
    },
    getAddressDetails: async (addressId: any) => {
        return get(`/api/v1/Common/Customer/Address/${addressId}`)
    },
    cardsAddressPost: async (body: any,) => {
        const data=await post(`/api/v1/Customer/address`,body)
        return data;
    }, cardsAddressPut: async ( body: any) => {
        const data = await put(`api/v1/customer/address`,body)
        return data;
    },getCountryCodes: async () => {
        return get(`api/v1/Common/AddressLu`);
    }, getphysicalCards: async (customerId: any) => {
        return get(`/api/v1/CardsWallet/Customer/PhysicalCards/${customerId}`)
    }, getCardsApplicationInfo: async (customerId: any, cardId: any) => {
        return get(`/api/v1/Common/Customer/${customerId}/Physical/ApplicationInformation/${cardId}`)
    }, cardsCryptoAmount: async (coin: any, customerId: any) => {
        return get(`/api/v1/CardsWallet/availablebalance/${coin}/${customerId}`)
    }, getCardsCryptoCoins: async (customerId: any, appName: any) => {
        return get(`${CARDS_SERVICE_CONSTANTS?.API_V1_EXCHNAGEWALLET_WALLET_CRYPTOWALLET}${customerId}/${appName}`)
    },
    getTowns: async () => {
        return get(`api/v1/Common/countrytownlu`);
    },
    getPersonalAddressLu: async () => {
        return get(`api/v1/Common/AddressLu`);
    },
    getCountryLu: async () => {
        return get(`api/v1/Common/CountryLu`);
    },
    updateKyc: async (body: any) => {
        return put(`api/v1/CardsWallet/kycUpdate`, body)
    },
    postKycInformation: async (body: any) => {
        return post(`api/v1/CardsWallet/Customer/Physical/ApplyCard`, body)
    },
    getQuickLinkApplicationInfo: async (customerId: any, cardId: any) => {
        return get(`/api/v1/Common/Customer/${customerId}/Card/${cardId}/KYCInformation`)

    },
    getBeneficiaryType: async () => {
        return get(`/api/v1/Kyc/BeneficiaryTypeLu`)
    },
    getBeneficiaries: async (type: any) => {
        return get(`/api/v1/Kyc/BeneficiariesLu/${type}`)
    },
    getUbosDetails: async (id: any) => {
        return get(`/api/v1/Kyc/UboDetails/${id}`)
    },
    postQuickLinks: async (body: any) => {
        return cardsPost(`/api/v1/cards/physical/bind`, body)
    },
    getEmployeeLu: async (id: any) => {
        return get(`/api/v1/Team/teamEmployeesLu/${id}`)
    },
    getAssignedCards: async (customerId: any, pageSize: any, pageNo: any) => {
        return get(`api/v1/CardsWallet//AssignCards/${customerId}/${pageSize}/${pageNo}`);
    },
    AssignCardSave: async (body: any) => {
        return post(`/api/v1/Team/AssignCard`, body)
    },
    CardInfo:async(cardId:string)=>{
        return cardsGet(`api/v1/Cards/${cardId}`)
    },
    saveResetPin: async (customerId: string, cardId: string, body: any) => {
        return put(
          `api/v1/CardsWallet/Customer/${customerId}/Card/${cardId}/Resendpin`,
          body
        );
      },
      getCards: async ( pageSize: any, pageNo: any) => {
        return cardsGet(`api/v1/cards?pageSize=${pageSize}&pageNo=${pageNo}`);
    },
    getCardTopupBalance: async ( cardId: any) => {
        const data = await cardsGet(`api/v1/cards/${cardId}/topup`);
        return data;
    },
    getCoins: async (cardId: any) => {
        return cardsGet(`/api/v1/cards/walletcode/${cardId}`)
      },
      getNetworkLookup: async (coin: any, cardId: any) => {
        return cardsGet(`api/v1/cards/networks/${coin}/Card/${cardId}`)
      },
      getCardsTotalAmount: async () => {
        return await cardsGet(`api/v1/cards/balances/summary`);
    },
    vertualCardApply: async (body: any) => {
        return cardsPost(`api/v1/cards/virtual/apply`, body);
    },
    physicalCardApply: async (body: any) => {
        return cardsPost(`api/v1/cards/customerphysical/apply`, body);
    }, 
    getBindCardData:async()=>{
        return cardsGet(`api/v1/cards/physical/bind`)
      },
      getAddressLookup: async () => {
        return cardsGet(`api/v1/addresses`);
    },
    getCardCountriesTowns: async (cardId: any, countryCode: any) => {
        return cardsGet(`api/v1/CardTownLu/${cardId}/${countryCode}`);
    },
};
export default CardsModuleService;


