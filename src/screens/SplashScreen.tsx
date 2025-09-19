import React, { useEffect } from "react";
import { View, Image, ActivityIndicator, ImageBackground } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Checkbox, Container } from "../components";
import { useAuth0 } from "react-native-auth0";
import { useDispatch } from "react-redux";
import crashlytics from "@react-native-firebase/crashlytics";
import { isSessionExpired, loginAction } from "../redux/Actions/UserActions";
import { SafeAreaView } from "react-native-safe-area-context";
import DefaultButton from "../components/DefaultButton";
import { TouchableOpacity } from "react-native";
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
const SplashScreen = React.memo(() => {
  const { authorize, getCredentials, user } = useAuth0();
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const styles = useStyleSheet(themedStyles);
  const [fcmToken, setFcmToken] = React.useState<string>("");
  const isFocused = useIsFocused();
  const [isNewLogin, setIsNewLogin] = React.useState<boolean>(false);
  const isUserLogin = user !== undefined && user !== null;
  const [isChecked, setIsChecked] = React.useState<boolean>(false);
  const [show, setShow] = React.useState<boolean>(false);
  const { memberLoader, getMemDetails, isOnboarding } = useMemberLogin();
  const { isLocedModelOpen, checkBio, handleUpdateModel } = useChekBio();

  useEffect(() => {
    if (isUserLogin) {
      setInfo();
    }
  }, [isUserLogin, isFocused]);

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
    return envList.oAuthConfig[path];
  };
  const onChange = () => {
    setIsChecked(!isChecked);
  };
  const onPress = async () => {
    setShow(false);
    setIsChecked(false);
    try {
      dispatch(loginAction(""));
      setLoading(true);
      setIsNewLogin(true);

      const authConfig = {
        scope: getUrl("scope"),
        audience: getUrl("audience"),
      };

      await authorize(authConfig);
      setLoading(false);
      setIsNewLogin(true);
    } catch (e) {
      console.error("Auth0 authorization failed:", e);
      setLoading(false);
    }
  };

  const onSignupPress = async () => {
    setShow(false);
    setIsChecked(false);
    try {
      dispatch(loginAction(""));
      setLoading(true);
      setIsNewLogin(true);
      await authorize({
        scope: getUrl("scope"),
        audience: getUrl("audience"),
        additionalParameters: { screen_hint: "signup" },
      });

      setLoading(false);
      setIsNewLogin(true);
    } catch (e) {}
  };

  const setInfo = async () => {
    setLoading(true);
    try {
      const res: any = await getCredentials();
      dispatch(loginAction(res));
      await storeToken(res?.accessToken, res?.refreshToken);
      const userDetsils = {
        isNewLogin: isNewLogin,
        fcmTken: fcmToken,
        isSplashScreen: true,
      };
      await getMemDetails(userDetsils, true);
    } catch (err: any) {
      crashlytics().recordError(err);
      return setLoading(false);
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
                    opacity: !(memberLoader || loading) && !user ? 1 : 0,
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
            {show && !loading && !user && (
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
              onConfirm={() => {
                handleUpdateModel(false);
                checkBio();
              }}
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
