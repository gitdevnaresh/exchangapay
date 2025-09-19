import React, { useEffect, useState } from "react";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../components";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  SafeAreaView,
  BackHandler,
  Linking,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { Image } from "react-native";
import DefaultButton from "../../components/DefaultButton";
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from "../../components/Paragraph/Paragraph";
import { NEW_COLOR } from "../../constants/theme/variables";
import SendCryptoServices from "../../services/sendcrypto";
import { isErrorDispaly } from "../../utils/helpers";
import { commonStyles } from "../../components/CommonStyles";
import CopyCard from "../../components/CopyCard";
import { IconRefresh } from "../../assets/svg";
import { ActivityIndicator } from "react-native";
import { useIsFocused } from "@react-navigation/native";

const SendCryptoSuccess = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [hash, setHash] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const isFocus = useIsFocused();
  useEffect(() => {
    setHash("");
    getHash();
  }, [isFocus]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 150000);
    return () => clearTimeout(timer);
  }, []);
  const getHash = async () => {
    setLoading(true);
    try {
      const res: any = await SendCryptoServices.getSendCryptoHash(
        props.route.params.transactionId
      );
      if (res?.status === 200) {
        setHash(res.data);
        setLoading(false);
        setErrMsg("");
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setErrMsg(isErrorDispaly(err));
    }
  };
  const backToHomeCryptoHandler = () => {
    props.navigation.navigate("CryptoCoinReceive", {});
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  const handleGoBack = () => {
    props.navigation.push("CryptoCoinReceive");
  };
  const sendAgainButtonHandler = () => {
    props.navigation.navigate("CryptoCoinReceive");
  };
  const copyToClipboard = async (text: any) => {
    try {
      await Clipboard.setString(text);
    } catch (error: any) {
      Alert.alert("Failed to copy text to clipboard:", error);
    }
  };
  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
      <ScrollView>
        <Container style={commonStyles.container}>
          <View
            style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.mb43,
              commonStyles.justifyContent,
            ]}
          >
            <View
              style={[
                commonStyles.dflex,
                commonStyles.alignCenter,
                commonStyles.gap16,
              ]}
            >
              <TouchableOpacity style={[]} onPress={() => handleGoBack()}>
                <AntDesign
                  name="arrowleft"
                  size={22}
                  color={NEW_COLOR.TEXT_BLACK}
                  style={{ marginTop: 3 }}
                />
              </TouchableOpacity>
              <ParagraphComponent
                text="Withdraw Success"
                style={[
                  commonStyles.fs16,
                  commonStyles.textBlack,
                  commonStyles.fw800,
                ]}
              />
            </View>
          </View>
          <View style={[commonStyles.flex1]}>
            <>
              <ImageBackground
                source={require("../../assets/images/cards/Subtract.png")}
                resizeMode="contain"
                style={[{ position: "relative", height: 450 }]}
              >
                <View
                  style={{
                    height: 216,
                    marginBottom: 16,
                    marginTop: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={[
                      commonStyles.mxAuto,
                      { marginTop: "auto", marginBottom: "auto" },
                    ]}
                  >
                    <Image
                      style={[commonStyles.mxAuto]}
                      source={require("../../assets/images/cards/checkmark.png")}
                    />
                    <View style={[commonStyles.mb8]} />
                    <ParagraphComponent
                      text={`Withdraw Submitted`}
                      style={[
                        commonStyles.fs20,
                        commonStyles.fw700,
                        commonStyles.textCenter,
                        { color: NEW_COLOR.TEXT_BLACK },
                      ]}
                    />
                  </View>
                </View>

                <View style={[styles.border]} />
                <View
                  style={[
                    commonStyles.flex1,
                    commonStyles.dflex,
                    commonStyles.justifyCenter,
                    commonStyles.alignCenter,
                    commonStyles.mb20,
                  ]}
                >
                  <View style={[{ marginTop: "auto", marginBottom: "auto" }]}>
                    <View>
                      <ParagraphComponent
                        text={` ${props.route?.params?.ammount ?? ""} ${
                          props.route?.params?.walletCode ?? ""
                        }   Amount Sent Successfully.`}
                        style={[
                          commonStyles.fs14,
                          commonStyles.fw500,
                          commonStyles.textGrey,
                          commonStyles.textCenter,
                          { marginHorizontal: 24 },
                        ]}
                      />
                      {/* <ParagraphComponent text={`Refresh page for Transaction Reference`} style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.textCenter, { marginBottom: 4, }]} /> */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          hash &&
                          Linking.openURL(
                            hash?.explorer + hash?.transactionHash
                          )
                        }
                        style={{ marginHorizontal: 24 }}
                      >
                        {loading && (
                          <ActivityIndicator
                            size="small"
                            color={NEW_COLOR.TEXT_BLACK}
                          />
                        )}
                        {!loading && hash ? (
                          <View>
                            <ParagraphComponent
                              text={hash?.transactionHash}
                              style={[
                                commonStyles.fs10,
                                commonStyles.fw500,
                                commonStyles.textCenter,
                                {
                                  color: NEW_COLOR.TEXT_BLACK,
                                  marginBottom: 10,
                                },
                                commonStyles.textCenter,
                              ]}
                            />
                            {hash.transactionHash && (
                              <View style={commonStyles.mxAuto}>
                                <CopyCard
                                  onPress={() =>
                                    copyToClipboard(hash?.transactionHash)
                                  }
                                />
                              </View>
                            )}
                          </View>
                        ) : (
                          <ParagraphComponent
                            text=""
                            style={[
                              commonStyles.fs12,
                              commonStyles.fw500,
                              commonStyles.textCenter,
                              { color: NEW_COLOR.TEXT_BLACK, marginBottom: 10 },
                              commonStyles.textCenter,
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={[commonStyles.mb20]} />
                  </View>
                </View>
              </ImageBackground>
              <View style={[styles.px32]}>
                <DefaultButton
                  title={"Send again"}
                  icon={undefined}
                  style={undefined}
                  customButtonStyle={undefined}
                  backgroundColors={undefined}
                  disable={undefined}
                  loading={undefined}
                  colorful={undefined}
                  onPress={sendAgainButtonHandler}
                  transparent={undefined}
                />
              </View>
            </>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
});

export default SendCryptoSuccess;

const themedStyles = StyleService.create({
  textOrange: {
    color: "#FEA55C",
  },
  px32: {
    paddingHorizontal: 32,
  },
  textDARKGreen: {
    color: NEW_COLOR.TEXT_DARKGREEN,
    borderBottomWidth: 1,
    borderBottomColor: "#D4DADA",
    borderStyle: "dashed",
    paddingBottom: 24,
    marginBottom: 24,
  },
  flex1: { flex: 1 },
  mt26: {
    marginTop: 26,
  },
  pr16: { paddingRight: 16 },
  textBlack: {
    color: NEW_COLOR.TEXT_BLACK,
  },
  mt120: {
    marginTop: 110,
  },
  mb25: {
    marginVertical: 25,
  },
  textWhite: {
    color: NEW_COLOR.TEXT_WHITE,
  },

  bglightgreen: { padding: 32 },
  border: {
    borderTopWidth: 2,
    marginBottom: 10,
    opacity: 0.2,
    width: "95%",
    borderColor: NEW_COLOR.BG_BLACK,
  },
  mtSuccess: {
    marginTop: 50,
  },
});
