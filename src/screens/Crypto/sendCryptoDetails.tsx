import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { View, ScrollView, SafeAreaView, TouchableOpacity, Modal, Platform, Image, BackHandler, ActivityIndicator, Alert, ViewComponent } from "react-native";
import { Container } from "../../components";
import { formatCurrency, isErrorDispaly, validateCryptoAddress } from "../../utils/helpers";
import { ms, s, screenHeight } from "../../constants/theme/scale";
import ErrorComponent from "../../components/Error";
import { useIsFocused } from "@react-navigation/native";
import DefaultButton from "../../components/DefaultButton";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import AntDesign from "react-native-vector-icons/AntDesign";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import TextInputField from "../../components/textInput";
import LabelComponent from "../../components/Paragraph/label";
import { commonStyles } from "../../components/CommonStyles";
import CryptoServices from "../../services/crypto";
import SendCryptoServices from "../../services/sendcrypto";
import QRCodeScanner from "../../components/qrScanner";
import Authentication from "../Profile/authentication";
import CoinsDropdown from "../Tlv_Cards/CoinsDropDown";
import Loadding from "../../components/skeleton";
import { personalInfoLoader } from "../Profile/skeleton_views";
import { Overlay } from "../../components/ui";
import SendOTP from "../../components/SendOTP";
import WebView from "react-native-webview"
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import AddressbookService from "../../services/addressbook";
import DeafultList from "../../components/DeafultPicker";
import Cookies from '@react-native-cookies/cookies';
import { cryptoReceiveLoader } from "./buySkeleton_views";
import {
  describeBiometricOutcome,
  getTwoFactorAllowedOrigins,
  guardHighRiskAction,
  isAllowedTwoFactorUrl,
  matchTwoFactorCallback,
  parseHttpsUrl,
  requireUserPresence,
} from "../../security";
import { log } from "../../utils/logger";

let amount;

