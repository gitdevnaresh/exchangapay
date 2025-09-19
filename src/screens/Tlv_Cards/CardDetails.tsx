import React, { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, BackHandler, Dimensions, Platform } from "react-native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import { isErrorDispaly, formatCurrency } from "../../utils/helpers";
import { useIsFocused } from "@react-navigation/native";
import Loadding from "../../components/skeleton";
import { CardViewtotalLoader } from "../cards/CardsSkeleton_views";
import { useSelector } from "react-redux";
import "moment-timezone";
import ErrorComponent from "../../components/Error";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { ms, s } from "../../constants/theme/scale";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
import { commonStyles } from "../../components/CommonStyles";
import { CardFreeze, IconRefresh, Record, ResendPin } from "../../assets/svg";
import CardsModuleService from "../../services/card";
import { RefreshControl } from "react-native";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import CradDetailsInfo from "./CardDetailsInfo";
import CardPin, { ChiperCardPin } from "./showPin";
import AccountDeactivatePopup from "../Currencypop/actDeactivatePopup";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";

const { width } = Dimensions.get('window');
const isPad = width > 600;

const CardDetails = React.memo((props: any) => {
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const isFocused = useIsFocused();
  const styles = useStyleSheet(themedStyles);
  const [errormsg, setErrormsg] = useState("");
  const CardViewtotal = CardViewtotalLoader();
  const [cardsDetailsLoading, setCardsDetailsLoading] = useState(false);
  const [myCardsData, setMyCardsData] = useState<any>({});
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [infoModelVisible, setInfoModelVisible] = useState<boolean>(false);
  const [isShowPin, setShowPin] = useState<boolean>(false);
  const [isPressed, setIsPressd] = useState<boolean>(false);
  const { decryptAES } = useEncryptDecrypt();
  const { width } = Dimensions.get('window');
  const spin = useSharedValue(0);
  const [showPinDetails, setShowPinDetails] = useState<any>({});
  const frontStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: withTiming(`${spinValue}deg`) }],
    }
  }
  )
  const backStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: withTiming(`${spinValue}deg`) }],
    }
  }
  )

  const isPad = width > 600;
  useEffect(() => {
    fetchMyCardDetails();
  }, [isFocused]);

  const fetchMyCardDetails = async () => {
    const cardId = props?.route?.params?.cardId;
    try {
      setCardsDetailsLoading(true);
      const response: any = await CardsModuleService.getMyCardDetails(cardId);
      if (response.status === 200) {
        setMyCardsData(response.data);
        setRefreshing(false);
      }
      setErrormsg("");
      setCardsDetailsLoading(false);
    } catch (error) {
      setRefreshing(false);
      setErrormsg(isErrorDispaly(error));
      setCardsDetailsLoading(false);
    }
  };
  function onRefresh(): void {
    fetchMyCardDetails();
    setRefreshing(true);
  }
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);
  const handleBack = () => {
    props?.navigation?.goBack()
  };
  const handleCardRecords = () => {
    props.navigation.push("CryptoCardsTransaction", {
      cardId: props?.route?.params?.cardId,
      status: myCardsData?.state,
    });
  };


  const handleCardFreezUnFreeze = () => {
    props.navigation.push("FreezeUnFreeze", {
      cardId: props?.route?.params?.cardId,
      status: myCardsData?.state,
      isFreezEnable: myCardsData.isFreezEnable
    });
  };

  const handleDeposit = () => {
    if (userInfo?.accountStatus === "Inactive") {
      setIsPressd(true);
    } else {
      props.navigation.navigate("CardBalance", {
        cardId: props?.route?.params?.cardId,
        cardAmount: myCardsData?.amount,
      });
    }

  };
  const convertExpiry = (cvv: string) => {
    if (cvv) {
      const cvvList = cvv.split("/");
      if (cvvList.length > 1) {
        return `${cvvList[0]}/${cvvList[1].substring(
          cvvList[1].length - 2,
          cvvList[1].length
        )}`;
      } else {
        return `XX/${cvvList[0]}`;
      }
    } else {
      return "XX/XX";
    }
  };
  const convertCardNumberWithSpace = (item: any) => {
    if (item) {
      const cardNumberString = item.toString();
      const response = cardNumberString.replace(/(\d{4})(?=\d)/g, '$1 ');
      return response;
    } else {
      const empty = "**** **** **** ****"
      return empty;
    }
  };

  const handleFlipcard = () => {
    setInfoModelVisible(!infoModelVisible)

  };

  const bargeColor = {
    approved: NEW_COLOR.BG_GREEN,
    failed: NEW_COLOR.BG_RED,
    rejected: NEW_COLOR.BG_RED,
    pending: NEW_COLOR.BG_YELLOW,
    freezed: NEW_COLOR.TEXT_GREY,
    cancelled: NEW_COLOR.BG_RED,
    unfreezed: NEW_COLOR.BG_GREEN,
    "freeze pending": NEW_COLOR.BG_YELLOW,
    "unfreeze pending": NEW_COLOR.BG_YELLOW,
    "under maintenance": NEW_COLOR.TEXT_ORANGE,
    "reviewing": NEW_COLOR.TEXT_ORANGE,

  };

  const handleCloseMFAPopUp = () => {
    setIsPressd(false)
  };

  const handleCloseError = () => {
    setErrormsg("");
  };
  const getCardPin = async () => {
    try {
      const body = {
        "walletId": props?.route?.params?.cardId
      }
      const response: any = await CardsModuleService.getcardPin(body);
      if (response.status === 200) {
        console.log(response.data)
        setShowPinDetails(response?.data);
        setShowPin(true);
      }
      setErrormsg(null);
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} >
        <Container style={commonStyles.container}>
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
                commonStyles.gap16,
              ]}
            >
              <TouchableOpacity onPress={handleBack} style={[]}>
                <View>
                  <AntDesign
                    name="arrowleft"
                    size={s(22)}
                    color={NEW_COLOR.TEXT_BLACK}
                    style={{ marginTop: 3 }}
                  />
                </View>
              </TouchableOpacity>
              <ParagraphComponent
                text="Card"
                style={[
                  commonStyles.fs16,
                  commonStyles.textBlack,
                  commonStyles.fw800,
                ]}
              />
            </View>
            <TouchableOpacity onPress={fetchMyCardDetails}>
              <IconRefresh height={s(24)} width={s(24)} />
            </TouchableOpacity>
          </View>
          <View style={[commonStyles.mb43]} />
          {errormsg && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}
          <View>
            {cardsDetailsLoading ? (
              <Loadding contenthtml={CardViewtotal} />
            ) : (
              <>
                <ImageBackground source={require(".././../assets/images/cards/card-bgabstract.png")}
                  resizeMode="contain"
                  style={[styles.mt63, { height: isPad ? 270 : "auto" }]}
                >
                  <TouchableOpacity
                    style={[commonStyles.mxAuto, commonStyles.relative, styles.cardBg,]}
                    onPress={() => { spin.value = spin.value == 0 ? 1 : 0 }}
                    activeOpacity={1}
                  >
                    <Animated.View
                      style={[{ position: "absolute" }, frontStyle]}
                    >
                      <ImageBackground
                        source={{ uri: myCardsData?.logo }}
                        resizeMode={"cover"}
                        imageStyle={{ borderRadius: 24 }}
                        style={{ height: isPad ? 250 : Platform.OS === "ios" ? 184 : ms(184), width: isPad ? (WINDOW_WIDTH * 50) / 100 : (WINDOW_WIDTH * 75) / 100, padding: 16, position: "relative", borderRadius: 24 }}
                      >

                        <View style={[]}>
                          <View style={[commonStyles.mt16]}>
                            <ParagraphComponent
                              style={[
                                myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,
                                commonStyles.fs16,
                                commonStyles.fw500,
                              ]}
                              text={`${"**** **** **** ****"
                                }`}
                              numberOfLines={1}
                            />
                            <ParagraphComponent
                              style={[
                                commonStyles.fs16,
                                commonStyles.fw500,
                                { color: "rgba(255, 255, 255, 0.7)" },
                                myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,
                              ]}
                              text={decryptAES(myCardsData?.name) || ""}
                              numberOfLines={1}
                            />

                          </View>
                        </View>

                        <View style={{ marginTop: "auto" }}>
                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.alignCenter,
                              commonStyles.justifyContent,
                              commonStyles.gap16,
                            ]}
                          >
                            <View
                              style={[
                                styles.badge,
                                {
                                  backgroundColor:

                                    bargeColor[myCardsData?.state?.toLowerCase()] || NEW_COLOR.BG_CANCEL
                                },
                              ]}
                            >
                              <ParagraphComponent
                                style={[
                                  commonStyles.textAlwaysWhite,
                                  commonStyles.fs10,
                                  commonStyles.fw500,
                                  commonStyles?.toCapitalize,
                                  { marginBottom: 2 },
                                ]}
                                text={`${myCardsData?.state}`}
                                numberOfLines={1}
                              />
                            </View>
                            <View>
                              <ParagraphComponent
                                style={[myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textBlack, commonStyles.fs12,]}
                                text="CVV"
                              />
                              <ParagraphComponent
                                style={[
                                  commonStyles.textAlwaysWhite,
                                  commonStyles.fw500,
                                  commonStyles.fs14,
                                  myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,
                                ]}
                                text={"****"}
                              />
                            </View>
                            <View>
                              <ParagraphComponent
                                style={[myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textBlack, commonStyles.fs12]}
                                text="EXPIRY"
                              />
                              <ParagraphComponent
                                style={[

                                  commonStyles.fw500,
                                  commonStyles.fs14,
                                  myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,
                                ]}
                                text={"XX/XX"}
                              />
                            </View>
                          </View>
                        </View>

                      </ImageBackground>
                    </Animated.View>
                    <Animated.View
                      style={[{ backfaceVisibility: "hidden" }, backStyle]}
                    >
                      <ImageBackground
                        source={{ uri: myCardsData?.logo }}
                        resizeMode={"cover"}
                        imageStyle={{ borderRadius: 24 }}
                        style={{ height: isPad ? 250 : Platform.OS === "ios" ? 184 : ms(184), width: isPad ? (WINDOW_WIDTH * 50) / 100 : (WINDOW_WIDTH * 75) / 100, padding: 16, position: "relative", borderRadius: 24 }}
                      >

                        <View
                          style={[]}
                        >

                          <View style={[commonStyles.mt16]}>
                            <ParagraphComponent
                              style={[
                                myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,
                                commonStyles.fs16,
                                commonStyles.fw500,
                              ]}
                              text={`${convertCardNumberWithSpace(decryptAES(myCardsData?.number))
                                }`}
                              numberOfLines={1}
                            />
                            <ParagraphComponent
                              style={[
                                commonStyles.fs16,
                                commonStyles.fw500,

                                myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,

                              ]}
                              text={decryptAES(myCardsData?.name) || ""}
                              numberOfLines={1}
                            />

                          </View>
                        </View>

                        <View style={{ marginTop: "auto" }}>

                          <View
                            style={[
                              commonStyles.dflex,
                              commonStyles.alignCenter,
                              commonStyles.justifyContent,
                              commonStyles.gap16,
                            ]}
                          >

                            <View
                              style={[styles.badge, { backgroundColor: bargeColor[myCardsData?.state?.toLowerCase()] || NEW_COLOR.BG_CANCEL }]}>
                              <ParagraphComponent
                                style={[
                                  commonStyles.textAlwaysWhite,
                                  commonStyles.fs10,
                                  commonStyles.fw500,
                                  commonStyles?.toCapitalize,
                                  { marginBottom: 2 },
                                ]}
                                text={`${myCardsData?.state}`}
                                numberOfLines={1}
                              />
                            </View>
                            <View>
                              <ParagraphComponent
                                style={[myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textBlack, commonStyles.fs12]}
                                text="CVV"
                              />
                              <ParagraphComponent

                                style={[
                                  myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,
                                  commonStyles.fw500,
                                  commonStyles.fs14,
                                ]}
                                text={decryptAES(myCardsData?.cvv) || ""}
                              />
                            </View>
                            <View>
                              <ParagraphComponent
                                style={[myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textBlack, commonStyles.fs12]}
                                text="EXPIRY"
                              />
                              <ParagraphComponent
                                style={[
                                  myCardsData?.colorCode ? { color: myCardsData?.colorCode } : commonStyles.textAlwaysWhite,
                                  commonStyles.fw500,
                                  commonStyles.fs14,
                                ]}
                                text={convertExpiry(decryptAES(myCardsData?.expireDate)) || ""}
                              />
                            </View>
                          </View>
                        </View>

                      </ImageBackground>
                    </Animated.View>
                  </TouchableOpacity>
                </ImageBackground>


                <ImageBackground imageStyle={{ minHeight: isPad ? 210 : (WINDOW_WIDTH * 30) / 100, }} source={require('../../assets/images/cards/hand-bg.png')} style={{ minHeight: isPad ? 210 : (WINDOW_WIDTH * 34) / 100, }} resizeMode="contain">
                  <View style={[commonStyles.flex1, commonStyles.relative]}>
                    <View style={[isPad ? commonStyles.mt30 : commonStyles.mt10]}>
                      <ParagraphComponent
                        style={[
                          commonStyles.fs24,
                          commonStyles.fw600,
                          commonStyles.textBlack,
                          commonStyles.textCenter
                        ]}
                        text={formatCurrency(myCardsData?.amount || 0, 2)}
                        numberOfLines={1}
                      />
                      <ParagraphComponent
                        style={[
                          commonStyles.fs12,
                          commonStyles.fw300,
                          commonStyles.textLightGrey,
                          commonStyles.textCenter
                        ]}
                        text={`Card Balance (${myCardsData.cardcurrency})`}
                      />
                    </View>
                    <View style={[commonStyles.hLine, commonStyles.mxAuto, commonStyles.mt16, commonStyles.mb10, { width: isPad ? 500 : "90%" }]} />
                    <View style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.flex1, { width: isPad ? (WINDOW_WIDTH * 48) / 100 : "70%", }, commonStyles.mxAuto,]}>
                      <ParagraphComponent
                        style={[
                          commonStyles.fs14,
                          commonStyles.fw500,
                          commonStyles.textGrey, commonStyles.textCenter,
                        ]}
                        text={"Card Name"}
                      />
                      <ParagraphComponent
                        style={[
                          isPad ? commonStyles.fs14 : commonStyles.fs12,
                          commonStyles.fw500,
                          commonStyles.textBlack,
                          styles.ml8, { marginTop: 2 }
                        ]}
                        text={decryptAES(myCardsData?.cardName) || ""}
                        children={
                          <ParagraphComponent
                            style={[
                              isPad ? commonStyles.fs14 : commonStyles.fs12,
                              commonStyles.fw500,
                              commonStyles.textBlack, commonStyles.flex1
                            ]}
                            text={` (${myCardsData.type})`}
                          />
                        }
                      />
                    </View>

                  </View>
                  <Image style={{ position: "absolute", left: isPad ? "18%" : s(15), top: isPad ? 50 : s(30), height: s(30) }} resizeMode="contain" source={require('../../assets/images/cards/handimg.png')} />

                </ImageBackground>
                <View style={[commonStyles.mb24]} />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleDeposit}
                  disabled={myCardsData?.state !== "Approved"}
                  style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, styles.depositbtn, commonStyles.justifyCenter, commonStyles.mxAuto]}
                >

                  <ParagraphComponent
                    style={[
                      commonStyles.fs16,
                      commonStyles.fw600, commonStyles.textBlack,
                      { marginBottom: 3, opacity: myCardsData?.state !== "Approved" ? 0.6 : 1, },
                    ]}
                    text="Deposit Amount"
                  />
                  <AntDesign
                    name="arrowright"
                    color={NEW_COLOR.TEXT_BLACK}
                    size={s(16)} />
                </TouchableOpacity>

                <View style={[commonStyles.mb24]} />
                <View style={[styles.warning, commonStyles.p16, commonStyles.dflex, commonStyles.gap10]}>
                  <AntDesign name="warning" size={s(16)} color={NEW_COLOR.TEXT_ERROR} style={{ marginTop: 8 }} />
                  <ParagraphComponent
                    style={[commonStyles.fs10, commonStyles.fw600, commonStyles.textBlack, commonStyles.flex1, { color: NEW_COLOR.TEXT_ERROR }]}
                    text="Using this card, any online transaction OTP will be sent as an app notification. Please continue with the transaction using any text or email OTP received during the payment process."
                  />
                </View>
                <View style={[commonStyles.mb24]} />
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justify]}>
                  <ParagraphComponent
                    style={[
                      commonStyles.fs16,
                      commonStyles.textBlack,
                      commonStyles.fw700,
                    ]}
                    text="Card Service"
                  />

                </View>
                <View style={commonStyles.mb16} />
                <View>
                  <View
                    style={[
                      commonStyles.dflex,
                      commonStyles.justifyCenter,
                      commonStyles.gap16,
                      styles.flexWrap,
                    ]}
                  >
                    <TouchableOpacity onPress={handleCardRecords}>
                      <ImageBackground style={{ minWidth: 115, minHeight: ms(115) }} resizeMode="contain" source={require("../../assets/images/cards/card-bg.png")}>
                        <View
                          style={[
                            commonStyles.mxAuto,
                            { width: (WINDOW_WIDTH * 20) / 100 }, styles.serviceCircle
                          ]}
                        >
                          <View>
                            <View >
                              <Record
                                height={34}
                                width={34}
                                style={[commonStyles.mxAuto]}
                              />
                            </View>
                            <ParagraphComponent
                              text="Record"
                              style={[
                                commonStyles.fs14,
                                commonStyles.fw500,
                                commonStyles.textGrey,
                                commonStyles.textCenter,
                                styles.mt8,
                              ]}
                              numberOfLines={1}
                            />
                          </View>
                        </View>
                      </ImageBackground>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleFlipcard}>
                      <ImageBackground style={{ minWidth: 115, minHeight: ms(115), }} resizeMode="contain" source={require("../../assets/images/cards/card-bg.png")}>
                        <View
                          style={[
                            commonStyles.mxAuto, styles.serviceCircle,
                            { width: (WINDOW_WIDTH * 20) / 100, marginTop: isPad ? 24 : 0 },
                          ]}
                        >
                          <View >
                            <View>
                              <Feather name="info" size={28} color={NEW_COLOR.TEXT_BLACK} style={[commonStyles.mxAuto]} />
                            </View>

                            <ParagraphComponent
                              text="Card Info"
                              style={[
                                commonStyles.fs12,
                                commonStyles.fw500,
                                commonStyles.textGrey,
                                commonStyles.textCenter,
                                styles.mt4, { marginTop: isPad ? 10 : 6 }
                              ]}
                              numberOfLines={2}
                            />
                          </View>
                        </View></ImageBackground>
                    </TouchableOpacity>


                    <TouchableOpacity
                      disabled={
                        myCardsData?.state !== "Approved" &&
                        myCardsData?.state !== "Freezed"
                      }
                      onPress={handleCardFreezUnFreeze}
                    >
                      <ImageBackground style={{ minWidth: 115, minHeight: ms(115) }} resizeMode="contain" source={require("../../assets/images/cards/card-bg.png")}>
                        <View
                          style={[
                            commonStyles.mxAuto, styles.serviceCircle,
                            {
                              width: (WINDOW_WIDTH * 20) / 100,
                              opacity:
                                myCardsData?.state !== "Approved" &&
                                  myCardsData?.state !== "Freezed"
                                  ? 0.6
                                  : 1, top: isPad ? 20 : 0
                            },

                          ]}
                        >
                          <View style={[commonStyles.flex1]}>
                            <View >
                              <CardFreeze
                                height={34}
                                width={34}
                                style={commonStyles.mxAuto}
                              />
                            </View>
                            <ParagraphComponent
                              text="Freeze/Unfreeze"
                              style={[
                                commonStyles.fs12,
                                commonStyles.fw500,
                                commonStyles.textGrey,
                                commonStyles.textCenter,
                                { width: "100%" }
                              ]}
                              numberOfLines={2}
                            />
                          </View>
                        </View></ImageBackground>
                    </TouchableOpacity>


                    {myCardsData?.type === "Physical" && (
                      <>

                        <TouchableOpacity
                          disabled={myCardsData?.state !== "Approved"}
                          onPress={getCardPin}
                        >
                          <ImageBackground style={{ minWidth: 115, minHeight: ms(115) }} resizeMode="contain" source={require("../../assets/images/cards/card-bg.png")}>
                            <View
                              style={[
                                commonStyles.mxAuto,
                                {
                                  width: (WINDOW_WIDTH * 20) / 100,
                                  opacity:
                                    myCardsData?.state !== "Approved" ? 0.6 : 1,
                                }, styles.serviceCircle
                              ]}
                            >
                              <View>
                                <View >
                                  <ResendPin
                                    height={34}
                                    width={34}
                                    style={commonStyles.mxAuto}
                                  />
                                </View>
                                <ParagraphComponent
                                  text="Show Pin"
                                  style={[
                                    commonStyles.fs14,
                                    commonStyles.fw500,
                                    commonStyles.textGrey,
                                    commonStyles.textCenter,
                                    styles.mt8,
                                  ]}
                                />
                              </View>
                            </View></ImageBackground>
                        </TouchableOpacity>


                      </>
                    )}
                  </View>

                </View>
              </>
            )}
          </View>
          <View style={[commonStyles.mb43]} />
        </Container>
      </ScrollView>
      {infoModelVisible && <CradDetailsInfo updatemodelvisible={() => { setInfoModelVisible(false) }} productId={myCardsData?.productId} />}
      {(isShowPin && showPinDetails?.isQR) && <ChiperCardPin cardId={props?.route?.params?.cardId} close={() => setShowPin(false)} showPinDetails={showPinDetails} />}
      {(isShowPin && showPinDetails?.isQR === false) && <CardPin cardId={props?.route?.params?.cardId} close={() => setShowPin(false)} showPinDetails={showPinDetails} />}
      {((userInfo?.accountStatus === "Inactive") && isPressed) && <AccountDeactivatePopup isVisible={((userInfo?.accountStatus === "Inactive") && isPressed)} handleClose={handleCloseMFAPopUp} />}

    </SafeAreaView >

  );
});

export default CardDetails;
const themedStyles = StyleService.create({
  warning: {
    backgroundColor: NEW_COLOR.WARNING_BG, borderRadius: 10,
  },
  depositbtn: {
    backgroundColor: NEW_COLOR.HOME_MENU_BG,
    paddingVertical: 10, paddingHorizontal: s(24),
    borderRadius: isPad ? s(19) : 19,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 100,
  },
  flexWrap: {
    flexWrap: "wrap",
  },
  cardBg: {
    minHeight: s(190),
    borderRadius: 32,
    top: -30,
  },
  mb24: {
    marginBottom: 24,
  },
  mxAuto: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  serviceCircle: {
    marginLeft: "auto",
    marginRight: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 110
  },
  mt4: {
    marginTop: 4,
  },
  mt8: {
    marginTop: 8,
  },
  mt63: {
    marginTop: 40,
  },
  ml8: {
    marginLeft: 8,
  }

});
