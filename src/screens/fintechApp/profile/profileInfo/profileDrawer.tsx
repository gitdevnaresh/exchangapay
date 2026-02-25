import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Animated, Easing, TouchableWithoutFeedback, View, BackHandler, StyleSheet } from 'react-native';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import DeviceInfo from "react-native-device-info";

import ConfirmLogout from '../../../commonScreens/logout/comfirmLogout';
import Container from '../../../../components/container/container';
import SafeAreaViewComponent from '../../../../components/safeArea/safeArea';
import { getTabsConfigation } from '../../../../../configuration';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import { WINDOW_WIDTH } from '../../../../constants/styels/variables';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import { s } from '../../../../constants/styels/scale';
import ProfileDrawerHeader from './profileDrawerHeader';
import ProfileDrawerMenuItems from './profileDrawerMenuItems';
import ProfileDrawerFooter from './profileDrawerFooter';
import ViewComponent from '../../../../components/view/view';
import { logEvent } from '../../../../hooks/loggingHook';
import useLogout from '../../../../hooks/logout/useLogout';

// Define types for navigation and Redux state
interface ProfileDrawerRouteUserInfo {
  name?: string;
  firstName?: string;
  lastName?: string;
  accountType?: string;
  // email?: string; // If these are part of userInfo, they are covered.
  // customerState?: string; // If separate, add them to ProfileDrawerParams.
}

// Params expected by the ProfileDrawer screen
type ProfileDrawerParams = {
  userInfo: ProfileDrawerRouteUserInfo;
};

// Define your RootStackParamList if not already globally available
// This should ideally be in a central navigation types file.
type RootStackParamList = {
  ProfileDrawer: ProfileDrawerParams;
  SplaceScreenW2: undefined; // For navigation.dispatch
  // ... other screens in your stack
};

// Props for the ProfileDrawer component
interface ProfileDrawerScreenProps extends NativeStackScreenProps<RootStackParamList, 'ProfileDrawer'> {
  blockFocusEffects?: boolean;
}

// Define RootState for Redux ThunkDispatch
// This should ideally come from your Redux store's type definitions.
interface UserDetailsForState { // Example, adjust to your actual userDetails structure
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  accountType?: string;
  image?: string;
  // ... other properties
}
interface RootState {
  userReducer: {
    userDetails: UserDetailsForState | null;
    // ... other userReducer state
  };
  // ... other reducers
}

// Define ThemeColors type (adjust if you have a more specific type)
type ThemeColors = Record<string, string>;


