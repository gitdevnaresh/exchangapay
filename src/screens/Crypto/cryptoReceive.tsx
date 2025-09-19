import React, { useEffect, useState, useRef } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ImageBackground,
  BackHandler,
  Dimensions,
} from "react-native";
import { Container } from "../../components";
import CopyCard from "../../components/CopyCard";
import QRCode from "react-native-qrcode-svg";
import Loadding from "../../components/skeleton";
import { cryptoReceiveLoader } from "./buySkeleton_views";
import Images from "../../assets/images";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import {
  NEW_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { commonStyles } from "../../components/CommonStyles";
import CryptoServices from "../../services/crypto";
import { useSelector } from "react-redux";
import SvgFromUrl from "../../components/svgIcon";
import { s } from "../../constants/theme/scale";
import Clipboard from "@react-native-clipboard/clipboard";
import { Overlay } from "react-native-elements";
import DefaultButton from "../../components/DefaultButton";
import ErrorComponent from "../../components/Error";
import { formatDateTimeAPI, isErrorDispaly } from "../../utils/helpers";
import ProfileService from "../../services/profile";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";

const { width } = Dimensions.get("window");
const isPad = width > 600;
const CryptoReceive = React.memo((props: any) => {
  const refRBSheet = useRef();
  const styles = useStyleSheet(themedStyles);
  const [cryptoDepositeData, setCryptoDepositeData] = useState<any>({});
  const [coin, setCoin] = useState<any>("");
  const [network, setNetwork] = useState<any>("");
  const [walletsAddress, setWalletsAddress] = useState<any>("");
  const [commonCryptoLoading, setCommonCryptoLoading] =
    useState<boolean>(false);
  const [networkLu, setNetworkLu] = useState<any>([]);
  const receiveCoiBalance = cryptoReceiveLoader();
  const [errorMsg, setErrorMsg] = useState<any>("");
  const [popupModelVisible, setPopupVisible] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const { decryptAES } = useEncryptDecrypt();

  useEffect(() => {
    fetchCommonCrypto();
    if (props?.route?.params?.network) {
      setNetwork(props?.route?.params?.network);
    }
  }, []);

  const fetchCryptoDepositData = async (
    coinName: string,
    networkName: string
  ) => {
    setCommonCryptoLoading(true);
    try {
      const res: any = await CryptoServices.getCryptoDeposit(
        coinName,
        networkName
      );
      if (res.status === 200) {
        setCryptoDepositeData(res?.data);
        setCommonCryptoLoading(false);
        if (res?.data?.depositMinimumamount > 0) {
          setPopupVisible(true);
        }
      } else {
        setErrorMsg(isErrorDispaly(res));

        setCommonCryptoLoading(false);
      }
    } catch (err) {
      setErrorMsg(isErrorDispaly(err));
    }
  };
  const fetchCommonCrypto = async () => {
    setCommonCryptoLoading(true);
    try {
      const res: any = await CryptoServices.getCommonCryptoNetworks(
        props.route?.params?.cryptoCoin
      );
      if (res.status === 200) {
        setNetworkLu(res?.data);
        if (props?.route?.params?.network) {
          setNetwork(props?.route?.params?.network);
          fetchCryptoDepositData(
            props.route?.params?.cryptoCoin,
            props?.route?.params?.network
          );
        } else {
          setNetwork(res?.data[0]?.name);
          fetchCryptoDepositData(
            props.route?.params?.cryptoCoin,
            res?.data[0]?.name
          );
        }
      }
    } catch (err) {
      setErrorMsg(isErrorDispaly(err));
      setCommonCryptoLoading(false);
    }
  };
  const handleCryptoDepositCall = (val: any) => {
    setCoin(val?.code);
    setNetwork(val?.name);
    setWalletsAddress(val?.address);
    fetchCryptoDepositData(props.route?.params?.cryptoCoin, val?.code);
    refRBSheet?.current?.close();
  };

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

  const handleGoBack = () => {
    props.navigation.goBack();
  };
  const copyToClipboard = async (text: any) => {
    try {
      await Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert("Failed to copy text to clipboard:", error);
    }
  };

  const cryptoList: any = {
    BTC: Images?.coins?.coinbtc,
    "ERC-20": Images?.coins?.coineth,
    "TRC-20": Images?.coins?.coineusdt,
    USDT: Images?.coins?.coineusdt,
    ETH: Images?.coins?.coineth,
    USDC: Images?.coins?.coineusdc,
  };
  const handleOpenRBSheet = () => {
    refRBSheet?.current?.open();
  };
  const handlePopUp = () => {
    setPopupVisible(!popupModelVisible);
  };

  const handleCloseError = () => {
    setErrorMsg(null);
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          {commonCryptoLoading && <Loadding contenthtml={receiveCoiBalance} />}

          {!commonCryptoLoading && (
            <>
              <View style={[commonStyles.dflex, commonStyles.alignCenter]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.pr16}>
                  <AntDesign
                    name="arrowleft"
                    size={s(22)}
                    color={NEW_COLOR.TEXT_BLACK}
                    style={{ marginTop: 3 }}
                  />
                </TouchableOpacity>
                <ParagraphComponent
                  style={[
                    commonStyles.fs16,
                    commonStyles.textBlack,
                    commonStyles.fw800,
                  ]}
                  text={`Deposit ${props.route?.params?.cryptoCoin}`}
                />
              </View>
              {errorMsg && (
                <ErrorComponent message={errorMsg} onClose={handleCloseError} />
              )}
              <View style={[styles.mt42, styles.mb32]}>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.gap16,
                    styles.flexWrap,
                    commonStyles.justifyCenter,
                    commonStyles.mb8,
                  ]}
                >
                  {networkLu?.length > 0 &&
                    networkLu?.map((item: any) => (
                      <TouchableOpacity
                        onPress={() => {
                          handleCryptoDepositCall(item);
                        }}
                        style={[
                          styles.tabStyle,
                          {
                            backgroundColor:
                              network === item?.name
                                ? NEW_COLOR.NETWORK_BLUE
                                : "transparent",
                          },
                        ]}
                        activeOpacity={0.9}
                        disabled={network === item?.name ? true : false}
                      >
                        <ParagraphComponent
                          style={[
                            commonStyles.fs14,
                            commonStyles.fw600,
                            commonStyles.textAlwaysWhite,
                            commonStyles.flex1,
                            commonStyles.textCenter,
                          ]}
                          text={item?.code}
                        />
                      </TouchableOpacity>
                    ))}
                </View>
                <ParagraphComponent
                  text={"Chain"}
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw500,
                    commonStyles.textGrey,
                    styles.px8,
                    commonStyles.textCenter,
                  ]}
                />
                <View style={commonStyles.mb8} />
              </View>

              <ImageBackground
                resizeMode="contain"
                style={{
                  position: "relative",
                  width: "100%",
                  height: isPad ? s(380) : s(350),
                  minHeight: s(350),
                }}
                source={require("../../assets/images/cards/light-purplebg.png")}
              >
                <View style={[commonStyles.relative]}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleOpenRBSheet}
                    style={[styles.badgePositin]}
                  >
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        styles.bgorange,
                        styles.w318,
                        commonStyles.mxAuto,
                      ]}
                    >
                      <View>
                        {cryptoDepositeData.logo && (
                          <SvgFromUrl
                            uri={cryptoDepositeData.logo}
                            width={s(22)}
                            height={s(22)}
                          />
                        )}
                        {!cryptoDepositeData.logo && (
                          <Image
                            source={cryptoList[props.route?.params?.cryptoCoin]}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 40 / 2,
                            }}
                          />
                        )}
                      </View>
                      <View>
                        <ParagraphComponent
                          style={[
                            commonStyles.textBlack,
                            styles.ml6,
                            commonStyles.fs16,
                            commonStyles.fw600,
                            { marginTop: -3 },
                          ]}
                          text={
                            cryptoDepositeData.code ||
                            props.route?.params?.cryptoCoin
                          }
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.bgQR}>
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.justifyCenter,
                        {
                          height: "auto",
                          minHeight: isPad ? s(236) : s(220),
                          paddingTop: 16,
                        },
                      ]}
                    >
                      <View
                        style={[
                          commonStyles.flex1,
                          commonStyles.dflex,
                          commonStyles.justifyCenter,
                          commonStyles.alignCenter,
                          { marginTop: "auto", marginBottom: "auto" },
                        ]}
                      >
                        <View
                          style={[
                            styles.bgWhite,
                            commonStyles.justifyCenter,
                            commonStyles.dflex,
                          ]}
                        >
                          <QRCode
                            color={NEW_COLOR.TEXT_WHITE}
                            backgroundColor="#fff"
                            value={
                              cryptoDepositeData?.address ||
                              "Sorry network error"
                            }
                            size={s(165)}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={[styles.border]} />
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.justifyCenter,
                        commonStyles.alignCenter,
                        { marginTop: "auto", marginBottom: "auto" },
                      ]}
                    >
                      <View
                        style={[
                          commonStyles.flex1,
                          commonStyles.px12,
                          commonStyles.mb16,
                          { marginTop: "auto" },
                        ]}
                      >
                        <ParagraphComponent
                          style={[
                            commonStyles.fs12,
                            commonStyles.fw500,
                            commonStyles.textCenter,
                            commonStyles.textGrey,
                          ]}
                          text={"Wallet Address"}
                        />
                        <View style={[]}>
                          <ParagraphComponent
                            style={[
                              commonStyles.fs12,
                              commonStyles.fw600,
                              commonStyles.textBlack,
                              commonStyles.textCenter,
                              { marginBottom: s(8) },
                            ]}
                            text={`${cryptoDepositeData?.address || "--"}`}
                          />
                          <TouchableOpacity
                            onPress={() =>
                              copyToClipboard(cryptoDepositeData?.address)
                            }
                            style={[commonStyles.mxAuto]}
                            activeOpacity={0.8}
                          >
                            <View>
                              <CopyCard
                                onPress={() =>
                                  copyToClipboard(cryptoDepositeData?.address)
                                }
                              />
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>
              <View style={[styles.infoCard, commonStyles.dflex, styles.mb32]}>
                <Feather
                  name="info"
                  size={s(20)}
                  color={NEW_COLOR.TEXT_BLACK}
                  style={[commonStyles.mt8, commonStyles.mr12]}
                />
                <ParagraphComponent
                  style={[
                    commonStyles.fs12,
                    commonStyles.fw400,
                    styles.mr24,
                    styles.pr16,
                    commonStyles.textBlack,
                  ]}
                  text={
                    "Please check the transfer address carefully. wrong currency receive address will cause asset loss and the asset cannot be retrieved."
                  }
                />
              </View>
            </>
          )}
        </Container>
        {!commonCryptoLoading &&
          cryptoDepositeData?.address &&
          popupModelVisible && (
            <Overlay
              overlayStyle={[
                styles.overlayContent,
                { width: WINDOW_WIDTH - 30, height: WINDOW_HEIGHT / 4 },
              ]}
              isVisible={popupModelVisible}
            >
              <View
                style={[
                  commonStyles.alignCenter,
                  commonStyles.gap10,
                  commonStyles.justifyContent,
                  commonStyles.mb43,
                ]}
              >
                <View style={[commonStyles.mb12]} />
                <View style={[commonStyles.gap10]}>
                  <ParagraphComponent
                    style={[
                      commonStyles.fs14,
                      commonStyles.fw500,
                      commonStyles.textpara,
                      commonStyles.textCenter,
                    ]}
                    text={`A fee of ${
                      cryptoDepositeData?.depositMinimumamount || "0"
                    } ${
                      props.route?.params?.cryptoCoin || ""
                    } will be charged for every ${
                      cryptoDepositeData?.network || ""
                    } deposit transaction.`}
                  />
                  <View style={[commonStyles.mb12]} />
                  <View style={[commonStyles.justify]}>
                    <DefaultButton
                      title={"Acknowledge"}
                      style={undefined}
                      iconArrowRight={false}
                      iconCheck={true}
                      loading={false}
                      disable={undefined}
                      onPress={handlePopUp}
                    />
                  </View>
                </View>
              </View>
            </Overlay>
          )}
      </ScrollView>
    </SafeAreaView>
  );
});

