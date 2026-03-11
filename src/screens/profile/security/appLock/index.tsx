import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import * as LocalAuthentication from "expo-local-authentication";
import useBiometricAuth from "../../../commonScreens/biometricAuthentication/biometricAuth";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import Container from "../../../../newComponents/container/container";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { showAppToast } from "../../../../newComponents/ToasterMessages/ShowMessage";
import PopupOrSheet from "../../../../newComponents/models/PopupOrSheet";
import PatternLock from "../../../../newComponents/pattren/pattrenCompoenent";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import CustomSwitch from "../../../../newComponents/switch";
import {
  setAutoLockTime,
  setBiometricEnabled,
  setPatternsEnabled,
} from "../../../../redux/actions/actions";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { isErrorDispaly } from "../../../../utils/helpers";
import ProfileService from "../../../../services/profile";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { s } from "../../../../constants/theme/scale";
import PatternLockHelper from "../../../../utils/patternLockHelper";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ViewComponent from "../../../../newComponents/view/view";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { PROFILE_URLS } from "../../../../assets/blobUrls";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
type SetupStage = "create" | "confirm" | "success" | "error";

const AUTO_LOCK_OPTIONS = [
  // { label: "Immediately", value: 0 },
  { label: "1 minute", value: 1 },
  { label: "2 minutes", value: 2 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "None", value: 0 },
];
const MIN_PATTERN_LENGTH = 4;

