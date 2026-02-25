import { CARDS_SERVICE_CONSTANTS } from '../serviceConstants';
import { cardsGet, cardsPost, cardsPut, get, post, put } from '../ApiService';
import { CARD_API_ENDPOINTS } from './constants';

const CardsModuleService = {
    getCardBalance: async (customerId: any) => {
        const data = await get(CARD_API_ENDPOINTS.GET_CARD_BALANCE(customerId))
        return data;
    },
    getAllCards: async () => {
        const data = await get(CARD_API_ENDPOINTS.GET_ALL_CARDS);
        return data;
    },
    totalBalance: async () => {
        return cardsGet(CARD_API_ENDPOINTS.TOTAL_BALANCE);
    },
    getAddressLu: async () => {
        return get(CARD_API_ENDPOINTS.GET_ADDRESS_LU);
    },
    createCards: async (id: any, body: any) => {
        const data = await post(CARD_API_ENDPOINTS.CREATE_CARDS(id), body);
        return data;
    },
    saveDeposit: async (Obj: any) => {
        return cardsPost(CARD_API_ENDPOINTS.SAVE_DEPOSIT, Obj);
    },
    getCardsById: async (cardId: any) => {
        const data = await cardsGet(CARD_API_ENDPOINTS.GET_CARDS_BY_ID(cardId));
        return data;
    },
    getFetchCVV: async (customerId: any, cardId: any) => {
        const data = await get(CARD_API_ENDPOINTS.FETCH_CVV(customerId, cardId));
        return data;
    },
    getFreezCard: async (body: any) => {
        const data = await put(CARD_API_ENDPOINTS.FREEZE_CARD, body);
        return data;
    },
    getUnFreezCard: async (body: any) => {
        const data = await put(CARD_API_ENDPOINTS.UNFREEZE_CARD, body);
        return data;
    },
    saveFreezeUnFreeze: async (cardId: string, action: string, body: any) => {
        return cardsPut(CARD_API_ENDPOINTS.SAVE_FREEZE_UNFREEZE(cardId, action), body);
    },
    saveReissuecard: async (customerId: string, cardId: string, body: any) => {
        return put(CARD_API_ENDPOINTS.REISSUE_CARD(customerId, cardId), body);
    },
    saveTerminateCard: async (customerId: string, cardId: string, body: any) => {
        return put(CARD_API_ENDPOINTS.TERMINATE_CARD(customerId, cardId), body);
    },
    saveterminateCard: async (body: any) => {
        const data = await put(CARD_API_ENDPOINTS.UNFREEZE_CARD, body);
        return data;
    },
    getReissueCard: async (id: any) => {
        const data = await get(CARD_API_ENDPOINTS.GET_REISSUE_CARD(id));
        return data;
    },
    savesetcardpin: async (customerId: any, cardId: any, body: any) => {
        const data = await put(CARD_API_ENDPOINTS.SET_CARD_PIN(customerId, cardId), body);
        return data;
    },
    savegetcardpin: async (id: any, customerId: any) => {
        const data = await get(CARD_API_ENDPOINTS.GET_CARD_PIN(id, customerId));
        return data;
    },
    getTopupBalance: async (customerId: any, cardId: any) => {
        const data = await get(CARD_API_ENDPOINTS.GET_TOPUP_BALANCE(customerId, cardId));
        return data;
    },
    getDepositFeeComission: async (amount: any, cardId: any, coin: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_DEPOSIT_FEE(cardId, amount, coin));
    },

    getTerminateCard: async (body: any) => {
        const data = await put(CARD_API_ENDPOINTS.TERMINATE_CARD_ALT, body);
        return data;
    },
    saveCardNotes: async (body: any) => {
        const data = await put(CARD_API_ENDPOINTS.SAVE_CARD_NOTES, body);
        return data;
    },
    getAllCardsInfo: async (pageSize: any, pageNo: any, customerId: any) => {
        return get(CARD_API_ENDPOINTS.GET_ALL_CARDS_INFO(pageSize, pageNo, customerId));
    },
    getApplyCards: async (pageSize: number, pageNo: number) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_APPLY_CARDS(pageSize, pageNo));
    },
    getMyCardsInfo: async (customerId: any) => {
        return get(CARD_API_ENDPOINTS.GET_MY_CARDS_INFO(customerId));
    },
    getAllMyCards: async (accountType: any, pageSize: any, pageNo: any, isChecked: boolean) => {
        const url = accountType === "Business" ? `cards?pageSize=${pageSize}&pageNo=${pageNo}&isExclude=${isChecked}` :
            `cards?pageSize=${pageSize}&pageNo=${pageNo}`
        return cardsGet(CARD_API_ENDPOINTS.GET_ALL_MY_CARDS(url));
    },
    getApplyCardDeatils: async (cardId: string) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_APPLY_CARD_DETAILS(cardId));
    },
    getApplyCardFaq: async () => {
        return get(CARD_API_ENDPOINTS.GET_APPLY_CARD_FAQ);
    },
    getSupportPlaforms: async (customerId: any, pageSize: any, pageNo: any) => {
        return get(CARD_API_ENDPOINTS.GET_SUPPORT_PLATFORMS(customerId, pageSize, pageNo));
    },
    getApplyCardsRequirements: async (cardId: string) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_APPLY_CARDS_REQUIREMENTS(cardId));
    },
    getApplyCardsCustomerFeeInfo: async (cardId: string, walletId: string, haveCard: boolean) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_APPLY_CARDS_CUSTOMER_FEE_INFO(cardId, walletId, haveCard));
    },
    saveCustomerCardsWallet: async (body: any) => {
        return post(CARD_API_ENDPOINTS.SAVE_CUSTOMER_CARDS_WALLET, body);
    },
    getApplyCardStatus: async (cardId: string) => {
        return get(CARD_API_ENDPOINTS.GET_APPLY_CARD_STATUS(cardId));
    },
    applyCardPostService: async (body: any) => {
        const data = await post(CARD_API_ENDPOINTS.APPLY_CARD_POST_SERVICE, body);
        return data;
    },
    getCardTotalAmount: async (customerId: any) => {
        const data = await get(CARD_API_ENDPOINTS.GET_CARD_TOTAL_AMOUNT(customerId))
        return data;
    },
    getMyCards: async () => {
        return get(CARD_API_ENDPOINTS.GET_MY_CARDS)
    },
    cardsAddressGet: async (page: any, pageSize: any) => {
        const data = await get(CARD_API_ENDPOINTS.CARDS_ADDRESS_GET(page, pageSize))
        return data;
    },
    getListOfCountries: async () => {
        return get(CARD_API_ENDPOINTS.GET_LIST_OF_COUNTRIES);
    },
    getAddressDetails: async (addressId: any) => {
        return get(CARD_API_ENDPOINTS.GET_ADDRESS_DETAILS(addressId))
    },
    cardsAddressPost: async (body: any,) => {
        return post(CARD_API_ENDPOINTS.CARDS_ADDRESS_POST, body)
    }, cardsAddressPut: async (body: any) => {
        const data = await put(CARD_API_ENDPOINTS.CARDS_ADDRESS_PUT, body)
        return data;
    }, getCountryCodes: async () => {
        return get(CARD_API_ENDPOINTS.GET_COUNTRY_CODES);
    }, getphysicalCards: async (customerId: any) => {
        return get(CARD_API_ENDPOINTS.GET_PHYSICAL_CARDS(customerId))
    }, getCardsApplicationInfo: async (customerId: any, cardId: any) => {
        return get(CARD_API_ENDPOINTS.GET_CARDS_APPLICATION_INFO(customerId, cardId))
    }, cardsCryptoAmount: async (coin: any, customerId: any) => {
        return get(CARD_API_ENDPOINTS.CARDS_CRYPTO_AMOUNT(coin, customerId))
    }, getCardsCryptoCoins: async (customerId: any, appName: any) => {
        return get(`${CARDS_SERVICE_CONSTANTS?.API_V1_EXCHNAGEWALLET_WALLET_CRYPTOWALLET}${customerId}/${appName}`)
    },
    getTowns: async () => {
        return get(CARD_API_ENDPOINTS.GET_TOWNS);
    },
    getPersonalAddressLu: async () => {
        return get(CARD_API_ENDPOINTS.GET_PERSONAL_ADDRESS_LU);
    },
    getCountryLu: async () => {
        return get(CARD_API_ENDPOINTS.GET_COUNTRY_LU);
    },
    updateKyc: async (body: any) => {
        return put(CARD_API_ENDPOINTS.UPDATE_KYC, body)
    },
    postKycInformation: async (body: any) => {
        return post(CARD_API_ENDPOINTS.POST_KYC_INFORMATION, body)
    },
    getQuickLinkApplicationInfo: async (customerId: any, cardId: any) => {
        return get(CARD_API_ENDPOINTS.GET_QUICK_LINK_APPLICATION_INFO(customerId, cardId))
    },
    getBeneficiaryType: async () => {
        return get(CARD_API_ENDPOINTS.GET_BENEFICIARY_TYPE)
    },
    getBeneficiaries: async (type: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_BENEFICIARIES(type))
    },
    getUbosDetails: async (id: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_UBOS_DETAILS(id))
    },
    postQuickLinks: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.POST_QUICK_LINKS, body)
    },
    getEmployeeLu: async () => {
        return get(CARD_API_ENDPOINTS.GET_EMPLOYEE_LU)
    },
    getAssignedCards: async (customerId: any, pageSize: any, pageNo: any) => {
        return get(CARD_API_ENDPOINTS.GET_ASSIGNED_CARDS(customerId, pageSize, pageNo));
    },
    AssignCardSave: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.ASSIGN_CARD_SAVE, body)
    },
    CardInfo: async (cardId: string) => {
        return cardsGet(CARD_API_ENDPOINTS.CARD_INFO(cardId))
    },
    saveResetPin: async (customerId: string, cardId: string, body: any) => {
        return put(CARD_API_ENDPOINTS.RESET_PIN(customerId, cardId), body);
    },
    getCards: async (pageSize: any, pageNo: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_CARDS(pageSize, pageNo));
    },
    getCardTopupBalance: async (cardId: any) => {
        const data = await cardsGet(CARD_API_ENDPOINTS.GET_CARD_TOPUP_BALANCE(cardId));
        return data;
    },
    getCoins: async (cardId: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_COINS(cardId))
    },
    getNetworkLookup: async (coin: any, cardId: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_NETWORK_LOOKUP(coin, cardId))
    },
    getCardsTotalAmount: async () => {
        return await cardsGet(CARD_API_ENDPOINTS.GET_CARDS_TOTAL_AMOUNT);
    },
    vertualCardApply: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.VIRTUAL_CARD_APPLY, body);
    },
    physicalCardApply: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.PHYSICAL_CARD_APPLY, body);
    },
    getBindCardData: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_BIND_CARD_DATA)
    },
    getAddressLookup: async () => {
        return get(CARD_API_ENDPOINTS.GET_ADDRESS_LOOKUP);
    },
    getCoreLookups: async () => {
        return get(CARD_API_ENDPOINTS.GET_CORE_LOOKUPS);
    },
    getOccupationLookup: async (cardId: string) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_OCCUPATION_LOOKUP(cardId));
    },
    postQuickLinkApplyCard: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.POST_QUICK_LINK_APPLY_CARD, body);
    },
    getCardCountries: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_CARD_COUNTRIES);
    },
    getCardCountriesTowns: async (cardId: any, countryCode: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_CARD_COUNTRIES_TOWNS(cardId, countryCode));
    },
    getDocuments: async (country: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_DOCUMENTS(country));
    },
    getNetWorkLookUp: async (coin: any) => {
        return get(CARD_API_ENDPOINTS.GET_NETWORK_LU(coin))
    },
    getESignConsent: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_E_SIGN_CONSENT);
    },
    getCardTerms: async () => {
        return get(CARD_API_ENDPOINTS.GET_CARD_TERMS);
    },
    getPrivacyPolicy: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_PRIVACY_POLICY);
    },
    getAuthorizedUserAgreement: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_AUTHORIZED_USER_AGREEMENT);
    },
    getIndustryLu: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_INDUSTRY_LU);
    },
    getUBODetails: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_UBO_DETAILS);
    },
    getUBODetailsById: async (id: string) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_UBO_DETAILS_BY_ID(id));
    },
    getCardDocTypes: async () => {
        return cardsGet(CARD_API_ENDPOINTS.GET_CARD_DOC_TYPES);
    },
    getActiveCardDynamicFeilds: async (id: string) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_ACTIVE_CARD_DYNAMIC_FIELDS(id))
    },
    getCardLimitsInfo: async (cardId: string) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_CARD_LIMITS_INFO(cardId))
    },
    setCardLimits: async (body: any) => {
        return cardsPut(CARD_API_ENDPOINTS.SET_CARD_LIMITS, body)
    },
    getViewIframe: async (id: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_VIEW_IFRAME(id))
    },
    getSetPinIframe: async (id: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_SET_PIN_IFRAME(id))
    },
    setPin: async (id: any, body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.SET_PIN(id), body)
    },
    getCardWithdrawBalance: async (cardId: any) => {
        const data = await cardsGet(CARD_API_ENDPOINTS.GET_CARD_WITHDRAW_BALANCE(cardId));
        return data;
    },
    saveCardWithdraw: async (Obj: any) => {
        return cardsPost(CARD_API_ENDPOINTS.SAVE_CARD_WITHDRAW, Obj);
    },
    getSupportedPlatforms: async (cardId: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_SUPPORTED_PLATFORMS(cardId));
    },
    getActivateCardFeilds: async (cardId: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_ACTIVATE_CARD_FIELDS(cardId));
    },
    activateCard: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.ACTIVATE_CARD, body);
    },
    getMyCardPost: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.GET_MY_CARD_POST, body);
    },
    postDoubleStepCardApply: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.POST_DOUBLE_STEP_CARD_APPLY, body);
    },
    postDoubleStepFeeStepVirtual: async (body: any) => {
        return cardsPost(CARD_API_ENDPOINTS.POST_DOUBLE_STEP_FEE_STEP_VIRTUAL, body);
    },
    getCardHolderStatus: async (cardId: any) => {
        return cardsGet(CARD_API_ENDPOINTS.GET_CARD_HOLDER_STATUS(cardId));
    }

};
export default CardsModuleService;