export default CryptoReceive;

const themedStyles = StyleService.create({
  flexWrap: {
    flexWrap: "wrap",
  },
  mr24: { marginRight: 24 },
  infoCard: {
    backgroundColor: NEW_COLOR.BG_BLUE,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  copyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  mt34: { marginTop: 34 },
  w318: {
    marginHorizontal: 28,
    marginBottom: -42,
    zIndex: 9,
    paddingHorizontal: 12,
  },
  badgePositin: {
    position: "absolute",
    top: isPad ? s(-14) : s(-18),
    left: isPad ? "35%" : "33%",
  },
  bgorange: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
    padding: 8,
    borderRadius: 100,
    width: (WINDOW_WIDTH * 30) / 100,
  },
  whiteCircle: {
    backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    padding: 8,
    borderRadius: 100,
  },
  px8: { paddingHorizontal: 8 },
  pr16: { paddingRight: 16 },
  mt42: { marginTop: 42 },
  borderCircle: {
    borderRadius: 100,
    paddingHorizontal: 24,
    borderWidth: 1,
    paddingVertical: 12,
    minWidth: (WINDOW_WIDTH * 26) / 100,
    maxWidth: (WINDOW_WIDTH * 40) / 100,
  },
  ml6: {
    marginLeft: 16,
  },
  ml4: {
    marginLeft: 4,
  },
  ml8: {
    marginLeft: 8,
  },
  mb32: {
    marginBottom: s(32),
  },
  bgWhite: {
    backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    padding: 4,
  },
  listItem: {
    marginVertical: 8,
    flexDirection: "row",
    flex: 1,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  mb20: {
    marginBottom: 20,
  },
  border: {
    height: 1,
    backgroundColor: NEW_COLOR.BORDER_BOTTOM,
    marginBottom: 10,
    opacity: 0.2,
    width: "85%",
    marginRight: "auto",
    marginLeft: "auto",
  },
  tabStyle: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: NEW_COLOR.NETWORK_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  overlayContent: {
    paddingHorizontal: s(28),
    paddingVertical: s(20),
    borderRadius: 35,
    backgroundColor: NEW_COLOR.POP_UP_BG,
  },
});
