import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../../../../components/CommonStyles';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import { s } from '../../../../../../constants/styels/scale';
import Container from '../../../../../../components/container/container';
import ViewComponent from '../../../../../../components/view/view';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ScrollViewComponent from '../../../../../../components/scrollView/scrollView';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import LabelComponent from '../../../../../../components/textComponets/lableComponent/lable';
import TextMultiLanguage from '../../../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import ButtonComponent from '../../../../../../components/buttons/button';
import CustomRBSheet from '../../../../../../components/models/commonBottomSheet';
import SendOTP from '../../../../../../components/sendPhoneOtp';
import EmailOTP from '../../../../../../components/EmailOTP';
import CommonSuccess from '../../../../../commonScreens/successPage/commonSucces';
import DashboardLoader from '../../../../../../components/loader';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import { getVerificationData } from '../../../../../../apiServices/common/countryService';
import useEncryptDecrypt from '../../../../../../hooks/encDecHook';
import { logEvent } from '../../../../../../hooks/loggingHook';
import CopyCard from '../../../../../../components/copyIcon/CopyCard';
import { walletsTabsNavigation } from '../../../../../../../cofiguration';
import WalletsService from '../../../../../../apiServices/wallets';

const CryptoWithdrawSummary: React.FC = (props: any) => {
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const navigationSource = useSelector((state: any) => state.userReducer?.navigationSource);
    const isFromDashboard = navigationSource === 'Dashboard';
    const verificationSheetRef = useRef<any>(null);
    const successSheetRef = useRef<any>(null);
    const [otp, setOtp] = useState('');
    const [isOTP, setIsOTP] = useState(false);
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [showOtpError, setShowOtpError] = useState(false);
    const [verficationFeild, setVerficationFeild] = useState<any>({});
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [isEmailOTP, setIsEmailOTP] = useState(false);
    const [showEmailOtpError, setShowEmailOtpError] = useState(false);
    const [isEmailOTPVerified, setIsEmailOTPVerified] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [timer, setTimer] = useState(0);
    const [refreshLoading, setRefreshLoading] = useState<boolean>(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const propsData = props?.route?.params;
    const [errorVerificationMsg, setErrorVerificationMsg] = useState("");
    const [isAuthenticationOTP, setIsAuthenticationOTP] = useState('');
    const [isAuthenticationOTPVerified, setIsAuthenticationOTPVerified] = useState(false);
    const [showAuthenticationOtpError, setShowAuthenticationOtpError] = useState(false);
    const isFocused = useIsFocused();
    const { decryptAES } = useEncryptDecrypt();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const titleText = "GLOBAL_CONSTANTS.CONTINUE";

    useEffect(() => {
        if (isFocused) {
            if (getCurrentData()?.timer) {
                setTimer(parseInt(getCurrentData().timer));
            }
        }
    }, [isFocused, summaryData]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleBackToAssets = (() => {
        if (successSheetRef.current) {
            successSheetRef.current.close();
        }
        navigation.navigate(walletsTabsNavigation, { initialTab: 0, animation: 'slide_from_left' })
    });

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                handleBack();
                return true;
            };
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription?.remove();
        }, [handleBack])
    );

    const handelFinalSave = async () => {
        logEvent("Button Pressed", {
            action: "Crypto Withdraw",
            nextScreen: "Crypto Withdraw Success",
            currentScreen: "Crypto Withdraw Summary"
        });
        setBtnDtlLoading(true);

        if (verficationFeild?.isPhoneVerified && (!otp || !isOTPVerified)) {
            setShowOtpError(true);
            setIsOTP(true);
            setBtnDtlLoading(false);
            return;
        }

        if (verficationFeild?.isEmailVerification && (!emailOtp || !isEmailOTPVerified)) {
            setShowEmailOtpError(true);
            setIsEmailOTP(true);
            setBtnDtlLoading(false);
            return;
        }

        if (verficationFeild?.isTwoFactorEnabled && (!isAuthenticationOTP || !isAuthenticationOTPVerified)) {
            setShowAuthenticationOtpError(true);
            setBtnDtlLoading(false);
            return;
        }

        setIsEmailOTP(false);
        setShowEmailOtpError(false);
        setBtnDisabled(false);
        setIsOTP(false);
        setShowOtpError(false);
        setShowAuthenticationOtpError(false);

        let obj = {
            payeeId: propsData?.payeeId,
            cryptorWalletId: propsData?.cryptorWalletId,
            amount: propsData?.amount,
            metadata: propsData?.metadata
        };

        try {
            setBtnDtlLoading(true);
            const response = await WalletsService.saveCrptoWithdraw(obj);
            if (response.ok) {
                verificationSheetRef.current?.close();
                setTimeout(() => {
                    setBtnDtlLoading(false);
                    setBtnDisabled(false);
                    successSheetRef.current?.open();
                }, 300);
            } else {
                setErrorVerificationMsg(isErrorDispaly(response));
                setBtnDtlLoading(false);
            }
        } catch (error) {
            setErrorVerificationMsg(isErrorDispaly(error));
            setBtnDisabled(false);
            setBtnDtlLoading(false);
        }
    };

    const handleReceiveOTP = (text: any) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue.length <= 6) {
            setOtp(numericValue);
        }
    };

    const handleReceiveEmailOTP = (text: any) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue.length <= 6) {
            setEmailOtp(numericValue);
        }
    };

    const handleReceiveAuthenticationOTP = (text: any) => {
        if (text.toString().length > 6) {
            return '';
        }
        const numericValue = text.replace(/[^0-9]/g, '');
        if (numericValue.length <= 6) {
            setIsAuthenticationOTP(numericValue);
        }
    };

    const handleContinue = async () => {
        setBtnDtlLoading(true);
        try {
            const securityVerififcationData = await getVerificationData();
            if (securityVerififcationData.ok) {
                const verificationData = securityVerififcationData.data;
                setVerficationFeild(verificationData);
                if (verificationData?.isPhoneVerified || verificationData?.isEmailVerification || verificationData?.isTwoFactorEnabled) {
                    setErrorMsg("");
                    verificationSheetRef.current?.open();
                } else {
                    handelFinalSave();
                }
            } else {
                setErrorMsg(isErrorDispaly(securityVerififcationData));
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        } finally {
            setBtnDtlLoading(false);
        }
    };

    //used  for purpose as of now refresh funvtionality is not there
    const handleRefresh = async () => {
        setRefreshLoading(true);
        let obj = {
            payeeId: propsData?.payeeId,
            cryptorWalletId: propsData?.cryptorWalletId,
            amount: propsData?.amount
        };
        try {
            const response = await WalletsService.gotoSummeryPage(obj);
            if (response.ok && response.data) {
                const newSummaryData = {
                    ...(propsData || {}),
                    ...(response.data || {})
                };
                setSummaryData(newSummaryData);
                if (response.data && typeof response.data === 'object' && 'timer' in response.data) {
                    setTimer(parseInt((response.data as any).timer));
                }
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error));
        } finally {
            setRefreshLoading(false);
        }
    };
    //unused for purpose as of now refresh funvtionality is not there
    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}s`;
    };

    const getCurrentData = () => {
        const currentData = summaryData || propsData;

        return currentData;
    };

    const clearVerificationData = () => {
        setOtp('');
        setEmailOtp('');
        setIsOTPVerified(false);
        setIsEmailOTPVerified(false);
        setShowOtpError(false);
        setShowEmailOtpError(false);
        setIsOTP(false);
        setIsEmailOTP(false);
        setIsAuthenticationOTPVerified(false);
        setShowAuthenticationOtpError(false);
        setIsAuthenticationOTP('');
    };

    const handleVerificationSheetClose = () => {
        clearVerificationData();
    };

    const handleSuccessClose = () => {
        if (successSheetRef.current) {
            successSheetRef.current.close();
        }

        navigation.reset({
            index: 0,
            routes: [{
                name: 'Dashboard',
                params: {
                    initialTab: isFromDashboard ? "GLOBAL_CONSTANTS.HOME" : "GLOBAL_CONSTANTS.WALLETS",
                    animation: 'slide_from_left'
                }
            }],
        });
    };

    const copyToClipboard = async (text: any) => {
        try {
            Clipboard.setString(text);
        } catch (error: any) {
            setErrorMsg('Failed to copy text to clipboard');
        }
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {refreshLoading ? (
                <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </SafeAreaViewComponent>
            ) : (
                <Container style={commonStyles.container}>
                    <PageHeader title={"GLOBAL_CONSTANTS.WITHDRAW_SUMMARY"} onBackPress={handleBack} />
                    <ScrollViewComponent>
                        {errorMsg != "" && <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />}

                        {/* Transfer Details Section */}
                        <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.TRANSFER_DETAILS"} multiLanguageAllows />
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            {/* Exchange Rate */}
                            {getCurrentData()?.exchangeRate && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EXCHANGE_RATE"} />
                                        <ViewComponent>
                                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={`1 ${getCurrentData()?.walletCode} = ${getCurrentData()?.exchangeRate} USD`} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listitemGap]} />
                                </>
                            )}

                            {/* Amount */}
                            {getCurrentData()?.amount && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.AMOUNT"} />
                                        <CurrencyText value={getCurrentData()?.amount} currency={getCurrentData()?.walletCode} style={[commonStyles.listprimarytext]} decimalPlaces={4} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listitemGap]} />
                                </>
                            )}

                            {/* Fee */}
                            {getCurrentData()?.fee && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FEE"} />
                                        <CurrencyText value={getCurrentData()?.fee} currency={getCurrentData()?.walletCode} style={[commonStyles.listprimarytext]} decimalPlaces={4} />
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listitemGap]} />
                                </>
                            )}

                            {/* Receive Amount */}
                            {getCurrentData()?.receivedAmount && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.RECEIVE_AMOUNT"} />
                                    <CurrencyText value={getCurrentData()?.receivedAmount} currency={getCurrentData()?.walletCode} style={[commonStyles.listprimarytext]} decimalPlaces={4} />
                                </ViewComponent>
                            )}
                        </ViewComponent>

                        {/* Recipient Details Section */}
                        <ParagraphComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.RECIPIENT_DETAILS"} multiLanguageAllows />
                        <ViewComponent style={[]}>
                            {/* Address */}
                            {getCurrentData()?.walletAddress && (
                                <>
                                    <ViewComponent>
                                        <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.ADDRESS"} />
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                            <ParagraphComponent style={[commonStyles.listprimarytext, commonStyles.flex1]} text={getCurrentData()?.walletAddress} />
                                            <CopyCard onPress={() => copyToClipboard(getCurrentData()?.walletAddress)} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listitemGap]} />
                                </>
                            )}

                            {/* Network */}
                            {getCurrentData()?.network && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.flexWrap, commonStyles.gap8]}>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.NETWORK"} />
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={getCurrentData()?.network} numberOfLines={3} />
                                </ViewComponent>
                            )}
                        </ViewComponent>
                    </ScrollViewComponent>

                    {getCurrentData()?.timer && getCurrentData()?.timer > 0 ? (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10]}>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ButtonComponent
                                    title={titleText}
                                    customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                                    customButtonStyle={[commonStyles.borderPrimary, { backgroundColor: NEW_COLOR.PRiMARY_COLOR }]}
                                    solidBackground={timer === 0}
                                    onPress={handleContinue}
                                    loading={btnDtlLoading}
                                    disable={btnDisabled || timer === 0}
                                />
                            </ViewComponent>
                        </ViewComponent>
                    ) : (
                        <ButtonComponent
                            title={titleText}
                            customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                            onPress={handleContinue}
                            loading={btnDtlLoading}
                            disable={btnDisabled}
                        />
                    )}
                    <ViewComponent style={commonStyles.sectionGap} />
                </Container>
            )}

            <CustomRBSheet
                refRBSheet={verificationSheetRef}
                height={"Large"}
                onClose={handleVerificationSheetClose}
            >
                <ViewComponent style={{ flex: 1 }}>
                    {/* Scrollable Content */}
                    <ScrollViewComponent
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: s(100) }} // extra space for buttons
                        showsVerticalScrollIndicator={false}
                    >
                        {errorVerificationMsg != "" && (
                            <ErrorComponent
                                message={errorVerificationMsg}
                                onClose={() => setErrorVerificationMsg("")}
                            />
                        )}

                        {verficationFeild?.isPhoneVerified && (
                            <SendOTP
                                isOTP={isOTP}
                                onChangeText={handleReceiveOTP}
                                value={otp}
                                customerId={userinfo?.id}
                                phoneNumber={decryptAES(userinfo?.phoneNo || userinfo?.phoneNumber)}
                                onVerify={setIsOTPVerified}
                                showError={showOtpError}
                                handlePhoneOtpVerified={() => { }}
                                verifiedPhoneOtp={false}
                                verfiedOtpErrorMsg={false}
                            />
                        )}

                        {verficationFeild?.isEmailVerification && (
                            <>
                                <ViewComponent style={[commonStyles.formItemSpace]} />
                                <EmailOTP
                                    isEmailOTP={isEmailOTP}
                                    onChangeText={handleReceiveEmailOTP}
                                    value={emailOtp}
                                    onVerify={setIsEmailOTPVerified}
                                    showError={showEmailOtpError}
                                />
                            </>
                        )}

                        {/* {verficationFeild?.isTwoFactorEnabled && (
                            <>
                                <ViewComponent style={[commonStyles.mb20]} />
                                <SendAuthenticatonOTP
                                    isOTP={Boolean(isAuthenticationOTP)}
                                    onChangeText={handleReceiveAuthenticationOTP}
                                    value={isAuthenticationOTP}
                                    onVerify={setIsAuthenticationOTPVerified}
                                    showError={showAuthenticationOtpError}
                                    customerId={String(userinfo?.id || "")}
                                    phoneNumber={String(userinfo?.phoneNumber || userinfo?.phoneNo || "")}
                                    handlePhoneOtpVerified={() => { }}
                                    verifiedPhoneOtp={false}
                                    verfiedOtpErrorMsg={false}
                                />
                            </>
                        )} */}
                    </ScrollViewComponent>

                    {/* Footer Buttons - Always at bottom */}
                    <ViewComponent
                        style={[
                            commonStyles.dflex,
                            commonStyles.alignCenter,
                            commonStyles.gap10,
                            commonStyles.sectionGap
                        ]}
                    >
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CANCEL"
                                onPress={() => {
                                    clearVerificationData();
                                    verificationSheetRef.current?.close();
                                }}
                                solidBackground={true}
                                disable={btnDtlLoading}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                loading={btnDtlLoading}
                                disable={
                                    (verficationFeild?.isPhoneVerified && !isOTPVerified) ||
                                    (verficationFeild?.isEmailVerification && !isEmailOTPVerified) ||
                                    (verficationFeild?.isTwoFactorEnabled && !isAuthenticationOTPVerified)
                                }
                                onPress={handelFinalSave}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
            </CustomRBSheet>

            <CustomRBSheet
                refRBSheet={successSheetRef}
                height={"Large"}
                draggable={false}
                closeOnPressMask={false}
            >
                <ViewComponent>
                    <CommonSuccess
                        navigation={props.navigation}
                        successMessage={t("GLOBAL_CONSTANTS.WITHDRAWAL_REQUEST_SUBMITTED")}
                        subtitle={`${t('GLOBAL_CONSTANTS.HAS_BEEN_SUBMITTED_SUCESSFULLY')}`}
                        buttonText={t("GLOBAL_CONSTANTS.BACK_TO_ASSETS")}
                        buttonAction={handleBackToAssets}
                        secondaryButtonText={t("GLOBAL_CONSTANTS.BACK_TO_DASHBOARD")}
                        secondaryButtonAction={handleSuccessClose}
                        amount={propsData?.amount?.toString()}
                        prifix={propsData?.walletCode}
                    />
                </ViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    );
};

export default CryptoWithdrawSummary;
