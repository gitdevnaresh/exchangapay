import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  ImageBackground,
  Switch,
  Image,
  Dimensions,
  Alert,
  Share,
  BackHandler,
} from "react-native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import QRCode from "react-native-qrcode-svg";
import Loadding from "../../components/skeleton";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import AntDesign from "react-native-vector-icons/AntDesign";
import { s } from "../../constants/theme/scale";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import AddressbookService from "../../services/addressbook";
import ErrorComponent from "../../components/Error";
import { isErrorDispaly } from "../../utils/helpers";
import { commonStyles } from "../../components/CommonStyles";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { cryptoReceiveLoader } from "../Crypto/buySkeleton_views";
import Clipboard from "@react-native-clipboard/clipboard";
import CopyCard from "../../components/CopyCard";
import SvgFromUrl from "../../components/svgIcon";
import Images from "../../assets/images";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import { useSelector } from "react-redux";
import CommonPopup from "../../components/commonPopup";
import DefaultButton from "../../components/DefaultButton";
import NoDataComponent from "../../components/nodata";
import { PayeeViewLoaders } from "./constants";
const { width } = Dimensions.get("window");
const isPad = width > 600;
const cryptoListImages: any = {
  BTC: Images?.coins?.coinbtc,
  ETH: Images?.coins?.coineth,
  USDT: Images?.coins?.coineusdt,
  USDC: Images?.coins?.coineusdc,
};

