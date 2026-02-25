import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Container from "../../../../../components/container/container";
import PaymentService from "../../../../../apiServices/payments";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import SendOTP from "../../../../../components/sendPhoneOtp";
import SendAuthenticatonOTP from "../../../../../components/authenticatorOtp/authenticatorCode"; // ? added
import { isErrorDispaly } from "../../../../../utils/helpers";
import { s } from "../../../../../components/theme/scale";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { PAYOUT_CONSTANTS } from "../payOutConstants";
import { CryptoObj, FiatObj } from "./send/sendInterface";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import CommonSuccess from "../../../../commonScreens/successPage/commonSucces";
import ButtonComponent from "../../../../../components/buttons/button";
import CustomRBSheet from "../../../../../components/models/commonBottomSheet";
import RBSheet from "react-native-raw-bottom-sheet";
import ViewComponent from "../../../../../components/view/view";
import useEncryptDecrypt from "../../../../../hooks/encDecHook";
import { useHardwareBackHandler } from "../../../../../hooks/backHandleHook";
import ScrollViewComponent from "../../../../../components/scrollView/scrollView";
import SummaryDetailsSection from "./components/SummaryDetailsSection";
import DashboardLoader from "../../../../../components/loader";
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import { logEvent } from "../../../../../hooks/loggingHook";
import EmailOTP from "../../../../../components/EmailOTP";
import { getVerificationData } from "../../../../../apiServices/common/countryService";

