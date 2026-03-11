import React, { useCallback, useEffect, useState, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getTabsConfigation } from "../../configuration";
import { StyleService, TopNavigation } from "@ui-kitten/components";
import { s } from "../constants/theme/scale";
import { useDispatch, useSelector } from "react-redux";
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native";
import ImageUri from "../newComponents/imageComponents/image";
import CommonTouchableOpacity from "../newComponents/touchableComponents/touchableOpacity";
import ViewComponent from "../newComponents/view/view";
import TextMultiLangauge from "../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../hooks/useThemeColors";
import { CustomIcons, NotificationCountResponse, TabConfig } from "./constants";
import useEncryptDecrypt from "../hooks/encDecHook";
import Home from "../screens/Dashboard";
import ComingSoon from "../screens/commonScreens/comingSoon/comingSoon";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyCards from "../screens/cards/myCards";
import { cardsService } from "../apiServices/cardsApis/cardsApiServices";
import ChooseCard from "../screens/cards/applyCards/chooseCard/chooseCard";
import { getThemedCommonStyles } from "../assets/styles/CommonStyles";
import ParagraphComponent from "../newComponents/textComponets/paragraphText/paragraph";
import NotifyAlerts from "../screens/commonScreens/alertNotices/alertNotices";
import Hub from "../screens/Hub/hub";
import HubActiveIcon from "../assets/mainmenuicons/hubicon";
import HubInActiveIcon from "../assets/mainmenuicons/hubIconInactive";
import { setMyCardsInfo } from "../redux/actions/sendActions";
import Rewards from "../screens/rewards";
import ReferIcon from "../assets/mainmenuicons/referIcon";
import NotificationService from "../services/notificationService";
import Refer from "../screens/refer";
import { COMMON_SVG_URLS } from "../assets/blobUrls";
import CardIcon from "../assets/mainmenuicons/cardIcon";
import HomeIcon from "../assets/mainmenuicons/homeIcon";

