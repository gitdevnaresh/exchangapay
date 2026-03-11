import * as Yup from "yup";

export interface LowBalanceAlertResponse {
    id: string;
    isEnable: boolean;
    amount: number;
    currency: string;
    createdBy: string | null;
    createdDate: string;
    modifiedBy: string | null;
    modifiedDate: string;
}

 export interface LowBalanceAlertRequest {
    IsEnable: boolean;
    Amount: number;
    CreatedBy: string | null;
    ModifiedBy: string | null;
}


  export const validationSchema = Yup.object().shape({
        thresholdAmount: Yup.string()
            .required("")
            .test('no-emojis', 'Emojis are not allowed', (value) => {
                if (!value) return true;
                const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
                return !emojiRegex.test(value);
            })
            .test('no-html', 'HTML tags are not allowed', (value) => {
                if (!value) return true;
                const htmlRegex = /<[^>]*>/g;
                return !htmlRegex.test(value);
            })
            .test('valid-number', 'Please enter a valid amount', (value) => {
                if (!value) return false;
                const num = parseFloat(value);
                return !isNaN(num) && num >= 0.01;
            })
    });