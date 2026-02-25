
import { BackHandler } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { useEffect, useState, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge"
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable"
import ViewComponent from "../../../../../components/view/view"
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation"
import useEncryptDecrypt from "../../../../../hooks/encDecHook"
import PageHeader from "../../../../../components/pageHeader/pageHeader"
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay"
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors"
import EmailOTP from "../../../../../components/EmailOTP"
import { isErrorDispaly } from "../../../../../utils/helpers"
import ButtonComponent from "../../../../../components/buttons/button"
import SendOTP from "../../../../../components/sendPhoneOtp"
import SvgFromUrl from "../../../../../components/svgIcon"
import { getThemedCommonStyles } from "../../../../../components/CommonStyles"
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph"
import { s } from "../../../../../components/theme/scale"
import Container from "../../../../../components/container/container"
import CommonSuccess from "../../../../commonScreens/successPage/commonSucces"
import ScrollViewComponent from "../../../../../components/scrollView/scrollView"
import CustomRBSheet from "../../../../../components/models/commonBottomSheet"
import WalletsService from "../../../../../apiServices/wallets"
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText"
import DashboardLoader from "../../../../../components/loader";
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import SendAuthenticatonOTP from "../../../../../components/authenticatorOtp/authenticatorCode"
import { logEvent } from "../../../../../hooks/loggingHook"
import { walletsTabsNavigation } from "../../../../../../cofiguration"
import { getVerificationData } from "../../../../../apiServices/common/countryService"

const FiatWithdrawSummary: React.FC = (props: any) => {
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
    const [btnDisabled, setBtnDisabled] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [isEmailOTP, setIsEmailOTP] = useState(false);
    const [showEmailOtpError, setShowEmailOtpError] = useState(false);
    const [isEmailOTPVerified, setIsEmailOTPVerified] = useState(false);
    const [errorMsg, setErrorMsg] = useState("")
    const [timer, setTimer] = useState(0);
    const [refreshLoading, setRefreshLoading] = useState<boolean>(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const propsData = props?.route?.params;
    const [errorVerificationMsg, setErrorVerificationMsg] = useState("")


    const { decryptAES } = useEncryptDecrypt();
    const [verifiedPhoneOtp, setVerifiedPhoneOtp] = useState(false);
    const [verfiedOtpErrorMsg] = useState(false);
    const [isAuthenticationOTP, setIsAuthenticationOTP] = useState('');
    const [isAuthenticationOTPVerified, setIsAuthenticationOTPVerified] = useState(false);
    const [showAuthenticationOtpError, setShowAuthenticationOtpError] = useState(false);

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const titleText = "GLOBAL_CONSTANTS.CONTINUE";
    useEffect(() => {
        if (getCurrentData()?.timer) {
            setTimer(parseInt(getCurrentData().timer));
        }
    }, [summaryData])

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

    const handleBackToAssets = () => {
        successSheetRef.current?.close();
        navigation.navigate(walletsTabsNavigation, { initialTab: 1, animation: 'slide_from_left' })
    };

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
        logEvent("Button Pressed", { action: "Fiat Withdraw", nextScreen: "Fiat Withdraw Success", currentScreen: "Fiat Withdraw Summary" })
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

        setIsEmailOTP(false);
        setShowEmailOtpError(false);
        setBtnDisabled(false);
        setIsOTP(false);
        setShowOtpError(false);

        let obj = {
            amount: propsData?.amount,
            payeeId: propsData?.payeeId,
            fiatWalletId: propsData?.fiatWalletId,
            metadata: propsData?.metadata
        };

        try {
            setBtnDtlLoading(true);
            const response = await WalletsService.withdrawFiatSucess(obj);
            if (response.ok) {
                verificationSheetRef.current?.close();
                setTimeout(() => {
                    setBtnDtlLoading(false);
                    setBtnDisabled(false);
                    successSheetRef.current?.open();
                }, 300);
            }
            else {
                setErrorVerificationMsg(isErrorDispaly(response))
                setBtnDtlLoading(false);
            }
        }
        catch (error) {
            setErrorVerificationMsg(isErrorDispaly(error))
            setBtnDisabled(false);
            setBtnDtlLoading(false);
        }
    }

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

    const handleRefresh = async () => {
        setRefreshLoading(true);
        let obj = {
            amount: propsData?.amount,
            payeeId: propsData?.payeeId,
            fiatWalletId: propsData?.fiatWalletId
        };
        try {
            const response = await WalletsService.withdrawFiatSummaryDetails(obj);
            if (response.ok && response.data) {
                setSummaryData({
                    ...(propsData || {}),
                    ...(response.data || {})
                });
                if (response.data && typeof response.data === 'object' && 'timer' in response.data) {
                    setTimer(parseInt((response.data as any).timer));
                }
            }
        } catch (error) {
            setErrorMsg(isErrorDispaly(error))
        } finally {
            setRefreshLoading(false);
        }
    };

    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}s`;
    };

    const getCurrentData = () => {
        return summaryData || propsData;
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
        setVerifiedPhoneOtp(false);
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
                        <LabelComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.TRANSFER_DETAILS"} multiLanguageAllows />
                        <ViewComponent style={[commonStyles.sectionGap]}>
                            {Boolean(getCurrentData()?.amount) && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent,]}>
                                        <ViewComponent>
                                            <TextMultiLanguage style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.WITHDRAWAL_AMOUNT"} />
                                        </ViewComponent>
                                        <ViewComponent>
                                            <CurrencyText value={getCurrentData()?.amount} currency={getCurrentData()?.currency} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {Boolean(getCurrentData()?.effectiveFee) && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent,]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                            <TextMultiLanguage style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.FEE"} />
                                            <SvgFromUrl uri="info-circle" width={s(16)} height={s(16)} />
                                        </ViewComponent>
                                        <ViewComponent>
                                            <CurrencyText value={getCurrentData()?.effectiveFee} currency={getCurrentData()?.currency} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {Boolean(getCurrentData()?.receiveAmount) && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent,]}>
                                    <ViewComponent>
                                        <TextMultiLanguage style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.RECEIVE_AMOUNT"} />
                                    </ViewComponent>
                                    <ViewComponent>
                                        <CurrencyText value={getCurrentData()?.receiveAmount} currency={getCurrentData()?.currency} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} />
                                    </ViewComponent>
                                </ViewComponent>
                            )}
                        </ViewComponent>

                        {/* Recipient Details Section */}
                        <LabelComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.RECIPIENT_DETAILS"} multiLanguageAllows />
                        <ViewComponent style={[]}>
                            {Boolean(getCurrentData()?.whitelistName) && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent,]}>
                                        <ViewComponent>
                                            <TextMultiLanguage style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} text={"GLOBAL_CONSTANTS.FAVORITE_NAME"} />
                                        </ViewComponent>
                                        <ViewComponent style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} text={getCurrentData()?.whitelistName} numberOfLines={3} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {Boolean(getCurrentData()?.beneficiaryName) && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <ViewComponent>
                                            <TextMultiLanguage
                                                style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]}
                                                text="GLOBAL_CONSTANTS.BENEFICIARY_NAME"
                                            />
                                        </ViewComponent>

                                        <ViewComponent>
                                            <ParagraphComponent
                                                style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]}
                                                text={getCurrentData().beneficiaryName}
                                                numberOfLines={3}
                                            />
                                        </ViewComponent>
                                    </ViewComponent>

                                    {/* {getCurrentData()?.beneficiaryName?.length > 15 && (
                                        <ParagraphComponent
                                            style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]}
                                            text={getCurrentData().beneficiaryName}
                                            numberOfLines={3}
                                        />
                                    )} */}

                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {Boolean(getCurrentData()?.accountNumber) && (
                                <>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                        <ViewComponent>
                                            <TextMultiLanguage style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} text={"GLOBAL_CONSTANTS.IBAN_ACCOUNT_NUMBER"} />
                                        </ViewComponent>
                                        <ViewComponent>
                                            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} text={getCurrentData()?.accountNumber} numberOfLines={3} />
                                        </ViewComponent>
                                    </ViewComponent>
                                    <ViewComponent style={[commonStyles.listGap]} />
                                </>
                            )}
                            {Boolean(getCurrentData()?.paymentType) && (
                                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent,]}>
                                    <ViewComponent>
                                        <TextMultiLanguage style={[commonStyles.textlinkgrey, commonStyles.fs14, commonStyles.fw400]} text={"GLOBAL_CONSTANTS.PAYMENT_TYPE"} />
                                    </ViewComponent>
                                    <ViewComponent>
                                        <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw600]} text={getCurrentData()?.paymentType} numberOfLines={3} />
                                    </ViewComponent>
                                </ViewComponent>
                            )}
                        </ViewComponent>
                    </ScrollViewComponent>

                    {getCurrentData()?.timer && getCurrentData()?.timer > 0 ? (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10]}>
                            <ViewComponent style={[commonStyles.flex1]}>
                                {/* <ButtonComponent
                                    title={timer === 0 ? t('GLOBAL_CONSTANTS.REFRESH') : `${t('GLOBAL_CONSTANTS.REFRESH')} (${formatTimer(timer)})`}
                                    customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                                    solidBackground={timer > 0}
                                    onPress={handleRefresh}
                                    loading={refreshLoading}
                                    disable={timer > 0}
                                /> */}
                                <ButtonComponent onPress={handleBack} solidBackground={true}
                                    title={"GLOBAL_CONSTANTS.CANCEL"} />
                            </ViewComponent>
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
                <ViewComponent>
                    {errorVerificationMsg != "" && (
                        <ErrorComponent message={errorVerificationMsg} onClose={() => setErrorVerificationMsg("")} />
                    )}

                    {verficationFeild?.isPhoneVerified === true && (
                        <>
                            <ViewComponent style={[commonStyles.mb20]} />
                            <SendOTP
                                isOTP={isOTP}
                                onChangeText={handleReceiveOTP}
                                value={otp}
                                customerId={userinfo?.id}
                                phoneNumber={decryptAES(userinfo?.phoneNo || userinfo?.phoneNumber)}
                                onVerify={setIsOTPVerified}
                                showError={showOtpError}
                                handlePhoneOtpVerified={setVerifiedPhoneOtp}
                                verifiedPhoneOtp={verifiedPhoneOtp}
                                verfiedOtpErrorMsg={verfiedOtpErrorMsg}
                            />
                        </>
                    )}

                    {verficationFeild?.isEmailVerification === true && (
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

                    {/* {verficationFeild?.isTwoFactorEnabled === true && (
                        <>
                            <ViewComponent style={[commonStyles.mb20]} />
                            <SendAuthenticatonOTP
                                isOTP={Boolean(isAuthenticationOTP)}
                                onChangeText={handleReceiveAuthenticationOTP}
                                value={isAuthenticationOTP}
                                onVerify={setIsAuthenticationOTPVerified}
                                showError={showAuthenticationOtpError}
                                customerId={String(userinfo?.id || '')}
                                phoneNumber={String(userinfo?.phoneNumber || userinfo?.phoneNo || '')}
                                handlePhoneOtpVerified={() => { }}
                                verifiedPhoneOtp={false}
                                verfiedOtpErrorMsg={false}
                            />
                        </>
                    )} */}

                    <ViewComponent style={[commonStyles.sectionGap]} />

                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
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

                    <ViewComponent style={commonStyles.sectionGap} />
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
                        subtitle={t('GLOBAL_CONSTANTS.HAS_BEEN_SUBMITTED_SUCESSFULLY')}
                        buttonText={t("GLOBAL_CONSTANTS.BACK_TO_ASSETS")}
                        buttonAction={handleBackToAssets}
                        secondaryButtonText={t("GLOBAL_CONSTANTS.BACK_TO_DASHBOARD")}
                        secondaryButtonAction={handleSuccessClose}
                        amount={propsData?.amount.toString()}
                        prifix={propsData?.currency}
                    />
                </ViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    )
}

export default FiatWithdrawSummary