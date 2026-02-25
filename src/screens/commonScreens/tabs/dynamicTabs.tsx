import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleService, TopNavigation } from "@ui-kitten/components";
import { s } from "../../../constants/styels/scale";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import ImageUri from "../../../components/imageComponents/image";
import { MlmPackagesActiveMenuIcon, MlmPackagesMenuIcon } from "../../../assets/svg";
import CommonTouchableOpacity from "../../../components/touchableComponents/touchableOpacity";
import ViewComponent from "../../../components/view/view";
import TextMultiLangauge from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { setCartCount, setShouldShowNotices } from "../../../redux/actions/actions";
import HomeInactiveIcon from "../../../components/svgIcons/mainmenuicons/homeInactiveIcon";
import ShopMenuIcon from "../../../components/svgIcons/mainmenuicons/shopMenuIcon";
import WalletsMenuIcon from "../../../components/svgIcons/mainmenuicons/walletsMenuIcon";
import Home from "../../fintechApp/Dashboard";
import WalletsInactiveIcon from "../../../components/svgIcons/mainmenuicons/walletsInactiveIcon";
import CardInactiveIcon from "../../../components/svgIcons/mainmenuicons/cardInactiveIcon";
import ProfileInactive from "../../../components/svgIcons/mainmenuicons/profileInactiveIcon";
import AuthService from "../../../apiServices/onBoarding/auth";
import Feather from '@expo/vector-icons/Feather';
import Cards from "../../fintechApp/cards/dashoard";
import HomeactiveIcon from "../../../components/svgIcons/mainmenuicons/homeactiveicon";
import WalletsactiveIcon from "../../../components/svgIcons/mainmenuicons/walletsactiveicon";
import CardactiveIcon from "../../../components/svgIcons/mainmenuicons/cardactiveicon";
import Profileactive from "../../../components/svgIcons/mainmenuicons/profileactiveicon";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import ScannerIcon from "../../../components/svgIcons/mainmenuicons/scaner";
import ChatBot from "../../fintechApp/aiBot";
import { Camera } from 'expo-camera';
import { SEND_CONST } from "../../fintechApp/profile/addressbook/crytoPayee/sendConstant";
import { Linking, Modal, Platform, Pressable, TouchableOpacity, Animated, LayoutChangeEvent, View, StyleSheet } from "react-native";
import Container from "../../../components/container/container";
import QrScanner from "../../../components/scanner/scanner";
import HubMenuIcon from "../../../components/svgIcons/mainmenuicons/hubicon";
import HubDashBoard from "../../fintechApp/hub";
import HubinactiveIcon from "../../../components/svgIcons/mainmenuicons/hubIconInactive";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PaymentsDashboard from "../../fintechApp/payments";
import BankDashboard from "../../fintechApp/bank/Dashboard";
import BankActiveIcon from "../../../components/svgIcons/mainmenuicons/bankactive";
import PaymentsActiveIcon from "../../../components/svgIcons/mainmenuicons/paymentsactive";
import { LinearGradient } from "expo-linear-gradient";
import { logEvent } from "../../../hooks/loggingHook";
import { useLngTranslation } from "../../../hooks/languagesHook/useLngTranslation";
import ParagraphComponent from "../../../components/textComponets/paragraphText/paragraph";
import CreateAccountService from "../../../apiServices/bank/createAccount";
import WalletsHome from "../../fintechApp/wallets";
import { Octicons } from "@expo/vector-icons";
import TextMultiLanguage from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import PermissionModel from "../permissionPopup";
import NotifyAlerts from "../../../components/notices/NotifyAlerts";
import { checkAppPermissions } from "../../../services/mediaPermissionService";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import { commonStyles } from "../../../components/theme/commonStyles";
import { Logger } from '../../../utils/Logger';
import { useNoticesManager } from "../../../hooks/notifications/useNoticesManager";
import ExchangeDashboard from "../../fintechApp/Exchange/dashboard/ExchangeDashboard";
import { getTabsConfigation } from "../../../../cofiguration";

