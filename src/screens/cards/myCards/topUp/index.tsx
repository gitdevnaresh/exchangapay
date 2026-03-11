import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ViewComponent from "../../../../newComponents/view/view";
import { Field, Formik } from "formik";
import { s } from "../../../../constants/theme/scale";
import CustomPickerModal from "../../../../newComponents/pickerComponents/formik/customPicker";
import { cardsService } from "../../../../apiServices/cardsApis/cardsApiServices";
import { useEffect, useState, useCallback, useRef } from "react";
import { isErrorDispaly } from "../../../../utils/helpers";
import ButtonComponent from "../../../../newComponents/buttons/button";
import AmountInput from "../../../../newComponents/numericInputs/amountInput";
import { CurrencyText } from "../../../../newComponents/textComponets/currencyText/currencyText";
import ImageUri from "../../../../newComponents/imageComponents/image";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import Loadding from "../../../commonScreens/skeltons";
import { transactionCard } from "../../../commonScreens/transactions/skeltonViews";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { CoinData, DepositData, FeeCommissionData, topUpschema } from "./interface";
import AuthVerification from "../../../commonScreens/authentication";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import { COMMON_SVG_URLS } from "../../../../assets/blobUrls";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";


const CardTopUp = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const [coinsDataList, setCoinsDataList] = useState<CoinData[]>([]);
    const [selectedCoin, setSelectedCoin] = useState<CoinData>();
    const [deposiData, setDeposiData] = useState<DepositData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [amount, setAmount] = useState<any>();
    const [feeComissionLoading, setFeeComissionLoading] = useState<boolean>(false);
    const [feeComissionData, setFeeComissionData] = useState<FeeCommissionData>();
    const [mainLoader, setMainLoader] = useState<boolean>(true);
    const topUpFeeLoading = transactionCard(3);
    const isFocused = useIsFocused();
    const { t } = useLngTranslation();
    const [authOpen, setAuthOpen] = useState<boolean>(false);
    const [error,setError]=useState<string>("");
    const [apiCallsCompleted, setApiCallsCompleted] = useState({
        coinsList: false,
        topupDetails: false
    });
    const initialValues = {
        currency: "",
        amount: ""
    };

    useEffect(() => {
        getCoinsList();
    }, [isFocused])

    // Helper function to remove commas and parse amount
    const parseAmountValue = (amountStr: string): number => {
        if (!amountStr || typeof amountStr !== 'string') return 0;
        const cleanedAmount = amountStr.replace(/,/g, '');
        const parsed = parseFloat(cleanedAmount);
        return isNaN(parsed) ? 0 : parsed;
    };
    useEffect(() => {
        const allCompleted = Object.values(apiCallsCompleted).every(Boolean);
        if (allCompleted) {
            setMainLoader(false);
        }
    }, [apiCallsCompleted]);
