import { ActivityIndicator } from "react-native";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { s } from "../../../constants/theme/scale";
import React, { useCallback, useEffect, useRef } from "react";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import { useSelector } from "react-redux";
import TextMultiLangauge from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import ViewComponent from "../../../newComponents/view/view";
import { Ionicons } from "@expo/vector-icons";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import useMemberLogin from "../../../hooks/userInfoHook";
import { languages, themes } from "./constants";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import ImageUri from "../../../newComponents/imageComponents/image";
import { PROFILE_URLS } from "../../../assets/blobUrls";
const Settings = (props: any) => {
  // Refs for bottom sheets
  const popupRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  // Language translation hook
  const { currentLanguage } = useLngTranslation();

  // State for active language label and loading indicator
  // Redux hooks for theme and user info
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme)
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const { logEvent } = useActionLogging();
  const isFocused = useIsFocused();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const { getMemDetails } = useMemberLogin();
  useEffect(() => {
    if (isFocused) {
      const screenViewData: ActionLogParams = {
        screename: 'Settings',
        actionName: 'Screen Loaded',
        actionType: 'View',
      };
      logEvent('screen_view', screenViewData);
      // Fetch latest user info (including currency)
      getMemDetails(true);
    }
  }, [isFocused]);
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })
  // Handler for back navigation
  const backArrowButtonHandler = () => {
    const actionData: ActionLogParams = {
      screename: 'Settings',
      actionName: 'Navigate Back',
      actionType: 'Button',
    };
    logEvent('navigation_action', actionData);
    navigation.goBack(); // <-- navigate to NewProfile 
  }


  const handleNavigateToCurrencyList = useCallback(() => {
    const actionData: ActionLogParams = {
      screename: 'Settings',
      actionName: 'Navigate to CurrencyList',
      actionType: 'Button',
    };
    logEvent('button_press', actionData);
    props.navigation.navigate('CurrencyList', {
      selectedCurrencyCode: userInfo?.currency // Pass the user's currency code here
    });
  }, [logEvent, props.navigation, userInfo?.currency]);

  // Get selected theme object for display
  const selectedThemeObject = themes.find(theme => theme.key === appThemeSetting);
  const selectedLanguage = languages.find(lang => lang.key === currentLanguage);
  // Handler to open language selection sheet
  const handleNavigateLanguage = useCallback(() => {
    const actionData: ActionLogParams = {
      screename: 'Settings',
      actionName: 'Open Language Sheet',
      actionType: 'Button',
    };
    logEvent('button_press', actionData);
    navigation.navigate("Language")// <-- use the correct ref
  }, [logEvent]);

  const handleOpenThemeSheet = useCallback(() => {
    const actionData: ActionLogParams = {
      screename: 'Settings',
      actionName: `Open Appearance Screen`,
      actionType: 'Button',
    };
    logEvent('button_press', actionData);
    navigation.navigate("Appearance")// <-- use the correct ref
  }, [logEvent]);

  // Handler for navigating to ComingSoon screen with logging
  const handleNavigateToComingSoon = useCallback((source: string) => {
    const actionData: ActionLogParams = {
      screename: 'Settings',
      actionName: `Navigate to ComingSoon (${source})`,
      actionType: 'Button',
    };
    logEvent('button_press', actionData);
    navigation.navigate('ComingSoon', {
      pageHeader: false, customHeader: {
        title: source,
        showBackButton: true
      }
    });
  }, []);
  const handleNavigatePermissions = () => {
    props.navigation.navigate('Permissions');
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        {/* Page header with back button */}
        <PageHeader title={"GLOBAL_CONSTANTS.SETTINGS"} onBackPress={backArrowButtonHandler} />
        <ScrollViewComponent>
          {/* Currency setting (currently opens theme sheet, adjust as needed) */}
          {/* <CommonTouchableOpacity
            onPress={handleNavigateToCurrencyList}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.list, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconcirclebg]} >
                <UsdCurrencyIcon color={commonStyles.textWhite.color} />
              </ViewComponent>
              <TextMultiLangauge text={"GLOBAL_CONSTANTS.CURRENCY"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]} />
              <ParagraphComponent text={userInfo?.currency} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw500]} />
               <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
            </ViewComponent>
          </CommonTouchableOpacity>
          <ViewComponent style={commonStyles.mb14} /> */}

          {/* Language setting */}
          <CommonTouchableOpacity
            onPress={handleNavigateLanguage}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.list, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconcirclebg]} >
                <ImageUri uri={PROFILE_URLS.language} height={s(18)} width={s(18)} />
              </ViewComponent>
              <TextMultiLangauge text={"GLOBAL_CONSTANTS.LANGUAGE"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]} />
              <ParagraphComponent text={selectedLanguage?.label} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw500]} />
               <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
            </ViewComponent>
          </CommonTouchableOpacity>
          <ViewComponent style={commonStyles.menuitemspace} />

          {/* Appearance (theme) setting */}
          <CommonTouchableOpacity
            onPress={handleOpenThemeSheet}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.list, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconcirclebg]} >
                <ImageUri uri={PROFILE_URLS.appearenceLogo} height={s(18)} width={s(18)} />
              </ViewComponent>
              <TextMultiLangauge text={"GLOBAL_CONSTANTS.APPEARANCE"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]} />
              <TextMultiLangauge text={selectedThemeObject?.label} style={[commonStyles.textGrey, commonStyles.fs14, commonStyles.fw500]} />
               <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
            </ViewComponent>
          </CommonTouchableOpacity>
          <ViewComponent style={commonStyles.menuitemspace} />

          {/* Permissions setting */}
          <CommonTouchableOpacity
            onPress={handleNavigatePermissions}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.list, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconcirclebg]} >
                <ImageUri uri={PROFILE_URLS.permissionsLogo} height={s(18)} width={s(18)} />

              </ViewComponent>
              <TextMultiLangauge text={"GLOBAL_CONSTANTS.PERMISSIONS"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]} />
               <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
            </ViewComponent>
          </CommonTouchableOpacity>
          <ViewComponent style={commonStyles.menuitemspace} />

          {/* Network diagnostics */}
          <CommonTouchableOpacity
            onPress={() => handleNavigateToComingSoon('Network Diagnostics')}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.list, commonStyles.gap16]}>
              <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconcirclebg]} >
                <ImageUri uri={PROFILE_URLS.networkDiagnostics} height={s(18)} width={s(18)} />
              </ViewComponent>
              <TextMultiLangauge text={"GLOBAL_CONSTANTS.NETWORKDIAGNOSTICS"} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]} />
               <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
            </ViewComponent>
          </CommonTouchableOpacity>
        </ScrollViewComponent>
      </Container>

      {/* popoUp loader for language switching */}
      <PopupOrSheet
        ref={popupRef}
        height={s(350)}
        showCloseIcon={false}
      >
        <ViewComponent style={[reversCommonStyles.mx14]}>
          <ActivityIndicator size="large" color={REVERSE_NEW_COLOR.TEXT_GREY} />
          <TextMultiLangauge text={"GLOBAL_CONSTANTS.PLEASE_WAIT"} style={[reversCommonStyles.textWhite, reversCommonStyles.fs16, reversCommonStyles.fw600, reversCommonStyles.textCenter, reversCommonStyles.mt10]} />
        </ViewComponent>
      </PopupOrSheet>
    </ViewComponent>
  );
};

export default Settings;
