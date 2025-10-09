import React, { useEffect } from "react";
import { View, Image, ActivityIndicator, ImageBackground, TouchableOpacity } from "react-native";
import {
  useNavigation,
  CommonActions,
} from "@react-navigation/native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Checkbox, Container } from "../components";
import { useAuth0 } from "react-native-auth0";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../hooks/useReduxStore";
import { isSessionExpired, loginAction, isLogin, setUserInfo } from "../redux/Actions/UserActions";
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultButton from "../components/DefaultButton";
import { NEW_COLOR, WINDOW_HEIGHT, WINDOW_WIDTH } from "../constants/theme/variables";
import ParagraphComponent from "../components/Paragraph/Paragraph";
import { ms, s } from "../constants/theme/scale";
import { fcmNotification } from "../utils/FCMNotification";
import { commonStyles } from "../components/CommonStyles";
import LockedModal from "../components/LockedModal";
import { getAllEnvData } from "../../Environment";
import useMemberLogin from "../hooks/useMemberLogin";
import useChekBio from "../hooks/useCheckBio";
import { storeToken } from "../utils/helpers";
const SplashScreen = React.memo(() => {
  const { authorize, getCredentials, clearSession } = useAuth0();
  const [loading, setLoading] = React.useState(false);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const styles = useStyleSheet(themedStyles);
  const [fcmToken, setFcmToken] = React.useState<string>("");
  const [isNewLogin, setIsNewLogin] = React.useState<boolean>(false);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const persistedLoginState = useSelector((state: any) => state.UserReducer?.login);
  const persistedUserInfo = useSelector((state: any) => state.UserReducer?.userInfo);
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
          console.log("No session found, user needs to login");
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
      const safeCredentials = {
        accessToken: credentials?.accessToken || "",
        refreshToken: credentials?.refreshToken || "",
        idToken: credentials?.idToken || "",
        expiresIn: credentials?.expiresIn || 0,
        tokenType: credentials?.tokenType || "Bearer",
      };
      dispatch(loginAction(safeCredentials));
      await storeToken(credentials?.accessToken, credentials?.refreshToken);

      const userDetails = {
        isNewLogin,
        fcmTken: fcmToken,
        isSplashScreen: true,
      };

      console.log("Calling getMemDetails with:", userDetails);
      await getMemDetails(userDetails, true);
      console.log("User session restored successfully");
    } catch (error) {
      console.log("Failed to restore user session:", error);
      await clearPersistedState();
    }
  };

  // Clear all persisted authentication state
  const clearPersistedState = async () => {
    try {
      dispatch(loginAction(""));
      dispatch(isLogin(false));
      dispatch(setUserInfo(null));
      await clearSession();
    } catch (error) {
      console.log("Error clearing persisted state:", error);
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
    const envList = getAllEnvData("prod");
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
      console.error("Auth0 authorization failed:", e);
      setLoading(false);
    }
  };

  // Temporary login function using provided JWT token
  const onTempLoginPress = async () => {
    try {
      setLoading(true);
      setIsNewLogin(true);

      // Create mock credentials object with the provided JWT token
      const tempCredentials = {
        accessToken:
          "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlRyQndlTVdEbzdMLTIwLUhMNGVPdSJ9.eyJlY29kZSI6IndFM2JHMGRzc0ZzZHE3NC93b1RKc1BuOGlUaWV3bWxWbmhRYXovWFZmY1E9IiwiaWRjIjoiY0FnZVRyVmNlZ1grR1kvREc4K0dWenp0QUk0d2tYbS9WTURuNnRHVEZ4K1BOY1VjYURqK0VFWkRYa0R1dVdCdCIsImlkciI6IlBEWFYrUVZZbTkveUQyb0paYVJqQkE9PSIsImlzcyI6Imh0dHBzOi8vZXhjaGFuZ2FwYXktdHN0LmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHxhZGNiYzAzZi1iZjM2LTQzMjctYjExYi04YzkyMzVkNWZiYjYiLCJhdWQiOlsiaHR0cHM6Ly9FeGNoYW5nYVRzdEFwaS5uZXQiLCJodHRwczovL2V4Y2hhbmdhcGF5LXRzdC5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzU4MzYyNjY1LCJleHAiOjE3NTg0NDkwNjUsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgb2ZmbGluZV9hY2Nlc3MiLCJhenAiOiJ0dmFmZENWTE5SZUE1Nlp1RW84cTR5QkdHSmw2Uk9xSiJ9.KGAMar0aQdWntql5PE1bkxUb5uljtY2en9RkuCjONKoZGVf7G_1n623cXr6vVAtW3MkNalWhed4iproLCqzutcpJ-RMBMFHpZKsynnm20JGtPXb6NkIuRgVs-sW8wJaw-clFGFVIOUdwiJc0-n9bZx1clw1f81VScrgU1p_6KUvTiemNt-wskRjvoTkMpxz4d1qOB6qwVAkliUb4JbkABSfj41hnM9tk2sL3ZhiOauH_HJWW80R94LdoATYS3pvzgJZa65e4MtJEoDAhdZQZP0BdCUYZTJMuAcXWT7OCkvnbhHCDlwWm9DNM4HVJdLUzutseqTOTOgedN6b-k0_nNg",
        refreshToken: null, // No refresh token for temp login
        idToken: null,
        expiresIn: 86400, // 24 hours
        tokenType: "Bearer",
      };

      console.log("Using temporary login with provided JWT token");
      console.log(
        "Token expires at:",
        new Date(1758449065 * 1000).toISOString()
      );

      // IMPORTANT: Store the token in Keychain first before calling restoreUserSession
      // This ensures the API service can access the token for authentication
      await storeToken(
        tempCredentials.accessToken,
        tempCredentials.refreshToken
      );

      await restoreUserSession(tempCredentials, true);

      setLoading(false);
    } catch (e) {
      console.error("Temporary login failed:", e);
      // If the API call fails, let's try to navigate directly to Dashboard
      // This is a fallback in case the token is invalid or expired
      try {
        dispatch(isLogin(true));
        dispatch(
          setUserInfo({
            role: "Customer",
            isEmailVerified: true,
            isPhoneNumberVerified: true,
            isKYC: true,
            customerState: "Approved",
            isCustomerReferralCode: true,
            customerKycRequiredorNot: false,
            isReferralRequiredOrNot: false,
            isPhoneNumberverfiyWhileSignup: false,
            isSumsubKyc: false,
          })
        );
        // Navigate directly to Dashboard
        navigation?.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: "Dashboard" }],
          })
        );
      } catch (fallbackError) {
        console.error("Fallback navigation failed:", fallbackError);
      }
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
      console.error("Auth0 signup failed:", e);
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
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignStart,
                    commonStyles.justifyContent,
                    commonStyles.gap8,
                  ]}
                >
                  <TouchableOpacity onPress={onChange} activeOpacity={0.7}>
                    <Checkbox
                      size={s(32)}
                      checked={isChecked}
                      activeColor={NEW_COLOR.TEXT_BLACK}
                      color={NEW_COLOR.TEXT_BLACK}
                    />
                  </TouchableOpacity>
                  <ParagraphComponent
                    style={[
                      commonStyles.fs16,
                      commonStyles.fw400,
                      commonStyles.textAlwaysWhite,
                      commonStyles.flex1,
                    ]}
                    text="By proceeding, I confirm that I understand and agree to the monthly subscription fee of 50 USDT, which will be charged ﻿upon account approval"
                  />
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
