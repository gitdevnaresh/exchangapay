
import CardsModuleService from "../../services/card";
import crashlytics from '@react-native-firebase/crashlytics';

export const getCardBalance = async (id: any) => {
    try {
        const data = await CardsModuleService.getCardBalance(id);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getAllCards = async (id: any) => {
    try {
        const data = await CardsModuleService.getAllCards(id);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const createCards = async (id: any, body: any) => {
    try {
        const data = await CardsModuleService.createCards(id, body);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getCardsById = async (customerId: any, cardId: any) => {
    try {
        const data = await CardsModuleService.getCardsById(customerId, cardId);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getFetchCVV = async (customerId: any, cardId: any) => {
    try {
        const data = await CardsModuleService.getFetchCVV(customerId, cardId);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getFreezCard = async (body: any) => {
    try {
        const data = await CardsModuleService.getFreezCard(body);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getUnFreezCard = async (body: any) => {
    try {
        const data = await CardsModuleService.getUnFreezCard(body);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const saveterminateCard = async (body: any) => {
    try {
        const data = await CardsModuleService.saveterminateCard(body);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getReissueCard = async (id: any) => {
    try {
        const data = await CardsModuleService.getReissueCard(id);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const savesetcardpin = async (body: any) => {
    try {
        const data = await CardsModuleService.savesetcardpin(body);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const savegetcardpin = async (id: any) => {
    try {
        const data = await CardsModuleService.savegetcardpin(id);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getTerminateCard = async (body: any) => {
    try {
        const data = await CardsModuleService.getTerminateCard(body);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const saveCardNotes = async (obj: any) => {
    try {
        const data = await CardsModuleService.saveCardNotes(obj);
        return data;

    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getMycards = async () => {
    try {
        const data = await CardsModuleService.getMycards();
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getMyCardDetails = async (cardId: any) => {
    try {
        const data = await CardsModuleService.getMyCardDetails(cardId);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const saveResetPin = async (cardId: string, obj: any) => {
    try {
        const data = await CardsModuleService.saveResetPin(cardId, obj);
        return data;

    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const saveFreezeUnFreeze = async (cardId: string, obj: any) => {
    try {
        const data = await CardsModuleService.saveFreezeUnFreeze(cardId, obj);
        return data;

    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const saveReplacecard = async (customerId: string, cardId: string, obj: any) => {
    try {
        const data = await CardsModuleService.saveReplacecard(customerId, cardId, obj);
        return data;

    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const saveReportLoss = async (customerId: string, cardId: string, obj: any) => {
    try {
        const data = await CardsModuleService.saveReportLoss(customerId, cardId, obj);
        return data;

    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getDeposit = async (cardId: string, cardAmount: string) => {
    try {
        const data = await CardsModuleService.getDeposit(cardId, cardAmount);
        return data;

    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getAvilableCards = async () => {
    try {
        const data = await CardsModuleService.getAvilableCards();
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getAllTopCards = async (pageSize: any, pageNo: any) => {
    try {
        const data = await CardsModuleService.getAllTopCards(pageSize, pageNo);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getApplyCardDeatils = async (id: any) => {
    try {
        const data = await CardsModuleService.getApplyCardDeatils(id);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
export const getApplyCardsCustomerInfo = async (customerId: string, cardId: string) => {
    try {
        const data = await CardsModuleService.getApplyCardsCustomerInfo(customerId, cardId);
        return data;
    } catch (error: any) {
        crashlytics().recordError(error);
        return {
            status: false,
        };
    }
};