const PayoutSummaryDetails = (props: any) => {
  // Hooks and state initialization
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const { t } = useLngTranslation();
  const userinfo = useSelector((state: any) => state.userReducer?.userDetails);
  const navigationSource = useSelector((state: any) => state.userReducer?.navigationSource);
  const isFromDashboard = navigationSource === 'Dashboard';
  const propsData = props?.route?.params;

  const [otp, setOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [authOtp, setAuthOtp] = useState(""); // ? Authenticator OTP

  const [isOTP, setIsOTP] = useState(false);
  const [isEmailOTP, setIsEmailOTP] = useState(false);
  const [isAuthOTP, setIsAuthOTP] = useState(false); // ?

  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [isEmailOTPVerified, setIsEmailOTPVerified] = useState(false);
  const [isAuthOTPVerified, setIsAuthOTPVerified] = useState(false); // ?

  const [showOtpError, setShowOtpError] = useState(false);
  const [showEmailOtpError, setShowEmailOtpError] = useState(false);
  const [showAuthOtpError, setShowAuthOtpError] = useState(false); // ?

  const [verificationField, setVerificationField] = useState<any>({});
  const [btnDtlLoading, setBtnDtlLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [expiresIn, setExpiresIn] = useState<string>(propsData?.expiresIn);
  const [verifiedPhoneOtp, setVerifiedPhoneOtp] = useState(false);
  const [verfiedOtpErrorMsg] = useState(false);
  const [timer, setTimer] = useState(0);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const { decryptAES } = useEncryptDecrypt();
  const succesRbSheetRef = useRef<RBSheet>(null);
  const verificationSheetRef = useRef<RBSheet>(null);

  // Data objects
  const cryptoObj: CryptoObj = {
    customerWalletId: propsData?.customerWalletId,
    amount: propsData?.amount,
    fiatCurrency: propsData?.fiatCurrency,
    payeeId: propsData?.addressBookId,
  };

  const fiatObj: FiatObj = {
    customerId: userinfo?.id,
    customerWalletId: propsData?.customerWalletId,
    amount: propsData?.amount,
    fiatCurrency: propsData?.fiatCurrency,
  };

  // Effects
  useEffect(() => {
    const expirationTime = new Date(expiresIn).getTime();
    const timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = expirationTime - now;

      if (timeLeft <= 0) {
        getSummaryDetails();
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [expiresIn]);

  useEffect(() => {
    if (propsData?.timer && timer === 0) {
      setTimer(parseInt(propsData.timer));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useHardwareBackHandler(() => {
    handleBack();
  });

  // API calls
  const getSummaryDetails = async () => {
    try {
      const response: any =
        propsData?.paymentType === PAYOUT_CONSTANTS?.CRYPTO
          ? await PaymentService.payOutCryptoSummery(cryptoObj)
          : await PaymentService.payOutFiatSummery(fiatObj);

      if (response.ok) {
        setErrorMsg("");
        setExpiresIn(response?.data?.expiresIn);
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    }
  };


  // Handlers
  const handleBack = () => navigation.goBack();
  const handleFinalSave = async () => {
    logEvent("Button Pressed", { action: "payout_save", nextScreen: "PayoutSuccessPopup", currentScreen: "Payout_summary" })
    verificationSheetRef.current?.close();
    setBtnDisabled(true);
    setBtnDtlLoading(true);

    // Validation checks
    if (
      (verificationField?.isPhoneVerified && !isOTPVerified) ||
      (verificationField?.isEmailVerification && !isEmailOTPVerified) ||
      (verificationField?.isTwoFactorEnabled && !isAuthOTPVerified)
    ) {
      if (verificationField?.isPhoneVerified && !isOTPVerified) {
        setShowOtpError(true);
        setIsOTP(true);
      }
      if (verificationField?.isEmailVerification && !isEmailOTPVerified) {
        setShowEmailOtpError(true);
        setIsEmailOTP(true);
      }
      if (verificationField?.isTwoFactorEnabled && !isAuthOTPVerified) {
        setShowAuthOtpError(true);
        setIsAuthOTP(true);
      }
      setBtnDtlLoading(false);
      return;
    }

    // Reset error states
    setIsEmailOTP(false);
    setShowEmailOtpError(false);
    setIsOTP(false);
    setShowOtpError(false);
    setIsAuthOTP(false);
    setShowAuthOtpError(false);

    // Prepare request data
    const requestData = {
      customerWalletId: propsData?.customerWalletId,
      requestedAmount: propsData?.requestedAmount || propsData?.amount,
      payeeId: propsData?.addressBookId,
      finalAmount: propsData?.finalAmount,
      createdby: userinfo?.name,
      merchantId: propsData?.merchantId,
      quoteId: propsData?.quoteId,
      info: "",
      docRepositories: propsData?.document
        ? [{ fileName: propsData.document }]
        : [{ fileName: null }],
      fiatCurrency: propsData?.fiatCurrency,
      moduleType: "",
      paymentType: propsData?.transferType || propsData?.dynamicFields?.paymentscheme || "",
    };

    try {
      setBtnDtlLoading(true);
      const response =
        propsData?.paymentType === PAYOUT_CONSTANTS.CRYPTO
          ? await PaymentService.cryptoPayoutSave(requestData)
          : await PaymentService.fiatPayoutSave(requestData);

      if (response.ok) {
        setBtnDtlLoading(false);
        setBtnDisabled(false);
        succesRbSheetRef?.current?.open();
      } else {
        setErrorMsg(isErrorDispaly(response));
        setBtnDtlLoading(false);
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
      setBtnDisabled(false);
      setBtnDtlLoading(false);
    }
  };

  const checkValidationNumber = (newValue: any) => {
    const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
    return format.test(newValue?.toString()) ? "" : newValue;
  };

  const handleReceiveOTP = (text: any) => {
    if (text.toString().length <= 6) {
      setOtp(checkValidationNumber(text));
    }
  };

  const handleReceiveEmailOTP = (text: any) => {
    if (text.toString().length <= 6) {
      setEmailOtp(checkValidationNumber(text));
    }
  };

  const handleReceiveAuthOTP = (text: any) => {
    if (text.toString().length <= 6) {
      setAuthOtp(checkValidationNumber(text));
    }
  };

  const handleSendAgain = () => {

    if (propsData?.screenName == PAYOUT_CONSTANTS.WALLETS_ALL_ASSETS) {
      navigation.navigate('WalletsAllCoinsList', { animation: 'slide_from_left', initialTab: 1 });
    } else {
      if (propsData?.paymentType === PAYOUT_CONSTANTS.CRYPTO) {
        navigation.navigate("PayOutList", { animation: 'slide_from_left', initialTab: 1 });
      }
      else {
        navigation.navigate("PayOutList");
      }
    }
    succesRbSheetRef?.current?.close();
  };
  const handleBackToPayments = () => {
    succesRbSheetRef?.current?.close();
    if (propsData.screenName === 'WalletsAllAssets') {
      navigation.reset({
        index: 0,
        routes: [{
          name: "Dashboard",
          params: {
            initialTab: isFromDashboard ? "GLOBAL_CONSTANTS.HOME" : "GLOBAL_CONSTANTS.WALLETS",
            animation: 'slide_from_left'
          }
        }]
      });
    }
    else {
      navigation.reset({
        index: 0,
        routes: [{
          name: "Dashboard",
          params: {
            initialTab: "GLOBAL_CONSTANTS.PAYMENTS",
            animation: 'slide_from_left'
          }
        }]
      });
    }

  };
  const handleRefresh = async () => {
    setRefreshLoading(true);
    try {
      const payload = {
        customerWalletId: propsData?.customerWalletId,
        amount: parseFloat(propsData?.amount),
        fiatCurrency: propsData?.fiatCurrency,
        payeeId: propsData?.addressBookId,
        metadata: "",
        moduleType: ""
      };

      const response: any = propsData?.paymentType === PAYOUT_CONSTANTS.CRYPTO
        ? await PaymentService.postCryptoWithdraw(payload)
        : await PaymentService.postFiatWithdraw(payload);

      if (response.ok && response.data) {
        const updatedData = {
          ...propsData,
          finalAmount: response.data.finalAmount,
          fee: response.data.fee,
          flatFee: response.data.feeInfo?.["Flat Fee"] || response.data.feeInfo?.FlatFee,
          quoteId: response.data.quoteId,
          expiresIn: response.data.expiresIn,
          favouriteName: response.data.favouriteName,
          beneficiaryName: response.data.beneficiaryName,
          PaymentMode: response.data.paymentType,
          accNoorWalletAddress: response.data.accNoorWalletAddress,
          timer: response.data.timer,
          receivedAmount: response?.data?.receivedAmount,

        };
        setSummaryData(updatedData);
        if (response.data.timer && timer === 0) {
          setTimer(parseInt(response.data.timer));
        }
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
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

  const formatAmount = (amount: any) => {
    const numAmount = parseFloat(amount || 0);
    const decimals = propsData?.paymentType === PAYOUT_CONSTANTS.CRYPTO ? 4 : 2;

    // Format with fixed decimals
    const fixedAmount = numAmount.toFixed(decimals);
    const parts = fixedAmount.split('.');

    // Add thousand separators (1,000 style)
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
  };

  const clearVerificationData = () => {
    setOtp("");
    setEmailOtp("");
    setAuthOtp("");
    setIsOTPVerified(false);
    setIsEmailOTPVerified(false);
    setIsAuthOTPVerified(false);
    setShowOtpError(false);
    setShowEmailOtpError(false);
    setShowAuthOtpError(false);
    setIsOTP(false);
    setIsEmailOTP(false);
    setIsAuthOTP(false);
    setVerifiedPhoneOtp(false);
  };

  const handleVerificationSheetClose = () => {
    clearVerificationData();
  };

  const handleContinue = async () => {
    setBtnDtlLoading(true);
    try {
      const securityVerififcationData = await getVerificationData();
      if (securityVerififcationData.ok) {
        const verificationData = securityVerififcationData.data;
        setVerificationField(verificationData);
        if (verificationData?.isPhoneVerified || verificationData?.isEmailVerification || verificationData?.isTwoFactorEnabled) {
          setErrorMsg("");
          verificationSheetRef.current?.open();
        } else {
          handleFinalSave();
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
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader
          title={"GLOBAL_CONSTANTS.SUMMARY"}
          onBackPress={handleBack}
        />
        <ScrollViewComponent>
          {errorMsg && (
            <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} />
          )}
          <SummaryDetailsSection propsData={getCurrentData()} />
        </ScrollViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.sectionGap]}>
          {propsData?.paymentType === PAYOUT_CONSTANTS.CRYPTO && <ViewComponent style={[commonStyles.flex1]}>
            <ButtonComponent
              title={timer === 0 ? t('GLOBAL_CONSTANTS.REFRESH') : `${t('GLOBAL_CONSTANTS.REFRESH')} (${formatTimer(timer)})`}
              customTitleStyle={[commonStyles.textprimary]}
              solidBackground={true}
              onPress={handleRefresh}
              loading={refreshLoading}
              disable={timer > 0}
            />
          </ViewComponent>}
          <ViewComponent style={[commonStyles.flex1]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONFIRM"}
              onPress={handleContinue}
              loading={btnDtlLoading}
              disable={btnDisabled || timer === 0}
            />
          </ViewComponent>
        </ViewComponent>
        <CustomRBSheet
          draggable={false}
          closeOnPressMask={false}
          refRBSheet={succesRbSheetRef}
          title="GLOBAL_CONSTANTS.SUCCESS"
          height={'Large'}
        >
          <CommonSuccess
            navigation={navigation}
            successMessage={t("GLOBAL_CONSTANTS.TRANSACTION_SUCCESSFUL")}
            subtitle={`${t(propsData.screenName === 'WalletsAllAssets' ? "GLOBAL_CONSTANTS.YOUR_WITHDRAWAL_REQUEST_SUBMITTED" : "GLOBAL_CONSTANTS.YOUR_PAYOUT_TRANSACTION_FOR")} ${formatAmount(propsData?.amount)} ${propsData?.coinCode || propsData?.walletCode} ${t("GLOBAL_CONSTANTS.HAS_BEEN_SUBMITTED_SUCESSFULLY")}`}
            buttonText={t("GLOBAL_CONSTANTS.SEND_AGAIN")}
            buttonAction={handleSendAgain}
            secondaryButtonText={`${t(propsData.screenName === 'WalletsAllAssets' ? (isFromDashboard ? "GLOBAL_CONSTANTS.BACK_TO_DASHBOARD" : "GLOBAL_CONSTANTS.BACK_TO_WALLETS") : "GLOBAL_CONSTANTS.BACK_TO_PAYMENTS")}`}
            secondaryButtonAction={handleBackToPayments}
            amount={propsData?.amount}
            decimals={propsData?.paymentType === PAYOUT_CONSTANTS.CRYPTO ? 4 : 2}
            prifix={propsData?.coinCode || propsData?.walletCode}
          />
        </CustomRBSheet>

        <CustomRBSheet
          refRBSheet={verificationSheetRef}
          height={'Medium'}
          onClose={handleVerificationSheetClose}
          closeOnPressMask={!btnDtlLoading}
          draggable={!btnDtlLoading}
        >
          <ViewComponent style={[commonStyles.flex1]}>
            <ScrollViewComponent contentContainerStyle={{}}>
              {errorMsg && (
                <ErrorComponent
                  message={errorMsg}
                  onClose={() => setErrorMsg("")}
                />
              )}

              {verificationField?.isPhoneVerified && (
                <>

                  <SendOTP
                    isOTP={isOTP}
                    onChangeText={handleReceiveOTP}
                    value={otp}
                    customerId={userinfo?.id}
                    phoneNumber={decryptAES(
                      userinfo?.phoneNo || userinfo?.phoneNumber
                    )}
                    onVerify={setIsOTPVerified}
                    showError={showOtpError}
                    handlePhoneOtpVerified={setVerifiedPhoneOtp}
                    verifiedPhoneOtp={verifiedPhoneOtp}
                    verfiedOtpErrorMsg={verfiedOtpErrorMsg}
                  />
                </>
              )}

              {verificationField?.isEmailVerification && (
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

              {/* {verificationField?.isTwoFactorEnabled && (
                  <>
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <SendAuthenticatonOTP
                      isOTP={isAuthOTP}
                      onChangeText={handleReceiveAuthOTP}
                      value={authOtp}
                      onVerify={setIsAuthOTPVerified}
                      showError={showAuthOtpError}
                      customerId={String(userinfo?.id || "")}
                      phoneNumber={String(
                        userinfo?.phoneNumber || userinfo?.phoneNo || ""
                      )}
                      handlePhoneOtpVerified={() => { }}
                      verifiedPhoneOtp={false}
                      verfiedOtpErrorMsg={false}
                    />
                  </>
                )} */}
              <ViewComponent style={[commonStyles.sectionGap]} />

            </ScrollViewComponent>
            <ViewComponent
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.gap10,
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
                    (verificationField?.isPhoneVerified && !isOTPVerified) ||
                    (verificationField?.isEmailVerification &&
                      !isEmailOTPVerified) ||
                    (verificationField?.isTwoFactorEnabled && !isAuthOTPVerified)
                  }
                  onPress={handleFinalSave}
                />
              </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
          </ViewComponent>
        </CustomRBSheet>
      </Container>
    </ViewComponent>
  );
};

export default PayoutSummaryDetails;