const SendCryptoDetails = React.memo((props: any) => {
  const isFocused = useIsFocused();
  const styles = useStyleSheet(themedStyles);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [sendAmmount, setSendAmout] = React.useState<any>("");
  const [address, setAdress] = React.useState<any>("");
  const [looading, setLoading] = useState<boolean>(false);
  const [summryLoading, setSummryLoading] = useState<boolean>(false);
  const [btnDisabled, setBtnDisabled] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<any>("");
  const [networkLu, setNetworkLu] = useState<any>([]);
  const [cryptoWithdrawData, setCryptoWithdrawData] = useState<any>({});
  const [enableScanner, setEnableScanner] = useState<boolean>(false);
  const [networkModel, setNetworkModel] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwok] = useState<any>("");
  const [fee, setFee] = useState<any>({});
  const [feeLoader, setFeeLoader] = useState<boolean>(false);
  const EditInfoLoader = personalInfoLoader(2);
  const [isMFAPopupVisible, setMFAPopupVisible] = useState<boolean>(false);
  const [isVisableVerifcation, setVisableVerifcation] = useState<boolean>(false);
  const [isOTPVerified, setIsOTPVerified] = useState<boolean>(false);
  const [showOtpError, setShowOtpError] = useState<boolean>(false);
  const [isOTP, setIsOTP] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [securityInfo, setSecurityInfo] = useState<any>({});
  const [webViewVisible, setWebViewVisible] = useState<boolean>(false);
  const [twoFactorAuthUrl, setTwoFactorAuthUrl] = useState<string>("");
  // H-10: the host of whatever the 2FA WebView is currently showing. A WebView
  // has no address bar, so without this the user has no way to tell our identity
  // provider's login page from one drawn to look like it.
  const [webViewHost, setWebViewHost] = useState<string>("");
  // Fixed for the lifetime of the build; memoised so the WebView never sees a
  // changed prop mid-authentication.
  const twoFactorOrigins = React.useMemo(() => getTwoFactorAllowedOrigins(), []);
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const [payeesList, setPayeesList] = useState<any>([]);
  const [openPayeesModel, setOpenPayeesModel] = useState<boolean>(false);
  const [selectedPayee, setSelectedPayee] = useState<any>({});
  const userName = decryptAES(userInfo?.userName);
  const [isApitriggerd, setIsApiTriggered] = useState<boolean>(false);
  const skeletonLoader = cryptoReceiveLoader();

  useEffect(() => {
    getSeccurityInfo();
    fetchCommonCrypto();
  }, [isFocused]);

  useEffect(() => {
    if (isOTPVerified) {
      handleAccount()
    }
  }, [isOTPVerified]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  const getlAllPayees = async (network?: any) => {
    try {
      const response: any = await AddressbookService.getCryptoPayees(props.route?.params?.walletCode || "", network || selectedNetwork);
      if (response?.ok) {
        setPayeesList(response?.data?.data);
      } else {
        setErrormsg(isErrorDispaly(response))
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error))
    }
  }


  const getAuthOtpUrl = async () => {
    const body = {
      "payeeId": selectedPayee.id,
      "walletCode": cryptoWithdrawData.code,
      "network": selectedNetwork,
      "walletAddress": address,
      "amount": parseFloat(sendAmmount),
      "feeComission": fee?.fee,
      "concurrencyStamp": fee?.concurrencyStamp || "",
      "createdBy": encryptAES(userName),

    };
    try {
      const res: any = await CryptoServices.updateTwoFactorAuthentication(body);
      if (res.ok && res.data) {
        // H-10: an API response is not a reason to load a page. Validate the URL
        // before it ever reaches the WebView — a compromised or spoofed response
        // otherwise picks the origin the user is about to authenticate against.
        if (!isAllowedTwoFactorUrl(res.data)) {
          log.error("[2FA] rejected a two-factor URL outside the allow-list", undefined, {
            host: parseHttpsUrl(res.data)?.host || "unparseable",
          });
          setErrormsg("Unable to start two-factor authentication. Please try again.");
          return;
        }
        setWebViewHost(parseHttpsUrl(res.data)?.host || "");
        setTwoFactorAuthUrl(res.data);
        setWebViewVisible(true);
      } else {
        setErrormsg(isErrorDispaly(res));
      }
    } catch (err) {
      setErrormsg(isErrorDispaly(err));
    }
  }
  const handleAddPayee = () => {
    props?.navigation.push("addPayee", {
      screenName: "withdraw",
      walletCode: cryptoWithdrawData.code,
      network: selectedNetwork
    });
    setOpenPayeesModel(false)
  };


  const handleFee = () => {
    const selectedNetworkData = networkLu.find(network => network.code === selectedNetwork);
    const NetworkId = selectedNetworkData && selectedNetworkData.id || 0;
    return NetworkId;
  }

  useEffect(() => {
    if (/^[0-9]\d*(\.\d+)?$/.test(sendAmmount)) {
      getFeeDetails();
    } else {
      amount = null;
      setFee({});
    }
  }, [sendAmmount, handleFee()])


  const handleGoBack = () => {
    props.navigation.goBack();
  };

  const verifyCodeSucess = async () => {
    setVisableVerifcation(false);
    handleAccount();
  };

  const verifyCodeClose = async () => {
    setVisableVerifcation(false);
  };

  const handleCloseMFA = () => {
    setMFAPopupVisible(false)
  }

  const fetchCommonCrypto = async () => {
    setLoading(true);
    try {
      const res: any = await CryptoServices.getCommonCryptoNetworks(props.route?.params?.walletCode);
      if (res.status === 200) {
        setSelectedNetwok(props.route?.params?.network || res?.data[0]?.name);
        await getlAllPayees(props.route?.params?.network || res?.data[0]?.name);
        setNetworkLu(res?.data);
        if (res?.data.length > 0) {
          await fetchCryptoWithdrawData(
            props.route?.params?.walletCode,
            props.route?.params?.network || res?.data[0]?.name
          );
        }
      } else {
        setLoading(false);
        setErrormsg(isErrorDispaly(res));
      }
    } catch (err) {
      setLoading(false);
      setErrormsg(isErrorDispaly(err));
    }
  };
  const fetchCryptoWithdrawData = async (coinName: string, networkName: string) => {
    setLoading(true);
    try {
      const res: any = await CryptoServices.getCryptoDeposit(coinName, networkName);
      if (res.status === 200) {
        setCryptoWithdrawData(res?.data);
        setLoading(false);
      } else {
        setCryptoWithdrawData({});
        setLoading(false);
        setErrormsg(isErrorDispaly(res));

      }
    } catch (err) {
      setCryptoWithdrawData({});
      setErrormsg(isErrorDispaly(err));
      setLoading(false);
    }
  };
  const getSeccurityInfo = async () => {
    try {
      const response = await CryptoServices.getSecurityDetails();
      if (response?.ok) {
        setSecurityInfo(response?.data);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (err) {
      setErrormsg(isErrorDispaly(err));

    }
  };




  const goToTheSummarryPage = async () => {
    setErrormsg("")
    // H-04: gate the whole withdrawal flow at its single entry point, ahead of
    // the biometric prompt below — on a hooked device that prompt is itself
    // trivially bypassed, so it cannot be the thing this depends on.
    //
    // H-14: skipPresenceCheck because this screen runs its own challenge below,
    // and on a device with no sensor escalates to Auth0 2FA or SMS OTP rather
    // than to nothing. Two prompts for one Send button teaches people to tap
    // through them.
    if (!(await guardHighRiskAction("CRYPTO_WITHDRAWAL", { skipPresenceCheck: true }))) {
      setSummryLoading(false);
      setBtnDisabled(false);
      return;
    }
    if (!address) {
      setSummryLoading(false);
      setBtnDisabled(false);
      return setErrormsg(`Please select recipient's address.`);
    }
    if (!validateCryptoAddress(selectedNetwork, address)) {
      setErrormsg("Invalid address. Please select a valid address based on the selected network.");
      setBtnDisabled(false);
      return;
    }
    if (sendAmmount === "." || sendAmmount === "") {
      setSummryLoading(false);
      setBtnDisabled(false);
      return setErrormsg("Please enter amount.");
    }
    if (parseFloat(sendAmmount) === 0) {
      setSummryLoading(false);
      setBtnDisabled(false);
      return setErrormsg("Amount must be greater than zero.");
    } if (fee?.remainingAmount <= 0) {
      setSummryLoading(false);
      setBtnDisabled(false);
      return setErrormsg("Total received amount must be greater than zero.");
    }

    if (parseFloat(sendAmmount) > parseFloat(cryptoWithdrawData.amount)) {
      setSummryLoading(false);
      setBtnDisabled(false);
      return setErrormsg("Insufficient balance.");
    }
    if (securityInfo.isFaceResgEnabled) {
      // H-14: one outcome means "go ahead". A cancelled or failed prompt stops
      // the withdrawal and says so — the old empty catch left the user pressing
      // Send with nothing happening at all.
      const outcome = await requireUserPresence("Confirm it's you to send crypto");
      if (outcome === "confirmed") {
        handleAccount();
        return;
      }
      if (outcome !== "unavailable") {
        setSummryLoading(false);
        setBtnDisabled(false);
        return setErrormsg(
          describeBiometricOutcome(outcome) || "Authentication failed, please retry"
        );
      }
      // "unavailable": this device has neither biometrics nor a passcode. Fall
      // through to the stronger challenge below rather than to the withdrawal —
      // Auth0 2FA and SMS OTP do not depend on this device having a lock.
      if (securityInfo.isAuth0Enabled) {
        getAuthOtpUrl()
      } else if (isOTPVerified) {
        setIsOTP(true);
      } else {
        setMFAPopupVisible(true)
      }
    } else if (isOTPVerified) {
      setIsOTP(true);
      return;
    } else if (securityInfo.isAuth0Enabled) {
      getAuthOtpUrl()
    } else {
      setMFAPopupVisible(true)
    }
  };

  const handleAccount = async () => {
    const withdrawAddress = address?.trim() || address;
    if (!withdrawAddress) {
      return setErrormsg("Please enter valid address");
    }
    setSummryLoading(true);
    let obj = {
      network: selectedNetwork,
      walletAddress: address,
      payeeId: selectedPayee.id || "",
      walletCode: cryptoWithdrawData.code,
      amount: parseFloat(sendAmmount),
      concurrencyStamp: fee?.concurrencyStamp || "",
      createdby: encryptAES(userName),
    };
    try {
      const res: any = await SendCryptoServices.confirmSendCrypto(obj);
      if (res?.status === 200) {
        setSummryLoading(false);
        setErrormsg("");
        props.navigation.navigate("SendCryptoSuccess", {
          ammount: sendAmmount,
          walletCode: props.route?.params?.walletCode,
          transactionId: res.data,
        });
      } else {
        setErrormsg(isErrorDispaly(res));
        setSummryLoading(false);
        setBtnDisabled(false);
      }
    } catch (err) {
      setErrormsg(isErrorDispaly(err));
      setSummryLoading(false);
      setBtnDisabled(false);
    }
  };
  const handleSendAmountChange = (text: any) => {
    setErrormsg("");
    const numericValue = text.replace(/[^0-9.]/g, "");
    amount = numericValue || null;
    if (text) {
      if (/^\d{1,8}(\.\d{0,2})?$/.test(text)) {
        setSendAmout(numericValue);
      }
    } else {
      setSendAmout(numericValue);
    }
  };




  const handleAddressChange = (text: any) => {
    setAdress(text);
    setErrormsg("");
  };
  const handleSelectNetwork = (network: any) => {
    setErrormsg("");
    getlAllPayees(network)
    fetchCryptoWithdrawData(props.route?.params?.walletCode, network);
    setSelectedNetwok(network);
    setAdress("")
    setNetworkModel(false)
  };

  const getFeeDetails = async () => {
    if (parseFloat(sendAmmount) > 0) {
      try {
        setFeeLoader(true);
        const response: any = await CryptoServices.getCryptoWithdrawFee(handleFee(), parseFloat(sendAmmount));
        if (response?.ok) {
          if (amount) {
            setFee(response?.data);
          } else {
            setFee({})
          }
          setFeeLoader(false)
        } else {
          setFeeLoader(false)
          setErrormsg(isErrorDispaly(response))
        }
      } catch (error) {
        setFeeLoader(false);
        setErrormsg(isErrorDispaly(error))
      }
    } else {
      setFee({})
    }
  };

  const handleOpenModel = () => {
    setNetworkModel(true);
  };

  const handleNavigateSecurity = () => {
    props?.navigation.navigate("Security", {
      isWithdrawScreen: true,
    });
    setMFAPopupVisible(false)
  };

  const handleCloseError = () => {
    setErrormsg("")
  };

  const checkValidationNumber = (newValue: any) => {
    const format = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
    const result = format.test(newValue.toString());
    if (result) {
      return '';
    }
    return newValue;
  };
  const handleReceiveOTP = (text: any) => {
    if (text.toString().length > 6) {
      return '';
    }
    const isValid = checkValidationNumber(text);
    setOtp(isValid);
  };



  const handleCloseWebView = () => {
    setWebViewVisible(false);
    setWebViewHost("");
  };

  /** True for a session that must be dropped, whatever transport reported it. */
  const isUnauthorizedBody = (data: any) =>
    typeof data?.detail === "string" &&
    data.detail.includes("Please log in using the authorized user credentials");

  /**
   * H-10: `query` is a query string, not a URL.
   *
   * It reaches here only from matchTwoFactorCallback(), which requires the
   * callback to be on this build's own API host at the exact 2FA path. The
   * request itself goes through the standard API client, whose base URL is fixed
   * at build time — so the bearer token cannot follow the WebView anywhere.
   */
  const trigger2FAValidation = async (query: string) => {
    if (!isApitriggerd) {
      setIsApiTriggered(true)
      try {
        const response: any = await CryptoServices.getTwoFactorAuthenticationCodeState(query);
        if (response?.status === 200) {
          setIsApiTriggered(false)
          if (response?.data === true) {
            setErrormsg("")
            props.navigation.navigate("SendCryptoSuccess", {
              ammount: sendAmmount,
              walletCode: props.route?.params?.walletCode,
            });
          } else {
            setErrormsg("Your withdrawal was unsuccessful , Please try again after some time.")
          };
          handleCloseWebView();

        } else {
          setIsApiTriggered(false)
          handleCloseWebView();
          setErrormsg(isErrorDispaly(response));
          // apisauce resolves HTTP errors instead of throwing, so the expired
          // session lands here rather than in the catch below.
          if (isUnauthorizedBody(response?.data)) {
            Cookies.clearAll(true);
          }
        }

      } catch (error: any) {
        setErrormsg(isErrorDispaly(error?.response || error));
        handleCloseWebView();
        setIsApiTriggered(false)
        if (isUnauthorizedBody(error?.response?.data)) {
          Cookies.clearAll(true);
        }

      }
    }
  };

  /**
   * H-10: completion is recognised by parsed host + exact path.
   *
   * The old check was `navState.url.includes(".../TwoFactorAuthenticationCodeState")`,
   * which any attacker-controlled URL satisfied by carrying that text in a query
   * parameter.
   */
  const handleWebViewNavigationStateChange = async (navState: any) => {
    setWebViewHost(parseHttpsUrl(navState?.url)?.host || "");

    const callbackQuery = matchTwoFactorCallback(navState?.url);
    if (callbackQuery !== null) {
      await trigger2FAValidation(callbackQuery);
      return;

    }
  };

  /**
   * H-10: the gate that actually keeps the WebView on our hosts.
   *
   * Sub-frames are left alone — the identity provider embeds bot-detection and
   * asset frames that have nothing to do with the top-level document, and they
   * cannot reach anything of ours. On Android this callback only ever fires for
   * main-frame navigation, so `isTopFrame` is undefined there and the strict
   * branch applies.
   */
  const handleShouldStartLoad = (request: any) => {
    if (request?.isTopFrame === false) {
      return true;
    }
    // The platforms use about:blank as an empty intermediate document between
    // redirects. It renders nothing and, with pop-ups disabled above, has no
    // opener that could script it.
    if (request?.url === "about:blank") {
      return true;
    }
    if (isAllowedTwoFactorUrl(request?.url)) {
      return true;
    }
    log.warn("[2FA] blocked WebView navigation to a non-allow-listed host", {
      host: parseHttpsUrl(request?.url)?.host || "unparseable",
    });
    handleCloseWebView();
    setErrormsg("Two-factor authentication was interrupted. Please try again.");
    return false;
  };

  const renderWebViewLoading = () => (
    <View style={styles.webViewLoadingContainer}>
      <ActivityIndicator size="large" color={NEW_COLOR.TEXT_ALWAYS_WHITE} />
      <ParagraphComponent text="Loading..." style={styles.webViewLoadingText} />
    </View>
  );

  const handleSelectPayee = (value: any) => {
    setErrormsg("")
    setAdress(value.walletAddress);
    setSelectedPayee(value);

  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          {looading && <Loadding contenthtml={skeletonLoader} />}
          {!looading && <View>
            <View
              style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]} >
              <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
                <TouchableOpacity style={[styles.pr16]} onPress={handleGoBack} >
                  <View>
                    <AntDesign name="arrowleft" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
                  </View>
                </TouchableOpacity>
                <ParagraphComponent
                  text={`Transfer ${props.route?.params?.walletCode ||
                    cryptoWithdrawData.walletCode
                    }`}
                  style={[commonStyles.fs16, commonStyles.textBlack]} />
              </View>

            </View>

            <View style={[styles.mt26, commonStyles.mb32]}>
              {errormsg && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}

              <TouchableOpacity onPress={handleOpenModel}>
                <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                  <ParagraphComponent text={selectedNetwork || ""} style={[commonStyles.fs24, commonStyles.fw600, commonStyles.textCenter, commonStyles.textBlack]} />
                  <Image style={styles.downArrow} source={require("../../assets/images/banklocal/down-arrow.png")} />
                </View>
              </TouchableOpacity>
              <ParagraphComponent text={'Chain'} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, styles.px8, commonStyles.textCenter]} />
            </View>

            <>
              <LabelComponent text="Recipient’s Address" style={[commonStyles.fs12, commonStyles.fw400, styles.px8]}
                Children={<LabelComponent text=" *" style={[commonStyles.textError]} />}
              />
              <TouchableOpacity onPress={() => setOpenPayeesModel(true)} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                <View style={[styles.searchContainer]}>
                  <TextInputField
                    style={styles.inputStyle}
                    inputStyle={[commonStyles.fs14, { borderRadius: 0 }]}
                    placeholder={"Select Address"}
                    onChangeText={(e) => handleAddressChange(e || "")}
                    value={address}
                    editable={false}
                    numberOfLines={1}
                  />

                  <View style={[styles.scan]}>
                    <Image style={styles.downArrow} source={require("../../assets/images/banklocal/down-arrow.png")} />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={styles.mt24}>
                <View style={[commonStyles.relative, styles.SelectStyle, commonStyles.p16, commonStyles.rounded24, commonStyles.dflex, commonStyles.alignCenter]}>
                  <ParagraphComponent text={"Currency Amount"} style={[commonStyles.fs20, commonStyles.flex1, commonStyles.textGrey, commonStyles.fw600, { color: NEW_COLOR.INPUT_INSIDE_LABEL }]} />
                  <View style={commonStyles.flex1}>
                    <TextInputField
                      inputStyle={[commonStyles.fs24, commonStyles.textRight, { height: 45, paddingBottom: 0, paddingTop: 0, paddingRight: 0 }]}
                      style={styles.depoInput}
                      placeholder={`0.00 ${props.route?.params?.walletCode ||
                        cryptoWithdrawData.walletCode
                        }`}
                      maxLength={8}
                      keyboardType="numeric"
                      onChangeText={(e) => handleSendAmountChange(e || "")}
                      value={sendAmmount}
                    />
                  </View>
                </View>

                <ParagraphComponent
                  style={[styles.balText, commonStyles.mt8, styles.px8, commonStyles.fs12, commonStyles.fw400]}  >
                  Available{" "}
                  <ParagraphComponent
                    style={[commonStyles.fs12, commonStyles.fw700, commonStyles.textBlack]} >
                    {formatCurrency(cryptoWithdrawData.amount || 0, 2)}{" "}
                  </ParagraphComponent>
                  {props.route?.params?.walletCode ||
                    cryptoWithdrawData.walletCode}
                </ParagraphComponent>
              </View>
              <View style={[commonStyles.mb10]} />
              {feeLoader &&
                <Loadding contenthtml={EditInfoLoader} />

              }
              {!feeLoader && <View style={[commonStyles.sectionStyle]}>
                <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter, commonStyles.gap16,]}>
                  <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400,]} text='Fee' />
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500,]} text={`${formatCurrency(fee?.fee || 0, 2)}`} />
                </View>
                <View style={[commonStyles.mt8, commonStyles.mb8]} />
                <View style={[commonStyles.dflex, commonStyles.justify, commonStyles.alignCenter, commonStyles.gap16,]}>
                  <ParagraphComponent style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400,]} text='Total Receive Amount' />
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.textBlack, commonStyles.fw500,]} text={`${formatCurrency(fee?.remainingAmount || 0, 2)}`} />
                </View>

              </View>}
            </>
            <View style={[commonStyles.mb32]} />
            {isOTP && <SendOTP
              isOTP={isOTP}
              onChangeText={handleReceiveOTP}
              value={otp}
              phoneNumber={userInfo?.phoneNumber}
              onVerify={setIsOTPVerified}
              showError={showOtpError}
            />}
            <View style={commonStyles.mb43} />
            <View style={[styles.mt42]}>
              <DefaultButton
                title={"Send"}
                style={undefined}
                customButtonStyle={undefined}
                customContainerStyle={undefined}
                backgroundColors={undefined}
                disable={summryLoading}
                loading={summryLoading}
                colorful={undefined}
                onPress={goToTheSummarryPage}
                transparent={undefined}
              />

            </View>
          </View>}
        </Container>

      </ScrollView>
      {
        enableScanner && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={props.modalVisible}
            onRequestClose={() => {
              setEnableScanner(false);
            }}
          >
            <Container style={[styles.container,]}>
              <QRCodeScanner
                onCaptureCode={(text: any) => {
                  const address = text?.includes(":") ? text.split(":")[1] : text;
                  setAdress(address);
                }}
                onClose={() => setEnableScanner(false)}
              />
            </Container>
          </Modal>
        )
      }
      {
        isVisableVerifcation && (
          <Authentication
            isVisable={isVisableVerifcation}
            isSucess={() => verifyCodeSucess()}
            isClose={() => verifyCodeClose()}
          />
        )
      }

      {networkModel && <CoinsDropdown coinsList={networkLu} modelvisible={() => { setNetworkModel(false) }} handleSelect={handleSelectNetwork} label={"Chain"} selected={selectedNetwork} />}
      {
        isMFAPopupVisible && <Overlay onBackdropPress={handleCloseMFA} overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 30 }]} isVisible={isMFAPopupVisible}>
          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb43]}>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Security Alert" />
            <AntDesign onPress={handleCloseMFA} name="close" size={s(22)} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
          </View>
          <View style={[commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb43]}>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Due To Security Reasons " />
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Enable Two Factor Authentication / Facial / Fingerprint" />


          </View>
          <View style={[commonStyles.gap10]}>
            <DefaultButton
              title={"Enable Security"}
              customTitleStyle={''}
              style={undefined}
              customContainerStyle={undefined}
              backgroundColors={undefined}
              colorful={undefined}
              onPress={handleNavigateSecurity}
              transparent={undefined}
              iconRight={true}
            />
          </View>
        </Overlay>
      }
      {
        webViewVisible && (
          <Modal
            visible={webViewVisible}
            onRequestClose={handleCloseWebView}
            animationType="slide"
          >
            <SafeAreaView style={styles.webViewSafeArea}>
              <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
                <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
                  <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />

                </TouchableOpacity>
                {/* H-10: stands in for the address bar the WebView does not have. */}
                <ParagraphComponent
                  text={webViewHost ? `🔒 ${webViewHost}` : ""}
                  numberOfLines={1}
                  style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.flex1]}
                />
              </View>
              <WebView
                source={{ uri: twoFactorAuthUrl }}
                style={styles.webView}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                // H-10: two independent origin gates. originWhitelist keeps the
                // WebView from following a link off our hosts at all;
                // onShouldStartLoadWithRequest re-checks every navigation it is
                // asked to start, including redirects.
                originWhitelist={twoFactorOrigins}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={renderWebViewLoading}
                // No downgrade to http, so a network attacker cannot strip TLS
                // and rewrite the page the user authenticates on.
                mixedContentMode="never"
                thirdPartyCookiesEnabled={false}
                allowFileAccess={false}
                allowFileAccessFromFileURLs={false}
                allowUniversalAccessFromFileURLs={false}
                // Pop-ups escape the gates above: a new window is not a
                // navigation of this one. Force target=_blank back into this
                // WebView, where handleShouldStartLoad sees it.
                setSupportMultipleWindows={false}
                javaScriptCanOpenWindowsAutomatically={false}
              />

            </SafeAreaView>
          </Modal>
        )
      }
      <Modal
        transparent={false}
        visible={openPayeesModel}
        onRequestClose={() => setOpenPayeesModel(false)}
        animationType="slide"
        style={{ flex: 1 }}
      >
        <DeafultList
          data={payeesList}
          changeModalVisible={() => setOpenPayeesModel(false)}
          setData={(selectedItem: any) => handleSelectPayee(selectedItem)}
          selected={address}
          customBind={['walletAddress']}
          modalTitle={"Select Whitelist Address"}
          isPayeeAdd={true}
          onPressAddPayee={handleAddPayee}
        />
      </Modal>

    </SafeAreaView >

  );
});