const Tab = createBottomTabNavigator();
const COMPONENT_MAP: Record<string, React.FC> = {
  _home: Home,
  _cards: Cards,
  _hub: HubDashBoard,
  _ai: ChatBot,
  _payments: PaymentsDashboard,
  _bank: BankDashboard,
  _wallets: WalletsHome,
  _exchange: ExchangeDashboard
};

const CustomTabBar: React.FC<
  BottomTabBarProps & {
    iconsMap: Record<string, { active: React.ReactNode; inactive: React.ReactNode }>;
    noticesProcessed: boolean;
    showNotices: boolean;
  }
> = React.memo(({ state, descriptors, navigation, iconsMap, noticesProcessed, showNotices }) => {
  const insets = useSafeAreaInsets();
  const NEW_COLOR = useThemeColors();
  const [barWidth, setBarWidth] = useState(0);
  const segments = state.routes.length || 1;
  const horizontalPadding = s(0);
  const animatedIndex = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.timing(animatedIndex, {
      toValue: state.index,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const onLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width - horizontalPadding * 1);
  };

  const segmentWidth = barWidth / segments || 0;
  const translateX =
    segmentWidth > 0
      ? Animated.multiply(animatedIndex, segmentWidth)
      : new Animated.Value(0);

  return (
    <View
      onLayout={onLayout}
      style={{
        marginBottom: s(12),
        backgroundColor: NEW_COLOR.BOTTOM_TABSBG,
        paddingBottom: Math.max(insets.bottom, s(10)),
        overflow: "hidden",
        paddingHorizontal: horizontalPadding,
        paddingTop: s(10)

      }}
    >
      {segmentWidth > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: horizontalPadding,
            right: horizontalPadding,
            height: s(4),
          }}
        >
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,

              top: (s(3) - 2) / 2, // center a 2px line in the 3px track
              height: 2,
              backgroundColor: NEW_COLOR.BOTTOMTAB_BORDERBG,
              borderRadius: 1,
            }}
          />

          <Animated.View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: segmentWidth,
              transform: [{ translateX }],
            }}
          >
            <LinearGradient
              colors={[NEW_COLOR.BUTTON_LINEARGRADIANT1, NEW_COLOR.BUTTON_LINEARGRADIANT2]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ height: "100%", width: "100%", borderRadius: s(100) }}
            />
          </Animated.View>
        </View>
      )}


      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const label =
            (options.tabBarLabel as string) ??
            (options.title as string) ??
            route.name;

          const onPress = () => {
            // Block navigation until notices are processed (only if notices are enabled)
            if (showNotices && !noticesProcessed) {
              return;
            }
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const iconPack =
            iconsMap[route.name] ||
            iconsMap[label] ||
            iconsMap[route.key];

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.85}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: s(4) }}
            >
              <View style={{ marginBottom: s(2) }}>
                {isFocused ? iconPack?.active : iconPack?.inactive}
              </View>
              <TextMultiLangauge
                text={label}
                style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textCenter, {


                  color: isFocused ? NEW_COLOR.NAV_ACTIVETEXT : NEW_COLOR.NAV_INACTIVETEXT,
                }]}
                numberOfLines={1}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

