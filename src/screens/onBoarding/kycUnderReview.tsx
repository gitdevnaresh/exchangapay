import React, { useEffect, useState } from "react";
import { View, ScrollView, Linking, Text } from "react-native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import DefaultButton from "../../components/DefaultButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import AuthService from "../../services/auth";
import { useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { commonStyles } from "../../components/CommonStyles";
import { NEW_COLOR, WINDOW_WIDTH } from "../../constants/theme/variables";
import { s } from "../../constants/theme/scale";
import {
  CONSTANTS,
  EMAIL_CONSTANTS,
  REGISTRATION_CONSTATNTS,
} from "./constants";
import { WebView } from "react-native-webview";
import ErrorComponent from "../../components/Error";
import { isErrorDispaly } from "../../utils/helpers";
import { progressSkeltons } from "../Profile/skeleton_views";
import Loadding from "../../components/skeleton";
import { SvgUri } from "react-native-svg";
import useLogout from "../../hooks/useLogOut";
import useMemberLogin from "../../hooks/useMemberLogin";
import { SafeAreaView } from "react-native-safe-area-context";

const UnderReview = () => {
  const styles = useStyleSheet(themedStyles);
  const navigation = useNavigation<any>();
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const userInfo = useSelector((state: any) => state.UserReducer?.userInfo);
  const [htmlContent, setHtmlContent] = useState<any>({});
  const [errorMsg, setErrorMsg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLogout, setIsLogout] = useState<boolean>(false);
  const [webViewHeight, setWebViewHeight] = useState<number>(0);
  const { logout } = useLogout();
  const isFocused = useIsFocused();
  const skeltons = progressSkeltons();
  const { getMemDetails } = useMemberLogin();
  const injectedJavaScript = `
    (function() {
      function applyStyles() {
        var body = document.body;
        if (body) {
          body.style.color = "${NEW_COLOR.TEXT_BLACK}";
          body.style.backgroundColor = "transparent";
          body.style.margin = "0px";
          body.style.padding = "0px";
          body.style.paddingTop = "16px";
          body.style.paddingBottom = "24px";
          body.style.width = "100%";
        }
        var html = document.documentElement;
        if (html) {
          html.style.backgroundColor = "transparent";
          html.style.margin = "0px";
          html.style.padding = "0px";
          html.style.width = "100%";
        }
        var links = document.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
          var href = links[i].getAttribute('href') || '';
          if (href.startsWith('mailto:')) {
            links[i].style.backgroundColor = "transparent";
            links[i].style.display = "inline";
            links[i].style.padding = "0px";
            links[i].style.margin = "0px";
            links[i].style.color = "#0099FF";
            links[i].style.textDecoration = "underline";
            links[i].style.fontWeight = "600";
            links[i].style.borderRadius = "0px";
          } else {
            links[i].style.display = "block";
            links[i].style.width = "100%";
            links[i].style.boxSizing = "border-box";
            links[i].style.backgroundColor = "${NEW_COLOR.BG_ORANGE}";
            links[i].style.color = "${NEW_COLOR.TEXT_ALWAYS_WHITE}";
            links[i].style.textDecoration = "none";
            links[i].style.textAlign = "center";
            links[i].style.padding = "20px";
            links[i].style.borderRadius = "999px";
            links[i].style.border = "none";
            links[i].style.outline = "none";
            links[i].style.fontWeight = "700";
            links[i].style.fontFamily = "PlusJakartaSans-SemiBold, sans-serif";
            links[i].style.margin = "24px auto 0";
            links[i].style.maxWidth = "100%";
            links[i].style.letterSpacing = "0.5px";
          }
        }
      }
      function postHeight() {
        if (!document.body || !document.documentElement) {
          return;
        }
        var height = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.ReactNativeWebView.postMessage(height.toString());
      }
      applyStyles();
      setTimeout(function() {
        applyStyles();
        postHeight();
      }, 100);
    })();
    true;
  `;
  useEffect(() => {
    handleGetCustomerNotes();
  }, [isFocused]);

  const handleGetCustomerNotes = async () => {
    setHtmlContent({});
    setWebViewHeight(0);
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
  const handleWebViewMessage = (event: any) => {
    const height = Number(event?.nativeEvent?.data);
    if (!Number.isNaN(height) && height > 0) {
      setWebViewHeight(height);
    }
  };
  const handleLinkPress = (href: any) => {
    if (href.startsWith("mailto:")) {
      Linking.openURL(href).catch((err) =>
        console.error("Failed to open email:", err)
      );
    } else {
      navigation.navigate("addKycInfomation", {
        screenName: "resumit",
      });
    }
  };
  const handleCloseError = () => {
    setErrorMsg(null);
  };
  const handleRejectedNav = () => {
    navigation.navigate("addKycInfomation", {
      screenName: "resumit",
    });
  };
  const handleRefresh = async () => {
    setSaveLoading(true);
    await getMemDetails({});
    handleGetCustomerNotes();
    setSaveLoading(false);
  };
  const handleLogout = async () => {
    setIsLogout(true);
    await logout();
    setIsLogout(false);
  };
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Container style={commonStyles.container}>
          <View
            style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.mxAuto,
            ]}
          >
            <SvgUri
              uri={REGISTRATION_CONSTATNTS.EXCHANGAPAY_LOGO}
              width={s(61)}
              height={s(56)}
            />
            <ParagraphComponent
              text={REGISTRATION_CONSTATNTS.EXCHANGA_PAY}
              style={[
                commonStyles.fs32,
                commonStyles.fw800,
                commonStyles.textOrange,
                commonStyles.textCenter,
              ]}
            />
          </View>

          {isLoading && <Loadding contenthtml={skeltons} />}
          {errorMsg && (
            <ErrorComponent message={errorMsg} onClose={handleCloseError} />
          )}

          {!isLoading && htmlContent?.message && (
            <View style={[commonStyles.flex1, styles.webViewContainer]}>
              <WebView
                originWhitelist={["*"]}
                source={{ html: htmlContent?.message }}
                style={{
                  width: "100%",
                  height: webViewHeight || s(200),
                  backgroundColor: "transparent",
                  alignSelf: "stretch",
                  marginHorizontal: 0,
                }}
                injectedJavaScript={injectedJavaScript}
                onMessage={handleWebViewMessage}
                javaScriptEnabled
                scalesPageToFit={false}
                scrollEnabled={false}
                onShouldStartLoadWithRequest={(request) => {
                  if (request?.url && request.url !== "about:blank") {
                    handleLinkPress(request.url);
                    return false;
                  }
                  return true;
                }}
              />
            </View>
          )}
          {!isLoading &&
            (userInfo.customerState === "Approval In Progress" ||
              userInfo.customerState === "Registered" ||
              (userInfo.customerState === "Approved" &&
                userInfo?.isSumsubKyc)) &&
            !htmlContent?.message && (
              <Container style={[commonStyles.container, commonStyles.flex1]}>
                <View style={commonStyles.flex1}>
                  <ParagraphComponent
                    text="KYC Verification Status"
                    style={[
                      commonStyles.fs22,
                      commonStyles.fw700,
                      commonStyles.textCenter,
                      commonStyles.mb16,
                      commonStyles.textBlack,
                      { marginTop: 24 },
                    ]}
                  />

                  <ParagraphComponent
                    style={[
                      commonStyles.textCenter,
                      commonStyles.fs16,
                      commonStyles.mb16,
                      commonStyles.textBlack,
                    ]}
                    text={
                      "Thank you for completing your KYC. We are currently reviewing your documents. This process typically takes 1–5 minutes, but may occasionally take longer.\n\nOnce you’ve received your verification results via email, click the refresh button to update your status.\n\nIf you have any questions or need assistance, please don’t hesitate to contact our support team at "
                    }
                  />
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `mailto:${
                          userInfo?.supportEmail || "support@exchangapay.com"
                        }`
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <ParagraphComponent
                      text={userInfo?.supportEmail || " "}
                      style={[
                        commonStyles.textCenter,
                        commonStyles.fs16,
                        commonStyles.textBlack,
                        { color: "#0099FF", textDecorationLine: "underline" },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </Container>
            )}
          <View style={[commonStyles.mb24]} />
          {!isLoading &&
            userInfo.customerState?.toLowerCase() === "registered" &&
            !htmlContent?.message &&
            !userInfo.isSumsubKyc && (
              <Container style={[commonStyles.container, commonStyles.flex1]}>
                <View style={commonStyles.flex1}>
                  <ParagraphComponent
                    text="KYC Rejected"
                    style={[
                      commonStyles.fs22,
                      commonStyles.fw700,
                      commonStyles.textCenter,
                      commonStyles.mb16,
                      commonStyles.textBlack,
                      { marginTop: 24 },
                    ]}
                  />

                  <ParagraphComponent
                    style={[
                      commonStyles.textCenter,
                      commonStyles.fs16,
                      commonStyles.mb16,
                      commonStyles.textBlack,
                    ]}
                    text={"Your KYC was rejected ,Please contact "}
                  />
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `mailto:${
                          userInfo?.supportEmail || "support@exchangapay.com"
                        }`
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <ParagraphComponent
                      text={userInfo?.supportEmail || "support@exchangapay.com"}
                      style={[
                        commonStyles.textCenter,
                        commonStyles.fs16,
                        commonStyles.textBlack,
                        { color: "#0099FF", textDecorationLine: "underline" },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
                <View style={[commonStyles.mb32]} />
              </Container>
            )}
          <View style={[commonStyles.mb10]} />
          {!isLoading && !isLogout && (
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
          )}
          {!isLoading && !isLogout && (
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.justifyCenter,
                commonStyles.mt10,
              ]}
            >
              <TouchableOpacity
                onPress={handleLogout}
                style={[commonStyles.px10]}
              >
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
          )}
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UnderReview;

const themedStyles = StyleService.create({
  btnConfirmTitle: {
    color: NEW_COLOR.TEXT_ALWAYS_WHITE,
  },
  scrollContainer: {
    paddingBottom: s(40),
  },
  webViewContainer: {
    marginTop: s(24),
    marginBottom: s(24),
    width: "100%",
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
  resend: {
    textAlign: "center",
  },
});
