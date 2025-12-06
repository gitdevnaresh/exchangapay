import React, { useEffect, useState, FC } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import { RootStackParamList } from "../../navigation/navigation-types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { ms, s } from "../../constants/theme/scale";
import { formatCurrency, isErrorDispaly } from "../../utils/helpers";
import Loadding from "../../components/skeleton";
import { TotalCryptobalanceView } from "./skeleton_views";
import ErrorComponent from "../../components/Error";
import { useIsFocused } from "@react-navigation/native";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { commonStyles } from "../../components/CommonStyles";
import { useDispatch, useSelector } from "react-redux";
import CryptoServices from "../../services/crypto";
import { ChevronRight, SendReceive, Wallet } from "../../assets/svg";
import { setNotificationCount } from "../../redux/Actions/UserActions";
import NotificationModuleService from "../../services/notification";
import { Overlay } from "react-native-elements";
import AntDesign from "react-native-vector-icons/AntDesign";
import AccountDeactivatePopup from "../Currencypop/actDeactivatePopup";
import { AlertItem, CRYPTO_CONSTANTS, CurrencyItem, SecurityInfo } from "./constants";
import CommonPopup from "../../components/commonPopup";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import NoDataComponent from "../../components/nodata";
import ProfileService from "../../services/profile";
import CaseAlertsCarousel from "../../components/carousel/caseAlertCarousel";
type CryptoNew = NativeStackScreenProps<RootStackParamList, "Crypto">;
const CryptoNew: FC<CryptoNew> = React.memo((props: any) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const styles = useStyleSheet(themedStyles);
  const { width } = Dimensions.get("window");
  const isPad = width > 600;
  const [totalBalLoading, setTotalBalLoading] = useState<boolean>(false);
  const [cryptoData, setCryptoData] = useState<any>({});
  const [errormsg, setErrormsg] = useState<any>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const TotalCryptobalanceLoader = TotalCryptobalanceView();
  const [modelVisible, setModelvisible] = useState<boolean>(false);
  const [currencyData, setCurrencydata] = useState<CurrencyItem[]>([]);
  const [isPressed, setIsPressd] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [isSecurityPopupVisible, setIsSecurityPopupVisible] =
    useState<boolean>(false);
  const [securityLoading, setSecurrityLoading] = useState<boolean>(true);
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo>({
    percentage: 0,
    level: "",
    email: "",
    phone: "",
    isSecurityQuestionsEnabled: false,
    isGoogleAuthEnabled: false,
    isFaceResgEnabled: false,
    isAuth0Enabled: false,
  });
  const { decryptAES } = useEncryptDecrypt();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  useEffect(() => {
    if (isFocused) {
      fetchAlerts();
      getSeccurityInfo();
      getCurrencyData();
      fetchCrypTototalBal(false);
      getAllNotificationCount();
    }
  }, [isFocused]);

  const getAllNotificationCount = async () => {
    const res = await NotificationModuleService.getAllNotificationCount();
    if (res.status === 200) {
      dispatch(setNotificationCount(res.data));
    }
  };
  const getSeccurityInfo = async () => {
    setSecurrityLoading(true);
    try {
      const response = await CryptoServices.getSecurityDetails();
      if (response?.ok) {
        const data: SecurityInfo = response?.data;
        setSecurityInfo(data);
        setSecurrityLoading(false);
      } else {
        setSecurrityLoading(false);
        setErrormsg(isErrorDispaly(response));
      }
    } catch (err) {
      setSecurrityLoading(false);
      setErrormsg(isErrorDispaly(err));
    }
  };
  const fetchCrypTototalBal = async (isRefresh: boolean) => {
    isRefresh ? setRefreshing(true) : setTotalBalLoading(true);
    try {
      const response: any = await CryptoServices.getCryptoTotalBalance();
      if (response?.status === 200) {
        setCryptoData({ ...response?.data, currency: userInfo?.currency });
        isRefresh ? setRefreshing(false) : setTotalBalLoading(false);
        setErrormsg("");
      } else {
        setErrormsg(isErrorDispaly(response));
        isRefresh ? setRefreshing(false) : setTotalBalLoading(false);
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
      isRefresh ? setRefreshing(false) : setTotalBalLoading(false);
    }
  };

  function onRefresh(): void {
    fetchCrypTototalBal(true);
  }
  function getGreeting() {
    const currentTime = new Date().getHours();
    if (currentTime >= 5 && currentTime < 12) {
      return CRYPTO_CONSTANTS.GREETING_MORNING;
    } else if (currentTime >= 12 && currentTime < 18) {
      return CRYPTO_CONSTANTS.GREETING_AFTERNOON;
    } else {
      return CRYPTO_CONSTANTS.GREETING_EVENING;
    }
  }
  const handleCryptoWallet = () => {
    props.navigation.navigate(CRYPTO_CONSTANTS.CRYPTO_WALLET_ROUTE, {
      totalAmount: cryptoData.cryptoValue,
      currency: cryptoData.currency,
    });
  };
  const setTotalAmount = (item: any) => {
    setCryptoData({ ...cryptoData, currency: item?.coin });
    setModelvisible(!modelVisible);
  };
  const getCurrencyData = async () => {
    const response = await CryptoServices.getCurrencyLookup();
    setCurrencydata(response?.data);
  };

  const handleNavigateDeposit = () => {
    props.navigation.push(CRYPTO_CONSTANTS.SELECT_ASSET_ROUTE);
  };

  const handleNavigateWithdraw = () => {
    if (userInfo?.accountStatus === CRYPTO_CONSTANTS.INACTIVE) {
      setIsPressd(true);
    } else if (
      !securityInfo.isAuth0Enabled &&
      !securityInfo.isFaceResgEnabled
    ) {
      setIsSecurityPopupVisible(true);
    } else {
      props.navigation.push(CRYPTO_CONSTANTS.CRYPTO_COIN_RECEIVE);
    }
  };

  const handleNavigateCryptoWallet = () => {
    props.navigation.push(CRYPTO_CONSTANTS.EXCHANGA_CARD, {
      cardAmount: cryptoData.fiatValue,
      currency: cryptoData.currency,
    });
  };

  const handleNavigateCards = () => {
    props.navigation.navigate(CRYPTO_CONSTANTS.CARDS);
  };

  const handleOpenCurrency = () => {
    setModelvisible(true);
  };

  const handleCloseCurrency = () => {
    setModelvisible(!modelVisible);
  };

  const handleCloseMFAPopUp = () => {
    setIsPressd(false);
  };

  const handleCloseError = () => {
    setErrormsg("");
  };

  const handleNavigateSecurity = () => {
    props?.navigation.navigate("Security", {
      isWithdrawScreen: true,
    });
    setIsSecurityPopupVisible(false);
  };
  const fetchAlerts = async () => {
    try {
      const response: any = await ProfileService.getAlertCasess();
      if (response?.ok && Array.isArray(response.data)) {
        setAlerts(response.data);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };
  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Container style={[commonStyles.container]}>
          <>
            {errormsg && (
              <View style={styles.marginTop}>
                <ErrorComponent message={errormsg} onClose={handleCloseError} />
              </View>
            )}
            {alerts?.length > 0 && (<CaseAlertsCarousel commonStyles={commonStyles} screenName="Home" alerts={alerts} />)}

            <ParagraphComponent
              style={[
                commonStyles.fs14,
                commonStyles.fw400,
                { marginBottom: -4, color: NEW_COLOR.TEXT_GREY4 },
              ]}
              text={getGreeting()}
            />
            <ParagraphComponent
              numberOfLines={2}
              style={[
                commonStyles.fs24,
                commonStyles.fw600,
                commonStyles.textBlack,
                commonStyles.mb32,
              ]}
              text={`${decryptAES(userInfo.firstName)
                ? decryptAES(userInfo.firstName)
                : " "
                } ${decryptAES(userInfo.lastName)
                  ? decryptAES(userInfo.lastName)
                  : " "
                }`}
            />
            <View>
              <View>
                {(totalBalLoading || securityLoading) && (
                  <Loadding contenthtml={TotalCryptobalanceLoader} />
                )}
                {!totalBalLoading && !securityLoading && (
                  <>
                    <View style={[commonStyles.mb16]} />
                    <View
                      style={[
                        styles.assetsDottedBg,
                        commonStyles.rounded24,
                        { position: "relative", minHeight: isPad ? 180 : 114 },
                      ]}
                    >
                      <ImageBackground
                        style={{
                          position: "absolute",
                          padding: 20,
                          minHeight: ms(120),
                          minWidth: (WINDOW_WIDTH * 80) / 100,
                          left: 25,
                          top: -30,
                        }}
                        resizeMode="contain"
                        source={require("../../assets/images/cards/orangebg.png")}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={handleOpenCurrency}
                          style={[
                            commonStyles?.dflex,
                            commonStyles.alignCenter,
                            { marginLeft: isPad ? "14%" : 0 },
                          ]}
                        >
                          <ParagraphComponent
                            text={`${formatCurrency(
                              cryptoData[cryptoData.currency?.toUpperCase()]
                                ?.totalAmount || 0
                            )}  ${cryptoData.currency || ""}`}
                            style={[
                              commonStyles.fs22,
                              commonStyles.fw600,
                              commonStyles.textAlwaysWhite,
                            ]}
                            numberOfLines={1}
                          />
                          <Image
                            style={styles.downArrow}
                            source={require("../../assets/images/banklocal/down-arrow.png")}
                          />
                        </TouchableOpacity>
                        <ParagraphComponent
                          style={[
                            commonStyles.fs14,
                            commonStyles.fw400,
                            commonStyles.textBlack,
                            { left: isPad ? "14%" : 0 },
                          ]}
                          text="Total Assets"
                        />
                      </ImageBackground>
                    </View>
                    <View style={[styles.menuBlock]}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleNavigateDeposit}
                      >
                        <ImageBackground
                          style={{
                            minWidth: (WINDOW_WIDTH * 26) / 100,
                            height: (WINDOW_WIDTH * 24) / 100,
                          }}
                          resizeMode="contain"
                          source={require("../../assets/images/cards/card-bg.png")}
                        >
                          <View style={styles.actionsList}>
                            <View style={{ alignItems: "center" }}>
                              <SendReceive
                                style={{
                                  transform: [{ rotate: "180deg" }],
                                  margin: "auto",
                                }}
                                width={s(24)}
                                height={s(24)}
                              />
                              <ParagraphComponent
                                style={[
                                  commonStyles.textGrey,
                                  commonStyles.fs12,
                                  commonStyles.textCenter,
                                  commonStyles.mt8,
                                  commonStyles.fw500,
                                ]}
                                text={CRYPTO_CONSTANTS.DEPOSIT}
                              />
                            </View>
                          </View>
                        </ImageBackground>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleNavigateWithdraw}
                      >
                        <ImageBackground
                          style={{
                            minWidth: (WINDOW_WIDTH * 26) / 100,
                            minHeight: (WINDOW_WIDTH * 24) / 100,
                          }}
                          resizeMode="contain"
                          source={require("../../assets/images/cards/card-bg.png")}
                        >
                          <View style={styles.actionsList}>
                            <View style={{ alignItems: "center" }}>
                              <SendReceive width={s(24)} height={s(24)} />
                              <ParagraphComponent
                                style={[
                                  commonStyles.textGrey,
                                  commonStyles.fs12,
                                  commonStyles.textCenter,
                                  commonStyles.mt8,
                                  commonStyles.fw500,
                                ]}
                                text={CRYPTO_CONSTANTS.WITHDRAW}
                              />
                            </View>
                          </View>
                        </ImageBackground>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleNavigateCards}
                      >
                        <ImageBackground
                          style={{
                            minWidth: (WINDOW_WIDTH * 26) / 100,
                            minHeight: (WINDOW_WIDTH * 24) / 100,
                          }}
                          resizeMode="contain"
                          source={require("../../assets/images/cards/card-bg.png")}
                        >
                          <View style={styles.actionsList}>
                            <View style={{ alignItems: "center" }}>
                              <Wallet width={s(24)} height={s(24)} />
                              <ParagraphComponent
                                style={[
                                  commonStyles.textGrey,
                                  commonStyles.fs12,
                                  commonStyles.textCenter,
                                  commonStyles.mt8,
                                  commonStyles.fw500,
                                ]}
                                text={CRYPTO_CONSTANTS.CARDS}
                              />
                            </View>
                          </View>
                        </ImageBackground>
                      </TouchableOpacity>
                    </View>
                    <View style={[commonStyles.mb8]} />
                    <View>
                      <ParagraphComponent
                        style={[
                          commonStyles.fs16,
                          commonStyles.fw700,
                          commonStyles.textBlack,
                          commonStyles.px12,
                        ]}
                        text={CRYPTO_CONSTANTS.ASSETS}
                      />
                      <View style={commonStyles.mt16} />
                      <View style={[styles.assetAllocation]}>
                        <TouchableOpacity
                          onPress={handleCryptoWallet}
                          style={styles.bgcard}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.justifyContent,
                              commonStyles.alignCenter,
                            ]}
                          >
                            <View>
                              <Image
                                source={require("../../assets/images/cards/crypto-wallet.png")}
                                style={styles.mb20}
                              />
                              <ParagraphComponent
                                style={[
                                  commonStyles.fs14,
                                  commonStyles.fw600,
                                  commonStyles.textBlack,
                                ]}
                                text={`${formatCurrency(
                                  cryptoData[cryptoData.currency?.toUpperCase()]
                                    ?.cryptoAmount || 0
                                )}  ${cryptoData.currency || ""}`}
                              />
                              <ParagraphComponent
                                style={[
                                  commonStyles.fs12,
                                  commonStyles.fw400,
                                  commonStyles.textLightGrey,
                                ]}
                                text={CRYPTO_CONSTANTS.CRYPTO_WALLET}
                              />
                            </View>
                            <View>
                              <ChevronRight />
                            </View>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleNavigateCryptoWallet}
                          style={styles.bgcard}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.justifyContent,
                              commonStyles.alignCenter,
                            ]}
                          >
                            <View>
                              <Image
                                source={require("../../assets/images/cards/card-asset.png")}
                                style={[commonStyles.mb26]}
                              />
                              <ParagraphComponent
                                style={[
                                  commonStyles.fs14,
                                  commonStyles.fw600,
                                  commonStyles.textBlack,
                                ]}
                                text={`${formatCurrency(
                                  cryptoData[cryptoData.currency?.toUpperCase()]
                                    ?.cardsAmount || 0
                                )}  ${cryptoData.currency || " "}`}
                              />
                              <ParagraphComponent
                                style={[
                                  commonStyles.fs12,
                                  commonStyles.fw400,
                                  commonStyles.textLightGrey,
                                ]}
                                text={CRYPTO_CONSTANTS.CARDS}
                              />
                            </View>
                            <View>
                              <ChevronRight />
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                      <View style={commonStyles.mb16} />
                      <View style={commonStyles.mb16} />
                    </View>
                    <View style={[commonStyles.mb43]} />
                    <View style={[commonStyles.mb43]} />
                  </>
                )}
              </View>
            </View>
          </>
        </Container>
      </ScrollView>
      {modelVisible && (
        <Overlay
          onBackdropPress={handleCloseCurrency}
          overlayStyle={[styles.overlayContent, { width: WINDOW_WIDTH - 30 }]}
          isVisible={modelVisible}
        >
          <View
            style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.gap10,
              commonStyles.justifyContent,
              commonStyles.mb28,
            ]}
          >
            <ParagraphComponent
              style={[
                commonStyles.fs16,
                commonStyles.fw800,
                commonStyles.textBlack,
              ]}
              text={CRYPTO_CONSTANTS?.SELECT_CURRENCY}
            />
            <AntDesign
              onPress={handleCloseCurrency}
              name={CRYPTO_CONSTANTS?.CLOSE}
              size={22}
              color={NEW_COLOR.TEXT_BLACK}
              style={{ marginTop: 3 }}
            />
          </View>
          <View style={[commonStyles.gap10]}>
            {currencyData &&
              currencyData?.length > 0 &&
              currencyData?.map((item: any) => {
                return (
                  <TouchableOpacity
                    key={item?.coin}
                    activeOpacity={0.8}
                    style={[
                      styles.optiopStyle,
                      {
                        backgroundColor:
                          (cryptoData?.currency === item?.coin &&
                            NEW_COLOR.MENU_CARD_BG) ||
                          "transparent",
                      },
                    ]}
                    onPress={() => {
                      setTotalAmount(item);
                    }}
                  >
                    <ParagraphComponent
                      style={[
                        commonStyles.fs16,
                        commonStyles.fw800,
                        commonStyles.textBlack,
                      ]}
                      text={item?.coin}
                    />
                  </TouchableOpacity>
                );
              })}
            {(!currencyData || currencyData?.length <= 0) && (
              <NoDataComponent />
            )}
          </View>
        </Overlay>
      )}
      {userInfo?.accountStatus === CRYPTO_CONSTANTS.INACTIVE && isPressed && (
        <AccountDeactivatePopup
          isVisible={
            userInfo?.accountStatus === CRYPTO_CONSTANTS.INACTIVE && isPressed
          }
          handleClose={handleCloseMFAPopUp}
        />
      )}

      {isSecurityPopupVisible && (
        <CommonPopup
          isVisible={isSecurityPopupVisible}
          handleClose={() => setIsSecurityPopupVisible(false)}
          title="Secure your account"
          backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.40)" }}
          isBackdropPressAllowed={true}
          content={
            <>
              <ParagraphComponent
                style={[
                  commonStyles.fs14,
                  commonStyles.fw400,
                  commonStyles.textpara,
                  commonStyles.textCenter,
                ]}
                text="To use this feature, you'll need to enable additional security. "
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs14,
                  commonStyles.fw400,
                  commonStyles.textpara,
                  commonStyles.textCenter,
                ]}
                text=" Set up Two-Factor Authentication (2FA)  "
              />
              <ParagraphComponent
                style={[
                  commonStyles.fs14,
                  commonStyles.fw400,
                  commonStyles.textpara,
                  commonStyles.textCenter,
                ]}
                text=" to protect your account and keep your funds safe."
              />
            </>
          }
          buttonName="Enable Security"
          onButtonPress={handleNavigateSecurity}
        />
      )}
    </SafeAreaView>
  );
});

export default CryptoNew;
const themedStyles = StyleService.create({
  assetsDottedBg: {
    flex: 1,
    borderWidth: 1,
    borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
    backgroundColor: NEW_COLOR.BG_PURPLERDARK,
    borderStyle: "dashed",
  },
  mb20: { marginBottom: 20 },
  bgcard: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    paddingVertical: s(20),
    borderRadius: 20,
    paddingHorizontal: s(16),
    flex: 1,
  },
  assetAllocation: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: s(14),
  },
  menuBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
    marginBottom: 8,
  },
  actionsList: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    textAlign: "center",
  },
  overlayContent: {
    paddingHorizontal: s(36),
    paddingVertical: s(36),
    borderRadius: 35,
    backgroundColor: NEW_COLOR.POP_UP_BG,
  },
  downArrow: {
    marginLeft: 10,
    marginTop: 6,
  },
  optiopStyle: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: NEW_COLOR.DASHED_BORDER_STYLE,
  },
  marginTop: { marginTop: -16 },
});
