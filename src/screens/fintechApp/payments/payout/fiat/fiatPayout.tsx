import React, { useRef, useState, useEffect, useCallback } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import { Field, Formik } from "formik";
import ButtonComponent from "../../../../../components/buttons/button";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import CustomPicker from "../../../../../components/customPicker/CustomPicker";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import Container from "../../../../../components/container/container";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { CoinImages, getThemedCommonStyles } from "../../../../../components/CommonStyles";
import PaymentService from "../../../../../apiServices/payments";
import { isErrorDispaly } from "../../../../../utils/helpers";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import ViewComponent from "../../../../../components/view/view";
import Feather from 'react-native-vector-icons/Feather';
import RBSheet from "react-native-raw-bottom-sheet";
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import { s } from "../../../../../components/theme/scale";
import FiatPayeeListSheetContent from "../../../bank/withdraw/components/FiatPayeeListSheetContent";
import { ADD_RECIPIENT } from "../../../profile/addressbook/fiatPayee/addRecipient/constant";
import { createValidationSchema, PAYOUT_CONSTANTS } from "./fiatPayoutSchema";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import { logEvent } from "../../../../../hooks/loggingHook";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import AmountInput from "../../../../../components/amountInput/amountInput";
import ImageUri from "../../../../../components/imageComponents/image";
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import DashboardLoader from '../../../../../components/loader';