const AppLock = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { isBiometricEnabled, isPatternEnabled, autoLockTime } = useSelector(
    (state: any) => state.userReducer
  );

  const [biometricsEnabled, setBiometricsEnabled] =
    useState(isBiometricEnabled);
  const [patternEnabled, setPatternEnabled] = useState(isPatternEnabled);
  const [autoLock, setAutoLock] = useState(autoLockTime || 5);

  const patternRbSheetRef = useRef<any>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { authenticateUser } = useBiometricAuth();
  const [applockLoading, setApplockLoading] = useState(false);
  const [stage, setStage] = useState<SetupStage>("create");
  const [errMessage, setErrMessage] = useState<string>("");
  const [initialPattern, setInitialPattern] = useState<number[] | null>(null);
  const [patternNo, setPatternNo] = useState<number | null>(null);
  const [biometricLoader, setBiometricLoader] = useState<any>(false);
  const [patternLoader, setPatternLoader] = useState<any>(false);
  const [error, setError] = useState<string>("");
  const { t } = useLngTranslation();
  useEffect(() => {
    getApplock();
  }, []);
  useHardwareBackHandler(() => {
    handleBackPress();
    return true;
  });

  const getApplock = async () => {
    setError("");
    setApplockLoading(true);
    try {
      const response: any = await ProfileService.getApplock();
      if (response?.ok) {
        setBiometricsEnabled(response?.data?.isBiometric);
        setPatternEnabled(response?.data?.isPattern);
        setAutoLock(response?.data?.minutes);
        setPatternNo(response?.data?.patternNo);
        // Dispatch to sync Redux store
        dispatch(setBiometricEnabled(response?.data?.isBiometric));
        dispatch(setPatternsEnabled(response?.data?.isPattern));
        dispatch(setAutoLockTime(response?.data?.minutes));
      } else {
        setError(isErrorDispaly(response));
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setApplockLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // --- Biometrics Toggle Handler ---
  const handleBiometricsToggle = async (newValue: boolean) => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware || !(await LocalAuthentication.isEnrolledAsync())) {
      showAppToast(t("GLOBAL_CONSTANTS.BIOMETRICS_NOT_AVAILABLE_OR_NOT_ENROLLED"), "info");
      return;
    }

    const authSuccess = await authenticateUser();
    if (authSuccess) {
      setBiometricLoader(true);
      const previousValue = biometricsEnabled;
      setBiometricsEnabled(newValue); // Optimistic UI update
      dispatch(setBiometricEnabled(newValue));

      try {
        const payload = {
          isBiometric: newValue,
          isPattern: patternEnabled,
          minutes: autoLock,
          patternNo: patternNo,
        };
        const response = await ProfileService.updateApplock(payload);
        if (!response?.ok) throw new Error(isErrorDispaly(response));
        showAppToast(
          t(newValue ? "GLOBAL_CONSTANTS.BIOMETRICS_ENABLED" : "GLOBAL_CONSTANTS.BIOMETRICS_DISABLED"),
          "success"
        );
      } catch (error) {
        setError(isErrorDispaly(error));
        setBiometricsEnabled(previousValue); // Rollback on failure
        dispatch(setBiometricEnabled(previousValue));
      } finally {
        setBiometricLoader(false);
      }
    }
  };

  // --- Pattern Toggle Handler ---
  const handlePatternToggle = async (newValue: boolean) => {
    navigation.navigate("ComingSoon", {
      pageHeader: false,
      customHeader: {
        title: "Create Pattern Password",
        showBackButton: true,
      },
    });
    // if (newValue) {
    //   // To enable, open the creation sheet
    //   resetSetup();
    //   patternRbSheetRef.current?.open();
    // } else if (!newValue) {
    //   // To disable, authenticate and call API
    //   const authSuccess = await authenticateUser();
    //   if (authSuccess) {
    //     const previousValue = patternEnabled;
    //     setPatternEnabled(false);
    //     dispatch(setPatternsEnabled(false));
    //     setPatternLoader(true);

    //     try {
    //       // Clear pattern locally first
    //       await PatternLockHelper.clearPattern();

    //       const payload = {
    //         isBiometric: biometricsEnabled,
    //         isPattern: false,
    //         patternNo: null,
    //         minutes: autoLock,
    //       };
    //       const response = await ProfileService.updateApplock(payload);
    //       if (!response?.ok) throw new Error(isErrorDispaly(response));
    //       showAppToast(t("GLOBAL_CONSTANTS.PATTRN_DESABLED"), "success");
    //     } catch (error) {
    //       showAppToast(isErrorDispaly(error), "error");
    //       setPatternEnabled(previousValue); // Rollback
    //       dispatch(setPatternsEnabled(previousValue));
    //     } finally {
    //       setPatternLoader(false);
    //     }
    //   }
    // }
  };

  // --- Auto-Lock Change Handler ---
  const handleAutoLockChange = async (val: number) => {
    const previousValue = autoLock;
    setAutoLock(val);
    dispatch(setAutoLockTime(val));
    try {
      const payload = {
        isBiometric: biometricsEnabled,
        isPattern: patternEnabled,
        minutes: val,
      };
      const response = await ProfileService.updateApplock(payload);
      if (!response?.ok) throw new Error(isErrorDispaly(response));
      showAppToast(t("GLOBAL_CONSTANTS.AUTO_LOCK_TIME_UPDATED"), "success");
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error");
      setAutoLock(previousValue); // Rollback
      dispatch(setAutoLockTime(previousValue));
    }
  };

  // --- Main Pattern Creation Logic Handler ---
  const handlePatternComplete = async (newPattern: number[]): Promise<void> => {
    if (stage === "create") {
      if (newPattern.length < MIN_PATTERN_LENGTH) {
        setErrMessage(
          t("GLOBAL_CONSTANTS.PATTERN_MIN_LENGTH_ERROR", { length: MIN_PATTERN_LENGTH })
        );
        return;
      }
      setInitialPattern(newPattern);
      setStage("confirm");
      setErrMessage("");
      return;
    }

    if (stage === "confirm") {
      const isMatch =
        JSON.stringify(initialPattern) === JSON.stringify(newPattern);
      setPatternNo(parseInt(newPattern.join(""), 10));
      if (isMatch) {
        try {
          // Save pattern locally first
          const saved = await PatternLockHelper.savePattern(newPattern);

          if (!saved) {
            showAppToast(t("GLOBAL_CONSTANTS.PATTERN_SAVE_FAILED"), "error");
          }

          const payload = {
            isBiometric: biometricsEnabled,
            isPattern: true,
            patternNo: parseInt(newPattern.join(""), 10), // NOTE: In a real app, hash this value
            minutes: autoLock,
          };
          const response = await ProfileService.updateApplock(payload);
          if (!response?.ok) throw new Error(isErrorDispaly(response));

          setPatternEnabled(true);
          dispatch(setPatternsEnabled(true));
          patternRbSheetRef.current?.close();
          showAppToast(t("GLOBAL_CONSTANTS.PATTERN_CREATED_SUCCESS"), "success");
        } catch (error) {
          showAppToast(isErrorDispaly(error), "error");
        }
      } else {
        setErrMessage(t("GLOBAL_CONSTANTS.PATTERNS_DO_NOT_MATCH"));
        setStage("create");
        setInitialPattern(null);
      }
    }
  };

  const resetSetup = (): void => {
    setStage("create");
    setInitialPattern(null);
    setErrMessage("");
  };

  const { title } = useMemo(() => {
    return stage === "confirm"
      ? { title: t("GLOBAL_CONSTANTS.CONFIRM_YOUR_PATTERN") }
      : { title: t("GLOBAL_CONSTANTS.CREATE_NEW_PATTERN") };
  }, [stage, t]);

  const autoLockDisplayText = AUTO_LOCK_OPTIONS.find((opt) => opt.value === autoLock)
    ?.label || `${autoLock} minutes`;

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {applockLoading &&
        <SafeAreaView style={[commonStyles.flex1]}>
          <SwokipayDashboardLoader />
        </SafeAreaView>
      }
      {!applockLoading && (

        <Container>
          <PageHeader onBackPress={handleBackPress} title={"GLOBAL_CONSTANTS.APP_LOCK_TITLE"} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {error && <ErrorComponent message={error} screen={true} />}

            <TextMultiLanguage text={"GLOBAL_CONSTANTS.APP_LOCK_DISCRIPTION"} style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.mb20, commonStyles.flex1]} />
            {/* Toggles */}
            <ViewComponent style={[commonStyles.menuitemspace, commonStyles.dflex, commonStyles.justifyContent, commonStyles.appLockoutside]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                  <ImageUri uri={PROFILE_URLS.fingerPringLogo} height={s(18)} width={s(18)} />
                </ViewComponent>
                <TextMultiLanguage style={[commonStyles.fs16, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.BIOMETRICS"} />
              </ViewComponent>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                {biometricLoader && (
                  <ActivityIndicator
                    style={[commonStyles.mr10]}
                    color={NEW_COLOR.BG_YELLOW}
                  />
                )}
                <CustomSwitch
                  value={biometricsEnabled}
                  onValueChange={handleBiometricsToggle}
                />
              </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.menuitemspace, commonStyles.dflex, commonStyles.justifyContent, commonStyles.appLockoutside]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                  <ImageUri uri={PROFILE_URLS.pattrnLogo} height={s(18)} width={s(18)} />
                </ViewComponent>
                <TextMultiLanguage style={[commonStyles.fs16, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.CREATE_PATTERN_PASSWORD"} />

              </ViewComponent>
              <ViewComponent style={{ flexDirection: "row", alignItems: "center" }}>
                {patternLoader && (
                  <ActivityIndicator
                    style={[commonStyles.mr10]}
                    color={NEW_COLOR.BG_YELLOW}
                  />
                )}
                <CustomSwitch
                  value={patternEnabled}
                  onValueChange={handlePatternToggle}
                />
              </ViewComponent>
            </ViewComponent>

            {/* Auto-Lock */}
            {(biometricsEnabled || patternEnabled) && (
              <TouchableOpacity
                style={[commonStyles.mb24, commonStyles.dflex, commonStyles.justifyContent, commonStyles.appLockoutside]}
                onPress={() => {
                  navigation.navigate("AutoLock", {
                    biometricsEnabled: biometricsEnabled,
                    autoLock: autoLock,
                    setAutoLock: setAutoLock,
                    options: AUTO_LOCK_OPTIONS,
                    patternEnabled: patternEnabled,
                    patternNo: patternNo,
                  });
                }}
              >
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>

                  <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                    <Feather name="lock" size={s(18)} color={NEW_COLOR.TEXT_WHITE} />
                  </ViewComponent>
                  <TextMultiLanguage style={[commonStyles.fs16, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.APPLOCK"} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap12]} >
                  <ParagraphComponent style={[commonStyles.fs14, commonStyles.textGrey, commonStyles.fw400]}>
                    {autoLockDisplayText}
                  </ParagraphComponent>
                  <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} /></ViewComponent>
              </TouchableOpacity>
            )}

            {/* Pattern Creation Sheet */}
            <PopupOrSheet
              displayType="bottom-sheet"
              ref={patternRbSheetRef}
              height={s(600)}
              title={title}
            >
              <ViewComponent style={{ padding: s(20) }}>
                {errMessage && (
                  <ErrorComponent
                    message={errMessage}
                    onClose={() => setErrMessage("")}
                  />
                )}
                <PatternLock onPatternComplete={handlePatternComplete} />
              </ViewComponent>
            </PopupOrSheet>
          </ScrollView>
        </Container>

      )}
    </ViewComponent>
  );
};


export default AppLock;
