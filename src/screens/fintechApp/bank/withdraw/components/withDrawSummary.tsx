
import React, { useEffect, useState, useRef, useCallback } from "react"
import { BackHandler } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { useSelector } from "react-redux"
import useEncryptDecrypt from "../../../../../hooks/encDecHook"
import { getThemedCommonStyles } from "../../../../../components/CommonStyles"
import { logEvent } from "../../../../../hooks/loggingHook"
import { isErrorDispaly } from "../../../../../utils/helpers"
import { getVerificationData } from "../../../../../apiServices/common/countryService"
import { BankAccountService } from "../../../../../apiServices/bank";
import ViewComponent from "../../../../../components/view/view";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import Container from "../../../../../components/container/container";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import DashboardLoader from "../../../../../components/loader";
import LabelComponent from "../../../../../components/textComponets/lableComponent/lable";
import TextMultiLanguage from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import SvgFromUrl from "../../../../../components/svgIcon";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import ButtonComponent from "../../../../../components/buttons/button";
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import SendOTP from "../../../../../components/sendPhoneOtp";
import EmailOTP from "../../../../../components/EmailOTP";
import CommonSuccess from "../../../../commonScreens/successPage/commonSucces";
import { s } from "../../../../../components/theme/scale";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation"
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors"