export const DynamicTabs: React.FC = ({ route }: any) => {
  const tabs = getTabsConfigation("TABS")?.filter(
    (tab: TabConfig) => tab?.isDisplay
  );
  const initialTab =
    route?.params?.screen ?? route?.params?.initialTab ?? tabs[0]?.title;
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [notificationsCount, setNotificationsCount] = useState<number | null>(
    null
  );
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [currentTabComponent, setCurrentTabComponent] = useState(() => {
    const tab = tabs.find((t: TabConfig) => t.title === initialTab);
    return tab ? tab.componentName : tabs[0]?.componentName;
  });
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);
  const { decryptAES } = useEncryptDecrypt();
  const insets = useSafeAreaInsets();
  const [myCards, setMyCards] = useState<any[]>([]);
  const dispatch = useDispatch();

  const navigatedFromDrawerRef = useRef(false);
  const [blockTabFocusEffects, setBlockTabFocusEffects] = useState(false);
  useEffect(() => {
    if (blockTabFocusEffects) {
      const timer = setTimeout(() => {
        setBlockTabFocusEffects(false);
      }, 50);
      return () => clearTimeout(timer);
    }
    getMyCards();
  }, [blockTabFocusEffects]);

  const NotificationsCount = async () => {
    try {
      const response: NotificationCountResponse =
        await NotificationService.getAllNotificationCount();
      if (response?.ok) {
        setNotificationsCount(
          typeof response?.data === "number" ? response.data : null
        );
      } else {
        setNotificationsCount(null);
      }
    } catch (error) {
      setNotificationsCount(null);
    }
  };
  const Tab = createBottomTabNavigator();
  const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    _home: Home,
    _cards: myCards?.length > 0 ? MyCards : ChooseCard,
    _rewards: Rewards,
    _refer: Refer,
    _perks: () => <ComingSoon pageHeader={false} />,
    _hub: Hub,
  };
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", () => {
      if (navigatedFromDrawerRef.current) {
        navigatedFromDrawerRef.current = false;
        setBlockTabFocusEffects(true); // Signal tabs to block their effects
      } else {
        setBlockTabFocusEffects(false); // Ensure tabs fetch normally
        NotificationsCount();
      }
    });

    return unsubscribeFocus; // Cleanup the listener when the component unmounts
  }, [navigation, NotificationsCount]); // Dependencies for setting up the listener

  useEffect(() => {
    NotificationsCount();
  }, [navigation]);
  const handleProfileImagePress = useCallback(() => {
    navigatedFromDrawerRef.current = true; // Set flag to indicate the next focus is a return from drawer
    navigation.navigate("NewProfile", { userInfo: userInfo });
  }, [navigation, userInfo]);
  const handleNavigateNotifications = useCallback(() => {
    navigation.navigate("Notifications", {
      pageHeader: false,
      customHeader: {
        title: "Notifications",
        showBackButton: true,
      },
    });
  }, []);

  const getMyCards = async () => {
    try {
      let response: any = await cardsService.getMyCards(10, 1);
      if (response?.data) {
        const cards = response.data;
        setMyCards(cards);
        dispatch(setMyCardsInfo(cards));
      }
    } catch (error) {
    }
  }; 
  const titleName = userInfo?.isKYC
    ? ` ${decryptAES(userInfo?.firstName)} ${decryptAES(userInfo?.lastName)}`
    : "GLOBAL_CONSTANTS.USER";

  const customIcons: CustomIcons = {
    _home: {
      active: (
        <HomeIcon
          color={NEW_COLOR.TEXT_WHITE}
          style={[commonStyles.mxAuto]}
        />
      ),
      inactive: (
        <HomeIcon
          color={NEW_COLOR.ICON_GREY}
          style={[commonStyles.mxAuto]}
        />
      ),
    },
    _cards: {
      active: (
        <CardIcon
          color={NEW_COLOR.TEXT_WHITE}
          style={[commonStyles.mxAuto]}
        />
      ),
      inactive: (
        <CardIcon
          color={NEW_COLOR.ICON_GREY}
          style={[commonStyles.mxAuto]}
        />
      ),
    },
    _perks: {
      active: (
        <Ionicons
          name="gift-outline"
          size={24}
          color={NEW_COLOR.TEXT_WHITE}
          style={[commonStyles.mxAuto]}
        />
      ),
      inactive: (
        <Ionicons
          name="gift-outline"
          size={24}
          color={NEW_COLOR.ICON_GREY}
          style={[commonStyles.mxAuto]}
        />
      ),
    },
    _hub: {
      active: (
        <HubActiveIcon
          color={NEW_COLOR.TEXT_WHITE}
          style={[commonStyles.mxAuto]}
        />
      ),
      inactive: (
        <HubInActiveIcon
          color={NEW_COLOR.ICON_GREY}
          style={[commonStyles.mxAuto]}
        />
      ),
    },
    _rewards: {
      active: (
        <Ionicons
          name="gift-outline"
          size={24}
          color={NEW_COLOR.TEXT_WHITE}
          style={[commonStyles.mxAuto]}
        />
      ),
      inactive: (
        <Ionicons
          name="gift-outline"
          size={24}
          color={NEW_COLOR.ICON_GREY}
          style={[commonStyles.mxAuto]}
        />
      ),
    },
    _refer: {
      active: (
        <ReferIcon
          color={NEW_COLOR.TEXT_WHITE}
          style={[commonStyles.mxAuto]}
        />
      ),
      inactive: (
        <ReferIcon
          color={NEW_COLOR.ICON_GREY}
          style={[commonStyles.mxAuto]}
        />
      ),
    },
  };
  // TabBarIcon component moved outside DynamicTabs
  const TabBarIcon: React.FC<{
    focused: boolean;
    icon: { active: React.ReactNode; inactive: React.ReactNode };
  }> = ({ focused, icon }) => <>{focused ? icon.active : icon.inactive}</>;
  return (
    <ViewComponent
      style={[
        commonStyles.flex1,
        commonStyles.screenBg,
        currentTabComponent === "_home" && commonStyles.pt24,
      ]}
    >
      <ViewComponent style={[commonStyles.screenBg]}>
        {currentTabComponent === "_home" && (
          <ViewComponent style={[]}>
            <TopNavigation
              title={() => (
                <TextMultiLangauge
                  style={[
                    { width: s(200), marginLeft: s(-10) },
                    commonStyles.fs16,
                    commonStyles.fw400,
                    commonStyles.textlinkgrey,
                  ]}
                  text={"GLOBAL_CONSTANTS.HELLO_TITLE"}
                  numberOfLines={1}
                >
                  <TextMultiLangauge style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw400]} text={titleName} />
                </TextMultiLangauge>
              )}
              style={[
                {
                  backgroundColor: NEW_COLOR.SCREENBG_BLACK,
                  paddingHorizontal: s(24),
                },
              ]}
              accessoryLeft={() => (
                <ViewComponent
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.ml10,
                  ]}
                >
                  <CommonTouchableOpacity onPress={handleProfileImagePress}>
                    <ImageUri
                      style={styles.profile}
                      source={
                        userInfo?.imageURL
                          ? { uri: userInfo.imageURL }
                          : require("../assets/imageAssets/default.png")
                      }
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              )}
              accessoryRight={() => (
                <ViewComponent
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.gap16,
                  ]}
                >
                  <CommonTouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleNavigateNotifications()}
                  >
                    <ViewComponent
                      style={[commonStyles.relative, commonStyles.mr4]}
                    >
                      <ImageUri style={{ width: s(24), height: s(24) }} uri={COMMON_SVG_URLS.notificationIcon} />
                      {notificationsCount && (
                        <ViewComponent
                          style={[styles.redBg, { right: s(-8.5), top: s(-4) }]}
                        >
                          <ParagraphComponent
                            style={[
                              commonStyles.fs10,
                              commonStyles.fw400,
                              commonStyles.textAlwaysWhite,
                              commonStyles.textCenter,
                              { marginBottom: 1 },
                            ]}
                            text={notificationsCount}
                          />
                        </ViewComponent>
                      )}
                    </ViewComponent>
                  </CommonTouchableOpacity>
                  {/* <CommonTouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleInviteFriends()}
                  >
                    <ViewComponent style={commonStyles.relative}>
                      <PayeesIconImage width={s(20)} height={s(20)} />
                    </ViewComponent>
                  </CommonTouchableOpacity> */}
                </ViewComponent>
              )}
            />
          </ViewComponent>
        )}
      </ViewComponent>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialTab}
        screenListeners={{
          state: (e: any) => {
            const currentRouteName =
              e.data.state.routes[e.data.state.index].name;
            const currentTabConfig = tabs.find(
              (t) => t.title === currentRouteName
            );
            if (
              currentTabConfig &&
              currentTabConfig.componentName !== currentTabComponent
            ) {
              setCurrentTabComponent(currentTabConfig.componentName);
            }
          },
        }}
      >
        {tabs?.map((tab: TabConfig) => (
          <Tab.Screen
            key={tab?.title}
            name={tab?.title}
            component={COMPONENT_MAP[tab?.componentName]}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => (
                <TabBarIcon
                  focused={focused}
                  icon={customIcons[tab?.componentName as keyof CustomIcons]}
                />
              ),
              tabBarLabel: ({ focused }) => (
                <TextMultiLangauge
                  style={[
                    commonStyles.fs16,
                    commonStyles.fw700,
                    commonStyles.textCenter,
                    {
                      color: focused
                        ? NEW_COLOR.TEXT_WHITE
                        : NEW_COLOR.TEXT_GREY,
                    },
                  ]}
                  text={tab?.title}
                />
              ),
              tabBarStyle: {
                backgroundColor: NEW_COLOR.SCREENBG_BLACK,
                borderColor: NEW_COLOR.TEXTGRE,
                borderTopColor: NEW_COLOR.MENU_HALF_SHADE_BORDER,
                borderTopWidth: 1, // increase height of the tab bar
                height: s(80) + insets.bottom + 10, // s(60) is your desired height
                paddingBottom: insets.bottom, // ensures content is above the home indicator
                paddingTop: s(5),
              },
            }}
            listeners={{
              tabPress: () => {
                setCurrentTabComponent(tab.componentName);
              },
            }}
          />
        ))}
      </Tab.Navigator>
      {userInfo?.isCustomerUpdated && (
        <ViewComponent style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'box-none'
        }}>
          <NotifyAlerts />
        </ViewComponent>
      )}
    </ViewComponent>
  );
};
const screenStyles = (NEW_COLOR: any) =>
  StyleService.create({
    arthaMenu: {
      top: -24,
      position: "absolute",
      zIndex: 10,
      height: s(55),
      width: s(55),
      borderRadius: s(100) / 2,
      borderWidth: 1,
      borderColor: NEW_COLOR.DB_SECTION_BORDER,
      backgroundColor: NEW_COLOR.INACTIVE_HOME_MENU_BG,
    },
    arthaBgColor: {
      backgroundColor: NEW_COLOR.PRiMARY_COLOR,
    },
    my16: {
      marginHorizontal: 16,
    },
    tabItem: {
      alignItems: "center",
      paddingBottom: 0,
    },
    px8: { paddingVertical: 8 },
    redBg: {
      backgroundColor: NEW_COLOR.TEXT_RED,
      minWidth: s(18),
      minHeight: s(18),
      padding: 1,
      borderRadius: 100 / 2,
      position: "absolute",
      right: -11,
      top: -6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    mt44: {
      paddingTop: 44,
    },
    bgDark: {
      backgroundColor: NEW_COLOR.SCREENBG_BLACK,
    },
    profile: {
      width: s(28),
      height: s(28),
      borderRadius: 50,
      marginRight: s(16),
    },
  });
