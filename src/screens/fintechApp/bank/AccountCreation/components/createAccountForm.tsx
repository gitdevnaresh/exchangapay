import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Formik, FormikProps } from 'formik';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import CreateAccountService from '../../../../../apiServices/bank/createAccount';
import { CreateAccountSchema } from '../schemas/createShema';
import { useDispatch } from 'react-redux';
import { Currency, LocalLists } from '../types/interface';
import { KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';
import Container from '../../../../../components/container/container';
import { isErrorDispaly } from '../../../../../utils/helpers';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { CoinImages, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ButtonComponent from '../../../../../components/buttons/button';
import CommonDropdown from '../../../../../components/dropDown';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import ViewComponent from '../../../../../components/view/view';
import DashboardLoader from '../../../../../components/loader';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import ImageUri from '../../../../../components/imageComponents/image';
import { s } from '../../../../../components/theme/scale';
import { bankService } from '../../../../../apiServices/common/transfer';
import CustomRBSheet from '../../../../../components/models/commonBottomSheet';
import ScrollViewComponent from '../../../../../components/scrollView/scrollView';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import LabelComponent from '../../../../../components/textComponets/lableComponent/lable';
import ProfileService from '../../../../../apiServices/profile';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { sanitizeHtmlForReactNative } from '../../../../../hooks/securityHook/secureDomContent';
import SuccessBottomSheet from '../../../../commonScreens/successBottomSheet/successBottomSheet';
import { Logger } from '../../../../../utils/Logger';

interface FormValues {
    currency: string;
    bank: string;
}

const CreateAccountForm = React.memo((props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const [errormsg, setErrormsg] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [initValues, setInitValues] = useState<FormValues>({ currency: "", bank: "" });
    const isFocused = useIsFocused();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const [lists, setLists] = useState<LocalLists>({
        currenciesList: [],
        banksList: [],
    });
    const { t } = useTranslation();
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
    const [kycLoading, setKycLoading] = useState<boolean>(false);
    const [apiLoading, setApiLoading] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const rbSheetRef = useRef<any>(null);
    const successSheetRef = useRef<any>(null);
    const { width } = useWindowDimensions();

    const checkIfCurrencyRejected = async (currencyName: string) => {
        try {
            const response = await bankService.getBanks(currencyName);
            if (response?.ok) {
                const bankList = (response?.data as any)?.bankList || [];
                return bankList.some((bank: any) =>
                    bank?.accountStatus?.toLowerCase() === 'rejected'
                );
            }
        } catch (error) {
            Logger.error('checkIfCurrencyRejected failed', { error, currencyName });
            setErrormsg(isErrorDispaly(error));
        }
        return false;
    };

    useEffect(() => {
        getCurrencies();
        // Reset loading state when screen refocuses
        setKycLoading(false);
    }, [isFocused]);


    // Set USD as default currency when currencies list is loaded, fallback to first currency if USD not available
    useEffect(() => {
        try {
            if (lists.currenciesList.length > 0 && !selectedCurrency) {
                const usdCurrency = lists.currenciesList.find((currency) => currency.name === 'USD');
                const defaultCurrency = usdCurrency || lists.currenciesList[0]; // Fallback to first currency

                if (defaultCurrency?.banks?.length > 0) {
                    setSelectedCurrency(defaultCurrency);
                    setLists((prev) => ({ ...prev, banksList: defaultCurrency.banks }));
                    // Set initial values for Formik
                    setInitValues(prev => ({
                        ...prev,
                        currency: defaultCurrency.name,
                        bank: defaultCurrency.banks[0]?.name || ''
                    }));
                }
            }
        } catch (error) {
            Logger.error('Currency selection useEffect failed', { error, listsLength: lists.currenciesList.length });
        }
    }, [lists.currenciesList]);

    useEffect(() => {
        if (props?.route?.params?.feeZeroCall && selectedCurrency) {

        }
    }, [selectedCurrency, props?.route?.params?.feeZeroCall]);

    const handleSave = async (values: FormValues) => {
        const firstBank = lists?.banksList?.[0];
        if ((firstBank as any)?.note) {
            // Reset loading state when opening terms sheet
            setKycLoading(false);
            setAgreedToTerms(false);
            rbSheetRef?.current?.open();
        } else {
            proceedToNextScreen(values);
        }
    };

    const proceedToNextScreen = async (values: FormValues) => {
        try {
            // Get first bank from default currency's banks
            const firstBank = lists?.banksList?.[0];

            // Check if selected currency has rejected account
            const selectedCurrencyName = selectedCurrency?.name || values.currency;
            const isSelectedCurrencyRejected = await checkIfCurrencyRejected(selectedCurrencyName);

            const hasAccountCreationFee = selectedCurrency?.banks?.[0]?.accountCreationFee;
            dispatch({ type: 'SET_SELECTED_BANK', payload: firstBank });
            dispatch({ type: 'SET_IS_REAPPLY', payload: isSelectedCurrencyRejected });
            dispatch({ type: 'SET_HAS_ACCOUNT_CREATION_FEE', payload: hasAccountCreationFee });
            dispatch({ type: 'SET_IDENTITY_DOCUMENTS', payload: [] });
            dispatch({ type: 'SET_SELECTED_ADDRESSES', payload: [] });
            dispatch({ type: 'SET_UBO_FORM_DATA', payload: [] });
            dispatch({ type: 'SET_DIRECTOR_FORM_DATA', payload: [] });
            dispatch({ type: 'SET_DOCUMENTS_DATA', payload: null });
            dispatch({ type: 'SET_PERSONAL_DOB', payload: null });
            dispatch({ type: 'SET_IP_ADDRESS', payload: '' });
            dispatch({ type: 'SET_SECTORS', payload: '' });
            dispatch({ type: 'SET_TYPES', payload: '' });
            // Navigate with productId from first bank
            if (firstBank?.productId) {
                navigation.navigate(props?.targetScreen, {
                    productId: firstBank.productId,
                    ...props?.route?.params,
                    animation: 'slide_from_right'
                });
            }
        } catch (error) {
            Logger.error('proceedToNextScreen failed', { error, selectedCurrency: selectedCurrency?.name });
            setErrormsg(isErrorDispaly(error));
        }
    };
    const handleAgreeToTerms = useCallback(() => {
        setAgreedToTerms(prev => !prev);
    }, []);
    const handleProceed = async () => {
        rbSheetRef?.current?.close();
        setKycLoading(true);

        try {
            const firstBank = lists?.banksList?.[0];
            if (firstBank?.productId) {
                const detailsRes = await ProfileService.kycInfoDetails(firstBank.productId);

                if (detailsRes?.ok && detailsRes.data?.kyc?.provider?.toLowerCase() === "sumsub") {
                    const requirement = detailsRes.data?.kyc?.requirement;
                    setKycLoading(false);
                    navigation.navigate('BankKYCScreen', {
                        requirement,
                        selectedBank: firstBank,
                        selectedCurrency,
                        onSuccess: () => {
                            // Show success sheet in CreateAccountForm
                            successSheetRef.current?.open();
                        },
                        onError: (error: string) => {
                            // Show error in CreateAccountForm
                            setErrormsg(error);
                        },
                        animation: 'slide_from_right'
                    });
                    return;
                } else {
                    proceedToNextScreen(initValues);
                    setKycLoading(false);
                }
            } else {
                setKycLoading(false);
            }
        } catch (error) {
            Logger.error('handleProceed failed', { error, firstBankId: lists?.banksList?.[0]?.productId });
            setErrormsg(isErrorDispaly(error));
            setKycLoading(false);
        }

    };

    const handleCancel = useCallback(() => {
        setAgreedToTerms(false);
        rbSheetRef?.current?.close();
    }, []);

    const handleFeeZeroApiCall = async () => {
        const firstBank = lists?.banksList?.[0];
        if (!firstBank?.productId) return;

        try {
            setApiLoading(true);

            const payload = {
                walletId: null,
                amount: 0,
                metadata: null,
                documents: [],
                address: [],
                ubo: [],
                director: [],
                isReapply: false,
                sector: null,
                type: null,
                dob: null
            };

            const response = await CreateAccountService.summaryAccountCreation(
                firstBank.productId,
                payload
            );

            setApiLoading(false);

            if (response?.ok) {
                setTimeout(() => {
                    if (successSheetRef.current && typeof successSheetRef.current.open === 'function') {
                        successSheetRef.current.open();
                    }
                }, 100);
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (err) {
            Logger.error('handleFeeZeroApiCall failed', { error: err, productId: firstBank?.productId });
            setApiLoading(false);
            setErrormsg(isErrorDispaly(err));
        }
    };

    // Check if navigated from WalletsHome for fee = 0 scenario

    const onRefresh = useCallback(async () => {
        setRefresh(true);
        try {
            await getCurrencies();
        } finally {
            setRefresh(false);
        }
    }, []);

    const getCurrencies = async () => {
        setLoading(true);
        try {
            const response = await CreateAccountService.getAllCurrencies();
            if (response?.ok) {
                setLists((prev) => ({ ...prev, currenciesList: response?.data as Currency[] }));
            } else {
                setErrormsg(isErrorDispaly(response));
            }
        } catch (error) {
            Logger.error('getCurrencies API failed', { error });
            setErrormsg(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };

    const getBanks = (currencyName: string, setFieldValue: (field: keyof FormValues, value: any) => void) => {
        try {
            const selected = lists?.currenciesList?.find((item) => item?.name === currencyName);
            if (selected?.banks && selected.banks.length > 0) {
                setLists((prev) => ({ ...prev, banksList: selected.banks }));
                // Auto-select first bank
                const firstBank = selected.banks[0];
                if (setFieldValue && typeof setFieldValue === 'function') {
                    setFieldValue('bank', firstBank.name);
                }
            }
        } catch (error) {
            Logger.error('getBanks failed', { error, currencyName });
        }
    };

    const handleCloseError = useCallback(() => {
        setErrormsg(null);
    }, []);


    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {(loading || apiLoading) && <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}><DashboardLoader /></ViewComponent>}
            {!loading && <KeyboardAvoidingView
                style={[commonStyles.flex1]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.BANK_CREATE_ACCOUNT"} onBackPress={props.handleBack} />
                    <ViewComponent style={[commonStyles.flex1, commonStyles.mt8]}>
                        {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
                        <ViewComponent style={[commonStyles.flex1]}>
                            <Formik
                                initialValues={initValues}
                                onSubmit={handleSave}
                                validationSchema={CreateAccountSchema}
                                enableReinitialize
                            >
                                {({ touched, handleSubmit, errors, setFieldValue }: FormikProps<FormValues>) => {
                                    return (
                                        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
                                            <ScrollViewComponent
                                                style={[commonStyles.flex1]}
                                                refreshing={refresh} onRefresh={onRefresh}
                                            >
                                                <ViewComponent>
                                                    <LabelComponent style={commonStyles.inputLabel} text={"GLOBAL_CONSTANTS.CURRENCY"}>
                                                        <LabelComponent text=" *" style={commonStyles.textRed} />
                                                    </LabelComponent>
                                                    <CommonDropdown
                                                        data={lists.currenciesList}
                                                        selectedItem={selectedCurrency}
                                                        onSelect={(item: Currency) => {
                                                            setSelectedCurrency(item);
                                                            setFieldValue('currency', item.name); // Update Formik state
                                                            getBanks(item.name, setFieldValue);
                                                        }}
                                                        placeholder={"GLOBAL_CONSTANTS.SELECT_CURRENCY"}
                                                        error={touched.currency && errors.currency ? errors.currency : undefined}
                                                        currencyMapping={(key: string) => {
                                                            return key === 'usd' ? CoinImages['bankusd'] : CoinImages[key];
                                                        }}
                                                        renderItem={(item: Currency) => {
                                                            const isCurrentlySelected = selectedCurrency?.name === item.name;

                                                            return (
                                                                <ViewComponent
                                                                    style={[
                                                                        commonStyles.dflex,
                                                                        commonStyles.alignCenter,
                                                                        commonStyles.gap16,
                                                                        commonStyles.rounded5,
                                                                        commonStyles.p8,
                                                                        commonStyles.mt4,
                                                                        isCurrentlySelected && { backgroundColor: NEW_COLOR.TAB_ACTIVE_BG }, //  Only selected gets background
                                                                    ]}
                                                                >
                                                                    <ViewComponent style={{ width: 30, height: 30 }}>
                                                                        <ImageUri
                                                                            uri={(() => {
                                                                                const key = item?.name?.toLowerCase();
                                                                                // If USD comes, pass bankusd to CoinImages
                                                                                if (key === 'usd') {
                                                                                    return CoinImages['bankusd'] || "";
                                                                                }
                                                                                return CoinImages[key] || "";
                                                                            })()}
                                                                            style={{ borderRadius: 24 }}
                                                                        />

                                                                    </ViewComponent>

                                                                    <ViewComponent style={{ flex: 1 }}>
                                                                        <ParagraphComponent
                                                                            text={item.name}
                                                                            style={[
                                                                                commonStyles.fs14,
                                                                                commonStyles.fw600,
                                                                                commonStyles.textWhite,
                                                                            ]}
                                                                        />
                                                                    </ViewComponent>
                                                                </ViewComponent>
                                                            );
                                                        }}
                                                        dropdownHeight={300}
                                                    />
                                                    <ViewComponent style={[commonStyles.formItemSpace]} />
                                                    {selectedCurrency?.banks?.[0]?.accountCreationFee && (
                                                        <ViewComponent style={[commonStyles.bgnote]}>
                                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignStart, commonStyles.gap8]}>

                                                                <ViewComponent>
                                                                    <MaterialIcons name="info-outline" size={s(18)} color={NEW_COLOR.NOTE_ICON} />
                                                                </ViewComponent>
                                                                <ViewComponent style={[commonStyles.flex1]}>
                                                                    <TextMultiLanguage
                                                                        text={t("GLOBAL_CONSTANTS.BANK_ACCOUNT_OPENING_FEE_NOTE")}
                                                                        style={[commonStyles.bgNoteText]}
                                                                    >
                                                                        <CurrencyText
                                                                            value={selectedCurrency?.banks?.[0]?.accountCreationFee ?? 0}
                                                                            currency={selectedCurrency?.name ?? ''}
                                                                            style={[commonStyles.bgNoteText]}
                                                                        />
                                                                        <TextMultiLanguage
                                                                            text="GLOBAL_CONSTANTS.ACCOUNT_OPENING_FEE"
                                                                            style={[commonStyles.bgNoteText]}
                                                                        />
                                                                    </TextMultiLanguage>


                                                                </ViewComponent>

                                                            </ViewComponent>
                                                        </ViewComponent>
                                                    )}
                                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                                </ViewComponent>
                                            </ScrollViewComponent>
                                            <ViewComponent>
                                                <ButtonComponent
                                                    title={"GLOBAL_CONSTANTS.CONTINUE"}
                                                    onPress={handleSubmit}
                                                />
                                                <ViewComponent style={[commonStyles.sectionGap]} />
                                            </ViewComponent>
                                        </ViewComponent>

                                    );
                                }}
                            </Formik>
                        </ViewComponent>
                    </ViewComponent>
                </Container>
            </KeyboardAvoidingView>}

            <CustomRBSheet refRBSheet={rbSheetRef} title={"GLOBAL_CONSTANTS.TERMS_AND_CONDITIONS"} height={'Large'} onClose={() => setAgreedToTerms(false)}>
                <ViewComponent style={{ flex: 1 }}>
                    <ScrollViewComponent style={{ flex: 1 }}>
                        <RenderHTML
                            contentWidth={width}
                            source={{
                                html: sanitizeHtmlForReactNative((selectedCurrency?.banks?.[0] as any)?.note) || (selectedCurrency?.banks?.[0] as any)?.note || ''
                            }}
                            tagsStyles={{
                                body: { color: NEW_COLOR.TEXT_link, fontSize: 12 },
                                li: { color: NEW_COLOR.TEXT_link, fontSize: 12 }
                            }}
                            renderersProps={{
                                img: { enableExperimentalPercentWidth: true }
                            }}
                            enableExperimentalMarginCollapsing
                        />

                        <ViewComponent style={[commonStyles.mt10]}>
                            <CommonTouchableOpacity onPress={handleAgreeToTerms}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <MaterialCommunityIcons
                                        name={agreedToTerms ? 'checkbox-outline' : 'checkbox-blank-outline'}
                                        size={s(24)}
                                        color={agreedToTerms ? NEW_COLOR.BUTTON_BG : NEW_COLOR.TEXT_link}
                                    />
                                    <TextMultiLanguage
                                        style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.flex1]}
                                        text={"GLOBAL_CONSTANTS.AGREE_TERMS_AND_CONDITIONS"}
                                    />
                                </ViewComponent>
                            </CommonTouchableOpacity>
                        </ViewComponent>
                    </ScrollViewComponent>

                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.mb10]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CANCEL"}
                                onPress={handleCancel}
                                solidBackground={true}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.IVE_READ"}
                                onPress={handleProceed}
                                disable={!agreedToTerms || kycLoading}
                                loading={kycLoading}
                            />
                        </ViewComponent>
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />
                </ViewComponent>
            </CustomRBSheet>

            <SuccessBottomSheet
                sheetRef={successSheetRef}
                navigation={navigation}
            />
        </ViewComponent>
    );
});

export default CreateAccountForm;