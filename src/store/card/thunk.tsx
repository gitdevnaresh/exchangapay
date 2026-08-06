
import CardsModuleService from "../../services/card";
import crashlytics from '@react-native-firebase/crashlytics';

// Only the two wrappers below have callers. The other 22 exports that used to
// live here duplicated CardsModuleService methods that the card screens already
// call directly, so nothing ever imported them.

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