const PayeeDetailsView = (props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [payeeDetails, setPayeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const skeletonLoader = cryptoReceiveLoader();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { decryptAES, encryptAES } = useEncryptDecrypt();
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const { userInfo } = useSelector((state: any) => state.UserReducer);
  const decryptUserName = decryptAES(userInfo?.userName);
  const [isLoaders, setIsLoaders] = useState<PayeeViewLoaders>({
    isBtnLoading: false,
    isCloseLoading: false,
  });
  const fetchPayeeDetails = async () => {
    setLoading(true);
    try {
      const res: any = await AddressbookService.getPayeeDetails(
        props.route?.params?.payeeId
      );
      if (res.status === 200) {
        setPayeeDetails(res.data);
      } else {
        setErrorMsg(isErrorDispaly(res));
      }
    } catch (err) {
      setErrorMsg(isErrorDispaly(err));
    }
    setLoading(false);
  };
  useEffect(() => {
    if (isFocused) fetchPayeeDetails();
  }, [props.route?.params?.payeeId, isFocused]);
  const handleGoBack = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleGoBack);
    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleGoBack);
  }, [handleGoBack]);

  const copyToClipboard = async (text: any) => {
    try {
      await Clipboard.setString(text);
    } catch (error: any) {
      Error;
      Alert.alert("Copy ", "Failed to copy address to clipboard.");
    }
  };

  const onShare = async () => {
    try {
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        payeeDetails.walletaddress
      )}&size=200x200`;
      await Share.share({
        message: `Hey, I'm sharing my whitelist address details below for your reference:\n Whitelist Address Name : ${decryptAES(
          payeeDetails.favouriteName
        )}\nWallet Address: ${payeeDetails.walletaddress}\nNetwork: ${
          payeeDetails.network
        }\nCurrency: ${
          payeeDetails.currency || "--"
        }\n\nScan this QR Code: ${qrCodeUrl}`,
        title: "Share Whitelist Address Details",
      });
    } catch (error: any) {}
  };
  const handleProceed = async () => {
    const popupType =
      payeeDetails.status?.toLowerCase() !== "inactive" ? "inactive" : "Active";
    setIsLoaders((prev) => ({
      ...prev,
      isBtnLoading: true,
    }));
    try {
      const body = {
        status: popupType,
        modifiedBy: encryptAES(decryptUserName) || "",
      };
      const res = await AddressbookService.inActivePayee(
        popupType,
        payeeDetails.id,
        body
      );
      if (res.status === 200) {
        setPopupVisible(false);
        setIsLoaders((prev) => ({ ...prev, isBtnLoading: false }));
        fetchPayeeDetails();
      } else {
        setIsLoaders((prev) => ({ ...prev, isBtnLoading: false }));
        setPopupVisible(false);
        setErrorMsg(isErrorDispaly(res));
      }
    } catch (err) {
      setIsLoaders((prev) => ({ ...prev, isBtnLoading: false }));
      setPopupVisible(false);
      setErrorMsg(isErrorDispaly(err));
    }
  };
  const handleClosePopup = () => {
    setPopupVisible(false);
  };
  const handleCloseError = () => {
    setErrorMsg("");
  };
  const handleOpenPopup = () => {
    setPopupVisible(true);
  };

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          {!loading && (
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.gap16,
                commonStyles.justifyContent,
              ]}
            >
              <View
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.gap8,
                ]}
              >
                <TouchableOpacity style={[]} onPress={handleGoBack}>
                  <View>
                    <AntDesign
                      name="arrowleft"
                      size={22}
                      color={NEW_COLOR.TEXT_BLACK}
                      style={{ marginTop: 3 }}
                    />
                  </View>
                </TouchableOpacity>
                <ParagraphComponent
                  text={"Whitelist Address Details"}
                  style={[
                    commonStyles.fs16,
                    commonStyles.textBlack,
                    commonStyles.fw800,
                  ]}
                />
              </View>

              {payeeDetails?.status && (
                <Switch
                  trackColor={{ false: "#767577", true: "#F55D52" }}
                  thumbColor={"#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={handleOpenPopup}
                  value={
                    (payeeDetails?.status?.toLowerCase() === "active" &&
                      true) ||
                    false
                  }
                />
              )}
            </View>
          )}
          {loading && <Loadding contenthtml={skeletonLoader} />}
          {(errorMsg && (
            <ErrorComponent message={errorMsg} onClose={handleCloseError} />
          )) ||
            null}
          {!loading && payeeDetails && (
            <>
              <View style={[styles.mt42, styles.mb32]}>
                <ParagraphComponent
                  text={
                    decryptAES(payeeDetails.favouriteName) ||
                    "Whitelist Address"
                  }
                  style={[
                    commonStyles.fs24,
                    commonStyles.fw600,
                    commonStyles.textCenter,
                    commonStyles.textBlack,
                  ]}
                />
                <ParagraphComponent
                  text="Whitelist Address Name"
                  style={[
                    commonStyles.fs14,
                    commonStyles.fw500,
                    commonStyles.textGrey,
                    styles.px8,
                    commonStyles.textCenter,
                  ]}
                />
              </View>
              <ImageBackground
                resizeMode="contain"
                style={styles.qrBackground}
                source={require("../../assets/images/cards/light-purplebg.png")}
              >
                <View style={styles.currencyBadgePosition}>
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.alignCenter,
                      styles.currencyBadgeInner,
                    ]}
                  >
                    {(payeeDetails.logo && (
                      <SvgFromUrl
                        uri={payeeDetails.logo}
                        width={s(22)}
                        height={s(22)}
                        style={styles.currencyIconStyle}
                      />
                    )) ||
                      (cryptoListImages[
                        payeeDetails.currency?.toUpperCase()
                      ] && (
                        <Image
                          source={
                            cryptoListImages[
                              payeeDetails.currency.toUpperCase()
                            ]
                          }
                          style={[
                            styles.currencyIconStyle,
                            {
                              width: s(22),
                              height: s(22),
                              borderRadius: s(11),
                            },
                          ]}
                        />
                      )) ||
                      null}
                    <ParagraphComponent
                      text={payeeDetails.currency || "--"}
                      style={[
                        commonStyles.textAlwaysWhite,
                        commonStyles.fs14,
                        commonStyles.fw600,
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.qrContainer}>
                  <View
                    style={[
                      styles.bgWhite,
                      commonStyles.justifyCenter,
                      commonStyles.dflex,
                    ]}
                  >
                    <QRCode
                      value={payeeDetails.walletaddress || "No Address"}
                      size={s(165)}
                      color={NEW_COLOR.TEXT_WHITE}
                      backgroundColor="#fff"
                    />
                  </View>
                </View>
                <View style={styles.border} />
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
                      text="Wallet Address"
                      style={[
                        commonStyles.fs12,
                        commonStyles.fw500,
                        commonStyles.textCenter,
                        commonStyles.textGrey,
                      ]}
                    />
                    <View
                      style={[
                        commonStyles.dflex,
                        commonStyles.alignCenter,
                        commonStyles.justifyCenter,
                        commonStyles.gap4,
                      ]}
                    >
                      <ParagraphComponent
                        text={payeeDetails.walletaddress || "--"}
                        style={[
                          commonStyles.fs12,
                          commonStyles.fw600,
                          commonStyles.textBlack,
                          commonStyles.textCenter,
                          { width: s(270) },
                        ]}
                      />
                      {payeeDetails.walletaddress && (
                        <CopyCard
                          onPress={() =>
                            copyToClipboard(payeeDetails.walletaddress)
                          }
                          iconShow={true}
                          contentShow={false}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </ImageBackground>
              <View style={[styles.detailsCard, commonStyles.mt16]}>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.justifyContent,
                    commonStyles.alignCenter,
                    commonStyles?.mb10,
                  ]}
                >
                  <ParagraphComponent text="Currency" style={styles.label} />
                  <ParagraphComponent
                    text={payeeDetails.currency || "--"}
                    style={styles.infoText}
                  />
                </View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.justifyContent,
                    commonStyles.alignCenter,
                    commonStyles?.mb10,
                  ]}
                >
                  <ParagraphComponent text="Network" style={styles.label} />
                  <ParagraphComponent
                    text={payeeDetails.network || "--"}
                    style={styles.infoText}
                  />
                </View>

                {payeeDetails.status && (
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.justifyContent,
                      commonStyles.alignCenter,
                      commonStyles?.mb10,
                    ]}
                  >
                    <ParagraphComponent text="Status" style={styles.label} />
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            payeeDetails.status?.toLowerCase() === "active"
                              ? NEW_COLOR.BG_GREEN
                              : NEW_COLOR.BG_RED,
                        },
                      ]}
                    >
                      <ParagraphComponent
                        text={payeeDetails.status || "--"}
                        style={styles.badgeText}
                      />
                    </View>
                  </View>
                )}
                {payeeDetails.reason && (
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.justifyContent,
                      commonStyles.alignCenter,
                      commonStyles?.mb10,
                    ]}
                  >
                    <ParagraphComponent text="Reason" style={styles.label} />
                    <ParagraphComponent
                      text={payeeDetails.reason || "--"}
                      style={[
                        commonStyles.textBlack,
                        commonStyles.textRight,
                        { width: s(200) },
                      ]}
                      numberOfLines={3}
                    />
                  </View>
                )}
              </View>
              {payeeDetails?.status?.toLowerCase() === "active" && (
                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    commonStyles.mt16,
                    commonStyles.mb16,
                  ]}
                  onPress={onShare}
                >
                  <AntDesign
                    name="sharealt"
                    size={s(20)}
                    color={NEW_COLOR.TEXT_ALWAYS_WHITE}
                  />
                  <ParagraphComponent
                    text="Share Whitelist Address"
                    style={styles.shareButtonText}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
          {!loading && !payeeDetails && <NoDataComponent />}
        </Container>
      </ScrollView>
      {popupVisible && (
        <CommonPopup
          isVisible={popupVisible}
          handleClose={handleClosePopup}
          title={
            (payeeDetails?.status?.toLowerCase() == "active" &&
              "Inactive Whitelist Address") ||
            "Active Whitelist Address"
          }
          content={
            <>
              <ParagraphComponent
                text={
                  (payeeDetails?.status?.toLowerCase() === "inactive" &&
                    "Do you want to Active the Whitelist Address?") ||
                  "Do you want to Inactive the Whitelist Address?"
                }
                style={[commonStyles.fs16, commonStyles.textAlwaysWhite]}
              />
              <View style={{ marginBottom: s(30) }} />
              <DefaultButton
                title="Proceed"
                loading={isLoaders.isBtnLoading}
                onPress={handleProceed}
                style={{ flex: 1, marginLeft: s(8) }}
              />
              <View style={{ marginBottom: s(10) }} />
              <DefaultButton
                title="Cancel"
                loading={isLoaders.isCloseLoading}
                transparent
                onPress={handleClosePopup}
                style={{ flex: 1, marginRight: s(8) }}
              />
            </>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default PayeeDetailsView;

const themedStyles = StyleService.create({
  qrBackground: {
    width: "100%",
    height: isPad ? s(380) : s(350),
    minHeight: s(350),
    position: "relative",
    marginTop: s(20),
  },
  bgWhite: {
    backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    padding: s(4),
    borderRadius: s(8),
  },
  qrContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: s(35),
  },
  border: {
    height: 1,
    backgroundColor: NEW_COLOR.BORDER_BOTTOM,
    marginBottom: s(10),
    opacity: 0.2,
    width: "85%",
    marginRight: "auto",
    marginLeft: "auto",
  },
  detailsCard: {
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    borderRadius: s(12),
    padding: s(16),
    marginTop: s(24),
  },
  label: {
    fontSize: s(14),
    fontWeight: "500",
    color: NEW_COLOR.TEXT_GREY,
  },
  infoText: {
    fontSize: s(14),
    fontWeight: "600",
    color: NEW_COLOR.TEXT_BLACK,
  },
  mt42: { marginTop: s(42) },
  mb32: { marginBottom: s(32) },
  px8: { paddingHorizontal: s(8) },
  px12: { paddingHorizontal: s(12) },
  mb16: { marginBottom: s(16) },
  mt16: { marginTop: s(16) },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NEW_COLOR.BG_ORANGE,
    paddingVertical: s(12),
    paddingHorizontal: s(20),
    borderRadius: s(100),
    alignSelf: "center",
  },
  shareButtonText: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
    fontSize: s(16),
    fontWeight: "600",
    marginLeft: s(8),
  },
  currencyBadgePosition: {
    position: "absolute",
    top: isPad ? s(-14) : s(-18),
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9,
  },
  currencyBadgeInner: {
    backgroundColor: NEW_COLOR.BG_ORANGE,
    paddingVertical: s(6),
    paddingHorizontal: s(16),
    borderRadius: s(100),
    minWidth: (WINDOW_WIDTH * 20) / 100,
    justifyContent: "center",
  },
  currencyIconStyle: {
    marginRight: s(8),
  },
  badge: {
    borderRadius: s(8),
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    marginLeft: s(8),
    // Default background color, will be overridden inline if payeeDetails exists:
  },
  badgeText: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
    fontSize: s(12),
    fontWeight: "600",
  },
});