useHardwareBackHandler(()=>{
  backPress();
  return true;  
})
    const backPress = () => {
        navigation.goBack();
    }

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleAmountChange = useCallback((newAmount: string) => {
        setAmount(newAmount);
        // Cancel any pending API call
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Clear any pending debounce
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        // Immediately clear fee data if amount is empty or invalid
        if (!newAmount || newAmount.trim() === '' || newAmount === '0') {
            setFeeComissionData(undefined);
            setFeeComissionLoading(false);
        }
    }, []);

    useEffect(() => {
        // Clear any pending debounce
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        // Clear fee data immediately if amount is empty or invalid
        if (!amount || amount.trim() === '' || amount === '0') {
            setFeeComissionData(undefined);
            setFeeComissionLoading(false);
            return;
        }

        const parsedAmount = parseAmountValue(amount);
        if (parsedAmount > 0 && /^[0-9]\d*(\.\d+)?$/.test(amount?.replace(/,/g, '') || '')) {
            // Debounce API call by 500ms
            debounceTimeoutRef.current = setTimeout(() => {
                fetchDepositFeeComission();
            }, 500);
        } else {
            setFeeComissionData(undefined);
            setFeeComissionLoading(false);
        }
        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [amount, selectedCoin]);

    const handleAuthClose = () => {
        setAuthOpen(false);
        setLoading(false);
    };

    const handleAuthSuccess = () => {
        setAuthOpen(false);
        saveTopUp();
    };

    const verifyAuth = () => {
        setError("");
        // Validate amount
        if (!amount) {
            return setError(t("GLOBAL_CONSTANTS.PLEASE_ENTER_AMOUNT"));
        }

        const parsedAmount = parseAmountValue(amount);

        // Validate amount format
        if (amount && /^[0-9]\d*(\.\d+)?$/.test(amount?.replace(/,/g, '') || '') == false) {
            return setError(t("GLOBAL_CONSTANTS.PLEASE_ENTER_A_VALID_AMOUNT"));
        }

        // Validate minimum amount
        if (!amount || (amount && deposiData && parsedAmount < parseFloat(deposiData.depositCryptoMinAmount.toFixed(2)))) {
            return setError(`${t("GLOBAL_CONSTANTS.THE_MINIMUM_AMOUNT_FOR_DEPOSIT_IS")} ${deposiData?.depositCryptoMinAmount?.toFixed(2)} ${deposiData?.cryptoCurrency}`);
        }

        // Validate maximum amount
        if (!amount || (amount && deposiData && parsedAmount > parseFloat(deposiData.depositCryptoMaxAmount.toFixed(2)))) {
            return setError(`${t("GLOBAL_CONSTANTS.THE_MAXIMUM_AMOUNT_FOR_DEPOSIT_IS")} ${deposiData?.depositCryptoMaxAmount.toFixed(2)} ${deposiData?.cryptoCurrency}`);
        }

        // Validate sufficient balance
        if (selectedCoin && parsedAmount > selectedCoin.avilable) {
            return setError(t("GLOBAL_CONSTANTS.INSUFFICIENT_BALANCE"));
        }

        // Validate required selections
        if (!selectedCoin) {
            return setError(t("GLOBAL_CONSTANTS.PLEASE_SELECT_CURRENCY"));
        }
        // All validations passed, proceed with auth
        setAuthOpen(true);
        setLoading(true);
    };
    const getCoinsList = async () => {
        setError("");
        try {
            const response: any = await cardsService.topupCurrencyList();
            if (response?.status === 200) {
                setCoinsDataList(response?.data);
                setSelectedCoin(response?.data[0]);
                getTopupCurrencyDetails(response?.data[0]?.walletCode)

            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted(prev => ({ ...prev, coinsList: true }));
        }
    }



    const getTopupCurrencyDetails = async (walletCode?: any) => {
        const cardId = props?.route?.params?.activeCard?.id;
        try {
            const response: any = await cardsService.getTopUpData(cardId, walletCode);
            if (response?.status === 200) {
                setDeposiData(response?.data);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setApiCallsCompleted(prev => ({ ...prev, topupDetails: true }));
        }
    };
    const handleSelectionChange = async (selectedValue: any, setFieldValue: any) => {
        setSelectedCoin(selectedValue);
        setFieldValue('currency', selectedValue.walletCode);
        await getTopupCurrencyDetails(selectedValue?.walletCode);

    };
    const fetchDepositFeeComission = async () => {
        setError("");
        // Early return if amount is empty or invalid
        if (!amount || amount.trim() === '' || amount === '0') {
            setFeeComissionData(undefined);
            setFeeComissionLoading(false);
            return;
        }
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        // Create new AbortController
        abortControllerRef.current = new AbortController();

        const cardId = props?.route?.params?.activeCard?.id;
        const parsedAmount = parseAmountValue(amount);

        if (deposiData && parsedAmount >= parseFloat(deposiData.depositCryptoMinAmount.toFixed(2))) {
            setFeeComissionLoading(true)
            try {
                const response: any = await cardsService.getTopUpFeeComission(parsedAmount || 0, cardId);

                // Check if request was aborted
                if (abortControllerRef.current?.signal.aborted) {
                    return;
                }

                if (response?.status === 200) {
                    setFeeComissionData(response?.data);
                    setFeeComissionLoading(false)
                } else {
                    setError(isErrorDispaly(response));
                    setFeeComissionLoading(false)
                };
            } catch (error) {
                setError(isErrorDispaly(error));
                setFeeComissionLoading(false)
            }
        } else {
            setFeeComissionData(undefined);
            setFeeComissionLoading(false);
        }
    };

    const saveTopUp = async () => {
        setLoading(true);
        // const parsedAmount = parseAmountValue(amount);
        try {
            const Obj: any = {
                "cardId": props?.route?.params?.activeCard?.id,
                "cardNumber": deposiData?.cardNumber,
                "cuurency": deposiData?.cryptoCurrency,
                "holderId": deposiData?.holderId,
                "amount": amount,
                "fee": feeComissionData?.fee,
                "estimatedAmount": feeComissionData?.estimatedAmount,
                "concurrencyStamp": feeComissionData?.concurrencyStamp || "",
                "receivedAmount": feeComissionData?.toTalAmount
            };
            const res = await cardsService.saveTopupData(Obj);
            if (res.status === 200) {
                setLoading(false);
                navigation.navigate("TopUpSuccess", { cardId: props?.route?.params?.activeCard?.id, reciveAmount: `${feeComissionData?.toTalAmount || 0} ${deposiData?.fiatCurrency}` });
            } else {
                setError(isErrorDispaly(res));
                setLoading(false);
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setLoading(false);
        }
    }
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            {mainLoader && <SwokipayDashboardLoader />}
            {!mainLoader && (
                <Container>
                    <PageHeader title="GLOBAL_CONSTANTS.TOP_UP" onBackPress={backPress} />
                    {error &&<ErrorComponent message={error}screen={true}/>}
                    <KeyboardAwareScrollView
                        contentContainerStyle={[{ flexGrow: 1 }]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        enableOnAndroid={true}
                    >
                        <ViewComponent>
                            <Formik
                                initialValues={initialValues}
                                onSubmit={() => verifyAuth()}
                                validateOnChange={true}
                                validationSchema={topUpschema}
                                validateOnBlur={true}
                            >
                                {({ handleSubmit, touched, errors, setFieldValue, values }) => {
                                    if (selectedCoin && !values.currency) {
                                        setFieldValue('currency', selectedCoin?.walletCode);
                                    }

                                    return (
                                        <>
                                            <Field
                                                name="currency"
                                                component={CustomPickerModal}
                                                data={(coinsDataList || []).filter(item => item && (item.walletCode || item.id))}
                                                label="GLOBAL_CONSTANTS.CURRENCY"
                                                placeholder="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                                modalTitle="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                                inputCustomStyle={{ borderRadius: s(10) }}
                                                error={touched.currency && errors.currency ? errors.currency : undefined}
                                                searchPlaceholder="GLOBAL_CONSTANTS.SEARCH_CURRENCY"
                                                sheetHeight={s(500)}
                                                selectionType={"walletCode"}
                                                isRequired={true}
                                                onChange={(selectedValue: CoinData) => {
                                                    handleSelectionChange(selectedValue, setFieldValue);
                                                }}
                                            />

                                            <ViewComponent style={[commonStyles.sectionGap]} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.list]}>
                                                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                                    <ImageUri uri={selectedCoin?.logo} height={s(24)} width={s(24)} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1]}>
                                                    <TextMultiLanguage
                                                        text={"GLOBAL_CONSTANTS.AVAIL_BALANCE"}
                                                        style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} />
                                                    <ViewComponent>
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                                                            <CurrencyText
                                                                value={selectedCoin?.avilable || 0}
                                                                currency={`${selectedCoin?.walletCode || ''}`}
                                                                symboles={true}
                                                                style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]} />
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                </ViewComponent>
                                            </ViewComponent>
                                            <ViewComponent style={{ alignItems: "center" }}>
                                                <AmountInput
                                                    value={amount}
                                                    onChangeText={handleAmountChange}
                                                    inputStyle={[commonStyles.fw700, commonStyles.textWhite, {
                                                        fontSize: s(60)

                                                    }]}
                                                />
                                            </ViewComponent>
                                            <ViewComponent style={[commonStyles.sectionGap]}>

                                                <ViewComponent style={[commonStyles.mt16]} >
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                        <TextMultiLanguage
                                                            text={"GLOBAL_CONSTANTS.MAX_TOP_UP_AMOUNT_IS"}
                                                            style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                                        />

                                                        <CurrencyText value={deposiData?.depositCryptoMaxAmount || 0} style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw400]} />
                                                        <ParagraphComponent
                                                            text={`${deposiData?.cryptoCurrency || ''}/`}
                                                            style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                                        />

                                                        <CurrencyText value={deposiData?.depositMaxAmount || 0} style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw400]} />

                                                        <ParagraphComponent
                                                            text={`${deposiData?.fiatCurrency || ''}`}
                                                            style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                                        />
                                                    </ViewComponent>
                                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                        <TextMultiLanguage
                                                            text={"GLOBAL_CONSTANTS.MIN_TOP_UP_AMOUNT_IS"}
                                                            style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                                        />

                                                        <CurrencyText value={deposiData?.depositCryptoMinAmount || 0} style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw400]} />

                                                        <ParagraphComponent
                                                            text={`${deposiData?.cryptoCurrency || ""}/`}
                                                            style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                                        />
                                                        <CurrencyText value={deposiData?.depositMinAmount || 0} style={[commonStyles.fs12, commonStyles.textWhite, commonStyles.fw400]} />

                                                        <ParagraphComponent
                                                            text={`${deposiData?.fiatCurrency || ""}`}
                                                            style={[commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.fw400]}
                                                        />
                                                    </ViewComponent>
                                                </ViewComponent>


                                                {feeComissionLoading && (
                                                    <ViewComponent style={[commonStyles.mt32]}>
                                                        <Loadding contenthtml={topUpFeeLoading} />
                                                    </ViewComponent>
                                                )}
                                                {!feeComissionLoading && (
                                                    <ViewComponent style={[commonStyles.mt32]}>
                                                        <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FEE"} />
                                                            <CurrencyText value={feeComissionData?.fee || 0} currency={deposiData?.cryptoCurrency} style={[commonStyles.listprimarytext]} />
                                                        </ViewComponent>
                                                        <ViewComponent style={[commonStyles.listbg,commonStyles.menuitemspace]}>
                                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ESTIMATED_CRYPTO_AMOUNT"} />
                                                            <CurrencyText value={feeComissionData?.estimatedAmount || 0} currency={deposiData?.cryptoCurrency} style={[commonStyles.listprimarytext]} />
                                                        </ViewComponent>
                                                        <ViewComponent style={[commonStyles.listbg]}>
                                                            <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.TOTAL_RECEIVE_CURRENCY_AMOUNT"} />
                                                            <CurrencyText value={feeComissionData?.toTalAmount || 0} currency={deposiData?.fiatCurrency} style={[commonStyles.listprimarytext]} />
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                )}
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.mb24, commonStyles.gap10, commonStyles.mt16]}>
                                                    <ImageUri uri={COMMON_SVG_URLS.infoIcon} height={s(24)} width={s(24)} />
                                                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.DUE_TO_CURRENCY_PRICE_FLUCTUATIONS_THERE_MAY_BE_A_SMALL_DIFFERENCE_BETWEEN_THE_FINAL"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.flex1]} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.sectionGap]} />
                                                <ViewComponent style={[commonStyles.flex1]} />
                                                <ButtonComponent
                                                    title="GLOBAL_CONSTANTS.CONTINUE"
                                                    onPress={handleSubmit}
                                                    loading={loading}
                                                    disable={loading || !amount || !feeComissionData?.fee}
                                                />
                                                <ViewComponent style={[commonStyles.sectionGap]} />
                                            </ViewComponent>
                                        </>
                                    );
                                }}
                            </Formik>
                        </ViewComponent>
                    </KeyboardAwareScrollView>

                    {authOpen && (
                        <AuthVerification
                            onClose={handleAuthClose}
                            onSuccess={handleAuthSuccess}
                            feature={'Top Up'}
                            requiredVerifys={1}
                        />
                    )}
                </Container>
            )}
        </ViewComponent>
    )
}

export default CardTopUp;