const ProfileDrawer: React.FC<ProfileDrawerScreenProps> = ({
  navigation,
  route,
  blockFocusEffects,
}) => {
  const NEW_COLOR: ThemeColors = useThemeColors(); // Explicitly type NEW_COLOR
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const DRAWER_VISIBLE_WIDTH = WINDOW_WIDTH * 0.8;
  const { userInfo } = route.params; // userInfo is now typed via ProfileDrawerParams
  const styles = profileDrawerStyles(NEW_COLOR, DRAWER_VISIBLE_WIDTH);

  const drawerSlideAnim = useRef(new Animated.Value(-DRAWER_VISIBLE_WIDTH)).current;
  const overlayOpacityAnim = useRef(new Animated.Value(0)).current;
  // Type ThunkDispatch with RootState
  const dispatch = useReduxDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const version = DeviceInfo?.getVersion();


  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [logoutLoader, setLogoutLoader] = useState(false);
  const menuTabs = getTabsConfigation('MENU_DRAWER_CONGIGURATION');
  const { logout } = useLogout()
  const closeDrawer = useCallback(() => {
    // Animate drawer closing
    Animated.parallel([
      Animated.timing(drawerSlideAnim, {
        toValue: -DRAWER_VISIBLE_WIDTH, // Target the closed state
        duration: 200, // Animation duration for closing
        easing: Easing.in(Easing.ease), // Easing function for closing
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacityAnim, {
        toValue: 0, // Fade out overlay
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    });
  }, [drawerSlideAnim, overlayOpacityAnim, navigation]);

  const showLogoutModal = () => setIsLogoutModalVisible(true);
  const hideLogoutModal = () => setIsLogoutModalVisible(false);


  useEffect(() => {
    // Animate the drawer to the open state (translateX: 0) when the component mounts
    Animated.parallel([
      Animated.timing(drawerSlideAnim, {
        toValue: 0, // Target the open state
        duration: 250, // Animation duration for opening
        easing: Easing.out(Easing.ease), // Easing function for opening
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacityAnim, {
        toValue: 1, // Fade in overlay
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const backAction = () => {
      closeDrawer();
      return true; // Prevent default behavior (e.g., exiting app)
    };
    const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandlerSubscription.remove();
    };
  }, [drawerSlideAnim, overlayOpacityAnim, closeDrawer]);

  const handleLgout = useCallback(async () => {
    logEvent("Button Pressed", { action: "Logout", currentScreen: "Profile" })
    setLogoutLoader(true);
    await logout();
    setLogoutLoader(false)
  }, [logout]);


  return (

    <View style={styles.fullScreenContainer}>
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacityAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.drawerContentContainer,
          { transform: [{ translateX: drawerSlideAnim }] },
        ]}
      >
        <SafeAreaViewComponent style={[{ flex: 1, backgroundColor: 'transparent' }]}>
          <ScrollViewComponent style={{ backgroundColor: 'transparent' }} contentContainerStyle={[{ flexGrow: 1, backgroundColor: 'transparent' }]}>
            <Container style={styles.drawerActualContent}>
              <ProfileDrawerHeader
                userInfoFromRoute={userInfo}
                blockFocusEffects={blockFocusEffects}
                showProfileInfoConfig={menuTabs?.PROFILE_INFORMATION}
              />

              <ViewComponent style={[commonStyles.sectionGap]} />

              <ProfileDrawerMenuItems navigation={navigation} />

              <ProfileDrawerFooter
                onLogoutPress={showLogoutModal}
                logoutLoader={logoutLoader}
                version={version ?? "N/A"} // Handle potential undefined version
                showLogoutConfig={menuTabs?.LOGOUT}
              />
            </Container>
            <ConfirmLogout
              isVisible={isLogoutModalVisible}
              onClose={hideLogoutModal}
              onConfirm={handleLgout}
            />
          </ScrollViewComponent>
        </SafeAreaViewComponent>
      </Animated.View>
    </View >
  );
};

// Type NEW_COLOR in profileDrawerStyles
export const profileDrawerStyles = (NEW_COLOR: ThemeColors, drawerWidth: number) => StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.70)',
    zIndex: 1,
  },
  drawerContentContainer: { // Animated sliding view
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: drawerWidth,
    backgroundColor: NEW_COLOR.SCREENBG_BLACK, // Example usage
    zIndex: 2, // Above overlay
  },
  drawerActualContent: { // Inner view for padding and content
    paddingHorizontal: s(20), // Adjusted padding
    backgroundColor: 'transparent', // Make the Container transparent
  },
  menuItemsContainer: {
    marginBottom: s(25),
  },
  redBg: {
    backgroundColor: NEW_COLOR.TEXT_RED,
  },
  menuItem: {
    paddingVertical: s(14),
  },
  defaultimg: {
    width: s(45), height: s(45), borderRadius: s(45) / 2, overflow: "hidden"
  },
  menuItemText: {
    color: NEW_COLOR.TEXT_WHITE, // Example usage
    fontSize: s(24),
    fontFamily: "Manrope-Medium", // Ensure this font is linked
  },
  badgeRed: {
    backgroundColor: NEW_COLOR.TEXT_RED, // Example usage
  },
  badgeGold: {
    backgroundColor: NEW_COLOR.GOLD_COLOR ?? '#FFD700', // Example usage
  },
  versionText: {
    color: NEW_COLOR.TEXT_GREEN, // Example usage
    fontSize: s(12),
  },
  logoutButton: {
    backgroundColor: NEW_COLOR.TEXT_DARK_GREY ?? '#4A4A4A', // Example usage
    paddingVertical: s(12),
    borderRadius: s(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: s(15),
  },
  logoutButtonText: {
    color: NEW_COLOR.TEXT_WHITE, // Example usage
    fontSize: s(16),
    fontFamily: "Manrope-SemiBold", // Ensure this font is linked
  },
});

export default ProfileDrawer;
