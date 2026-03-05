import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { BackHandler, Keyboard } from 'react-native';
import { BankAccountService, BankCommonService } from '../../../../../apiServices/bank';
import { isErrorDispaly } from '../../../../../utils/helpers';
import Container from '../../../../../components/container/container';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import ButtonComponent from '../../../../../components/buttons/button';
import { Formik } from 'formik';
import AmountInput from '../../../../../components/amountInput/amountInput';
import { CoinImages, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import Feather from 'react-native-vector-icons/Feather';
import ViewComponent from '../../../../../components/view/view';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import { s } from '../../../../../components/theme/scale';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ImageUri from '../../../../../components/imageComponents/image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import DashboardLoader from '../../../../../components/loader';
import { BANK_CONST } from '../../constants';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import FiatPayeeListSheetContent from './FiatPayeeListSheetContent';
import { createDynamicValidationSchema } from '../schemas/SendFiatSchema';
import { Logger } from '../../../../../utils/Logger';
import { logEvent } from '../../../../../hooks/loggingHook';


const SendAmount = React.memo((props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState("");
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [summryLoading, setSummryLoading] = useState(false);
    const [bankList, setBankList] = useState<any>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<any>(null);
    const [selectedPayee, setSelectedPayee] = useState<any>(null);
    const [payeesList, setPayeesList] = useState<any[]>([]);
    const [formikTouched, setFormikTouched] = useState<boolean>(false);
    const [withdrawNote, setWithdrawNote] = useState<string>("");
    const [minAmount, setMinAmount] = useState<number>(0);
    const [maxAmount, setMaxAmount] = useState<number>(0);
    const [dynamicFields, setDynamicFields] = useState<any[]>([]);
    const payeeSheetRef = useRef<RBSheet>(null); // Fixed ref type
    const addPayeeSheetRef = useRef<RBSheet>(null); // New ref for add payee options
    const { t } = useLngTranslation();
    const [loader, setLoader] = useState<boolean>(false);
    // Add theme hooks
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

    const [initValues, setInitValues] = useState({
        currency: props?.route?.params?.walletCode || "",
        amount: "" // Changed from null to empty string
    });

    const parseDynamicFields = (paymentScheme: string) => {
        try {
            const fields = JSON.parse(paymentScheme);
            const parsedFields = Array.isArray(fields) ? fields : [fields];
            return parsedFields;
        } catch (error) {
            return [];
        }
    };



    const backArrowButtonHandler = useCallback(() => {
        try {
            if (props?.route?.params?.screenName === "AccountDetail") {
                (props.navigation as any).navigate("Currencypop", {
                    name: props?.route?.params?.name,
                    selectedId: props?.route?.params?.selectedId,
                    screenName: "Accounts",
                    animation: "slide_from_left"
                });
                return;
            }
            if (props?.route?.params?.screenName === "frombankDashboard") {
                (props.navigation as any).navigate("Currencypop", {
                    name: props?.route?.params?.name,
                    selectedId: props?.route?.params?.selectedId,
                    screenName: "frombankDashboard",
                    animation: "slide_from_left"
                });
                return;
            }
            if (props?.route?.params?.screenName === "Accounts") {
                (props.navigation as any).navigate("Accounts", {
                    animation: "slide_from_left",
                    isWithdrawTrue: true
                });
                return;
            } else if (props?.route?.params?.screenName === "WalletsAllCoinsList") {
                (props.navigation as any).navigate("WalletsAllCoinsList", {
                    animation: "slide_from_left",
                    initialTab: 1,
                    screenType: props?.route?.params?.screenType
                });
                return;
            }
            else {
                (props.navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: "slide_from_left" });
            }
        } catch (error) {
            Logger.error('backArrowButtonHandler failed', { error, screenName: props?.route?.params?.screenName });
        }
    }, [props.navigation, props?.route?.params?.screenName, props?.route?.params?.name]);

    useEffect(() => {
        const fetchBankList = async () => {
            try {
                await getBankList();
            } catch (error) {
                Logger.error('getBankList useEffect failed', { error });
            }
        };
        fetchBankList();

        try {
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                () => {
                    backArrowButtonHandler();
                    return true;
                }
            );

            return () => backHandler.remove();
        } catch (error) {
            Logger.error('BackHandler useEffect failed', { error });
        }
    }, [isFocused, backArrowButtonHandler]);

    const getPayeesLu = useCallback(async (currency: string) => {
        if (!currency) return;
        setErrormsg('');
        try {
            const response = await BankCommonService.getSendListDetails(currency);
            if (response?.ok) {
                const payees = (response.data as any[])?.map((payee: any) => ({
                    id: payee.id,
                    favoriteName: payee.favoriteName,
                    walletAddress: payee.walletAddress,
                    bankName: payee.favoriteName,
                    walletCode: payee.currency,
                    type: payee.type,
                    state: payee.state,
                    status: payee.status,
                    isEditable: payee.isEditable
                })) || [];
                setPayeesList(payees);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            Logger.error('getPayeesLu failed', { error, currency });
            setErrormsg(isErrorDispaly(error));
        }
    }, [t]);

    // Reset loading states when screen comes into focus
    useEffect(() => {
        if (isFocused) {
            setSummryLoading(false);
            setBtnDisabled(false);
            setSelectedPayee(null); // Clear payee field when returning to screen
            setFormikTouched(false); // Reset validation state

            // Refresh payees list when returning to screen
            if (selectedCurrency?.currency) {
                getPayeesLu(selectedCurrency.currency);
            }
        }
    }, [isFocused, selectedCurrency?.currency, getPayeesLu]);

    const getBankList = async () => {
        try {
            setLoader(true);
            const response: any = await BankAccountService.getAccountDetailsOfMobileBank();

            if (response?.ok) {
                setLoader(false);
                setErrormsg('');
                const banks = response.data?.accounts?.map((data: any) => {
                    const dynamicFields = data.paymentScheme ? parseDynamicFields(data.paymentScheme) : [];
                    return {
                        ...data,
                        name: data?.currency,
                        dynamicFields
                    };
                });
                setBankList(banks);

                // Set default currency if available
                if (props?.route?.params?.walletCode) {
                    const defaultCurrency = banks.find((bank: any) => bank.currency === props?.route?.params?.walletCode);
                    if (defaultCurrency) {
                        setSelectedCurrency(defaultCurrency);
                        setMinAmount(defaultCurrency.minLimit);
                        setMaxAmount(defaultCurrency.maxLimit);
                        setDynamicFields(defaultCurrency.dynamicFields || []);

                        // Update initial values with dynamic fields
                        const newInitValues: any = { ...initValues };
                        defaultCurrency.dynamicFields?.forEach((field: any) => {
                            newInitValues[field.key] = "";
                        });
                        setInitValues(newInitValues);

                        getPayeesLu(defaultCurrency.currency);
                        getBankWithdrawDetails(defaultCurrency.currency);
                    }
                }
            } else {
                setErrormsg(isErrorDispaly(response));
                setLoader(false);
            }
        } catch (error) {
            Logger.error('getBankList failed', { error });
            setErrormsg(isErrorDispaly(error));
            setLoader(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            try {
                const onBackPress = () => {
                    backArrowButtonHandler();
                    return true;
                };

                const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

                return () => subscription?.remove();
            } catch (error) {
                Logger.error('useFocusEffect failed', { error });
            }
        }, [backArrowButtonHandler])
    );

    const goToTheSummarryPage = async (values: any) => {
        setSummryLoading(true);
        setBtnDisabled(true);

        try {
            // Map form values to API fields explicitly
            let fiatObj: any = {
                amount: values.amount,
                payeeId: selectedPayee?.id,
                accountId: selectedCurrency?.id,
                paymentscheme: values.paymentscheme
            };

            // Add other dynamic fields if they exist
            dynamicFields.forEach((field: any) => {
                if (values[field.key] && field.key !== 'paymentscheme') {
                    fiatObj[field.key] = values[field.key];
                }
            });

            const response: any = await BankAccountService.postBanksFiatWithdraw(fiatObj);

            if (response?.ok) {
                const targetScreen = props?.route?.params?.screenName === "WalletsAllCoinsList" ? "WalletsWithDrawSummary" : "SummeryDetails"
                logEvent("Action Name", { action: "Bank Withdraw Post Call Success", currentScreen: "Bank Withdraw Amount", nextScreen: targetScreen });
                props.navigation.navigate(targetScreen, {
                    ...response.data,
                    ...props?.route?.params,
                    payeeName: selectedPayee?.favoriteName,
                    AccountId: selectedCurrency?.id,
                    paymentscheme: values.paymentscheme
                });
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            Logger.error('goToTheSummarryPage failed', { error, payeeId: selectedPayee?.id });
            setErrormsg(isErrorDispaly(error));
        } finally {
            setSummryLoading(false);
            setBtnDisabled(false);
        }
    };

    const handleSendAmountChange = useCallback((text: any, setFieldValue: any) => {
        let numericValue = text.replace(/[^0-9.]/g, '');
        const decimalIndex = numericValue.indexOf('.');
        if (decimalIndex !== -1) {
            const integerPart = numericValue.slice(0, decimalIndex);
            const fractionalPart = numericValue.slice(decimalIndex + 1).replace(/\./g, '');
            numericValue = integerPart + '.' + fractionalPart.slice(0, 2);
        }
        setFieldValue('amount', numericValue)
        setErrormsg("")
    }, []);

    const getBankWithdrawDetails = useCallback(async (currency: string) => {
        if (!currency) return;
        try {
            const response: any = await BankAccountService.getBakWithDrawDetails(currency);
            if (response?.ok && response.data?.bankList?.[0]?.note) {
                setWithdrawNote(response.data.bankList[0].note);
            } else {
                setWithdrawNote("");
            }
        } catch (error) {
            Logger.error('getBankWithdrawDetails failed', { error, currency });
            setWithdrawNote("");
        }
    }, []);



    const handleMinValue = useCallback((setFieldValue: any) => {
        const withdrawMin = selectedCurrency?.minLimit;

        // Only set min value if withdrawMin is not null
        if (withdrawMin !== null && withdrawMin !== undefined) {
            setFieldValue('amount', withdrawMin.toFixed(2));
            setErrormsg("");
        }
    }, [selectedCurrency?.minLimit]);

    const handleMaxValue = useCallback((setFieldValue: any) => {
        const withdrawMax = selectedCurrency?.maxLimit;

        // Only set max value if withdrawMax is not null
        if (withdrawMax !== null && withdrawMax !== undefined) {
            // setFieldValue('amount', withdrawMax.toFixed(2));
            setFieldValue('amount', selectedCurrency?.amount < withdrawMax ? selectedCurrency?.amount?.toFixed(2) : withdrawMax.toFixed(2));
            setErrormsg("");
        }
    }, [selectedCurrency?.maxLimit, selectedCurrency?.amount]);

    const handleSelectCurrency = (item: any, setFieldValue: any) => {
        setSelectedPayee(null);
        setSelectedCurrency(item);
        setFieldValue("currency", item?.currency);
        setFieldValue("amount", '');
        setFormikTouched(false);
        setMinAmount(item.minLimit);
        setMaxAmount(item.maxLimit);
        setDynamicFields(item.dynamicFields || []);

        // Clear previous dynamic field values
        item.dynamicFields?.forEach((field: any) => {
            setFieldValue(field.key, '');
        });

        getPayeesLu(item?.currency);
        getBankWithdrawDetails(item?.currency);


    }

    const handleErrorComonent = useCallback(() => {
        setErrormsg("")
    }, []);



    const handlePayeeFieldPress = useCallback(() => {
        Keyboard.dismiss();
        payeeSheetRef.current?.open();
    }, []);

    const handleActivePayee = useCallback((item: any) => {
        setSelectedPayee(item);
        payeeSheetRef.current?.close();
    }, []);

    const handleNavigatePayee = () => {
        payeeSheetRef.current?.close();
        setTimeout(() => {
            addPayeeSheetRef.current?.open();
        }, 300);
    };

    const handlePersonalPayee = () => {
        try {
            addPayeeSheetRef.current?.close();
            props.navigation.navigate('AccountDetails', {
                walletCode: selectedCurrency?.currency || props?.route?.params?.walletCode,
                logo: props?.route?.params?.logo,
                accountType: BANK_CONST.PERSIONAL,
                screenName: "fiatWithdraw"
            });
        } catch (error) {
            Logger.error('handlePersonalPayee failed', { error });
        }
    };

    const handleBusinessPayee = () => {
        try {
            addPayeeSheetRef.current?.close();
            props.navigation.navigate('AccountDetails', {
                walletCode: selectedCurrency?.currency || props?.route?.params?.walletCode,
                logo: props?.route?.params?.logo,
                accountType: BANK_CONST.BUSINESS,
                screenName: "fiatWithdraw"
            });
        } catch (error) {
            Logger.error('handleBusinessPayee failed', { error });
        }
    };

    const validateBeneficiary = () => {
        if (formikTouched && !selectedPayee) {
            return t('GLOBAL_CONSTANTS.IS_REQUIRED');
        }
        return undefined;
    };

    const validateAmount = (amount: string) => {
        if (amount === "" || amount === null || amount === undefined) {
            return `${t("GLOBAL_CONSTANTS.ENTER_VALID_AMOUNT")} ${selectedCurrency?.currency}.`;
        }

        const numAmount = parseFloat(amount);
        const availableBalance = parseFloat(selectedCurrency?.amount || 0);
        const withdrawMin = selectedCurrency?.minLimit;
        const withdrawMax = selectedCurrency?.maxLimit;

        if (numAmount <= 0) {
            return t('GLOBAL_CONSTANTS.AMOUNT_SHOULD_BE_GREATER_THAN_ZERO');
        }

        // Scenario 3 & 4: Check minimum if withdrawMin is not null (check limits first)
        if (withdrawMin !== null && withdrawMin !== undefined && numAmount < withdrawMin) {
            return `${t('GLOBAL_CONSTANTS.MIN_WITHDRAW_AMOUNT_IS')} ${withdrawMin.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedCurrency?.currency}`;
        }

        // Scenario 2 & 4: Check maximum if withdrawMax is not null (check limits first)
        if (withdrawMax !== null && withdrawMax !== undefined && numAmount > withdrawMax) {
            return `${t('GLOBAL_CONSTANTS.MAX_WITHDRAW_AMOUNT_IS')} ${withdrawMax.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${selectedCurrency?.currency}`;
        }

        // Always check available balance last
        if (numAmount > availableBalance) {
            return `${t('GLOBAL_CONSTANTS.INSUFFICIENT_BALANCE_BANK')}`;
        }

        return null;
    };

     return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {loader && (
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]} >
                    <DashboardLoader />
                </SafeAreaViewComponent>
            )}
            {!loader && <KeyboardAwareScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <Container style={[commonStyles.flex1, commonStyles.container]}>
                    <PageHeader title={`${t("GLOBAL_CONSTANTS.WITHDRAW")} ${selectedCurrency?.currency || props?.route?.params?.walletCode}`} onBackPress={backArrowButtonHandler} />

                    {errormsg != "" && <ErrorComponent message={errormsg} onClose={handleErrorComonent} />}
                    <Formik
                        initialValues={initValues}
                        onSubmit={(values) => {
                            setFormikTouched(true);
                            const amountError = validateAmount(values.amount);
                            if (amountError) {
                                setErrormsg(amountError);
                                return;
                            }
                            if (!selectedPayee) {
                                return;
                            }
                            goToTheSummarryPage(values);
                        }}
                        validationSchema={createDynamicValidationSchema(dynamicFields)}
                        enableReinitialize
                        validateOnChange={true}
                        validateOnBlur={true}
                    >
                        {(formik) => {
                            const {
                                touched,
                                values,
                                setFieldValue,
                                errors,
                                handleSubmit
                            } = formik;
                            return (
                                <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.mb10]}>
                                            <LabelComponent style={[commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.ACCOUNTT"}>
                                                <LabelComponent text=" *" style={[commonStyles.textRed]} />
                                            </LabelComponent>
                                            {selectedCurrency && (
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                    <ParagraphComponent
                                                        style={[commonStyles.availblelabel]}
                                                        text={`${t('GLOBAL_CONSTANTS.AVAIL_BALANCE')}: `}
                                                    />
                                                    <CurrencyText
                                                        value={selectedCurrency?.amount || 0}
                                                        currency={selectedCurrency?.currency}
                                                        style={[commonStyles.availbleamount]}
                                                    />
                                                </ViewComponent>
                                            )}
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap8]} >
                                            <ViewComponent style={{ width: s(32), height: s(32) }} >
                                                <ImageUri
                                                    uri={CoinImages[selectedCurrency?.currency?.toLowerCase()] || ""}
                                                    style={{ width: s(32), height: s(32) }}
                                                />
                                            </ViewComponent>
                                            <ParagraphComponent style={[commonStyles.inputdropdowntext, commonStyles.mt6]} text={selectedCurrency?.currency} />
                                        </ViewComponent>
                                        {/* <CommonDropdown
                                            data={bankList || []}
                                            selectedItem={selectedCurrency}
                                            onSelect={(item: any) => {
                                                Keyboard.dismiss();
                                                setSelectedCurrency(item);
                                                handleSelectCurrency(item, setFieldValue);
                                            }}
                                            placeholder={"GLOBAL_CONSTANTS.SELECT_ACCOUNT"}
                                             currencyMapping={(key: string) => {
                                            return key === 'usd' ? CoinImages['bankusd'] : CoinImages[key];
                                        }}
                                            renderItem={(item: any) => {
                                                const isSelected = selectedCurrency?.currency === item.currency;
                                                return (
                                                    <ViewComponent
                                                        style={[
                                                            commonStyles.dflex,
                                                            commonStyles.alignCenter,
                                                            commonStyles.gap16,
                                                            isSelected && { backgroundColor: NEW_COLOR.TAB_ACTIVE_BG },
                                                            commonStyles.p10,
                                                            commonStyles.mt6

                                                        ]}
                                                    >
                                                        <ViewComponent style={{ width: s(30), height: s(30) }}>
                                                           <ImageUri uri={(() => {
                                                                            const key = item?.currency?.toLowerCase();
                                                                            // If USD comes, pass bankusd to CoinImages
                                                                            if (key === 'usd') {
                                                                                return CoinImages['bankusd'] || "";
                                                                            }
                                                                            return CoinImages[key] || "";
                                                                        })()} style={{ borderRadius: s(24) }} />

                                                        </ViewComponent>
                                                        <ViewComponent style={{ flex: 1 }}>
                                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite]}>
                                                                {item.currency}
                                                            </ParagraphComponent>
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                );
                                            }}

                                            dropdownHeight={300}
                                        /> */}


                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        {withdrawNote !== "" && (


                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8, commonStyles.bgnote]}>

                                                <ViewComponent>
                                                    <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                                                </ViewComponent>
                                                <ViewComponent style={[commonStyles.flex1]}>
                                                    <ParagraphComponent style={[commonStyles.bgNoteText]} text={withdrawNote} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        )}

                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        <ViewComponent style={[commonStyles.mb10]} />
                                        <AmountInput
                                            label="GLOBAL_CONSTANTS.AMOUNT"
                                            isRequired={true}
                                            placeholder={"GLOBAL_CONSTANTS.ENTER_AMOUNT"}
                                            maxLength={13}
                                            onChangeText={(value: any) => handleSendAmountChange(value, setFieldValue)}
                                            value={values?.amount || ""}
                                            maxDecimals={2}
                                            autoCapitalize="words"
                                            touched={touched.amount}
                                            showError={touched.amount && errors.amount ? t(errors.amount) : undefined}
                                            minLimit={selectedCurrency?.minLimit !== null && selectedCurrency?.minLimit !== undefined ? selectedCurrency.minLimit : undefined}
                                            maxLimit={selectedCurrency?.maxLimit == null ? undefined : (parseFloat(selectedCurrency?.amount) < parseFloat(selectedCurrency?.minLimit) ? parseFloat(selectedCurrency?.maxLimit) : (parseFloat(selectedCurrency?.amount) > parseFloat(selectedCurrency?.maxLimit) ? parseFloat(selectedCurrency?.maxLimit) : parseFloat(selectedCurrency?.amount)))}
                                            onMinPress={selectedCurrency?.minLimit !== null && selectedCurrency?.minLimit !== undefined ? () => handleMinValue(setFieldValue) : undefined}
                                            onMaxPress={selectedCurrency?.maxLimit !== null && selectedCurrency?.maxLimit !== undefined ? () => handleMaxValue(setFieldValue) : undefined}
                                            topupBalanceInfo={{ currency: selectedCurrency?.currency || "" }}
                                            decimals={2}
                                        />

                                       
                                      

                                        {/* Payee Field (Fiat) - mimic crypto withdraw design exactly */}
                                            <LabelComponent style={[commonStyles.payeeLabel,]}
                                                text="GLOBAL_CONSTANTS.PAYEE">
                                                <LabelComponent text=" *" style={[commonStyles.textRed]} />
                                            </LabelComponent>
                                        <CommonTouchableOpacity onPress={handlePayeeFieldPress} disabled={!selectedCurrency}>
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
                                                            commonStyles.iconbg
                                                        ]}>
                                                            <ViewComponent style={[{ width: s(32), height: s(32), flexDirection: "row", justifyContent: "center", alignItems: "center", borderRadius: s(100) }, commonStyles.tabactivebg]}>

                                                                <ParagraphComponent
                                                                    style={[
                                                                        commonStyles.twolettertext

                                                                    ]}
                                                                    text={selectedPayee.favoriteName?.slice(0, 1)?.toUpperCase() || ''}
                                                                />
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                        <ViewComponent style={{ flex: 1 }}>
                                                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite]} text={selectedPayee.favoriteName || ''} numberOfLines={1} />
                                                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={selectedPayee?.walletCode || ''} />
                                                            <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textlinkgrey]} text={selectedPayee?.walletAddress || ''} />
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                ) : (
                                                    <TextMultiLanguage style={[commonStyles.fw400, commonStyles.fs16, commonStyles.textlinkgrey, commonStyles.flex1]} text={t('GLOBAL_CONSTANTS.SELECT_PAYEE')} />
                                                )}
                                                <Feather name="chevron-down" size={s(24)} color={!selectedCurrency ? NEW_COLOR.TEXT_DISABLED : NEW_COLOR.TEXT_WHITE} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>

                                         {validateBeneficiary() && (
                                            <TextMultiLanguage text={validateBeneficiary()} style={[commonStyles.mt4, commonStyles.fs14, commonStyles.fw400, commonStyles.textRed]} />
                                        )}

                                          {dynamicFields.length > 0 &&(<><ViewComponent style={[commonStyles.formItemSpace]} />
                                          {/* Dynamic Fields */}
                                        <DynamicFieldRenderer
                                            fields={dynamicFields}
                                            values={values}
                                            touched={touched}
                                            errors={errors}
                                            setFieldValue={setFieldValue}
                                            handleBlur={formik.handleBlur}
                                            selectedCurrency={selectedCurrency}
                                            selectedPayee={selectedPayee}
                                        /></>)}                                      
                                        {/* RBSheet for Payee Selection - using new FiatPayeeListSheetContent */}
                                        <CustomRBSheet
                                            refRBSheet={payeeSheetRef}
                                            title="GLOBAL_CONSTANTS.SELECT_PAYEE"
                                            height={"Medium"}
                                        >
                                            <FiatPayeeListSheetContent
                                                dataLoading={false}
                                                payeesList={payeesList}
                                                selectedPayee={selectedPayee}
                                                handleActivePayee={handleActivePayee}
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
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: s(2) }]}>
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
                                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: s(2) }]}>
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

                                        <ViewComponent style={commonStyles.sectionGap} />
                                        <ViewComponent style={commonStyles.sectionGap} />



                                    </ViewComponent>
                                    <ButtonComponent
                                        title={"GLOBAL_CONSTANTS.CONTINUE"}
                                        customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                                        customButtonStyle={[commonStyles.borderPrimary, { backgroundColor: NEW_COLOR.PRiMARY_COLOR }]}
                                        disable={btnDisabled}
                                        loading={summryLoading}
                                        onPress={() => {
                                            setFormikTouched(true);
                                            handleSubmit();
                                        }}
                                    />
                                    <ViewComponent style={commonStyles.sectionGap} />
                                </ViewComponent>


                            )

                        }}
                    </Formik>

                </Container>
            </KeyboardAwareScrollView>}
        </ViewComponent>
    )
})

export default SendAmount;