const FiatPayout = (props: any) => {
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [fiatCurrencies, setFiatCurrencies] = useState<any[]>();
    const payeeSheetRef = useRef<RBSheet>(null);
    const [payeeList, setPayeeList] = useState<any[]>();
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [formikTouched, setFormikTouched] = useState<boolean>(false);
    const [selectedCurrency, setSelectedCurrency] = useState()
    const addPayeeSheetRef = useRef<RBSheet>(null);
    const [selectedPayee, setSelectedPayee] = useState<any>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
    const [purposeList, setPurposeList] = useState<any>([]);
    const [sourceOfFundsList, setSourceOfFundsList] = useState<any>([]);
    const [loader, setLoader] = useState<boolean>(false);
    const [selectedFiatCurrency, setSelectedFiatCurrency] = useState(props?.route?.params?.selectedVault?.code || '')
    const initValues = {
        fromCurrency: props?.route?.params?.selectedVault?.code || "",
        amount: "",
        toCurrency: "",
        payee: "",
        purpose: "",
        sourceOfFunds: "",
    };
    const coinList = props?.allCoinsList || props?.route?.params?.allCoinsList || [];
    useEffect(() => {
        if (props?.route?.params?.selectedVault?.productId || props?.allCoinsList[0]?.productId) {
            getFiatCurrency();
        }

        // Set initial currency and network from available data
        if (props?.route?.params?.selectedVault?.code) {
            setSelectedCurrency(props.route.params.selectedVault.code);
            setSelectedNetwork(props.route.params.selectedVault);
        } else if (props?.allCoinsList?.[0]) {
            setSelectedCurrency(props.allCoinsList[0].code);
            setSelectedNetwork(props.allCoinsList[0]);
        }

        getPayeesList(props?.route?.params?.selectedVault?.code || props?.allCoinsList?.[0]?.code);
    }, [props?.route?.params?.selectedVault?.productId]);
    const getFiatCurrency = async () => {
        setLoader(true);
        try {
            const response: any = await PaymentService.getCurrencyLu(props?.route?.params?.selectedVault?.productId || props?.allCoinsList[0]?.productId, "payoutfiat");
            if (response.ok) {
                setLoader(false);
                const fiatCurrencyList = response?.data?.map((data: any) => ({
                    ...data,
                    name: data.code,
                })) || [];
                setFiatCurrencies(fiatCurrencyList)

            } else {
                setLoader(false);
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setLoader(false);
            setErrorMsg(isErrorDispaly(error));
        }
    };

    const getPayeesList = async (currency: string) => {
        if (!currency) {
            setPayeeList(undefined);
            return;
        };
        try {
            const response: any = await PaymentService.getFiatPayee(currency || props?.route?.params?.selectedVault?.code); // Assuming a getFiatPayee service
            if (response?.ok) {
                setPayeeList(response.data);
            } else {
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    };
    const backArrowButtonHandler = () => {
        navigation.goBack();
    };

    const handleCancel = () => {
        navigation.goBack();
    };
    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    });
    const handlePayeeFieldPress = () => {
        payeeSheetRef.current && payeeSheetRef.current.open();
    };
    const handleNavigatePayee = () => {
        payeeSheetRef.current && payeeSheetRef.current.close();
        setTimeout(() => {
            addPayeeSheetRef.current && addPayeeSheetRef.current.open();
        }, 300);
    };
    const handleFromCurrencyChange = (item: any) => {
        setSelectedCurrency(item);
        const selectedVault = coinList?.find((coin: any) => coin.code === item);
        if (selectedVault) {
            setSelectedNetwork(selectedVault);
            setPurposeList([]);
            setSourceOfFundsList([]);
            if (selectedPayee?.id) {
                loadAdditionalFields(selectedPayee.id);
            }
        }
    }
    const onSubmit = async (values: any) => {
        logEvent("Button Pressed", { action: "fait payout button", currentScreen: "Fait payout" })
        if (values?.amount > selectedNetwork?.amount) {
            setErrorMsg(`Insufficient balance in ${selectedNetwork?.name || selectedNetwork?.code || 'wallet'}`);
            return;
        }
        setBtnLoading(true);
        try {
            const payload = {
                customerWalletId: selectedNetwork?.id,
                amount: parseFloat(values?.amount),
                fiatCurrency: selectedFiatCurrency,
                payeeId: selectedPayee?.id,
                metadata: "",
                moduleType: ""
            };
            const response: any = await PaymentService.postFiatWithdraw(payload);
            if (response.ok) {
                setBtnLoading(false);
                navigation.navigate('PayoutSummary', {
                    amount: values?.amount,
                    network: selectedNetwork?.code,
                    exchangeRate: response.data.exchangeRate,
                    addressBookId: selectedPayee?.id,
                    walletCode: selectedNetwork?.code || props?.route?.params?.selectedVault?.code,
                    walletAddress: selectedPayee?.walletAddress,
                    merchantId: selectedNetwork?.id,
                    customerWalletId: selectedNetwork?.id,
                    fee: response?.data?.fee,
                    flatFee: response?.data?.feeInfo?.FlatFee,
                    finalAmount: response?.data?.finalAmount,
                    requestedAmount: response?.data?.requestedAmount,
                    quoteId: response?.data?.quoteId,
                    expiresIn: response?.data?.expiresIn,
                    logo: props?.route?.params?.logo,
                    payeeName: selectedPayee?.favoriteName || selectedPayee?.name,
                    paymentType: "Fiat",
                    timer: response?.data?.timer,
                    fiatCurrency: selectedFiatCurrency,
                    balance: selectedNetwork?.amount,
                    favouriteName: response?.data?.favouriteName,
                    beneficiaryName: response?.data?.beneficiaryName,
                    PaymentMode: response?.data?.paymentType,
                    accNoorWalletAddress: response?.data?.accNoorWalletAddress,
                    holderName: response?.data?.holderName,
                    screenName: props?.screenName,

                });
            }
            else {
                setBtnLoading(false);
                setErrorMsg(isErrorDispaly(response));
            }

        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        } finally {
            setBtnLoading(false);
        }
    };
    const handleCurrencyChange = (val: any) => {
        setSelectedFiatCurrency(val)
        setSelectedPayee(null);
        getPayeesList(val);
    }
    const loadAdditionalFields = async (payeeId: string) => {
        try {
            const purposeResponse: any = await PaymentService.getPurpose(payeeId);
            if (purposeResponse.ok && purposeResponse.data?.data?.data && Array.isArray(purposeResponse.data.data.data)) {
                setPurposeList(purposeResponse.data.data.data.map((item: any) => ({
                    ...item,
                    name: item.purpose,
                    code: item.purposeCode
                })));
            } else {
                setPurposeList([]);
            }
            const sourceResponse: any = await PaymentService.getSourceFunds(payeeId);
            if (sourceResponse.ok && sourceResponse.data?.data?.data && Array.isArray(sourceResponse.data.data.data)) {
                setSourceOfFundsList(sourceResponse?.data?.data?.data?.map((item: any) => ({
                    ...item,
                    name: item.sourceOfIncome || item.name,
                    code: item.sourceOfFundsCode || item.code
                })));
            } else {
                setSourceOfFundsList([]);
            }
        } catch {
            setPurposeList([]);
            setSourceOfFundsList([]);
        }
    };

    const formatNumericInput = useCallback((text: string) => {
        let numericValue = text.replace(/[^0-9.]/g, '');
        const decimalIndex = numericValue?.indexOf('.');
        if (decimalIndex !== -1) {
            const integerPart = numericValue?.slice(0, decimalIndex);
            const fractionalPart = numericValue?.slice(decimalIndex + 1)?.replace(/\./g, '');
            numericValue = integerPart + '.' + fractionalPart?.slice(0, 8);
        }
        return numericValue;
    }, []);

    const handleMaxValue = useCallback((setFieldValue: any) => {
        const maxLimit = parseFloat(selectedNetwork?.amount) < parseFloat(selectedNetwork?.maxLimit) ? parseFloat(selectedNetwork?.amount) : parseFloat(selectedNetwork?.maxLimit)
        setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.AMOUNT, maxLimit.toFixed(2));
    }, [selectedNetwork?.maxLimit]);

    const handleMinValue = useCallback((setFieldValue: any) => {
        const minLimit = selectedNetwork?.minLimit || 0;
        setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.AMOUNT, minLimit.toFixed(2));
    }, [selectedNetwork?.minLimit]);


    const handlePersonalPayee = () => {
        addPayeeSheetRef.current && addPayeeSheetRef.current.close();
        navigation.navigate('AccountDetails', {
            walletCode: props?.route?.params?.walletCode,
            logo: props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.PERSIONAL,
            screenName: 'Payout'
        });
    };

    const handleBusinessPayee = () => {
        addPayeeSheetRef.current && addPayeeSheetRef.current.close();
        navigation.navigate('AccountDetails', {
            walletCode: props?.route?.params?.walletCode,
            logo: props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.BUSINESS,
            screenName: 'Payout'
        });
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loader && (
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]} >
                    <DashboardLoader />
                </SafeAreaViewComponent>
            )}
            {!loader && <Container style={[commonStyles.container]}>
                <PageHeader title={`${t("GLOBAL_CONSTANTS.WITHDRAW")} ${props?.route?.params?.selectedVault?.name || ''}`} onBackPress={backArrowButtonHandler} />
                {errorMsg && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />}
                <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} enableOnAndroid={true}>
                    <Formik
                        initialValues={initValues}
                        onSubmit={(values) => {
                            setFormikTouched(true);
                            if (!selectedPayee) {
                                return;
                            }
                            onSubmit(values);
                        }}
                        validationSchema={createValidationSchema(selectedNetwork, t)}
                        enableReinitialize
                        validateOnChange={true}
                        validateOnBlur={true}
                    >
                        {(formik) => {
                            const {
                                touched,
                                handleSubmit,
                                errors,
                                handleBlur,
                                values,
                                setFieldValue
                            } = formik;

                            const handleSendAmountChange = useCallback((text: string) => {
                                const formattedValue = formatNumericInput(text);
                                setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.AMOUNT, formattedValue);
                            }, [formatNumericInput, setFieldValue]);

                            return (
                                <ViewComponent style={[]}>

                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                        <ViewComponent style={[commonStyles.flex1]}>
                                            <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.CURRENCY" multiLanguageAllows>
                                                <LabelComponent text=" *" style={[commonStyles.textRed]} />
                                            </LabelComponent>
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                            <ParagraphComponent
                                                style={[commonStyles.availblelabel]}
                                                text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')} `}
                                            />
                                            <CurrencyText
                                                value={selectedNetwork?.amount || 0}
                                                currency={selectedCurrency} decimalPlaces={2}
                                                symboles={true}
                                                style={[commonStyles.availbleamount]}
                                            />
                                        </ViewComponent>
                                    </ViewComponent>

                                    {/* <Field
                                        name={PAYOUT_CONSTANTS.FIELD_NAMES.FROM_CURRENCY}
                                        component={CustomPicker}
                                        data={coinList?.map((item:any)=>{
                                            item.name=item.code
                                            return item
                                        })}
                                        label="GLOBAL_CONSTANTS.CURRENCY"
                                        value={selectedCurrency}
                                        placeholder="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                        modalTitle="GLOBAL_CONSTANTS.SELECT_FROM_CURRENCY"
                                        selectionType="code"
                                        error={errors.fromCurrency}
                                        touched={touched.fromCurrency}
                                        handleBlur={handleBlur}
                                        requiredMark={<LabelComponent text=" *" style={[commonStyles.textRed]} />}
                                        onChange={(item: any) => {
                                            setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.FROM_CURRENCY, item);
                                            handleFromCurrencyChange(item);
                                        }}
                                    /> */}
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap8]} >
                                        <ViewComponent style={{ width: s(32), height: s(32) }} >
                                            <ImageUri
                                                uri={CoinImages[selectedCurrency?.toLowerCase() || 'idr'] || ""}
                                                style={{ width: s(32), height: s(32) }}
                                            />
                                        </ViewComponent>
                                        <ParagraphComponent style={[commonStyles.inputdropdowntext, commonStyles.mt6]} text={selectedCurrency} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.formItemSpace]} />

                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <LabelComponent style={commonStyles.inputLabel} text="GLOBAL_CONSTANTS.AMOUNT" multiLanguageAllows>
                                            <LabelComponent text=" *" style={[commonStyles.textRed]} />
                                        </LabelComponent>
                                    </ViewComponent>
                                    <AmountInput

                                        isRequired={true}
                                        placeholder={"GLOBAL_CONSTANTS.ENTER_AMOUNT"}
                                        maxLength={16}
                                        onChangeText={handleSendAmountChange}
                                        value={values?.amount || ''}
                                        onMinPress={() => handleMinValue(setFieldValue)}
                                        onMaxPress={() => handleMaxValue(setFieldValue)}
                                        minLimit={selectedNetwork?.minLimit ?? 0}
                                        maxLimit={selectedNetwork?.maxLimit == null || selectedNetwork?.amount == null ? undefined : (parseFloat(selectedNetwork?.amount) < parseFloat(selectedNetwork?.minLimit) ? parseFloat(selectedNetwork?.maxLimit) : (parseFloat(selectedNetwork?.amount) > parseFloat(selectedNetwork?.maxLimit) ? parseFloat(selectedNetwork?.maxLimit) : parseFloat(selectedNetwork?.amount)))}
                                        //  maxLimit={(parseFloat(selectedNetwork?.amount) < parseFloat(selectedNetwork?.minLimit) ? parseFloat(selectedNetwork?.maxLimit) :(parseFloat(selectedNetwork?.amount) >parseFloat(selectedNetwork?.maxLimit) ?parseFloat(selectedNetwork?.maxLimit) :parseFloat(selectedNetwork?.amount)))}
                                        showError={errors?.amount}
                                        touched={touched?.amount}
                                        maxDecimals={2}
                                        decimals={2}
                                        coinCode={selectedNetwork?.code}
                                    />

                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                    {/* <Field
                                        name={PAYOUT_CONSTANTS.FIELD_NAMES.TO_CURRENCY}
                                        component={CustomPicker}
                                        data={fiatCurrencies}
                                        label="GLOBAL_CONSTANTS.TO_CURRENCY"
                                        placeholder="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_TO_CURRENCY"}
                                        error={errors.toCurrency}
                                        touched={touched.toCurrency}
                                        handleBlur={handleBlur}
                                        requiredMark={<LabelComponent text=" *" style={[commonStyles.textRed]} />}
                                        onChange={(item: any) => {
                                            setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.TO_CURRENCY, item);
                                            handleCurrencyChange(item);
                                        }}
                                    /> */}
                                    {/* Select Payee */}

                                    <LabelComponent style={[commonStyles.payeeLabel, commonStyles.mb10]}
                                        text={t("GLOBAL_CONSTANTS.PAYEE")}>
                                        <LabelComponent text=" *" style={[commonStyles.textRed]} />
                                    </LabelComponent>
                                    <CommonTouchableOpacity onPress={handlePayeeFieldPress}
                                    // disabled={!selectedFiatCurrency}
                                    >
                                        <ViewComponent
                                            style={[
                                                commonStyles.withdrawPayeeInput,
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                commonStyles.justifyContent,
                                                commonStyles.relative,
                                                (formikTouched && !selectedPayee && commonStyles.errorBorder),
                                                // (!selectedFiatCurrency && { opacity: 0.5 })
                                            ]}>
                                            {selectedPayee ? (
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.gap14, commonStyles.alignCenter]}>
                                                    <ViewComponent style={[
                                                        commonStyles.dflex,
                                                        commonStyles.alignCenter,
                                                        commonStyles.justifyCenter,
                                                        commonStyles.inputroundediconbg
                                                    ]}>
                                                        <ParagraphComponent
                                                            style={[
                                                                commonStyles.twolettertext
                                                            ]}
                                                            text={selectedPayee.favoriteName?.slice(0, 1)?.toUpperCase() || ''}
                                                        />
                                                    </ViewComponent>
                                                    <ViewComponent style={{ flex: 1 }}>
                                                        <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite]} text={selectedPayee.favoriteName || ''} numberOfLines={1} />
                                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={selectedPayee?.currency || ''} />
                                                    </ViewComponent>
                                                </ViewComponent>
                                            ) : (
                                                <TextMultiLanguage style={[commonStyles.fw400, commonStyles.fs16, commonStyles.textlinkgrey, commonStyles.flex1]} text={'GLOBAL_CONSTANTS.SELECT_PAYEE'} />
                                            )}
                                            <Feather name="chevron-down" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                    {(formikTouched && !selectedPayee) && (
                                        <TextMultiLanguage text={t('GLOBAL_CONSTANTS.IS_REQUIRED')} style={[commonStyles.mt4, commonStyles.fs14, commonStyles.fw400, commonStyles.textRed]} />
                                    )}

                                    {selectedNetwork?.transactionAdditionalFields && <ViewComponent>
                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        {/* Purpose */}
                                        <Field
                                            name={PAYOUT_CONSTANTS.FIELD_NAMES.PURPOSE}
                                            component={CustomPicker}
                                            data={purposeList}
                                            label="GLOBAL_CONSTANTS.PURPOSE"
                                            placeholder="GLOBAL_CONSTANTS.SELECT_PURPOSE"
                                            modalTitle="GLOBAL_CONSTANTS.SELECT_PURPOSE"
                                            error={errors.purpose}
                                            touched={touched.purpose}
                                            handleBlur={handleBlur}
                                            onChange={(item: any) => setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.PURPOSE, item)}
                                        />
                                        <ViewComponent style={[commonStyles.formItemSpace]} />

                                        {/* Source Of Funds */}
                                        <Field
                                            name={PAYOUT_CONSTANTS.FIELD_NAMES.SOURCE_OF_FUNDS}
                                            component={CustomPicker}
                                            data={sourceOfFundsList}
                                            label="GLOBAL_CONSTANTS.SOURCE_OF_FUNDS"
                                            placeholder="GLOBAL_CONSTANTS.SELECT_SOURCE_OF_FUNDS"
                                            modalTitle="GLOBAL_CONSTANTS.SELECT_SOURCE_OF_FUNDS"
                                            error={errors.sourceOfFunds}
                                            touched={touched.sourceOfFunds}
                                            handleBlur={handleBlur}
                                            onChange={(item: any) => setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.SOURCE_OF_FUNDS, item)}
                                        />
                                    </ViewComponent>}
                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                    {/* Action Buttons */}
                                    <ButtonComponent
                                        title="GLOBAL_CONSTANTS.CONTINUE"
                                        onPress={() => {
                                            setFormikTouched(true);
                                            handleSubmit();
                                        }}
                                        loading={btnLoading}
                                        disable={btnLoading}
                                    />
                                    <ViewComponent style={[commonStyles.buttongap]} />
                                    <ButtonComponent
                                        title="GLOBAL_CONSTANTS.CANCEL"
                                        onPress={handleCancel}
                                        solidBackground={true}
                                        disable={btnLoading}
                                    />
                                    <ViewComponent style={[commonStyles.mb24]} />
                                </ViewComponent>
                            )
                        }}
                    </Formik>
                </KeyboardAwareScrollView>
                {/* Payee Selection Bottom Sheet */}
                <CustomRBSheet
                    refRBSheet={payeeSheetRef}
                    title="GLOBAL_CONSTANTS.SELECT_PAYEE"
                    height={"Medium"}
                    closeicon={false}
                >
                    <FiatPayeeListSheetContent
                        dataLoading={false}
                        payeesList={payeeList || []}
                        selectedPayee={selectedPayee}
                        handleActivePayee={(item: any) => {
                            setSelectedPayee(item);
                            payeeSheetRef.current && payeeSheetRef.current.close();
                            loadAdditionalFields(item.id);
                        }}
                        transactionCardContent={null}
                        commonStyles={commonStyles}
                        s={s}
                        handleNavigatePayee={handleNavigatePayee}
                    />
                </CustomRBSheet>
                {/* RBSheet for Add Payee Options (Personal/Business) */}
                <CustomRBSheet
                    refRBSheet={addPayeeSheetRef}
                    title=""
                    height={"Small"}
                >
                    <ViewComponent style={[commonStyles.sheetHeaderbg]}>
                        <ViewComponent>
                            <CommonTouchableOpacity onPress={handlePersonalPayee}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                        <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                                            <Feather name='user' size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                        </ViewComponent>
                                        <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt5]} text={"GLOBAL_CONSTANTS.PERSONAL"} />
                                    </ViewComponent>
                                    <Feather name="chevron-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </CommonTouchableOpacity>
                            <ViewComponent style={[commonStyles.listGap]} />
                            <CommonTouchableOpacity onPress={handleBusinessPayee}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2 }]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                        <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
                                            <Feather name='briefcase' size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                                        </ViewComponent>
                                        <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.textCenter, commonStyles.mt5]} text={"GLOBAL_CONSTANTS.BUSINESS"} />
                                    </ViewComponent>
                                    <Feather name="chevron-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </CommonTouchableOpacity>
                        </ViewComponent>
                        <ViewComponent style={commonStyles.sectionGap} />
                        <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} solidBackground={true} onPress={() => addPayeeSheetRef?.current?.close()} />
                    </ViewComponent>
                </CustomRBSheet>
            </Container>}
        </ViewComponent>
    );
};

export default FiatPayout;
