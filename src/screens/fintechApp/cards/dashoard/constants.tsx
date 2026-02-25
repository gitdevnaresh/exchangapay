import * as Yup from 'yup';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { View } from 'react-native';
import { ms, s } from '../../../../components/theme/scale';
import AntDesign from '@expo/vector-icons/AntDesign';
import { NEW_COLOR } from '../../../../constants/styels/variables';

export const CARDS_CONSTANTS_DATA = {
    ALL_CARDS_LIST: {
        ALL_CARDS: 'allCards',
        LIST_DATA_LOADING: 'listdataLoading',
        ERROR_MSG: 'errorMsg',
        CARDS_DETAILS_COMPONENT: 'CardDetails',
    },

};
export const statusIconMap: { [key: string]: string } = {
    approved: "Active",
    active: "Active",
    pending: "Pending",
    rejected: "Rejected",
    canceled: "Canceled",
    freezed: "Freezed",
    submitted: "Pending",
    cardbinding: "CardBinding",
    reviewing: "Reviewing",
    "unfreeze pending": "UnFreeze Pending",
    "freeze pending": "Freeze Pending",
    "suspended": "Suspended"
};
export const CARDS_CRYPTO_CONSTANTS = {
    WALLET_RECEIVE: "WalletReceive",
    CARDS_CRYPTO: "cardsCrypto",
    SEND_AMOUNTS: "SendAmounts",
    DASHBORD: "Dashboard",
    CRYPTO: "Crypto",
    AVAILABLE_BALANCE: 'Available Balance',
    COINS: 'Coins',
    NO_DATA_AVAILABLE: "No data available",
    ACTIONS: "Actions",
    DEPOSIT: "Deposit",
    WITHDRAW: "Withdraw",
    CLOSE: "close",
    My_CARDS: "AllCardsList",
    COUNTRY: "country"

};

export interface CryptoCoins {
    amount: number,
    id: string,
    logo: string,
    network: string,
    note: string | null,
    percentage: number,
    walletCode: string,
    walletName: string,
    withdrawMax: number,
    withdrawMin: number,
};

export interface TotalAmounts {
    id: string;
    currency: string;
    totalAmount: number;
}
export const CARDS_CONST = {
    ERR_MSG: "Invalid data received",
    APPLICATION: "Application Rules",
    CHARGES: "Charges",
    BIN: "Bin",
    ASSOC: "Assoc",
    CARD_TYPE: "Card Type",
    ISO_COUNTRY_NAME: "ISO Country Name",
    ATM_WITHDRAWAL_FEE: "ATM Withdrawal Fee",
    MAINTANACE_FEE: "Maintenance Fee",
    NONEEA_CONSUMPTION_FEE: "Non-EEA Consumption Fee",
    ACCOUNT_BALANCE_LIMIT: "Account Balance Limit",
    MONTHLY_RECHARGE_LIMIT: "Monthly Recharge Limit",
    DAILY_RECHARGE_LIMIT: "Daily Recharge Limit",
    DAILY_PAYMENT_LIMIT: "Daily Payment Limit",
    ATM_DAILY_WITHDRAWAL_LIMIT: "ATM Daily Withdrawal Limit",
    CARD_CURRENCY: "Card Currency",
    COMMON_CARD_ISSUING_FEE: "Common Card Issuing Fee",
    EXCHANGA_ISSUING_FEE: "Exchanga Issuing Fee",
    DEPOSIT_FEE_RATE: "Deposit Fee Rate",
    SPENDING_LIMIT: "Spending Limit",
    REVIEW_TIME: "Review Time",
    RIGHT: "right",
    ARROW_LEFT: "arrowleft",
    CARD: "Card",
    XXXX_XXXX: "XXXX  XXXX  XXXX  XXXX",
    EXCHANGA_REBATE: "Exchanga Rebate",
    NOTES: "Notes",
    APPLICATION_REQUIREMENTS: "Application requirements:",
    INFORMATION_REQUIRED: "Information Required For EXChangaCard Application",
    IVE_READ: "I’ve Read",
    CANCEL: "Cancel",
    APPLY_NOW: "Apply Now",
    NEXT_PAGE: "Next",
    CHECK: "check",
    ALL_NEW_CARDS: "Apply Cards",
    CARD_OWNER: "Card Owner",
    APPLICATION_INFORMATION: "Application Info",
    FEE: "Fee",
    TO_BE_REVIEWED: "To Be Reviewed",
    APPLY_FOR_EXCHANGA_PAY_CARD: "Apply For",
    APPLY_FOR: "Apply For",
    APPLY_FOR_EXCHANGA_CARD: "Apply For Digital Bank Card",
    RIGHT_ARROW: "arrowright",
    NEXT: "Next",
    AMOUNT_TO_BE_PAID: "Amount to be paid",
    PLEASE_PAY_THE_ACCOUNT_OPENING_FEE: "Please pay the account opening fee. After the payment is successful, the card will be opened within 24 hours",
    ISSUING_FEE: "Issuing Fee",
    FREIGHT_FEE: "Freight Fee",
    PAYMENT_CURRENCY: "Payment Currency",
    ESTIMATED_PAYMENT_AMOUNT: "Estimated Payment Amount",
    PAY: "Pay",
    EXCHANGE_CARD: "Exchange Card",
    CREATED_CARD_SUCCESSFULLY: "Created Card Successfully",
    OK: "Ok",
    CHECKMARK_CIRCLE: "checkmark-circle",
    BACK_TO_HOME: "Back TO Home",
    BACK_TO_CARD: "Back To Card",
    STANDARD: "STANDARD",
    CVV_XXXX: 'XXXX',
    VALID_UPTO: "Valid Upto",
    CVV: "CVV",
    CVV_XXX: "XXX",
    APPLY_CARD: "ApplyCard",
    ADDS_CONFIGURATION: 'ADDS_AND_GRAPG_CONFIGURATION',
    CARDS: 'CARDS',
    _CARDS: "_cards",
    CARD_DETAILS: "CardDetails",
    PHYSCICAL_CARDS_LIST: "PhyscialCardsList",
    ALL_NEW_CARDS_: "AllNewCards",
    ALL_CARDS_LIST: "AllCardsList",
    MYCARDS: "My Cards",
    CARDS_: "cards",
    APPROVED: "Approved",
    ACTIVE: "Active",
    CURRENT_VALUE: "Current value",
    CHEVRON_DOWN: "chevron-down",
    MY_CARDS: 'My Cards',
    APPLY_CARDS: 'Apply Cards',
    BIND_CARDS: 'Bind Card',
    NO_CARDS_AVAILABLE: "No Cards Available",
    TRANSACTIONS_SUMMARY: "Transactions Summary",
    SELECT_CURRENCY: "Select Currency",
    CLOSE: "close",
    CARDS_RECENT: "Cards",
    MYCARDS_: "MyCards",
    BUSINESS: "Business",
    MONTH_YEAR: 'XX/XX',
    FREEZED: "Freezed",
    EYE: 'eye',
    UN_FREEZED: "Unfreezed",
    SUPPORTED_PLOTFORMS: "Supported Platforms",
    PLEASE_SELECT_AT_LEAST_ONE_OPTION: "Please select at least one option: either 'I have the card on hand' or 'Please send a card to me'.",
    CARD_TOBE_REVIEW: "CardToBeReviewed",
    APPLY_EXCHANGE_CARD: "ApplyExchangaCard",
    SEND_CARD: "sendCard",
    HAVE_CARD: "haveCard",
    CURRENCY: "currency",
    NETWORK: "network",
    VERTUAL: "Virtual",
    APPROVE: "Approved"


},
    BIND_CARD_CONSTANTS = {
        BIND_CARD: "Bind Card",
        BIND_CARD_NULL: "xxxx xxxx xxxx xxxx",
        BIND_CARD_VALIDATION: {
            INVALID_DATA_RECEIVED: "Invalid data received",
        },
        BIND_CARD_NAVIGATION: {
            QUICK_LINKS_ENVELOP: "QuickLinksEnvelop",
            QUICK_LINKS_APPLICATION_INFO_STEP1: "QuickApplicationInfo",

        },
    }

