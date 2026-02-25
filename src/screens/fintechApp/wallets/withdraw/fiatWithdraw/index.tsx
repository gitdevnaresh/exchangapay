import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { BackHandler, Keyboard } from 'react-native';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { isErrorDispaly } from '../../../../../utils/helpers';
import Container from '../../../../../components/container/container';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import ButtonComponent from '../../../../../components/buttons/button';
import { Formik } from 'formik';
import AmountInput from '../../../../../components/amountInput/amountInput';
import { withdrawSchema } from './schema';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import { CoinImages, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import Feather from 'react-native-vector-icons/Feather';
import ViewComponent from '../../../../../components/view/view';
import RBSheet from 'react-native-raw-bottom-sheet';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import { s } from '../../../../../components/theme/scale';
import WalletsService from '../../../../../apiServices/wallets';
import { ADD_RECIPIENT } from '../../../profile/addressbook/fiatPayee/addRecipient/constant';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import ImageUri from '../../../../../components/imageComponents/image';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import SafeAreaViewComponent from '../../../../../components/safeArea/safeArea';
import DashboardLoader from '../../../../../components/loader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FiatPayeeListSheetContent } from '../../../bank/withdraw';


const FiatWithdrawForm = React.memo((props: any) => {
    const isFocused = useIsFocused();
    const [errormsg, setErrormsg] = useState("");
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [summryLoading, setSummryLoading] = useState(false);
    const [coinsList, setCoinsList] = useState<any>([]);
    const [selectedCoin, setSelectedCoin] = useState<any>(null);
    const [selectedPayee, setSelectedPayee] = useState<any>(null);
    const [payeesList, setPayeesList] = useState<any[]>([]);
    const [formikTouched, setFormikTouched] = useState<boolean>(false);
    const [minAmount, setMinAmount] = useState<number>();
    const [maxAmount, setMaxAmount] = useState<number>();
    const payeeSheetRef = useRef<RBSheet>(null);
    const addPayeeSheetRef = useRef<RBSheet>(null);
    const { t } = useLngTranslation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [loader, setLoader] = useState<boolean>(false);

    const [initValues, setInitValues] = useState({
        currency: props?.route?.params?.currency || "",
        amount: ""
    })

    useEffect(() => {
        getFiatVaultsList();
    }, []);

    useEffect(() => {
        if (props?.route?.params?.currency && coinsList.length > 0 && !selectedCoin) {
            const defaultCoin = coinsList.find((coin: any) => coin.code === props?.route?.params?.currency);
            if (defaultCoin) {
                setSelectedCoin(defaultCoin);
                getCoinDetails(defaultCoin.id);
                getPayeesForCoin(defaultCoin.code);
            }
        }
    }, [coinsList, props?.route?.params?.currency]);
    useEffect(() => {
        if (isFocused) {
            setSummryLoading(false);
            setBtnDisabled(false);
            setSelectedPayee(null);
            setFormikTouched(false);
            setInitValues(prev => ({ ...prev, amount: "" }));

            // Refresh payees list when returning to screen
            if (selectedCoin?.code) {
                getPayeesForCoin(selectedCoin.code);
            }
        }
    }, [isFocused, selectedCoin?.code]);

    const getFiatVaultsList = async () => {
        setLoader(true);
        try {
            const response: any = await WalletsService.getFiatCoinListsList('withdraw');
            if (response?.ok) {
                setLoader(false);
                setErrormsg('')
                setCoinsList(response.data?.assets || []);
            } else {
                setErrormsg(isErrorDispaly(response))
                setLoader(false);
            }
        } catch (error) {
            setLoader(false);
            setErrormsg(isErrorDispaly(error))
        }
    }

    const getCoinDetails = async (coinId: string) => {
        if (!coinId) return;
        try {
            const response: any = await WalletsService.withdrawFiatSelectCoinDetails(coinId);
            if (response?.ok) {
                let minAmt = response.data?.minAmount || response.data?.minWithdrawAmount || response.data?.minimumAmount || response.data?.minLimit;
                let maxAmt = response.data?.maxAmount || response.data?.maxWithdrawAmount || response.data?.maximumAmount || response.data?.maxLimit;
                if (!minAmt && !maxAmt) {
                    const coinFromList = coinsList.find(c => c.id === coinId);
                    minAmt = coinFromList?.minLimit;
                    maxAmt = coinFromList?.maxLimit;
                }
                setMinAmount(minAmt);
                setMaxAmount(maxAmt);
            } else {
                setErrormsg(isErrorDispaly(response))
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error))
        }
    }

    const getPayeesForCoin = async (coinCode: string) => {
        if (!coinCode) return;
        setErrormsg('');
        const savedPayeeId = selectedPayee?.id || props?.route?.params?.selectedPayeeId;
        try {
            const response: any = await WalletsService.withdrawFiatSelectCoinPayees(coinCode);
            if (response?.ok) {
                const payees = (response.data as any[])?.map((payee: any) => ({
                    id: payee.id,
                    favoriteName: payee.favoriteName,
                    walletAddress: payee.walletAddress,
                    bankName: payee.favoriteName,
                    walletCode: payee.currency,
                    createdDate: payee.createdDate,
                })) || [];
                setPayeesList(payees);
                const restoredPayee = savedPayeeId && payees.find((p: any) => p.id === savedPayeeId);
                if (restoredPayee) {
                    setSelectedPayee(restoredPayee);
                } else if (!savedPayeeId) {
                    setSelectedPayee(null);
                }
            } else {
                setErrormsg(isErrorDispaly(response) || t("ERROR_MESSAGES.FAILED_TO_LOAD_PAYEES"));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        }
    };

    const backArrowButtonHandler = useCallback(() => {
        props.navigation.goBack();
    }, [props.navigation]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                backArrowButtonHandler();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription?.remove();
        }, [backArrowButtonHandler])
    );
    const goToTheSummarryPage = async (values: any) => {
        setSummryLoading(true);
        setBtnDisabled(true);

        try {
            let fiatObj = {
                amount: parseFloat(values.amount),
                payeeId: selectedPayee?.id,
                fiatWalletId: selectedCoin?.id,
            };
            const response: any = await WalletsService.withdrawFiatSummaryDetails(fiatObj);
            if (response?.ok) {
                props.navigation.navigate("FiatWithdrawSummary", {
                    ...response.data,
                    ...props.route.params,
                    payeeName: selectedPayee?.favoriteName,
                    fiatWalletId: selectedCoin?.id,
                    currency: selectedCoin?.code,
                    selectedPayeeId: selectedPayee?.id
                });
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
        } finally {
            setSummryLoading(false);
            setBtnDisabled(false);
        }
    };

    const handleSendAmountChange = (text: any, setFieldValue: any) => {
        let numericValue = text.replace(/[^0-9.]/g, '');
        const decimalIndex = numericValue.indexOf('.');
        if (decimalIndex !== -1) {
            const integerPart = numericValue.slice(0, decimalIndex);
            const fractionalPart = numericValue.slice(decimalIndex + 1).replace(/\./g, '');
            numericValue = integerPart + '.' + fractionalPart.slice(0, 2);
        }
        setFieldValue('amount', numericValue)
        setErrormsg("")
    };

    const handleMinValue = (setFieldValue: any) => {
        setFieldValue('amount', minAmount.toFixed(2));
        setErrormsg("");
    };

    const handleMaxValue = (setFieldValue: any) => {
        const maxValue = parseFloat(selectedCoin?.amount) < parseFloat(selectedCoin?.maxAmount) ? parseFloat(selectedCoin?.amount) : parseFloat((selectedCoin?.maxAmount));
        setFieldValue('amount', maxValue?.toFixed(2));
        setErrormsg("");
    };

    const handleSelectCoin = async (item: any, setFieldValue: any) => {
        setSelectedPayee(null);
        setPayeesList([]);
        setMinAmount(0);
        setMaxAmount(0);
        setSelectedCoin(item);
        setFieldValue("currency", item?.code);
        setFieldValue("amount", '');
        setFormikTouched(false);
        if (item?.id) {
            await getCoinDetails(item.id);
        }
        if (item?.code) {
            await getPayeesForCoin(item.code);
        }
    }

    const handleErrorComonent = () => {
        setErrormsg("")
    };

    const handlePayeeFieldPress = () => {
        Keyboard.dismiss();
        payeeSheetRef.current && payeeSheetRef.current.open();
    };

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
            walletCode: selectedCoin?.code || props?.route?.params?.currency,
            logo: selectedCoin?.image || props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.PERSIONAL,
            screenName: "fiatWithdraw"
        });
    };

    const handleBusinessPayee = () => {
        addPayeeSheetRef.current && addPayeeSheetRef.current.close();
        props.navigation.navigate('AccountDetails', {
            walletCode: selectedCoin?.code || props?.route?.params?.currency,
            logo: selectedCoin?.image || props?.route?.params?.logo,
            accountType: ADD_RECIPIENT.BUSINESS,
        });
    };

    const validateBeneficiary = () => {
        if (formikTouched && !selectedPayee) {
            return t('GLOBAL_CONSTANTS.IS_REQUIRED');
        }
        return undefined;
    };

    const validateAmount = (amount: string) => {
        const numAmount = parseFloat(amount);

        if (numAmount <= 0) {
            return t('GLOBAL_CONSTANTS.AMOUNT_SHOULD_BE_GREATER_THAN_ZERO');
        }

        if (selectedCoin && numAmount > selectedCoin.amount) {
            return t('GLOBAL_CONSTANTS.AMOUNT_SHOLD_BE_LESS_THAN_AVAILABLE_BALANCE');
        }
        else if (minAmount !== null) {
            if (minAmount > 0 && numAmount < minAmount) {
                return `${t('GLOBAL_CONSTANTS.MIN_WITHDRAW_AMOUNT_IS')} ${minAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        }
        else if (maxAmount !== null) {
            if (maxAmount > 0 && numAmount > maxAmount) {
                return `${t('GLOBAL_CONSTANTS.MAX_WITHDRAW_AMOUNT_IS')} ${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        }
        return undefined;
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
            <Container style={[commonStyles.container]}>
                    <PageHeader title={`${t("GLOBAL_CONSTANTS.WITHDRAW")} ${selectedCoin?.code || props?.route?.params?.currency || ''}`} onBackPress={backArrowButtonHandler} />

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
                        validationSchema={withdrawSchema}
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
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ViewComponent style={[commonStyles.flex1]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                            <LabelComponent style={[commonStyles.inputLabel, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.CURRENCY"}>
                                            </LabelComponent>
                                            {selectedCoin && (
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mb10]}>
                                                    <ParagraphComponent
                                                        style={[commonStyles.fw600, commonStyles.fs12, commonStyles.textlinkgrey]}
                                                        text={`${t('GLOBAL_CONSTANTS.AVAILABLE_BALANCES')}`}
                                                    />

                                                    <CurrencyText
                                                        value={selectedCoin?.amount || 0}
                                                        currency={selectedCoin?.code}
                                                        style={[commonStyles.fw600, commonStyles.fs12, commonStyles.textlinkgrey]}
                                                    />
                                                </ViewComponent>
                                            )}
                                        </ViewComponent>

                                        {/* {props.route.params?.screenName!=="WalletsAllCoinsList"&& <CommonDropdown
                                        data={coinsList}
                                        selectedItem={selectedCoin}
                                        onSelect={(item) => {
                                            handleSelectCoin(item, setFieldValue);
                                        }}
                                        placeholder={t('GLOBAL_CONSTANTS.SELECT_CURRENCY')}
                                        currencyMapping={(key: string) => {
                                            return key === 'usd' ? CoinImages['bankusd'] : CoinImages[key];
                                        }}
                                        renderItem={(item, isSelected) => (
                                            <ViewComponent
                                                style={[
                                                    commonStyles.dflex,
                                                    commonStyles.alignCenter,
                                                    commonStyles.justifyContent,
                                                    commonStyles.p10,
                                                    commonStyles.gap16,
                                                    isSelected && commonStyles.inputdropdowntabactivebg,
                                                ]}
                                            >
                                                <ViewComponent style={{ width: s(32), height: s(32) }} >
                                                    <ImageUri
                                                        uri={(() => {
                                                            const key = item?.code?.toLowerCase();
                                                            if (key === 'usd') {
                                                                return CoinImages['bankusd'] || "";
                                                            }
                                                            return CoinImages[key] || "";
                                                        })()}
                                                        style={{ width: s(32), height: s(32) }}
                                                    />
                                                </ViewComponent>
                                                <ViewComponent style={{ flex: 1 }}>
                                                    <ParagraphComponent style={[commonStyles.inputdropdowntext, commonStyles.mt6]}>
                                                        {item.code}
                                                    </ParagraphComponent>
                                                </ViewComponent>
                                            </ViewComponent>
                                        )}
                                        dropdownHeight={s(300)}
                                    />} */}
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap8]} >
                                            <ViewComponent style={{ width: s(32), height: s(32) }} >
                                                <ImageUri
                                                    uri={CoinImages[selectedCoin?.code?.toLowerCase()] || selectedCoin?.image || ""}
                                                    style={{ width: s(32), height: s(32) }}
                                                />
                                            </ViewComponent>
                                            <ParagraphComponent style={[commonStyles.inputdropdowntext, commonStyles.mt6]} text={selectedCoin?.code} />
                                        </ViewComponent>

                                        <ViewComponent style={[commonStyles.formItemSpace]} />
                                        <AmountInput
                                            label={"GLOBAL_CONSTANTS.AMOUNT"}
                                            isRequired={true}
                                            placeholder={"GLOBAL_CONSTANTS.ENTER_AMOUNT"}
                                            maxLength={21}
                                            onChangeText={(value: any) => {
                                                handleSendAmountChange(value, setFieldValue);
                                            }}
                                            value={values?.amount || ""}
                                            maxDecimals={2}
                                            autoCapitalize="words"
                                            showError={touched.amount && errors.amount ? t(errors.amount) : undefined}
                                            minLimit={minAmount == null ? undefined : minAmount}
                                            maxLimit={selectedCoin?.maxLimit == null ? undefined : (parseFloat(selectedCoin?.amount) < parseFloat(selectedCoin?.minLimit) ? parseFloat(selectedCoin?.maxLimit) : (parseFloat(selectedCoin?.amount) > parseFloat(selectedCoin?.maxLimit) ? parseFloat(selectedCoin?.maxLimit) : parseFloat(selectedCoin?.amount)))}
                                            onMinPress={() => {
                                                handleMinValue(setFieldValue);
                                            }}
                                            onMaxPress={() => {
                                                handleMaxValue(setFieldValue);
                                            }}
                                            touched={touched.amount}
                                            topupBalanceInfo={{ currency: selectedCoin?.code || "" }}
                                            decimals={2}
                                        />

                                        <LabelComponent style={[commonStyles.payeeLabel, commonStyles.mb10]}
                                            text="GLOBAL_CONSTANTS.PAYEE">
                                            <LabelComponent text=" *" style={[commonStyles.textRed]} />
                                        </LabelComponent>
                                        <CommonTouchableOpacity onPress={handlePayeeFieldPress} disabled={!selectedCoin}>
                                            <ViewComponent
                                                style={[
                                                    commonStyles.withdrawPayeeInput,
                                                    commonStyles.dflex,
                                                    commonStyles.alignCenter,
                                                    commonStyles.justifyContent,
                                                    commonStyles.relative,
                                                    (formikTouched && !selectedPayee && commonStyles.errorBorder),
                                                    (!selectedCoin && { opacity: 0.5 })
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
                                                            <ParagraphComponent style={[commonStyles.withdrawpayeetexttitle]} text={selectedPayee.favoriteName || ''} numberOfLines={1} />
                                                            <ParagraphComponent style={[commonStyles.withdrawpayeetexttitlepara]} text={selectedPayee?.walletCode || ''} />
                                                        </ViewComponent>
                                                    </ViewComponent>
                                                ) : (
                                                    <ParagraphComponent style={[commonStyles.fw400, commonStyles.fs16, commonStyles.textGrey, commonStyles.flex1]} text={t('GLOBAL_CONSTANTS.SELECT_PAYEE')} />
                                                )}
                                                <Feather name="chevron-down" size={s(24)} color={!selectedCoin ? NEW_COLOR.TEXT_DISABLED : NEW_COLOR.TEXT_WHITE} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        {validateBeneficiary() && (
                                            <TextMultiLanguage text={validateBeneficiary()} style={[commonStyles.inputrequirederrormessage]} />
                                        )}

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
                                    </ViewComponent>

                                    <ViewComponent style={[commonStyles.sectionGap]}>
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
                                    </ViewComponent>
                                </ViewComponent>
                            )
                        }}
                    </Formik>
                </Container>
                </KeyboardAwareScrollView>}
        </ViewComponent>
    )
})

export default FiatWithdrawForm;
