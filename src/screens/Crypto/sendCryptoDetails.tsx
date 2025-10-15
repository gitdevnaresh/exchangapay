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
import ReactNativeBiometrics from "react-native-biometrics";
import Authentication from "../Profile/authentication";
import CoinsDropdown from "../Tlv_Cards/CoinsDropDown";
import Loadding from "../../components/skeleton";
import { personalInfoLoader } from "../Profile/skeleton_views";
import { Overlay } from "react-native-elements";
import SendOTP from "../../components/SendOTP";
import WebView from "react-native-webview"
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import AddressbookService from "../../services/addressbook";
import DeafultList from "../../components/DeafultPicker";
import Cookies from '@react-native-cookies/cookies';

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
  const rnBiometrics = new ReactNativeBiometrics();
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
  const { encryptAES, decryptAES } = useEncryptDecrypt();
  const [payeesList, setPayeesList] = useState<any>([]);
  const [openPayeesModel, setOpenPayeesModel] = useState<boolean>(false);
  const [selectedPayee, setSelectedPayee] = useState<any>({});
  const userName = decryptAES(userInfo?.userName);
  const [isApitriggerd, setIsApiTriggered] = useState<boolean>(false)

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
      "amount": sendAmmount,
      "feeComission": fee?.fee,
      "concurrencyStamp": fee?.concurrencyStamp || "",
      "createdBy": encryptAES(userName),


    };
    try {
      const res: any = await CryptoServices.updateTwoFactorAuthentication(body);
      if (res.ok && res.data) {
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
        getlAllPayees(props.route?.params?.network || res?.data[0]?.name);
        setNetworkLu(res?.data);
        if (res?.data.length > 0) {
          fetchCryptoWithdrawData(
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
        setLoading(false);
        setErrormsg(isErrorDispaly(res));
      }
    } catch (err) {
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
      rnBiometrics.isSensorAvailable().then((resultObject) => {
        const { available, biometryType } = resultObject;
        if (available) {
          rnBiometrics
            .simplePrompt({ promptMessage: "Confirm fingerprint" })
            .then((resultObject) => {
              const { success } = resultObject;
              if (success) {

                handleAccount()
              } else {
                setErrormsg("Authentication failed, please retry");
              }
            })
            .catch(() => {
              setErrormsg("Authentication failed, please retry");
            });
        } else {
          if (securityInfo.isAuth0Enabled) {
            getAuthOtpUrl()
          } else if (isOTPVerified) {
            setIsOTP(true);
          } else {
            setMFAPopupVisible(true)
          }
        }
      });
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
      amount: sendAmmount,
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
          from: props?.route?.params?.from
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
  };
  const trigger2FAValidation = async (url: string) => {
    if (!isApitriggerd) {
      setIsApiTriggered(true)
      try {
        const response: any = await CryptoServices.makeAuthenticatedGetRequest(url);
        if (response?.status === 200) {
          setIsApiTriggered(false)
          if (response?.data === true) {
            setErrormsg("")
            props.navigation.navigate("SendCryptoSuccess", {
              ammount: sendAmmount,
              walletCode: props.route?.params?.walletCode,
              from: props?.route?.params?.from
            });
          } else {
            setErrormsg("Your withdrawal was unsuccessful , Please try again after some time.")
          };
          setWebViewVisible(false);

        } else {
          setIsApiTriggered(false)
          setWebViewVisible(false);
          setErrormsg(isErrorDispaly(response));
        }

      } catch (error: any) {
        setErrormsg(isErrorDispaly(error.response));
        setWebViewVisible(false);
        setIsApiTriggered(false)
        if (error.response?.data?.detail?.includes("Please log in using the authorized user credentials")) {
          Cookies.clearAll(true);
        }

      }
    }
  };


  const handleWebViewNavigationStateChange = async (navState: any) => {
    if (navState.url?.includes("/api/v1/Common/TwoFactorAuthenticationCodeState")) {
      await trigger2FAValidation(navState.url);
      return;

    }
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
          <View
            style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]} >
            <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
              <TouchableOpacity style={[styles.pr16]} onPress={handleGoBack} >
                <View>
                  <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
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
            {/* <TouchableOpacity onPress={enableScannerModel}>
                <View style={[styles.bgpurple]}>
                  <Scanbar />
                </View>
              </TouchableOpacity> */}




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
            <AntDesign onPress={handleCloseMFA} name="close" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />
          </View>
          <View style={[commonStyles.alignCenter, commonStyles.gap10, commonStyles.justifyContent, commonStyles.mb43]}>
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Due To Security Reasons " />
            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw800, commonStyles.textBlack,]} text="Enable Two Factor Authentication or Face/Fingerprint" />


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
              <TouchableOpacity onPress={handleCloseWebView} style={styles.closeButton}>
                <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} style={{ marginTop: 3 }} />

              </TouchableOpacity>
              <WebView
                source={{ uri: twoFactorAuthUrl }}
                style={styles.webView}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={renderWebViewLoading}
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
