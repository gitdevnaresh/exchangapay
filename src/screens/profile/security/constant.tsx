import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";

export const dummyPostApiCall = async (data: any) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            showAppToast('Settings updated (dummy API call)', 'success');
            resolve(true);
        }, 500);
    });
};