const SummeryDetails: React.FC = (props: any) => {
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
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
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [summaryData, setSummaryData] = useState<any>(null);
    const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
    const propsData = props?.route?.params;
    const [countdown, setCountdown] = useState<number>(0);
    const [expiresIn] = useState<string>(propsData?.expiresIn);
    const { decryptAES } = useEncryptDecrypt();
    const [verifiedPhoneOtp, setVerifiedPhoneOtp] = useState(false);
    const [verfiedOtpErrorMsg] = useState(false);
    const [isAuthenticationOTP, setIsAuthenticationOTP] = useState("");
    const [isAuthenticationOTPVerified, setIsAuthenticationOTPVerified] = useState(false);
    const [showAuthenticationOtpError, setShowAuthenticationOtpError] = useState(false);

    // Add theme hooks
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const handleSendAgain = () => {
        navigation.navigate('AllAccounts', { animation: 'slide_from_left' });
    };

    const handleBackToBank = () => {
        navigation.navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: 'slide_from_left' });
    };

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
        logEvent("Button Pressed", { action: "Bank withdraw button", currentScreen: "Bank withdraw", nextScreen: "Bank withdraw success" })
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
            amount: propsData?.requestedAmount,
            accountId: propsData?.AccountId,
            metadata: null,
            paymentscheme: propsData?.paymentscheme
        };
        try {
            let response: any;
            setBtnDtlLoading(true);
            response = await BankAccountService.banksWithdrawSave(obj);
            if (response.ok) {
                verificationSheetRef.current?.close();
                setTimeout(() => {
                    setBtnDtlLoading(false);
                    setBtnDisabled(false);
                    successSheetRef.current?.open();

                }, 300);
            }
            else {
                setErrorMsg(isErrorDispaly(response))
                setBtnDtlLoading(false);
            }
        }
        catch (error) {
            setErrorMsg(isErrorDispaly(error))
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

    const clearVerificationData = () => {
        setOtp('');
        setEmailOtp('');
        setIsAuthenticationOTP('');
        setIsOTPVerified(false);
        setIsEmailOTPVerified(false);
        setIsAuthenticationOTPVerified(false);
        setShowOtpError(false);
        setShowEmailOtpError(false);
        setShowAuthenticationOtpError(false);
        setIsOTP(false);
        setIsEmailOTP(false);
        setVerifiedPhoneOtp(false);
    };

    const handleVerificationSheetClose = () => {
        clearVerificationData();
    };
    const handleSendAgainAction = () => {
        successSheetRef.current?.close();
        props?.handleSendAgain();
    };

    const handleBackToBankAction = () => {
        successSheetRef.current?.close();
        props?.handleBackToBank();
    };

    const handleRefresh = async () => {
        setRefreshLoading(true);
        let fiatObj = {
            payeeId: propsData?.payeeId,
            amount: propsData?.requestedAmount,
            accountId: propsData?.AccountId,
            paymentscheme: propsData?.paymentscheme
        };
        try {
            const response = await BankAccountService.postBanksFiatWithdraw(fiatObj);
            if (response?.ok && response.data) {
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

    return (

        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {(refreshLoading) ? (
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
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.WITHDRAWAL_AMOUNT"} />
                                </ViewComponent>
                                <ViewComponent>
                                    <CurrencyText value={getCurrentData()?.requestedAmount} currency={getCurrentData()?.walletCode} style={[commonStyles.listprimarytext]} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.EFFECTIVE_FEE"} />
                                    <SvgFromUrl uri="info-circle" width={s(16)} height={s(16)} />
                                </ViewComponent>
                                <ViewComponent>
                                    <CurrencyText value={getCurrentData()?.commission} currency={getCurrentData()?.walletCode} style={[commonStyles.listprimarytext]} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.RECEIVE_AMOUNT"} />
                                </ViewComponent>
                                <ViewComponent>
                                    <CurrencyText value={getCurrentData()?.withdrawAmount} currency={getCurrentData()?.walletCode} style={[commonStyles.listprimarytext]} />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>

                        {/* Recipient Details Section */}
                        <LabelComponent style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.RECIPIENT_DETAILS"} multiLanguageAllows />
                        <ViewComponent style={[]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.FAVORITE_NAME"} />
                                </ViewComponent>
                                <ViewComponent>
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={getCurrentData()?.payeeName || ""} numberOfLines={3} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BANK_BENEFICIARY_NAME"} />
                                </ViewComponent>
                                <ViewComponent>
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={getCurrentData()?.beneficiaryAccountName || ""} numberOfLines={3} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.IBAN_ACCOUNT_NUMBER"} />
                                </ViewComponent>
                                <ViewComponent>
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={getCurrentData()?.accountNumber || ""} numberOfLines={3} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap]}>
                                <ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.BANKS_NAME"} />
                                </ViewComponent>
                                <ViewComponent>
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={getCurrentData()?.bankName || ""} numberOfLines={3} />
                                </ViewComponent>
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.listitemGap]} />
                            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flexWrap, commonStyles.gap8]}>
                                <ViewComponent>
                                    <TextMultiLanguage style={[commonStyles.listsecondarytext]} text={"GLOBAL_CONSTANTS.Bank_PAYMENT_TYPE"} />
                                </ViewComponent>
                                <ViewComponent>
                                    <ParagraphComponent style={[commonStyles.listprimarytext]} text={getCurrentData()?.paymentType || ""} numberOfLines={3} />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>



                    </ScrollViewComponent>
                    {getCurrentData()?.timer && getCurrentData()?.timer > 0 ? (
                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10]}>
                            {/* <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={timer === 0 ? t('GLOBAL_CONSTANTS.REFRESH') : `${t('GLOBAL_CONSTANTS.REFRESH')} (${formatTimer(timer)})`}
                                customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                                solidBackground={timer > 0}
                                onPress={handleRefresh}
                                loading={refreshLoading}
                                disable={timer > 0}
                            />
                        </ViewComponent> */}
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ButtonComponent
                                    title={"GLOBAL_CONSTANTS.CONFIRM"}
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
                            title={"GLOBAL_CONSTANTS.CONFIRM"}
                            customTitleStyle={[commonStyles.textWhite, commonStyles.fw600]}
                            onPress={handleContinue}
                            loading={btnDtlLoading}
                            disable={btnDisabled}
                        />
                    )}
                    <ViewComponent style={[commonStyles.sectionGap]} />

                </Container>
            )}

            <CustomRBSheet
                refRBSheet={verificationSheetRef}
                height={"Medium"}
                onClose={handleVerificationSheetClose}
            >
                <ViewComponent>
                    {errorMsg != "" && (
                        <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />
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
                                onVerify={(value: any) =>
                                    setIsAuthenticationOTPVerified(value)
                                }
                                showError={showAuthenticationOtpError}
                                customerId={String(userinfo?.id || '')}
                                phoneNumber={String(decryptAES(userinfo?.phoneNumber || userinfo?.phoneNo) || '')}
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
                                    logEvent("Button Pressed", { action: "Bank withdraw cancel button", currentScreen: "Bank withdraw", nextScreen: "Bank withdraw" })
                                }}
                                solidBackground={true}
                                disable={btnDtlLoading}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CONTINUE"
                                loading={btnDtlLoading}
                                disable={(
                                    (verficationFeild?.isPhoneVerified && !isOTPVerified) ||
                                    (verficationFeild?.isEmailVerification && !isEmailOTPVerified) ||
                                    (verficationFeild?.isTwoFactorEnabled && !isAuthenticationOTPVerified)
                                )}
                                onPress={handelFinalSave}
                            />
                        </ViewComponent>
                    </ViewComponent>

                    <ViewComponent style={[commonStyles.mb10]} />
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
                        WithdrawMsg={"GLOBAL_CONSTANTS.YOUR_WITHDRAWAL_OF"}
                        subtitle={`${t("GLOBAL_CONSTANTS.HAS_BEEN_SUBMITTED_SUCESSFULLY")}`}
                        buttonText={t("GLOBAL_CONSTANTS.WITHDRAW_AGAIN")}
                        buttonAction={handleSendAgainAction}
                        secondaryButtonText={t(props?.secondaryButtonText || "GLOBAL_CONSTANTS.BACK_TO_BANK")}
                        secondaryButtonAction={handleBackToBankAction}
                        amount={propsData?.requestedAmount}
                        prifix={propsData?.walletCode}
                    // amountIsDisplay={false}
                    />
                </ViewComponent>
            </CustomRBSheet>
        </ViewComponent>
    )
}

export default SummeryDetails