export default SendCryptoDetails;

const themedStyles = StyleService.create({
  depoInput: {
    borderWidth: 0,
    backgroundColor: "transparent",
    height: 45,
  },
  mt26: {
    marginTop: 26,
  },
  bgpurple: { backgroundColor: NEW_COLOR.BG_PURPLERDARK, padding: 8, borderRadius: 100 },
  gap8: { gap: 8 },
  flexWrap: { flexWrap: "wrap" },
  mt24: {
    marginTop: 24,
  },
  offerBadge: {
    backgroundColor: NEW_COLOR.BTN_PINK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: NEW_COLOR.TEXT_WHITE,
    borderRadius: 10,
    position: "absolute",
    bottom: -12,
    right: 25,
  },
  inputStyle: {
    borderWidth: 1,
    borderStyle: 'dashed',
    width: "100%",
    paddingRight: 44, paddingLeft: 6,
    height: Platform.OS === "ios" ? 80 : 60,
    paddingVertical: Platform.OS === "ios" ? 10 : 0,
  },
  searchContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    flexDirection: "row",
    borderRadius: 12,
    backgroundColor: "transparent",
    flex: 1,
  },
  inputBorder: {
    borderColor: NEW_COLOR.BORDER_LIGHT,
    color: NEW_COLOR.TEXT_BLACK,
  },
  scan: { right: 30 },
  fw700: { fontWeight: "700" },
  fw500: { fontWeight: "500" },
  fw600: { fontWeight: "600" },
  mt42: { marginTop: 42 },
  mb32: {
    marginBottom: 32,
  },
  px8: { paddingHorizontal: 8 },
  borderCircle: {
    borderColor: NEW_COLOR.TEXT_BLACK,
    borderRadius: 100,
    paddingHorizontal: 24,
    borderWidth: 1,
    paddingVertical: 14,
    marginTop: 10,
  },
  mb6: {
    marginBottom: 6,
  },
  pr16: { paddingRight: 16 },
  mt6: {
    marginTop: 6,
  },
  coinIcon: {
    width: ms(30),
    height: ms(30),
  },
  recipientTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: NEW_COLOR.TEXT_WHITE,
  },
  loading: {
    paddingBottom: screenHeight * 0.15,
    paddingTop: ms(30),
  },
  rowgap: {
    marginBottom: 40,
  },
  icon: {
    marginRight: 10,
  },
  transferSpace: {
    marginTop: 30,
    marginBottom: 30,
  },
  balText: {
    color: NEW_COLOR.TEXT_LABEL, textAlign: 'right'
  },
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fff",
  },
  SelectStyle: {
    borderRadius: 12,
    borderWidth: 1, backgroundColor: NEW_COLOR.BG_PURPLERDARK,
    borderColor: NEW_COLOR.SEARCH_BORDER,
    borderStyle: "dashed"
  }, overlayContent: {
    paddingHorizontal: s(28),
    paddingVertical: s(24),
    borderRadius: 25, backgroundColor: NEW_COLOR.DARK_BG,
  },
  webViewSafeArea: {
    flex: 1,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
  },
  webView: {
    flex: 1,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
  },
  closeButton: {
    padding: ms(15),
    alignItems: 'flex-start',
    backgroundColor: NEW_COLOR.SCREENBG_WHITE
  },
  closeButtonText: {
    color: NEW_COLOR.White,
    fontSize: ms(16),
  }, webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewLoadingText: {
    marginTop: ms(10),
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
    fontSize: ms(14),
  },
});