export const QuickLinkSchema = Yup.object().shape({
    cardNumber: Yup.string().matches(/^\d{16}$/, 'Link Card number must be 16 digits long').required('is required'),
    envelopNumber: Yup.string().matches(/^\d+$/, 'Envelope number must be numeric'),
    handHoldingIDPhoto: Yup.string().required('is required'),
});


export const cardDynamicFeildRenderLoader = (count: number) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const items = [];

    for (let i = 0; i < count; i++) {
        items.push(
            <View key={i} style={{ marginBottom: s(12) }}>
                <View
                    style={[
                        commonStyles.kpibg,
                        {
                            width: "100%",
                            height: ms(50),
                            borderRadius: ms(10),
                        },
                    ]}
                />
            </View>
        );
    }

    return <>{items}</>;
};


interface BindCardInfo {
    [key: string]: unknown;
}

interface CardsInfoData {
    [key: string]: unknown;
}

interface Navigation {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    [key: string]: unknown;
}

interface ValidationField {
    field: string;
    isMandatory: string;
    [key: string]: unknown;
}

export interface BindCardProps {
    buttonLoader: boolean;
    bindCardInfo: BindCardInfo;
    envelopeNoRequired?: boolean;
    CardsInfoData?: CardsInfoData;
    navigation: Navigation;
}

export const createDynamicValidationSchema = (fields: ValidationField[]) => {
    const schema: Record<string, Yup.StringSchema> = {};

    fields.forEach(field => {
        let validator = Yup.string();
        if (field.isMandatory === "true") {
            validator = validator.required(`Is required`);
        }

        if (field.field === "CardLastFourDigits") {
            validator = validator.matches(/^[0-9]{4}$/, "Must be exactly 4 digits");
        }

        if (field.field === "ExpiryDate") {
            validator = validator.matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Enter MM/YY format only");
        }

        schema[field.field] = validator;
    });

    return Yup.object().shape(schema);
};

export const getPlaceholder = (field: string) => {
    const placeholders: { [key: string]: string } = {
        CardLastFourDigits: "Enter last four digits of card",
        ExpiryDate: "Enter expiry date (MM/YY)"
    };
    return placeholders[field] || field;
};
export interface setLimitInterfaceProps {
    cardId: string,
    limit: number | string,
    type: string,
}
