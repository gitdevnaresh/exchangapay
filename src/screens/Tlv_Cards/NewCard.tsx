import React, { useEffect, useState, FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, ScrollView, TouchableOpacity, Image, ImageBackground, SafeAreaView, BackHandler, RefreshControl } from "react-native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/navigation-types";
import { CardsHomeBalance } from "../cards/CardsSkeleton_views";
import { getMycards } from "../../store/card/thunk";
import { useIsFocused } from "@react-navigation/native";
import { isErrorDispaly } from "../../utils/helpers";
import ErrorComponent from "../../components/Error";
import Loadding from "../../components/skeleton";
import "moment-timezone";
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { ms, s } from "../../constants/theme/scale";
import { commonStyles } from "../../components/CommonStyles";
import { ChevronRight, FeedBack, QuickLink, Record } from "../../assets/svg";
import CardsModuleService from "../../services/card";
import NoDataComponent from "../../components/nodata";
import { setNotificationCount } from "../../redux/Actions/UserActions";
import NotificationModuleService from "../../services/notification";
import AccountDeactivatePopup from "../Currencypop/actDeactivatePopup";

type NewCard = NativeStackScreenProps<RootStackParamList, "NewCard">;
const NewCard: FC<NewCard> = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const cardsHomeBalanceLoader = CardsHomeBalance();
  const [refreshing, setRefreshing] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [errormsg, setErrormsg] = useState("");
  const [myCardsData, setMyCardsData] = useState<any>([]);
  const [topCardsLoading, setTopCardsLoading] = useState(false);
  const [topCardsData, setTopCardsData] = useState<any>([]);
  const [allCustomerCount, setAllCustomerCount] = useState<any>({});
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);


  const isFocused = useIsFocused();
  useEffect(() => {
    fetchMyCards();
    fetchgetAvilableCards();
    fetchAllCustomerCradsCount();
    getAllNotificationCount()
  }, [isFocused]);
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
  const getAllNotificationCount = async () => {
    const res = await NotificationModuleService.getAllNotificationCount();
    if (res.status === 200) {
      dispatch(setNotificationCount(res.data));
    }
  };
  function onRefresh(): void {
    fetchMyCards();
    fetchgetAvilableCards();
    fetchAllCustomerCradsCount();
    setRefreshing(true);
  }
  const handleGetCardsById = (val: any) => {
    if (val.status === "Pending") {
      props.navigation.push("CardSuccess", {
        cardId: val?.id,
      });
    }
    else if (val.status === 'Reviewing') {
      props.navigation.push("ApplicatoionReview", {
        cardId: val?.id
      })
    } else {
      props.navigation.navigate("CardDetails", {
        cardId: val?.id,
        isCardBlock: val?.isCardBlock,
        from: "Dashboard"
      });
    }
  };

  const handleApplyCardById = (val: any) => {
    props.navigation.navigate("ApplyCard", {
      cardId: val?.id,
      logo: val?.logo,
      isCardBlock: val?.isCardBlock,
    });
  };
  const handleCloseMFAPopUp = () => {
    setIsPressed(false)
  };
  const fetchMyCards = async () => {
    try {
      setCardsLoading(true);
      const response: any = await getMycards();
      if (response.ok && response.data && Array.isArray(response.data)) {
        setRefreshing(false);
        setMyCardsData(response.data);
        setCardsLoading(false);
      } else {
        setErrormsg(isErrorDispaly(response));
        setCardsLoading(false);
      }
    } catch (error) {
      setRefreshing(false);
      setErrormsg(isErrorDispaly(error));
      setCardsLoading(false);
    }
  };
  const fetchgetAvilableCards = async () => {
    try {
      setTopCardsLoading(true);
      const response: any = await CardsModuleService?.getAvilableCards();
      if (response.ok && response.data && Array.isArray(response.data)) {
        setTopCardsData(response.data);
        setRefreshing(false);
      } else {
        setErrormsg(isErrorDispaly(response));
        setTopCardsLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      setRefreshing(false);
      setErrormsg(isErrorDispaly(error));
    } finally {
      setTopCardsLoading(false);
      setRefreshing(false);
    }
  };
  const fetchAllCustomerCradsCount = async () => {
    try {
      setTopCardsLoading(true);
      const response: any = await CardsModuleService?.getCustomerCradsCount();
      if (response.ok && response.data) {
        setAllCustomerCount(response.data);
        setRefreshing(false);
      } else {
        setErrormsg(isErrorDispaly(response));
        setRefreshing(false);
        setTopCardsLoading(false);
      }
    } catch (error) {
      setRefreshing(false);
      setErrormsg(isErrorDispaly(error));
    } finally {
      setRefreshing(false);
      setTopCardsLoading(false);
    }
  };

  const myCradsHandlePress = () => {
    props.navigation.push("ViewallMyCards");
  };
  const allCardsHandlePress = () => {
    props.navigation.push("AllNewCards");
  };

  const handleGoBack = () => {
    props.navigation.push('Dashboard', { screen: 'Home' });
  };
  const handleFeedback = () => {
    props.navigation.push("Feedback", {
      isFlag: true,
    });
  };
  const handleQuickLink = () => {
    if (userInfo.accountStatus === "Inactive") {
      setIsPressed(true);
    } else {
      props.navigation.push("QuickCardsList", {
        isFlag: true,
      });
    }
  };
  const StatusColors = {
    approved: NEW_COLOR.BG_GREEN,
    suspended: NEW_COLOR.BG_RED,
    pending: NEW_COLOR.BG_YELLOW,
    rejected: NEW_COLOR.BG_RED,
    failed: NEW_COLOR.BG_RED,
    cancelled: NEW_COLOR.BG_RED,
    freeze: NEW_COLOR.BORDER_GREY,
    "freeze pending": NEW_COLOR.BG_YELLOW,
    "unfreeze pending": NEW_COLOR.BG_YELLOW,
    "under maintenance": NEW_COLOR.TEXT_ORANGE,
    "reviewing": NEW_COLOR.TEXT_ORANGE,
  };

  const handleCloseError = () => {
    setErrormsg("");
  };
  const handlePersonalInfo = () => {
    props.navigation.navigate("addressesList", {
      returnScreen: "Dashboard",
      returnParams: { screen: 'Cards' },
    })
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
            {(cardsLoading || topCardsLoading) && (
              <Loadding contenthtml={cardsHomeBalanceLoader} />
            )}
            {cardsLoading || (
              <>
                {errormsg && (<ErrorComponent message={errormsg} onClose={handleCloseError} />)}
                <ParagraphComponent text="Card Service" style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textBlack, commonStyles.mb10, { marginLeft: 10 }]} />
                <View style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap10]}>
                  <TouchableOpacity onPress={handlePersonalInfo} style={[]} activeOpacity={0.6}>
                    <ImageBackground style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minWidth: (WINDOW_WIDTH * 26) / 100, minHeight: (WINDOW_WIDTH * 24) / 100, padding: 12 }]} resizeMode="contain" source={require("../../assets/images/cards/card-bg.png")}>
                      <View style={[commonStyles.flex1]}>
                        <Record height={s(28)} width={s(28)} style={[commonStyles.mxAuto, commonStyles.mb4]} />
                        <ParagraphComponent text="Address" style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter]} />
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleQuickLink} activeOpacity={0.6} >
                    <ImageBackground style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minWidth: (WINDOW_WIDTH * 26) / 100, minHeight: (WINDOW_WIDTH * 24) / 100, padding: 12 }]} resizeMode="contain" source={require("../../assets/images/cards/card-bg.png")}>
                      <View style={[commonStyles.flex1]}>
                        <QuickLink height={s(28)} width={s(28)} style={[commonStyles.mxAuto, commonStyles.mb4]} />
                        <ParagraphComponent text="Quick Link" style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter]} />
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleFeedback} activeOpacity={0.6}>
                    <ImageBackground style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { minWidth: (WINDOW_WIDTH * 26) / 100, minHeight: (WINDOW_WIDTH * 24) / 100, padding: 12 }]} resizeMode="contain" source={require("../../assets/images/cards/card-bg.png")}>
                      <View style={[commonStyles.flex1]}>
                        <FeedBack height={s(28)} width={s(28)} style={[commonStyles.mxAuto, commonStyles.mb4]} />
                        <ParagraphComponent text="Feedback" style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter]} />
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                </View>
                <View style={[commonStyles.mb24]} />
                <View
                  style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justify, commonStyles.px10]}  >
                  <ParagraphComponent text="Mine" style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textBlack]} />
                  {myCardsData &&
                    myCardsData?.length >= 0 && <TouchableOpacity onPress={myCradsHandlePress} activeOpacity={0.8}>
                      <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]} >
                        <AntDesign style={styles.arrowRotate} name="arrowup" size={14} color={NEW_COLOR.TEXT_ORANGE} />
                        <ParagraphComponent text={`All (${allCustomerCount?.myCardscount})`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textOrange]} />
                      </View>
                    </TouchableOpacity>}
                </View>
                <View style={[commonStyles.mb10]} />
                <View style={[commonStyles.gap16]}>
                  {myCardsData &&
                    myCardsData?.length > 0 &&
                    myCardsData.map((item: any, i: any) => {
                      return (
                        <TouchableOpacity onPress={() => handleGetCardsById(item)} activeOpacity={0.7} key={i} >
                          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.flex1, styles.sectionStyle, commonStyles.relative, { paddingTop: 22 }]} >
                            <View style={[commonStyles.relative, { marginRight: 6 }]}>
                              <Image style={[styles.cardRotate]} source={{ uri: item?.logo }} />
                            </View>
                            <View style={commonStyles.flex1}>
                              <ParagraphComponent style={[commonStyles.textBlack, commonStyles.fs14, commonStyles.fw600, commonStyles.mb8]} text={`${item?.cardName}`} numberOfLines={1} />
                              <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.mb8,]} text={`${item?.supportedFlatforms || ''}`} numberOfLines={2} />
                            </View>
                            <ChevronRight />
                            <View style={[styles.badgeStyle, { backgroundColor: StatusColors[item?.status?.toLowerCase()] || NEW_COLOR.BG_CANCEL }]}>
                              <ParagraphComponent style={[commonStyles.fw600, commonStyles?.toCapitalize, commonStyles.textAlwaysWhite, { marginBottom: 2, fontSize: 8 }]} text={item?.status} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  {(!myCardsData || myCardsData?.length === 0) && (
                    <NoDataComponent />
                  )}
                </View>
                <View style={[commonStyles.mb24]} />
                <View
                  style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16, commonStyles.justify, commonStyles.px10]} >
                  <ParagraphComponent text="New Card" style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textBlack]} />
                  {topCardsData?.length > 0 && <TouchableOpacity activeOpacity={0.8} onPress={allCardsHandlePress}>
                    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]} >
                      <AntDesign style={styles.arrowRotate} name="arrowup" size={14} color={NEW_COLOR.TEXT_ORANGE} />
                      <ParagraphComponent text={`All (${allCustomerCount?.cardscount})`} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textOrange]} />
                    </View>
                  </TouchableOpacity>}
                </View>

                <View style={[commonStyles.mb10]} />
                <View style={[commonStyles.gap16]}>
                  {topCardsData &&
                    topCardsData?.length > 0 &&
                    topCardsData.map((item: any, i: any) => {
                      return (
                        <TouchableOpacity onPress={() => handleApplyCardById(item)} activeOpacity={0.7} key={i} >
                          <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12, commonStyles.flex1, styles.sectionStyle]} >
                            <View style={[commonStyles.relative, { marginRight: 6 }]}>
                              <Image style={[styles.cardRotate]} source={{ uri: item?.logo }} />
                            </View>
                            <View style={commonStyles.flex1}>
                              <ParagraphComponent style={[commonStyles.textBlack, commonStyles.fs14, commonStyles.fw600, commonStyles.mb8]} text={item?.name} numberOfLines={1} />
                              <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw500, commonStyles.textGrey, commonStyles.mb8]} text={`${item?.supportedFlatforms || ''}`} numberOfLines={2} />
                            </View>
                            <ChevronRight />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  {(!topCardsData || topCardsData?.length === 0) && (
                    <NoDataComponent />
                  )}
                </View>
              </>
            )}

            <View style={[commonStyles.mb16]} />
            <View style={[commonStyles.mb43]} />
            <View style={[commonStyles.mb43]} />

          </>
          {((userInfo?.accountStatus === "Inactive") && isPressed) && <AccountDeactivatePopup isVisible={((userInfo?.accountStatus === "Inactive") && isPressed)} handleClose={handleCloseMFAPopUp} />}
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
});

