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
import { isSessionExpired } from "../redux/Actions/UserActions";
import { clearLocalSession } from "../utils/session/clearLocalSession";
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
import { checkAndRefreshToken, flushPendingRevokes, storeToken } from "../utils/helpers";
import {
  isTransientTokenFailure,
  readAccessToken,
  storeAuthTokens,
} from "../utils/storage/authTokens";
import { log } from "../utils/logger";
import {
  initializeDeviceIntegrity,
  isDeviceCompromised,
  isEnforcementEnabled,
} from "../security";

const AUTHORIZE_OPTIONS = { ephemeralSession: true };

const SplashScreen = React.memo(() => {
  const { authorize, getCredentials, clearCredentials } = useAuth0();
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
  const { isLocedModelOpen, checkBio, handleUpdateModel, lockReason } = useChekBio();

  // Main authentication initialization effect
  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;
      // L-03: retry revokes an offline logout could not complete.
      flushPendingRevokes();
      // Hold login until the device passes the root/jailbreak check.
      const integrity = await initializeDeviceIntegrity();
      if (isEnforcementEnabled() && isDeviceCompromised(integrity)) return;
      setLoading(true);
      try {
        await migrateSdkCredentials();
        // M-06: the app Keychain is the only credential store. The refresh is
        // the shared single-flight one, so it cannot race the refresh timer.
        const outcome = await checkAndRefreshToken();
        if (outcome === "ok") {
          await restoreUserSession(false);
        } else if (outcome !== "no-session") {
          // rejected / unavailable: the same fail-closed path getCredentials()
          // throwing used to take.
          await clearPersistedState();
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

  /**
   * M-06: the Auth0 SDK's credentials manager kept its own copy of the refresh
   * token, which went stale as soon as the app rotated the Keychain copy — and
   * a stale token reused on the next start revokes the whole token family. It
   * also sat outside the keychainPolicy accessibility rules.
   *
   * Installs from earlier builds may still hold credentials there. If the
   * Keychain has no session, the SDK copy is the only one (the app never
   * refreshed it out-of-band), so it is moved across once. Either way the SDK
   * store is then emptied. A Keychain that cannot be read right now is left
   * alone, since we cannot tell which copy is authoritative.
   */
  const migrateSdkCredentials = async () => {
    const stored = await readAccessToken();
    if (isTransientTokenFailure(stored.status)) return;
    if (stored.status === "empty" || !stored.value) {
      try {
        const legacy = await getCredentials();
        if (legacy?.accessToken) {
          await storeAuthTokens(legacy.accessToken, legacy.refreshToken);
        }
      } catch (error) {
        // no_credentials is the normal case: nothing to migrate. A failed
        // Keychain write keeps the SDK copy for the next start.
        if ((error as any)?.code !== "no_credentials") {
          log.warn("Auth0 credential migration skipped");
          return;
        }
      }
    }
    await dropSdkCredentials();
  };

  // Empties the SDK credentials manager; the app Keychain stays untouched.
  const dropSdkCredentials = async () => {
    try {
      await clearCredentials();
    } catch (error) {
      log.warn("Could not clear Auth0 SDK credentials");
    }
  };

  // Store tokens from a fresh login in the app Keychain — the single
  // credential store — and drop the copy the SDK saved for itself (M-06).
  const storeLoginCredentials = async (credentials: any) => {
    // H-05: the access, refresh and id tokens used to be dispatched into
    // Redux here as well as stored in the Keychain. Nothing ever read them
    // back — the only consumer of a token is GetTokens(), which reads the
    // Keychain — so the copy existed purely to be persisted into a weaker
    // store alongside the key that decrypts the user's data. Removed.
    await storeToken(credentials?.accessToken, credentials?.refreshToken);
    await dropSdkCredentials();
  };

  // Restore the user session; tokens are already in the Keychain.
  const restoreUserSession = async (isNewLogin: boolean = false) => {
    try {
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

  // Clear all persisted authentication state: the same wipe logout runs
  // (Keychain, persisted state, caches, keys, every Redux slice), not just
  // Auth0 and the login flag (L-09).
  const clearPersistedState = async () => {
    try {
      await clearCredentials();
    } catch (error) {
      log.error("Error clearing persisted state", error);
    }
    await clearLocalSession();
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

  // N-01: renamed from `getUrl`. It shadowed the exported getUrl() in
  // apiInterceptors, which resolves API HOSTS from apiUrls and now throws on an
  // unknown key — while this one reads oAuthConfig. Two functions with one name
  // and different maps is how a reader concludes a key is defined when it is not.
  const getOAuthValue = (path: string) => {
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
        scope: getOAuthValue("scope"),
        audience: getOAuthValue("audience"),
        additionalParameters: { prompt: "login" },
      };

      const credentials = await authorize(authConfig, AUTHORIZE_OPTIONS);
      if (credentials?.accessToken) {
        await storeLoginCredentials(credentials);
        await restoreUserSession(true);
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

      const credentials = await authorize({
        scope: getOAuthValue("scope"),
        audience: getOAuthValue("audience"),
        additionalParameters: { screen_hint: "signup", prompt: "login" },
      }, AUTHORIZE_OPTIONS);
      if (credentials?.accessToken) {
        await storeLoginCredentials(credentials);
        await restoreUserSession(true);
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

  // Login / Sign up are only usable once startup checks finish and no session exists.
  const showAuthActions = !(memberLoader || loading) && !persistedLoginState;

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
                  // Hidden by opacity so the layout does not shift; stop it
                  // taking taps while it is invisible.
                  pointerEvents={showAuthActions ? "auto" : "none"}
                  style={{ opacity: showAuthActions ? 1 : 0 }}
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
              // H-14: say why the unlock did not happen. "No screen lock on
              // this device" and "you cancelled" need different actions from
              // the user, and the modal's fixed copy cannot tell them apart.
              stateErrorMsg={lockReason}
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
