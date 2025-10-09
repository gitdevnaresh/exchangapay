import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Platform, Alert, BackHandler } from "react-native";
import { StyleService, useStyleSheet, TopNavigation } from "@ui-kitten/components";
import { s } from "../../constants/theme/scale";
import { NEW_COLOR } from "../../constants/theme/variables";
import Ionicons from "react-native-vector-icons/Ionicons";
import NewCard from "../Tlv_Cards/NewCard";
import Crypto from "./Crypto";
import { useSelector, useDispatch } from "react-redux";
import { TouchableWebElement } from "@ui-kitten/components/devsupport";
import { commonStyles } from "../../components/CommonStyles";
import { BellIcon, LogoxWhite } from "../../assets/svg";
import CryptoCardsTransaction from "../Crypto/cryptoCardTransations/CryptoCardsTransaction";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import NotifyAlerts from "./notifyAlerts";
import { DASHBOARD_CONSTANTS } from "./constants";
import CommonPopup from "../../components/commonPopup";
import useEncryptDecrypt from "../../hooks/useEncryption_Decryption";
import DraggableChatIcon from "../Chatbot/chatIcon";
import messaging from "@react-native-firebase/messaging";
import { updateChatCount } from "../../redux/Actions/UserActions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = (props: any) => {
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const noiffCount = useSelector((state: any) => state.UserReducer?.notificationCount);
  const supportMessageCount = useSelector((state: any) => state.UserReducer?.supportMessgaeCount);
  const dispatch = useDispatch();
  const styles = useStyleSheet(themedStyles);
  const Tab = createBottomTabNavigator();
  const { decryptAES } = useEncryptDecrypt();
  const [state, setState] = useState<any>({
    index: props.route?.params?.tabIndex || 0,
    routes: [
      { key: DASHBOARD_CONSTANTS?.FIRST, title: DASHBOARD_CONSTANTS?.HOME, icon: DASHBOARD_CONSTANTS?.ICON_HOME, component: Crypto },
      { key: DASHBOARD_CONSTANTS?.SECOND, title: DASHBOARD_CONSTANTS?.CARDS, icon: DASHBOARD_CONSTANTS?.EXCHANGE, component: NewCard },
      { key: DASHBOARD_CONSTANTS?.THIRD, title: DASHBOARD_CONSTANTS?.TRANSACTIONS, icon: DASHBOARD_CONSTANTS?.TRANSACTION, component: CryptoCardsTransaction }
    ],
  });
  const [isAccountpopupVisible, setIsAccountPopupVisible] = useState<boolean>(false);

  // Effect to handle foreground notifications
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (remoteMessage?.notification?.title === "Support Chat") {
        // Increment the count in Redux store
        dispatch(updateChatCount(supportMessageCount + 1));
      }
    });

    return unsubscribe;
  }, [supportMessageCount, dispatch]);

  // Effect to sync count from keychain on app start
 useEffect(() => {
  const syncBackgroundCount = async () => {
    try {
      const storedCount = await AsyncStorage.getItem('supportMessageCount');
      const backgroundCount = storedCount ? parseInt(storedCount, 10) : 0;
      if (backgroundCount > 0) {
        // Add background count to the current Redux count and reset AsyncStorage
        dispatch(updateChatCount(supportMessageCount + backgroundCount));
        await AsyncStorage.setItem('supportMessageCount', '0');
      }
    } catch (error) {
    }
  };

  syncBackgroundCount();
}, [dispatch]);

 


  useEffect(() => {
    if (props.route.params && props.route.params.tabIndex && props.route.params.tabIndex !== state.index) {
      setState({ ...state, index: props.route.params.tabIndex })
    }
  }, [props.route.params]);

  useEffect(() => {
    const backHandler = () => {
      if (state.index === 0) {
        Alert.alert(
          DASHBOARD_CONSTANTS?.EXIT_APP_TITLE,
          DASHBOARD_CONSTANTS?.EXIT_APP_MESSAGE,
          [
            { text: DASHBOARD_CONSTANTS?.NO, style: 'cancel' },
            { text: DASHBOARD_CONSTANTS?.YES, onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true;
      }
      return false;
    };



    BackHandler.addEventListener('hardwareBackPress', backHandler);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, [state?.index]);

  useEffect(() => {
    if (!props?.route?.params?.isUserUpdate && userInfo) {
      const isFirstNameEmpty = decryptAES(userInfo.firstName) === "" || decryptAES(userInfo.firstName) === null;
      if (isFirstNameEmpty) {
        setIsAccountPopupVisible(true);
      } else {
        setIsAccountPopupVisible(false);
      }
    }
  }, [userInfo]);

  const handleDrawer = () => {
    props.navigation.navigate(DASHBOARD_CONSTANTS?.DRAWER_MODAL)
  };

  const handleNotifications = () => {
    props.navigation.navigate(DASHBOARD_CONSTANTS?.NOTIFICATIONS);
  };


  const handleGetStarted = () => {
    props.navigation.navigate("addUserDetails");
    setIsAccountPopupVisible(false);
  };

  return (
    <>
      <View>
        <View style={[commonStyles.screenBg, commonStyles.px16]}>
          {state.index === 0 && <>
            <View style={[userInfo?.accountStatus === DASHBOARD_CONSTANTS?.INACTIVE && Platform.OS === "android" ? commonStyles.mb10 : commonStyles.mb32]} />
            <TopNavigation style={{ padding: 0, backgroundColor: "transparent" }}
              accessoryLeft={(): TouchableWebElement =>
                <View>
                  <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}>
                    <View>
                      <LogoxWhite width={s(26)} height={s(24)} />
                    </View>
                    <ParagraphComponent text={DASHBOARD_CONSTANTS?.EXCHANGA_PAY} style={[commonStyles.fs22, commonStyles.fw700, commonStyles.textLogo, { marginTop: -4 }]} />
                  </View>
                </View>
              }
              accessoryRight={(): TouchableWebElement =>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                  <TouchableOpacity activeOpacity={0.7} onPress={handleNotifications} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                    <View style={[commonStyles.relative]}>
                      <BellIcon height={s(22)} width={s(22)} />
                      {noiffCount > 0 && <View style={[styles.notifyBg]}>
                        <ParagraphComponent text={noiffCount} style={[commonStyles.fs8, commonStyles.fw500, commonStyles.textAlwaysWhite, { marginBottom: 1 }]} />
                      </View>}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDrawer} style={[styles.dashedBorder]}>
                    <Image
                      style={styles.profile}
                      resizeMode="cover"
                      source={
                        userInfo?.imageURL
                          ? { uri: userInfo.imageURL }
                          : require("../../assets/images/profile/avathar.png")
                      }

                    />
                  </TouchableOpacity>
                </View>

              }
            /></>}
        </View>
      </View>

      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === DASHBOARD_CONSTANTS?.HOME) {
              iconName = focused
                ? DASHBOARD_CONSTANTS?.ICON_HOME
                : DASHBOARD_CONSTANTS?.ICON_HOME_OUTLINE;
            } else if (route.name === 'Settings') {
              iconName = focused ? 'ios-list' : 'ios-list-outline';
            }
            if (route.name === 'Cards') {
              iconName = focused
                ? 'card'
                : 'card-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'ios-list' : 'ios-list-outline';
            }
            if (route.name === 'Transactions') {
              iconName = 'swap-horizontal'

            } else if (route.name === 'Settings') {
              iconName = focused ? 'ios-list' : 'ios-list-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: NEW_COLOR.BG_ORANGE,
          tabBarInactiveTintColor: NEW_COLOR.TEXT_LIGHTGREY,
          tabBarActiveBackgroundColor: NEW_COLOR.HOME_MENU_BG,
          tabBarInactiveBackgroundColor: NEW_COLOR.HOME_MENU_BG,
          tabBarItemStyle: { paddingVertical: 4, borderEndWidth: route.name !== 'Transactions' ? 0.7 : 0, borderEndColor: route.name !== 'Transactions' ? NEW_COLOR.BG_BLACK : "transparent", marginBottom: Platform.OS === "ios" ? 0 : 10, marginTop: 10 },
          tabBarStyle: { borderTopWidth: 0, borderBottomWidth: 0, height: Platform.OS === "ios" ? 90 : 70, backgroundColor: NEW_COLOR.HOME_MENU_BG },

        })}
      >
        <Tab.Screen name={DASHBOARD_CONSTANTS?.HOME} component={Crypto} />
        <Tab.Screen name={DASHBOARD_CONSTANTS?.CARDS} component={NewCard} />
        <Tab.Screen name={DASHBOARD_CONSTANTS?.TRANSACTIONS} component={CryptoCardsTransaction} />
      </Tab.Navigator>
      <DraggableChatIcon count={supportMessageCount} />

      {userInfo?.isCustomerUpdated && <NotifyAlerts customerId={""} />}
      {isAccountpopupVisible && (
        <CommonPopup
          isVisible={isAccountpopupVisible}
          isBackdropPressAllowed={false}
          handleClose={() => setIsAccountPopupVisible(false)}
          title="Account Created"
          backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}

          content={
            <ParagraphComponent
              style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textpara, commonStyles.textCenter]}
              text="You're all set to begin! In Just a few taps, complete your profile."
            />
          }
          buttonName="Get Started"
          onButtonPress={handleGetStarted}
        />
      )}
    </>
  );
};
export default Dashboard;
const themedStyles = StyleService.create({
  notifyBg: {
    backgroundColor: NEW_COLOR.NOTIFiCATIONS_BG,
    borderRadius: 100 / 2, position: "absolute",
    minWidth: 16, minHeight: 16, paddingVertical: 2,
    paddingHorizontal: s(4), right: -3, top: -6, flexDirection: "row",
    justifyContent: "center", alignItems: "center"
  },
  dashedBorder: {
    padding: 4,
    borderRadius: s(50) / 2,
    borderWidth: 1, borderColor: NEW_COLOR.PROFILE_BORDER,
    borderStyle: "dashed"
  },
  mt43: {
    marginTop: 43
  },
  profile: {
    width: s(36),
    height: s(36),
    borderRadius: s(36) / 2,
  },
  container: {
    padding: 16,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
  },
  topButtons: {
    flexDirection: "row",
  },
  pb0: {
    paddingBottom: 0,
  },
});