export const DynamicTabs: React.FC = ({ route }) => {
  const menuItemsFromStore = useSelector((state: any) => state.userReducer?.menuItems);
  const configTabs = useMemo(() => getTabsConfigation("TABS"), []);
  // ----Only Based on configuartion file
  // const tabs = getTabsConfigation("TABS")?.filter((tab: any) => tab?.isDisplay)

  //---Only based on api configuration
  const tabs = useMemo(() => {
    const featureToComponentMap: { [key: string]: string } = {
      'Exchange': '_exchange',
      'Dashboard': '_home',
      'Cards': '_cards',
      'Payments': '_payments',
      'Banks': '_bank',
      'Wallets': '_wallets',
    };

    return (menuItemsFromStore || [])
      .filter((item: any) => item?.isEnabled)?.map((item: any) => {
        const componentName = featureToComponentMap[item?.featureName];
        const tabConfig = configTabs?.find((t: any) => t.componentName === componentName);
        let tabTitle = `GLOBAL_CONSTANTS.${item.featureName.toUpperCase()}`;
        // Special handling: If the feature is 'Dashboard', use 'GLOBAL_CONSTANTS.HOME' as the title
        if (item.featureName === 'Dashboard') {
          tabTitle = 'GLOBAL_CONSTANTS.HOME';
        } else if (item.featureName === 'Banks') {
          tabTitle = 'GLOBAL_CONSTANTS.BANK';
        }
        return tabConfig ? { ...tabConfig, title: tabTitle } : null;
      }).filter(Boolean);
  }, [menuItemsFromStore, configTabs]);
  const initialTab = tabs.find(tab => tab.title === route?.params?.initialTab)?.title || tabs[0]?.title;

  // const initialTab = route?.params?.initialTab || tabs[0]?.title;
  const getProductTab = tabs.find((tab: any) => tab?.componentName == "_products")
  const navigation = useNavigation<any>();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const cartCount = useSelector((state: any) => state.userReducer?.cartCount);
  const dispatch = useDispatch();
  const [currentTabComponent, setCurrentTabComponent] = useState(tabs[0]?.componentName);
  const [hasHomeLoaded, setHasHomeLoaded] = useState(false);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const { noticesProcessed, showNotices } = useNoticesManager();
  const isLoggedIn = useSelector((state: any) => state.userReducer?.login);
  const isFocused = useIsFocused();
  const [userDetails, setUserDetails] = useState<any>({});
  const NEW_COLOR = useThemeColors();
  const [enableScanner, setEnableScanner] = useState<boolean>(false);
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const styles = useMemo(() => screenStyles(NEW_COLOR), [NEW_COLOR]);
  const [address, setAdress] = React.useState<any>("");
  const { t } = useLngTranslation();
  const [notificatonsCount, setNotifcationsCount] = useState<any>(null);
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>("");
  const [permissionMessage, setPermissionMessage] = useState<string>('');

  const NoRippleTabBarButton = (props: any) => {
    const { children, style, ...rest } = props;
    return Platform.OS === "android" ? (
      <Pressable {...rest} android_ripple={{ color: "transparent", radius: 0, borderless: true }} style={style}>
        {children}
      </Pressable>
    ) : (
      <TouchableOpacity {...rest} activeOpacity={1} style={style}>
        {children}
      </TouchableOpacity>
    );
  };

  // Initialize notices state on component mount
  useEffect(() => {
    if (isLoggedIn && userInfo?.id && (noticesProcessed || !showNotices)) {
      // If user is logged in and notices are processed or disabled, allow navigation
      setHasHomeLoaded(true);
    }
  }, [isLoggedIn, userInfo?.id, noticesProcessed, showNotices]);

  useEffect(() => {
    if (isFocused) {
      // Debounce API calls
      const timer = setTimeout(() => {
        getCartCount();
        NotificationsCount();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFocused])
  useEffect(() => {
    if (userInfo?.id) {
      getCustomerProfileInfo();
    }
  }, [userInfo?.id, isFocused]);
  const NotificationsCount = useCallback(async () => {
    try {
      const response: any = await CreateAccountService.getAllNotificationCount();
      if (response?.ok) setNotifcationsCount(response?.data);
    } catch { }
  }, []);;
  interface TabConfig {
    title: string;
    componentName: string;
    isDisplay: boolean;
  }
  const currentTabRef = useRef(currentTabComponent);
  useEffect(() => {
    currentTabRef.current = currentTabComponent;
  }, [currentTabComponent]);
  const navigatedFromDrawerRef = useRef(false);
  const [blockTabFocusEffects, setBlockTabFocusEffects] = useState(false);
  useEffect(() => {
    if (blockTabFocusEffects) {
      const timer = setTimeout(() => setBlockTabFocusEffects(false), 50);
      return () => clearTimeout(timer);
    }
  }, [blockTabFocusEffects]);

  const getCustomerProfileInfo = useCallback(async () => {
    if (!userInfo?.accountType) return;
    try {
      const response: any = await AuthService.getCustomerProfile(userInfo.accountType);
      setUserDetails(response?.data);
    } catch (error) {
      Logger.error("Failed to get customer profile:", error);
    }
  }, [userInfo?.accountType]);
  const handleCart = useCallback(() => {
    navigation?.navigate("ProductsCart")
  }, [])
  const getCartCount = useCallback(async () => {
    try {
      let response: any;
      if (response?.ok) {
        dispatch(setCartCount(response?.data))
      }
    } catch (error) {
      Logger.error("Failed to get customer profile:", error);
    }
  }, []);
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (navigatedFromDrawerRef.current) {
        navigatedFromDrawerRef.current = false;
        setBlockTabFocusEffects(true);
      } else {
        setBlockTabFocusEffects(false);
        getCartCount();
        NotificationsCount();
      }
    });
    return unsubscribeFocus;
  }, [navigation, getCartCount, NotificationsCount]);
  useEffect(() => {
    if (userInfo?.id) {
      getCustomerProfileInfo();
    }
  }, [userInfo?.id, getCustomerProfileInfo]);
  const handleProfileImagePress = useCallback(() => {
    navigatedFromDrawerRef.current = true;
    const currentTab = tabs?.find((tab: any) => tab?.componentName === currentTabRef.current);
    navigation.navigate("NewProfile", { userInfo: userInfo, currentTabTitle: currentTab?.title });
  }, [navigation, userInfo, tabs]);
  const handleNavigateNotifications = useCallback(() => {
    navigation.navigate("Notifications")
  }, [])
  const customIcons = useMemo(() => ({
    _home: { active: <HomeactiveIcon height={s(26)} width={s(26)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <HomeInactiveIcon height={s(26)} width={s(26)} color={NEW_COLOR.TEXT_link} /> },
    _cards: { active: <CardactiveIcon height={s(30)} width={s(30)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <CardInactiveIcon height={s(30)} width={s(30)} color={NEW_COLOR.TEXT_link} /> },
    _packages: { active: <MlmPackagesActiveMenuIcon height={s(20)} width={s(20)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <MlmPackagesMenuIcon height={s(20)} width={s(20)} color={NEW_COLOR.TEXT_link} /> },
    _wallets: { active: <WalletsactiveIcon height={s(26)} width={s(26)} color={NEW_COLOR.TEXT_WHITE} />, inactive: <WalletsInactiveIcon height={s(26)} width={s(26)} color={NEW_COLOR.TEXT_link} /> },
    _samratWallets: { active: <WalletsMenuIcon height={s(20)} width={s(20)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <WalletsMenuIcon height={s(20)} width={s(20)} color={NEW_COLOR.TEXT_link} /> },
    _products: { active: <ShopMenuIcon height={s(23)} width={s(20)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <ShopMenuIcon height={s(23)} width={s(20)} color={NEW_COLOR.TEXT_link} /> },
    _profile: { active: <Profileactive height={s(28)} width={s(28)} color={NEW_COLOR.TEXT_WHITE} />, inactive: <ProfileInactive height={s(28)} width={s(28)} color={NEW_COLOR.TEXT_link} /> },
    _ai: { active: <Profileactive height={s(28)} width={s(28)} />, inactive: <ProfileInactive height={s(28)} width={s(28)} color={NEW_COLOR.TEXT_link} /> },
    _hub: { active: <HubMenuIcon height={s(25)} width={s(25)} />, inactive: <HubinactiveIcon height={s(25)} width={s(25)} color={NEW_COLOR.TEXT_link} /> },
    _payments: { active: <PaymentsActiveIcon height={s(28)} width={s(28)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <PaymentsActiveIcon height={s(28)} width={s(28)} color={NEW_COLOR.TEXT_link} /> },
    _bank: { active: <BankActiveIcon height={s(28)} width={s(28)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <BankActiveIcon height={s(28)} width={s(28)} color={NEW_COLOR.TEXT_link} /> },
    _exchange: { active: <Octicons name="arrow-switch" size={s(24)} color={NEW_COLOR.BOTTOM_TAB} />, inactive: <Octicons name="arrow-switch" size={s(24)} color={NEW_COLOR.TEXT_link} /> },

  }), [NEW_COLOR]);

  const iconsMap = useMemo(() => {
    const map: Record<string, { active: React.ReactNode; inactive: React.ReactNode }> = {};
    tabs.forEach((t: any) => (map[t.title] = customIcons[t.componentName]));
    return map;
  }, [tabs, customIcons]);

  const enableScannerModel = async () => {
    const res = await checkAppPermissions("camera"); // or "library"

    if (res.showPopup) {
      setPermissionTitle("GLOBAL_CONSTANTS.ALLOW_CAMERA_ACCESS_TO_SCAN_WALLET_QR_CODES");
      setPermissionMessage("GLOBAL_CONSTANTS.CAMERA_ACCESS_DENIED_MESSAGE");
      setPermissionModel(true);
      return;
    }

    if (res.allowed) {
      setEnableScanner(true);
    }
  }

  const handleCloseModel = () => setEnableScanner(false);
  const sanitizeText = (text: string): string => text.replace(/[^a-zA-Z0-9]/g, "");
  const handleAddressChange = (text: string) => {
    if (text) {
      const sanitizedText = sanitizeText(text);
      setEnableScanner(false);
      navigation.navigate("AddContact", { scannedAddress: sanitizedText, screenName: "dynamicTabs" });
    }
  };

  const closePermissionModel = () => {
    setPermissionModel(false);
  }
  const tabScreenOptions = useMemo(
    () => ({
      headerShown: false,
      lazy: true,
      freezeOnBlur: true,
      tabBarButton: NoRippleTabBarButton,
      unmountOnBlur: false,
    }),
    []
  );

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.pt10, commonStyles.screenBg]}>
      {/* DEV: Notices System - Full screen loader */}
      {showNotices && noticesLoading && (
        <ViewComponent style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10001,
          backgroundColor: NEW_COLOR.SCREENBG_BLACK,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Add your loading component here */}
        </ViewComponent>
      )}

      {/* NotifyAlerts overlay - shown globally, not just on home tab */}
      {showNotices && (
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
          <NotifyAlerts
            onNoticesLoaded={() => {
              setHasHomeLoaded(true);
            }}
            onLoadingChange={setNoticesLoading}
          />
        </ViewComponent>
      )}
      <ViewComponent style={[commonStyles.screenBg]}>
        <PermissionModel permissionDeniedContent={permissionMessage} closeModel={closePermissionModel} addModelVisible={permissionModel} title={permissionTitle} />
        {currentTabComponent !== "_profile" && (
          <ViewComponent>
            <TopNavigation
              title={() => (
                <ParagraphComponent style={[{ width: s(200) }, commonStyles.fs16, commonStyles.fw400]} numberOfLines={1}>
                  <TextMultiLanguage style={[commonStyles.sectionsubtitlepara]} text={"GLOBAL_CONSTANTS.HELLOW"} />
                  <ParagraphComponent style={[commonStyles.sectionSubTitleText]}>{userInfo?.name}</ParagraphComponent>
                </ParagraphComponent>
              )}
              style={[{ backgroundColor: NEW_COLOR.SCREENBG_BLACK, paddingHorizontal: s(24) }]}
              accessoryLeft={
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                  <CommonTouchableOpacity onPress={handleProfileImagePress}>
                    <ImageUri
                      style={styles.profile}
                      source={
                        userInfo?.image
                          ? { uri: userInfo.image }
                          : require("../../../assets/images/banklocal/default.png")
                      }
                    />
                  </CommonTouchableOpacity>
                </ViewComponent>
              }
              accessoryRight={
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                  <CommonTouchableOpacity onPress={() => enableScannerModel()}>
                    <ScannerIcon width={s(24)} height={s(24)} />
                  </CommonTouchableOpacity>
                  <CommonTouchableOpacity activeOpacity={0.9} onPress={() => handleNavigateNotifications()}>
                    <ViewComponent style={commonStyles.relative}>
                      <Feather name="bell" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                      {notificatonsCount ? (
                        <ViewComponent style={[styles.redBg, { right: -8.5, top: -4 }]}>
                          <ParagraphComponent
                            style={[commonStyles.fs10, commonStyles.fw400, commonStyles.textAlwaysWhite, commonStyles.textCenter, { marginBottom: 1 }]}
                            text={String(notificatonsCount)}
                          />
                        </ViewComponent>
                      ) : null}
                    </ViewComponent>
                  </CommonTouchableOpacity>
                </ViewComponent>
              }
            />
            {enableScanner && (
              <Modal animationType={SEND_CONST.SLIDE as any} transparent visible={enableScanner} onRequestClose={handleCloseModel}>
                <Container style={[commonStyles.container]}>
                  <QrScanner
                    onCaptureCode={(text: string) => {
                      setAdress(text);
                      handleAddressChange(text);
                    }}
                    onClose={() => setEnableScanner(false)}
                  />
                </Container>
              </Modal>
            )}
          </ViewComponent>
        )}
      </ViewComponent>

      {(tabs && tabs.length > 0) && <Tab.Navigator
        detachInactiveScreens={true}
        initialRouteName={initialTab}
        screenOptions={tabScreenOptions}
        tabBar={(props) => <CustomTabBar {...props} iconsMap={iconsMap} noticesProcessed={noticesProcessed} showNotices={showNotices} />}
      >
        {tabs?.map((tab: any) => (
          <Tab.Screen
            key={tab?.title}
            name={tab?.title}
            component={COMPONENT_MAP[tab?.componentName]}
            options={{ title: tab.title }}
            listeners={{
              tabPress: (e) => {
                // Block navigation until notices are processed (only if notices are enabled)
                if (showNotices && !noticesProcessed) {
                  e.preventDefault();
                  return;
                }

                // Force home tab to load first if it hasn't loaded yet
                if (!hasHomeLoaded && tab.componentName !== '_home') {
                  e.preventDefault();
                  // Navigate to home first, then to desired tab
                  const homeTab = tabs.find(t => t.componentName === '_home');
                  if (homeTab) {
                    navigation.navigate(homeTab.title);
                    setCurrentTabComponent('_home');
                    currentTabRef.current = '_home';
                    // After a brief delay, navigate to the desired tab
                    setTimeout(() => {
                      if (!showNotices || noticesProcessed) { // Double check notices are still processed
                        navigation.navigate(tab.title);
                        setCurrentTabComponent(tab.componentName);
                        currentTabRef.current = tab.componentName;
                      }
                    }, 100);
                  }
                  return;
                }

                setCurrentTabComponent(tab.componentName);
                currentTabRef.current = tab.componentName;
                logEvent("Menu Tab Pressed", {
                  action: `${t(tab?.title)} Tab`,
                  nextScreen: t(tab?.title),
                  currentScreen: currentTabComponent,
                });
              },
              focus: () => {
                if (!blockTabFocusEffects) {
                  setCurrentTabComponent(tab.componentName);
                  currentTabRef.current = tab.componentName;
                  // Mark home as loaded when it's focused
                  if (tab.componentName === '_home') {
                    setHasHomeLoaded(true);
                  }
                }
              },
            }}
          />
        ))}
      </Tab.Navigator>}
    </ViewComponent>
  );
};

const screenStyles = (NEW_COLOR: any) => StyleService.create({
  arthaMenu: {
    top: -24, position: "absolute", zIndex: 10,
    height: s(55), width: s(55),
    borderRadius: s(100) / 2,
    borderWidth: 1,
    borderColor: NEW_COLOR.DB_SECTION_BORDER,
    backgroundColor: NEW_COLOR.INACTIVE_HOME_MENU_BG
  },
  arthaBgColor: { backgroundColor: NEW_COLOR.PRiMARY_COLOR },
  my16: { marginHorizontal: 16 },
  tabItem: { alignItems: "center", paddingBottom: 0 },
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
    width: s(40),
    height: s(40),
    borderRadius: 50, marginRight: s(16),
  },
});