export default NewCard;

const themedStyles = StyleService.create({
  badgeStyle: {
    position: "absolute", top: 0, right: 20, paddingVertical: 2, paddingHorizontal: 12,
    borderBottomEndRadius: 12, borderBottomStartRadius: 12,
  },
  darkCircle: {
    backgroundColor: NEW_COLOR.DARK_BG,
    height: 50, width: 50, borderRadius: 50 / 2
  },
  cardRotate: {
    height: s(30),
    width: s(50), borderRadius: s(8)

  },
  serviceStyle: {

  },
  mt8: {
    marginTop: 8,
  },
  sectionStyle: {
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    padding: 16, gap: 16
  },
  rebate: {
    backgroundColor: NEW_COLOR.BTN_PINK,
    color: NEW_COLOR.TEXT_WHITE,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 10,
    transform: [{ rotate: "-90deg" }],
    position: "absolute",
    right: -3,
    bottom: "65%",
  },
  textGrey: {
    color: NEW_COLOR.TEXT_GREY,
  },
  cardSmall: {
    borderRadius: 12,
  },
  mb16: {
    marginBottom: 16,
  },
  arrowRotate: {
    transform: [{ rotate: "45deg" }],
  },
  mt14: {
    marginTop: 14,
  },
  mb24: {
    marginBottom: 24,
  },
  noData: {
    fontSize: ms(16),
    fontWeight: "400",
    color: NEW_COLOR.TEXT_GREY,
    marginTop: 22,
  },
  custNodata: {
    marginTop: 22,
    marginBottom: 80,
  },
  cAccount: {
    justifyContent: "center",
    alignItems: "center",
  },
});
