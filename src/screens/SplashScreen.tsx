import React, { useEffect } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
// NOTE: navigation is deliberately not imported here. The splash screen must never
// navigate into the app by itself — routing is driven by real session state via
// getMemDetails/useMemberLogin. See security finding C-04: a removed "temp login"
// fallback used CommonActions.reset to jump straight to the Dashboard after
// fabricating a verified, KYC-approved user. Every failure path here must fail closed.
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Checkbox, Container } from "../components";
import { useAuth0 } from "react-native-auth0";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../hooks/useReduxStore";
import {
  isSessionExpired,
  loginAction,
  isLogin,
  setUserInfo,
} from "../redux/Actions/UserActions";
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultButton from "../components/DefaultButton";
import {
  NEW_COLOR,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from "../constants/theme/variables";
import ParagraphComponent from "../components/Paragraph/Paragraph";
import { ms, s } from "../constants/theme/scale";
import { fcmNotification } from "../utils/FCMNotification";
import { commonStyles } from "../components/CommonStyles";
import LockedModal from "../components/LockedModal";
import { getAllEnvData } from "../../Environment";
import useMemberLogin from "../hooks/useMemberLogin";
import useChekBio from "../hooks/useCheckBio";
import { storeToken } from "../utils/helpers";
import { log } from "../utils/logger";
const SplashScreen = React.memo(() => {
  const { authorize, getCredentials, clearSession } = useAuth0();
  const [loading, setLoading] = React.useState(false);
  const dispatch = useAppDispatch();
  const styles = useStyleSheet(themedStyles);
  const [fcmToken, setFcmToken] = React.useState<string>("");
  const [isNewLogin, setIsNewLogin] = React.useState<boolean>(false);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const persistedLoginState = useSelector(
    (state: any) => state.UserReducer?.login
  );
  const persistedUserInfo = useSelector(
    (state: any) => state.UserReducer?.userInfo
  );
  const [isChecked, setIsChecked] = React.useState<boolean>(false);
  const [show, setShow] = React.useState<boolean>(false);
  const { memberLoader, getMemDetails, isOnboarding } = useMemberLogin();
  const { isLocedModelOpen, checkBio, handleUpdateModel } = useChekBio();

  // Main authentication initialization effect
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;
      setLoading(true);
      try {
        const credentials = await getCredentials();
        if (credentials?.accessToken) {
          await restoreUserSession(credentials, false);
        } else if (persistedLoginState && persistedUserInfo) {
          await clearPersistedState();
        } else {
          // No session at all, user needs to login
          log.debug("No session found, user needs to login");
        }
      } catch (error) {
        await clearPersistedState();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isInitialized, fcmToken]);

  // Restore user session from Auth0 credentials
  const restoreUserSession = async (
    credentials: any,
    isNewLogin: boolean = false
  ) => {
    try {
      // Create a serializable credentials object
      const safeCredentials = {
        accessToken: credentials?.accessToken || "",
        refreshToken: credentials?.refreshToken || "",
        idToken: credentials?.idToken || "",
        expiresIn: credentials?.expiresIn || 0,
        tokenType: credentials?.tokenType || "Bearer",
      };

      // Ensure we're storing serializable data
      dispatch(loginAction(JSON.parse(JSON.stringify(safeCredentials))));
      await storeToken(credentials?.accessToken, credentials?.refreshToken);

      const userDetails = {
        isNewLogin,
        fcmTken: fcmToken,
        isSplashScreen: true,
      };

      // M-16: the payload is deliberately NOT logged — `userDetails` carries the
      // FCM token, which is a push-notification credential for this install.
      log.debug("Restoring session", { isNewLogin });
      // Call getMemDetails separately to avoid race conditions
      await getMemDetails(userDetails, true);
      log.debug("User session restored successfully");
    } catch (error) {
      log.error("Failed to restore user session", error);
      await clearPersistedState();
    }
  };

  // Clear all persisted authentication state
  const clearPersistedState = async () => {
    try {
      // Use proper serializable values
      dispatch(loginAction(""));
      dispatch(isLogin(false));
      dispatch(setUserInfo(null));
      await clearSession();
    } catch (error) {
      log.error("Error clearing persisted state", error);
    }
  };

  useEffect(() => {
    fcmNotification.createtoken((token: string) => {
      setFcmToken(token);
    });
    dispatch(isSessionExpired(false));
  }, []);

  useEffect(() => {
    if (isOnboarding === true) {
      checkBio();
    }
  }, [isOnboarding]);

  const getUrl = (path: string) => {
    const envList = getAllEnvData();
    return (envList.oAuthConfig as any)[path];
  };
  const onChange = () => {
    setIsChecked(!isChecked);
  };
  const onPress = async () => {
    setShow(false);
    setIsChecked(false);
    try {
      setLoading(true);
      setIsNewLogin(true);

      const authConfig = {
        scope: getUrl("scope"),
        audience: getUrl("audience"),
      };

      await authorize(authConfig);

      // After successful authorization, get credentials and restore session
      const credentials = await getCredentials();
      if (credentials?.accessToken) {
        await restoreUserSession(credentials, true);
      }

      setLoading(false);
    } catch (e) {
      log.error("Auth0 authorization failed", e);
      setLoading(false);
    }
  };

  const onSignupPress = async () => {
    setShow(false);
    setIsChecked(false);
    try {
      setLoading(true);
      setIsNewLogin(true);

      await authorize({
        scope: getUrl("scope"),
        audience: getUrl("audience"),
        additionalParameters: { screen_hint: "signup" },
      });

      // After successful authorization, get credentials and restore session
      const credentials = await getCredentials();
      if (credentials?.accessToken) {
        await restoreUserSession(credentials, true);
      }

      setLoading(false);
    } catch (e) {
      log.error("Auth0 signup failed", e);
      setLoading(false);
    }
  };

  const handleShow = () => {
    setShow(true);
  };

  return (
    <Container style={styles.container}>
      <ImageBackground
        source={require("../assets/images/login-bg.png")}
        resizeMode="cover"
        style={[styles.loginBg]}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: "flex-end" }}>
          <View
            style={[
              styles.p16,
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                maxHeight: WINDOW_HEIGHT * 0.6,
              },
            ]}
          >
            <View style={{ width: WINDOW_WIDTH - 48 }}>
              <Image
                source={require("../assets/images/exchanga_logo.png")}
                resizeMode="contain"
                style={[commonStyles.mxAuto, { height: s(300) }]} // Added height to prevent flicker
              />

              <View style={{ minHeight: s(80), justifyContent: "center" }}>
                <ActivityIndicator
                  size="large"
                  color="#FFF"
                  style={{ opacity: memberLoader || loading ? 1 : 0 }}
                />

                <View
                  style={{
                    opacity:
                      !(memberLoader || loading) && !persistedLoginState
                        ? 1
                        : 0,
                  }}
                >
                  <DefaultButton
                    title={"Login"}
                    customTitleStyle={styles.btnConfirmTitle}
                    icon={undefined}
                    style={undefined}
                    customButtonStyle={styles.customeBtn}
                    onPress={onPress}
                  />
                  <View style={[commonStyles.mb8]} />
                  <ParagraphComponent
                    style={[
                      commonStyles.textAlwaysWhite,
                      commonStyles.fs16,
                      commonStyles.fw400,
                      commonStyles.textCenter,
                    ]}
                    text={"Don't have an account?"}
                  />
                  <View
                    style={[commonStyles.dflex, commonStyles.justifyCenter]}
                  >
                    <TouchableOpacity onPress={handleShow}>
                      <ParagraphComponent
                        style={[
                          commonStyles.text_Black,
                          commonStyles.fs16,
                          commonStyles.fw800,
                        ]}
                        text={"Sign up"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View
            style={[commonStyles.p16, commonStyles.pt0, { minHeight: s(243) }]}
          >
            {show && !loading && !persistedLoginState && (
              <View>
                <View style={[commonStyles.mb43]} />
                <View >
                  <TouchableOpacity onPress={onChange} activeOpacity={0.7} style={[
                    commonStyles.dflex,
                    commonStyles.alignStart,
                    commonStyles.justifyContent,
                    commonStyles.gap8,
                  ]}>
                    <Checkbox
                      size={s(32)}
                      checked={isChecked}
                      activeColor={NEW_COLOR.TEXT_BLACK}
                      color={NEW_COLOR.TEXT_BLACK}
                    />

                    <ParagraphComponent
                      style={[
                        commonStyles.fs16,
                        commonStyles.fw400,
                        commonStyles.textAlwaysWhite,
                        commonStyles.flex1,
                      ]}
                      text="By proceeding, I confirm that I understand and agree to the monthly subscription fee of 50 USDT, which will be charged ﻿upon account approval"
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ marginTop: s(32), minHeight: s(60) }}>
                  {isChecked && (
                    <DefaultButton
                      title={"Next"}
                      icon={undefined}
                      onPress={onSignupPress}
                      style={undefined}
                      customContainerStyle={undefined}
                      backgroundColors={undefined}
                      disable={undefined}
                      loading={false}
                      colorful={undefined}
                      iconArrowRight={false}
                      customButtonStyle={{
                        backgroundColor: NEW_COLOR.BG_BLACK,
                        width: WINDOW_WIDTH / 3,
                        marginLeft: "auto",
                        paddingVertical: ms(6),
                        marginRight: "auto",
                        minHeight: s(38),
                      }}
                      transparent={undefined}
                      loadingProps={{ size: s(16) }}
                    />
                  )}
                </View>
              </View>
            )}
          </View>
          {isLocedModelOpen && (
            <LockedModal
              visible={isLocedModelOpen}
              onCancel={() => handleUpdateModel(false)}
              onConfirm={() => {
                handleUpdateModel(false);
                checkBio();
              }}
              title="Biometric Authentication Failed"
              remark=""
              amount=""
              setRemark={() => { }}
              setAmount={() => { }}
              btnLoading={false}
              btndisabled={false}
              erroMsg=""
              errorAmt=""
              stateErrorMsg=""
              setStateErrorMsg={() => { }}
            />
          )}
        </SafeAreaView>
      </ImageBackground>
    </Container>
  );
});

export default SplashScreen;

const themedStyles = StyleService.create({
  logo: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  title: {
    fontSize: ms(36),
    fontWeight: "500",
    color: NEW_COLOR.TEXT_WHITE,
    textAlign: "center",
  },
  p16: {
    padding: 16,
  },
  loginBg: {
    flex: 1,
  },
  container: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: NEW_COLOR.BG_PURPLE,
  },
  minHeight: { marginTop: s(40), minHeight: 50 },
  customeBtn: {
    backgroundColor: NEW_COLOR.BG_BLACK,
    width: WINDOW_WIDTH - 48,
    marginLeft: "auto",
    marginRight: "auto",
  },
});
