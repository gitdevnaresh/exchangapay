import * as yup from "yup";

interface CoinData {
    id: string;
    walletCode: string;
    logo: string;
    avilable: number;
    convertedValue: number;
    recorder: any;
    customerId: string;
    percent_change_1h: number;
}

interface NetworkData {
    id: string;
    name: string;
    code: string;
    amount: number;
    minLimit: number;
    maxLimit: number;
    depositMaxLimit: number;
    depositMinLimit: number;
    chainId: any;
    hexId: any;
    decimals: any;
    address: any;
    multiSendAddress: any;
    coinNetWork: string;
    logo: string;
}

interface DepositData {
    id: string;
    customerId: string;
    cardNumber: string;
    cryptoCurrency: string;
    fiatCurrency: string;
    network: string;
    holderId: string;
    amount: number;
    depositMaxFee: number;
    depositMinFee: number;
    depositMinAmount: number;
    depositMaxAmount: number;
    depositCryptoMaxAmount: number;
    depositCryptoMinAmount: number;
    concurrencyStamp: any;
}

interface FeeCommissionData {
    amount: number;
    fee: number;
    estimatedAmount: number;
    toTalAmount: number;
    concurrencyStamp: any;
}

export const topUpschema = () =>
    yup.object().shape({
        currency: yup.string().required(""),

    });


export type { CoinData, NetworkData, DepositData, FeeCommissionData };