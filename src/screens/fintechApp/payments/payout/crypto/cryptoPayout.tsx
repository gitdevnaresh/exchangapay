import React, { useRef, useState, useCallback, useEffect } from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Field, Formik } from "formik";
import { validationPayout, createDynamicPayoutValidationSchema } from "../schema";
import ButtonComponent from "../../../../../components/buttons/button";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import { PAYOUT_CONSTANTS } from "../payOutConstants";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import CustomPicker from "../../../../../components/customPicker/CustomPicker";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import Container from "../../../../../components/container/container";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import InputDefault from "../../../../../components/textInputComponents/DefaultFiat"; // Use your disabled input component
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
import { ADD_RECIPIENT } from "../../../profile/addressbook/fiatPayee/addRecipient/constant";
import { CryptoObj } from "./send/sendInterface";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import AmountInput from "../../../../../components/amountInput/amountInput";
import DynamicFieldRenderer from "./components/DynamicFieldRenderer";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import { FiatPayeeListSheetContent } from "../../../bank/withdraw";
import { TransferType } from "../../interface";

const CryptoPayout = (props: any) => {
    const propsData = props?.route?.params;
    const ref = useRef();
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [errorMsg, setErrorMsg] = useState<any>("");
    const isFocused = useIsFocused()
    // Use vaultData as fallback for selectedVault
    const vaultsList = propsData?.vaultsList || [];
    const [formikTouched, setFormikTouched] = useState<boolean>(false);
    const selectedVault = propsData?.selectedVault || propsData?.vaultData || vaultsList[0] || {};
    // State for lists - matching the working pattern
    const [lists, setLists] = useState({
        coinList: [],
        networkList: [],
        fiatCurrencyList: []
    });
    const [selectedNetwork, setSelectedNetwork] = useState<any>();
    const [selectedCoin, setSelectedCoin] = useState<any>();
    const payeeSheetRef = useRef<RBSheet>(null); // Fixed ref type
    const addPayeeSheetRef = useRef<RBSheet>(null); // New ref for add payee options
    const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
    const [selectedPayee, setSelectedPayee] = useState<any>(null);
    const [payeeList, setPayeeList] = useState<any>([])
    const { t } = useLngTranslation();
    const [btnLoading, setBtnLoading] = useState(false);
    const [dynamicFields, setDynamicFields] = useState<any[]>([]);
    const [transferTypeList, setTransferTypeList] = useState<TransferType[]>([]);
    useEffect(() => {
        if (selectedCoin) {
            getFiatCurrency();
        }
    }, [isFocused, selectedCoin]);

    useEffect(() => {
        if (Array.isArray(selectedVault?.details)) {
            const coinList = selectedVault.details.map((data: any) => {
                return {
                    ...data,
                    name: data.code, // Use code as name for consistency
                    code: data.code,
                };
            });
            setLists(prev => ({ ...prev, coinList }));

            // If there's a pre-selected coin, set up its networks and dynamic fields
            if (propsData?.coinCode) {
                const preSelectedCoin = coinList.find((coin: any) => coin.code === propsData?.coinCode);
                if (preSelectedCoin) {
                    setSelectedCoin(preSelectedCoin);
                    const networkList = propsData?.network || propsData?.networksData || preSelectedCoin.networks || [];
                    setLists(prev => ({
                        ...prev,
                        networkList: networkList
                    }));

                    // Parse dynamic fields for pre-selected coin
                    if ((preSelectedCoin as any)?.transactionAdditionalFields) {
                        const fields = parseDynamicFields((preSelectedCoin as any).transactionAdditionalFields);
                        setDynamicFields(fields);

                        // Add dynamic fields to initial values
                        const newInitValues = { ...initValues };
                        fields.forEach((field: any) => {
                            newInitValues[field.key] = "";
                        });
                        setInitValues(newInitValues);
                    }
                }
            }
        }
    }, [selectedVault?.details, propsData?.coinCode, propsData?.network]);

    const [initValues, setInitValues] = useState<any>({
        merchantName: selectedVault?.name || "",
        currency: propsData?.coinCode || "",
        networkName: "",
        amount: "",
        cryptoCurrency: "",
        transferType: ""
    });

    const parseDynamicFields = (transactionAdditionalFields: string) => {
        try {
            const fields = JSON.parse(transactionAdditionalFields);
            const parsedFields = Array.isArray(fields) ? fields : [fields];
            return parsedFields;
        } catch (error) {
            return [];
        }
    };

    // Update initial values when props change
    useEffect(() => {
        setInitValues(prev => ({
            ...prev,
            merchantName: selectedVault?.name || "",
            currency: propsData?.coinCode || "",
        }));
    }, [selectedVault?.name, propsData?.coinCode]);

    const backArrowButtonHandler = () => {
        navigation.navigate("PayOutList", { animation: 'slide_from_left', initialTab: 1 });

    };

    const handleCancel = () => {
        navigation.goBack();
    };

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
    })
    const handleCoinChange = (coinCode: string, setFieldValue: any) => {
        setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.CURRENCY, coinCode);
        setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.NETWORK, '');
        setFieldValue("cryptoCurrency", '')
        const newSelectedCoin = lists.coinList.find((c: any) => c.code === coinCode);
        setSelectedCoin(newSelectedCoin);
        const networkList = (coinCode === propsData?.coinCode)
            ? (propsData?.network || propsData?.networksData || (newSelectedCoin as any)?.networks || [])
            : ((newSelectedCoin as any)?.networks || []);

        setLists(prev => ({
            ...prev,
            networkList: networkList,
        }));
        setSelectedNetwork(undefined);

        // Parse and set dynamic fields from selected coin
        if ((newSelectedCoin as any)?.transactionAdditionalFields) {
            const fields = parseDynamicFields((newSelectedCoin as any).transactionAdditionalFields);
            setDynamicFields(fields);

            // Clear previous dynamic field values and add new ones to form
            const newInitValues = { ...initValues };
            fields.forEach((field: any) => {
                newInitValues[field.key] = "";
                setFieldValue(field.key, "");
            });
            setInitValues(newInitValues);
        } else {
            setDynamicFields([]);
        }
    };
    const handleNetworkChange = (networkCode: string, setFieldValue: any) => {
        setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.NETWORK, networkCode);
        const selectedNet = lists.networkList.find((n: any) => n.code === networkCode);
        setSelectedNetwork(selectedNet);
    };

    const onSubmit = async (values: any) => {
        setErrorMsg("")
        if (values?.amount > selectedCoin?.amount) {
            setErrorMsg(`Insufficient balance in ${selectedCoin?.name} and Network ${selectedNetwork?.name}`)
            return;
        }
        setBtnLoading(true)
        let response: any;
        try {
            // Build dynamic fields object
            const dynamicFieldsData: any = {};
            dynamicFields.forEach((field: any) => {
                if (values[field.key]) {
                    dynamicFieldsData[field.key] = values[field.key];
                }
            });

            let cryptoobj: CryptoObj = {
                customerWalletId: selectedNetwork?.id,
                amount: parseFloat(values?.amount),
                fiatCurrency: selectedCurrency,
                payeeId: selectedPayee?.id,
                metadata: "",
                moduleType: ""
            };
            response = await PaymentService.postCryptoWithdraw(cryptoobj);
            if (response.ok) {
                setBtnLoading(false)
                navigation.navigate("PayoutSummary", {
                    amount: values?.amount,
                    network: selectedNetwork?.code,
                    exchangeRate: response.data.exchangeRate,
                    addressBookId: selectedPayee?.id,
                    walletCode: selectedCoin.code,
                    walletAddress: selectedPayee?.walletAddress,
                    merchantId: selectedCoin.id,
                    customerWalletId: selectedNetwork?.id,
                    fee: response?.data?.fee,
                    flatFee: response?.data?.feeInfo?.FlatFee,
                    finalAmount: response?.data?.finalAmount,
                    requestedAmount: response?.data?.requestedAmount,
                    receivedAmount: response?.data?.receivedAmount,
                    quoteId: response?.data?.quoteId,
                    expiresIn: response?.data?.expiresIn,
                    timer: response?.data?.timer,
                    logo: props?.route?.params?.logo,
                    payeeName: selectedPayee?.favoriteName || selectedPayee?.name,
                    paymentType: "Crypto",
                    paymentTypeapi: response?.data?.paymentType,
                    fiatCurrency: selectedCurrency,
                    transferType: values?.transferType,
                    document: "",
                    balance: selectedCoin?.amount,
                    favouriteName: response?.data?.favouriteName,
                    beneficiaryName: response?.data?.beneficiaryName,
                    PaymentMode: response?.data?.paymentType,
                    accNoorWalletAddress: response?.data?.accNoorWalletAddress,
                    holderName: response?.data?.holderName,
                    bankName: response?.data?.bankName,
                    dynamicFields: dynamicFieldsData, // Pass dynamic fields
                }
                )
            }
            else {
                setBtnLoading(false)
                setErrorMsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
            setBtnLoading(false)
        }
    };
    const getFiatCurrency = async () => {
        try {
            const response: any = await PaymentService.getCurrencyLu(selectedCoin.productId, "payoutcrypto");
            if (response.ok) {
                const fiatCurrencyList = response?.data?.map((data: any) => ({
                    ...data,
                    name: data.code,
                })) || [];
                setLists(prev => ({
                    ...prev,
                    fiatCurrencyList
                }));
            } else {
                setErrorMsg(isErrorDispaly(response?.data));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        }
    };

    const getPayeesList = async (coin: string) => {
        try {
            const response: any = await PaymentService.getCryptoPayee(coin, "payoutcrypto")
            if (response?.ok) {
                setPayeeList(response.data)
            }
            else {
                setErrorMsg(isErrorDispaly(response))
            }

        } catch (error) {
            setErrorMsg(isErrorDispaly(error))
        }
    }
    const formatNumericInput = useCallback((text: string) => {
        let numericValue = text.replace(/[^0-9.]/g, '');
        const decimalIndex = numericValue?.indexOf('.');
        if (decimalIndex !== -1) {
            const integerPart = numericValue?.slice(0, decimalIndex);
            const fractionalPart = numericValue?.slice(decimalIndex + 1)?.replace(/\./g, '');
            numericValue = integerPart + '.' + fractionalPart?.slice(0, 4);
        }
        return numericValue;
    }, []);

    const handlePayeeFieldPress = () => {
        payeeSheetRef.current && payeeSheetRef.current.open();
    };
    const handleCurrencyChange = (val: any, setFieldValue?: any) => {
        setSelectedCurrency(val);
        setSelectedPayee(null);
        getPayeesList(val);

        if (setFieldValue) {
            setFieldValue('transferType', '');
        }

        const selectedCurrencyData = lists.fiatCurrencyList.find((c: any) => c.code === val);
        if (selectedCurrencyData?.transactionAdditionalFields) {
            try {
                const fields = JSON.parse(selectedCurrencyData.transactionAdditionalFields);
                const schemaList = Array.isArray(fields) ? fields.map((f: any) => ({
                    name: f.Name,
                    code: f.Code.toLowerCase()
                })) : [];
                setTransferTypeList(schemaList);
            } catch (error) {
                setTransferTypeList([]);
            }
        } else {
            setTransferTypeList([]);
        }
    }
    const handleActivePayee = (item: any) => {
        setSelectedPayee(item);
        payeeSheetRef.current && payeeSheetRef.current.close();
    };
    const handleNavigatePayee = () => {
        payeeSheetRef.current && payeeSheetRef.current.close();
        setTimeout(() => {
            addPayeeSheetRef.current && addPayeeSheetRef.current.open();
        }, 300);
    };

    const handlePersonalPayee = () => {
        addPayeeSheetRef.current && addPayeeSheetRef.current.close();
        props.navigation.navigate('AccountDetails', {
            walletCode: props?.route?.params?.walletCode,
            logo: props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.PERSIONAL,
            screenName: 'Payout'
        });
    };

    const handleBusinessPayee = () => {
        addPayeeSheetRef.current && addPayeeSheetRef.current.close();
        props.navigation.navigate('AccountDetails', {
            walletCode: props?.route?.params?.walletCode,
            logo: props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.BUSINESS,
            screenName: 'Payout'
        });
    };


    const validateBeneficiary = () => {
        if (formikTouched && !selectedPayee) {
            return t('GLOBAL_CONSTANTS.IS_REQUIRED');
        }
        return undefined;
    };

    const handleValidationSave = (validateForm: () => Promise<any>) => {
        validateForm().then(async (errors: any) => {
            if (Object.keys(errors).length > 0) {
                setErrorMsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
            }
        })
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={[commonStyles.container]}>
                <PageHeader title={"GLOBAL_CONSTANTS.PAY_OUT_CRYPTO"} onBackPress={backArrowButtonHandler} />
                {errorMsg && (<ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />)}
                <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} enableOnAndroid={true}>
                    <Formik
                        initialValues={initValues}
                        onSubmit={(values) => {
                            // Check all required fields at once
                            if (!selectedPayee || !selectedNetwork || !selectedCurrency) {
                                setErrorMsg(t('GLOBAL_CONSTANTS.PLEASE_CHECK_BELLOW_ALL_FEILD'));
                                return;
                            }
                            onSubmit(values);
                        }}
                        validationSchema={createDynamicPayoutValidationSchema(dynamicFields, selectedNetwork, t, transferTypeList)}
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

                            const handleMaxValue = useCallback(() => {
                                const inputValueNumber = parseFloat(selectedNetwork?.maxLimit || 0);
                                const calculatedResult = inputValueNumber * 1;
                                const maxLimit = parseFloat(selectedNetwork?.amount) < parseFloat(selectedNetwork?.maxLimit) ? parseFloat(selectedNetwork?.amount) : parseFloat(selectedNetwork?.maxLimit)

                                const fixedResult = calculatedResult?.toFixed(4);
                                setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.AMOUNT, maxLimit?.toFixed(4));
                            }, [selectedNetwork?.maxLimit, setFieldValue]);

                            const handleMinValue = useCallback(() => {
                                const inputValueNumber = parseFloat(selectedNetwork?.minLimit || 0);
                                const calculatedResult = inputValueNumber * 1;
                                const fixedResult = calculatedResult?.toFixed(4);
                                setFieldValue(PAYOUT_CONSTANTS.FIELD_NAMES.AMOUNT, fixedResult);
                            }, [selectedNetwork?.minLimit, setFieldValue]);

                            // Get the available balance based on selected coin and network
                            const getAvailableBalance = () => {
                                if (selectedCoin && selectedCoin.amount !== undefined) {
                                    return selectedCoin?.amount?.toFixed(4);
                                }
                                if (values.currency === propsData?.coinCode && propsData?.available !== undefined) {
                                    return propsData?.available?.toFixed(4);
                                }
                                // Find coin directly here:
                                const coin = lists.coinList.find((c: any) => c.code === values.currency);
                                if (coin?.amount !== undefined) {
                                    return coin?.amount?.toFixed(4);
                                }
                                return '0.00';
                            };

                            return (
                                <View style={[commonStyles.mt4]}>
                                    {/* Vault field: disabled, not a dropdown */}
                                    {vaultsList?.length > 1 && <View>
                                        <Field
                                            name={PAYOUT_CONSTANTS.FIELD_NAMES.MERCHANT_NAME}
                                            label={"GLOBAL_CONSTANTS.VAULT"}
                                            handleBlur={handleBlur}
                                            customContainerStyle={{}}
                                            placeholder={"GLOBAL_CONSTANTS.SELECT_VAULT"}
                                            component={InputDefault}
                                            innerRef={ref}
                                            editable={false}
                                            value={selectedVault?.name}
                                            requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                        />
                                        <View style={[commonStyles.formItemSpace]} />
                                    </View>}
                                    {/* Coin dropdown */}
                                    <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.mb4]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                            <TextMultiLanguage text={"GLOBAL_CONSTANTS.FROM_CURRENCY"} style={[commonStyles.inputLabel]} />
                                            <LabelComponent text={" *"} style={[commonStyles.textRed]} />
                                        </ViewComponent>
                                        <ParagraphComponent style={[commonStyles.textGrey, commonStyles.fs12, commonStyles.fw600, commonStyles.mt4]} text={"GLOBAL_CONSTANTS.AVAILABLE_BALANCES"} multiLanguageAllows >
                                            <CurrencyText style={[commonStyles.textWhite]} value={values?.currency && getAvailableBalance() || 0} coinName={values?.currency} />
                                        </ParagraphComponent>
                                    </View>
                                    <Field
                                        name={PAYOUT_CONSTANTS.FIELD_NAMES.CURRENCY}
                                        component={CustomPicker}
                                        data={lists.coinList}
                                        // label={"GLOBAL_CONSTANTS.FROM_CURRENCY"}
                                        placeholder={"GLOBAL_CONSTANTS.SELECT_COIN"}
                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_COIN"}
                                        error={errors?.currency}
                                        touched={touched?.currency}
                                        handleBlur={handleBlur}
                                        isIconsDisplay={true}
                                        sheetHeight="Medium"
                                        requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                        onChange={(item: any) => {
                                            handleCoinChange(item, setFieldValue);
                                        }}
                                    />
                                    {/* <View>
                                            {touched?.currency && errors.currency && <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textError, { marginTop: 4 }]} text={errors.currency} />}
                                        </View> */}
                                    <View style={[commonStyles.formItemSpace]} />
                                    {/* Network dropdown */}
                                    <Field
                                        name={PAYOUT_CONSTANTS.FIELD_NAMES.NETWORK}
                                        component={CustomPicker}
                                        data={lists.networkList}
                                        label={"GLOBAL_CONSTANTS.NETWORK"}
                                        placeholder={"GLOBAL_CONSTANTS.SELECT_NETWORK"}
                                        modalTitle={"GLOBAL_CONSTANTS.SELECT_NETWORK"}
                                        error={errors?.networkName}
                                        touched={touched?.networkName}
                                        handleBlur={handleBlur}
                                        disabled={propsData.id && true || false}
                                        requiredMark={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
                                        onChange={(item: any) => {
                                            handleNetworkChange(item, setFieldValue);
                                        }}
                                        sheetHeight="Medium"
                                    />
                                    <View style={[commonStyles.formItemSpace]} />
                                    <Field
                                        name={'cryptoCurrency'}
                                        component={CustomPicker}
                                        data={lists.fiatCurrencyList}
                                        label="GLOBAL_CONSTANTS.TO_CURRENCY"
                                        placeholder="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                        modalTitle="GLOBAL_CONSTANTS.SELECT_CURRENCY"
                                        error={errors?.cryptoCurrency}
                                        touched={touched?.cryptoCurrency}
                                        onChange={(val: any) => handleCurrencyChange(val, setFieldValue)}
                                        handleBlur={handleBlur}
                                        sheetHeight="Medium"
                                        requiredMark={<LabelComponent text=" *" style={[commonStyles.textRed]} />}
                                    />

                                    <View style={[commonStyles.formItemSpace]} />

                                    {transferTypeList.length > 0 && (
                                        <>
                                            <Field
                                                name={'transferType'}
                                                component={CustomPicker}
                                                data={transferTypeList}
                                                label="GLOBAL_CONSTANTS.TRANSFER_TYPE"
                                                placeholder="GLOBAL_CONSTANTS.SELECT_TRANSFER_TYPE"
                                                modalTitle="GLOBAL_CONSTANTS.SELECT_TRANSFER_TYPE"
                                                error={errors?.transferType}
                                                touched={touched?.transferType}
                                                handleBlur={handleBlur}
                                                sheetHeight="Medium"
                                                selectionType='code'
                                                requiredMark={<LabelComponent text=" *" style={[commonStyles.textRed]} />}
                                            />
                                            <View style={[commonStyles.formItemSpace]} />
                                        </>
                                    )}

                                    <AmountInput
                                        label={"GLOBAL_CONSTANTS.AMOUNT"}
                                        isRequired={true}
                                        placeholder={"GLOBAL_CONSTANTS.ENTER_AMOUNT"}
                                        maxLength={16}
                                        onChangeText={handleSendAmountChange}
                                        value={values?.amount || ''}
                                        onMinPress={handleMinValue}
                                        onMaxPress={handleMaxValue}
                                        minLimit={selectedNetwork?.minLimit ?? 0}
                                        // maxLimit={selectedNetwork?.maxLimit ?? 0}
                                        maxLimit={selectedNetwork?.maxLimit == null || selectedNetwork?.amount == null ? undefined : (parseFloat(selectedNetwork?.amount) < parseFloat(selectedNetwork?.minLimit) ? parseFloat(selectedNetwork?.maxLimit) : (parseFloat(selectedNetwork?.amount) > parseFloat(selectedNetwork?.maxLimit) ? parseFloat(selectedNetwork?.maxLimit) : parseFloat(selectedNetwork?.amount)))}
                                        showError={errors?.amount}
                                        decimals={4}
                                        touched={touched?.amount}
                                        coinCode={values?.currency}
                                    />


                                    {/* Dynamic Fields */}
                                    {dynamicFields?.length > 0 &&
                                        <ViewComponent style={[commonStyles.formItemSpace]} ><DynamicFieldRenderer
                                            fields={dynamicFields}
                                            values={values}
                                            touched={touched}
                                            errors={errors}
                                            setFieldValue={setFieldValue}
                                            handleBlur={handleBlur}
                                        /></ViewComponent>}
                                    <CommonTouchableOpacity onPress={handlePayeeFieldPress}>
                                        <LabelComponent style={[commonStyles.payeeLabel, commonStyles.mb10]}
                                            text={t("GLOBAL_CONSTANTS.PAYEE")}>
                                            <LabelComponent text=" *" style={[commonStyles.textRed]} />
                                        </LabelComponent>
                                        <ViewComponent
                                            style={[
                                                commonStyles.withdrawPayeeInput,
                                                commonStyles.dflex,
                                                commonStyles.alignCenter,
                                                commonStyles.justifyContent,
                                                commonStyles.relative,
                                                (formikTouched && !selectedPayee && commonStyles.errorBorder),
                                                (!selectedCurrency && { opacity: 0.5 }) // Fixed disabledInput style
                                            ]}>
                                            {selectedPayee ? (
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.flex1, commonStyles.gap14, commonStyles.alignCenter]}>
                                                    {/* Avatar with colored background and white letter - exactly like crypto withdraw */}
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
                                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={selectedPayee?.name || ''} />
                                                    </ViewComponent>
                                                </ViewComponent>
                                            ) : (
                                                <TextMultiLanguage style={[commonStyles.fw400, commonStyles.fs16, commonStyles.textGrey, commonStyles.flex1]} text={'GLOBAL_CONSTANTS.SELECT_PAYEE'} />
                                            )}
                                            <Feather name="chevron-down" size={24} color={NEW_COLOR.TEXT_WHITE} />
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                    {validateBeneficiary() && (
                                        <TextMultiLanguage text={validateBeneficiary()} style={[commonStyles.mt4, commonStyles.fs14, commonStyles.fw400, commonStyles.textRed]} />
                                    )}
                                    <View style={[commonStyles.formItemSpace]} />
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CONTINUE"}
                                        customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                                        customButtonStyle={[commonStyles.borderPrimary]}
                                        disable={btnLoading}
                                        onPress={() => {
                                            setFormikTouched(true);
                                            handleValidationSave(formik.validateForm);
                                            handleSubmit();
                                        }}
                                        loading={btnLoading}
                                    />
                                    <View style={[commonStyles.buttongap]} />
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CANCEL"}
                                        customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                                        customButtonStyle={[commonStyles.borderPrimary, { backgroundColor: "transparent" }]}
                                        disable={btnLoading}
                                        onPress={handleCancel}
                                        solidBackground={true}
                                    />
                                    <View style={[commonStyles.mb24]} />
                                </View>
                            );
                        }}
                    </Formik>
                </KeyboardAwareScrollView>
                <CustomRBSheet
                    refRBSheet={payeeSheetRef}
                    modeltitle
                    height="Medium"
                >
                    <FiatPayeeListSheetContent
                        dataLoading={false}
                        payeesList={payeeList}
                        selectedPayee={selectedPayee}
                        handleActivePayee={handleActivePayee}
                        transactionCardContent={null}
                        commonStyles={commonStyles}
                        s={s}
                        handleNavigatePayee={handleNavigatePayee}
                        screenName={"payout"}
                        payeeSheetRef={payeeSheetRef}
                    />
                </CustomRBSheet>

                {/* RBSheet for Add Payee Options (Personal/Business) */}
                <CustomRBSheet
                    refRBSheet={addPayeeSheetRef}
                    title=""
                    height="Small"
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
                                    <Feather name="chevron-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
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
                                    <Feather name="chevron-right" size={24} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </CommonTouchableOpacity>
                        </ViewComponent>
                        <ViewComponent style={commonStyles.sectionGap} />

                        <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} solidBackground={true} onPress={() => addPayeeSheetRef?.current?.close()} />
                    </ViewComponent>
                </CustomRBSheet>

            </Container>
        </ViewComponent>
    );
};

export default CryptoPayout;
