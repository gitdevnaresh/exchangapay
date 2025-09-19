import React, { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView, Linking, Text } from "react-native";
import {
  StyleService,
  TopNavigation,
  useStyleSheet,
} from "@ui-kitten/components";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import { TouchableOpacity } from "react-native";
import AuthService from "../../services/auth";
import {
  isLogin,
  loginAction,
  setUserInfo,
} from "../../redux/Actions/UserActions";
import { useDispatch, useSelector } from "react-redux";
import {
  CommonActions,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { commonStyles } from "../../components/CommonStyles";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import { s } from "../../constants/theme/scale";
import { TouchableWebElement } from "@ui-kitten/components/devsupport";
import { CONSTANTS, EMAIL_CONSTANTS } from "./constants";
import { RenderHTML } from "react-native-render-html";
import ErrorComponent from "../../components/Error";
import { isErrorDispaly } from "../../utils/helpers";
import { progressSkeltons } from "../Profile/skeleton_views";
import Loadding from "../../components/skeleton";
import { IconRefresh, LogoxWhite } from "../../assets/svg";
import { fcmNotification } from "../../utils/FCMNotification";
import DeviceInfo from "react-native-device-info";
import { useAuth0 } from "react-native-auth0";
import useMemberLogin from "../../hooks/useMemberLogin";

const AccountProgress = (props: any) => {
  const styles = useStyleSheet(themedStyles);
  const navigation = useNavigation();
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const skeltons = progressSkeltons();
  const { clearSession } = useAuth0();
  const { getMemDetails } = useMemberLogin();
  useEffect(() => {
    handleGetCustomerNotes();
  }, [isFocused]);

  const handleGetCustomerNotes = async () => {
    setHtmlContent({});
    setIsLoading(true);
    try {
      const response: any = await AuthService.customerNotes();
      if (response?.data) {
        setHtmlContent(response?.data);
        setIsLoading(false);
      } else {
        setErrorMsg(isErrorDispaly(response));
        setHtmlContent({});
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
      setHtmlContent({});
      setIsLoading(false);
    }
  };

  const handleLinkPress = (href: any) => {
    if (href.startsWith("mailto:")) {
      Linking.openURL(href).catch((err) =>
        console.error("Failed to open email:", err)
      );
    } else {
      navigation.navigate("addKycInfomation");
    }
  };

  const handleCloseError = () => {
    setErrorMsg(null);
  };

  const logOutLogData = async () => {
    const ip = await DeviceInfo.getIpAddress();
    const deviceName = await DeviceInfo.getDeviceName();
    const obj = {
      id: "",
      state: "",
      countryName: "",
      ipAddress: ip,
      info: `{brand:${DeviceInfo.getBrand()},deviceName:${deviceName},model: ${DeviceInfo.getDeviceId()}}`,
    };
    const actionRes = await AuthService.logOutLog(obj);
  };
  const handleLgout = async () => {
    await clearSession();
    dispatch(setUserInfo(""));
    dispatch(isLogin(false));
    dispatch(loginAction(""));
    logOutLogData();
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: EMAIL_CONSTANTS.SPLASH_SCREEN }],
      })
    );
    fcmNotification.unRegister();
  };

  const handleRefresh = async () => {
    setSaveLoading(true);
    await getMemDetails({});
    setSaveLoading(false);
  };

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          <TopNavigation
            style={[
              commonStyles.gap24,
              { padding: 0, backgroundColor: CONSTANTS?.TRANSPARENT },
            ]}
            accessoryLeft={(): TouchableWebElement => (
              <View>
                <View
                  style={[
                    commonStyles.dflex,
                    commonStyles.alignCenter,
                    commonStyles.gap4,
                  ]}
                >
                  <View style={{ width: s(27), height: s(25) }}>
                    <LogoxWhite width={s(26)} height={s(24)} />
                  </View>
                  <ParagraphComponent
                    text={CONSTANTS?.EXCHANGA_PAY}
                    style={[
                      commonStyles.fs22,
                      commonStyles.fw700,
                      commonStyles.textLogo,
                      { marginTop: -4 },
                    ]}
                  />
                </View>
              </View>
            )}
          />
          {isLoading && <Loadding contenthtml={skeltons} />}
          {errorMsg && (
            <ErrorComponent message={errorMsg} onClose={handleCloseError} />
          )}

          {!isLoading && htmlContent?.message && (
            <View style={commonStyles.flex1}>
              <RenderHTML
                contentWidth={WINDOW_WIDTH}
                source={{ html: htmlContent?.message }}
                tagsStyles={{
                  body: { color: NEW_COLOR.TEXT_BLACK },
                }}
                renderersProps={{
                  a: {
                    onPress: (event, href) => handleLinkPress(href),
                  },
                }}
                enableExperimentalMarginCollapsing={true}
              />
            </View>
          )}
          {!htmlContent?.message && (
            <Container
              style={[
                commonStyles.container,
                commonStyles.flex1,
                commonStyles.dflex,
                commonStyles.alignCenter,
              ]}
            >
              <View style={commonStyles.flex1}>
                <View style={[commonStyles.mb16]} />
                <IconRefresh
                  height={s(40)}
                  width={s(40)}
                  style={[commonStyles.mxAuto]}
                />
                <View style={[commonStyles.mb24]} />
                <ParagraphComponent
                  style={[
                    commonStyles.textCenter,
                    commonStyles.textBlack,
                    commonStyles.fs16,
                    commonStyles.fw800,
                  ]}
                  text={"Your account is Inprogress"}
                />
                <View style={[commonStyles.mb8]} />
                <ParagraphComponent
                  style={[
                    commonStyles.textCenter,
                    commonStyles.textBlack,
                    commonStyles.fs14,
                    commonStyles.fw600,
                  ]}
                  text={"please contact support"}
                />
                <View style={[commonStyles.mb43]} />
              </View>
            </Container>
          )}

          <View style={[commonStyles.mb24]} />
          <DefaultButton
            title={CONSTANTS?.REFRESH}
            customTitleStyle={styles.btnConfirmTitle}
            icon={undefined}
            style={undefined}
            customButtonStyle={undefined}
            customContainerStyle={undefined}
            backgroundColors={undefined}
            colorful={undefined}
            transparent={undefined}
            disable={saveLoading}
            loading={saveLoading}
            refresh={true}
            onPress={handleRefresh}
          />
          <View style={[commonStyles.mb24]} />
        </Container>
        <View
          style={[
            commonStyles.dflex,
            commonStyles.alignCenter,
            commonStyles.justifyCenter,
          ]}
        >
          <TouchableOpacity onPress={handleLgout} style={[commonStyles.px10]}>
            <Text
              style={[
                commonStyles.textCenter,
                commonStyles.textOrange,
                commonStyles.fs16,
                commonStyles.fw600,
              ]}
            >
              {EMAIL_CONSTANTS.LOG_OUT}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountProgress;

const themedStyles = StyleService.create({
  btnConfirmTitle: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
  },
  dashedBorder: {
    padding: 4,
    borderRadius: s(50) / 2,
    borderWidth: 1,
    borderColor: NEW_COLOR.PROFILE_BORDER,
    borderStyle: "dashed",
  },
  profile: {
    width: s(36),
    height: s(36),
    borderRadius: s(36) / 2,
  },
  container: {
    flex: 1,
  },
});
