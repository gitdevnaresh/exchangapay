import React, { useEffect, useState } from "react";
import { View, SafeAreaView, ScrollView, TouchableOpacity, Image, BackHandler } from "react-native";
import { StyleService, useStyleSheet } from "@ui-kitten/components";
import { Container } from "../../../components";
import { NEW_COLOR } from "../../../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import ParagraphComponent from "../../../components/Paragraph/Paragraph";
import { commonStyles } from "../../../components/CommonStyles";
import ErrorComponent from "../../../components/Error";
import CryptoServices from "../../../services/crypto";
import { formatCurrency, isErrorDispaly } from "../../../utils/helpers";
import NoDataComponent from "../../../components/nodata";
import { IconRefresh } from "../../../assets/svg";
import { s } from "../../../constants/theme/scale";
import Loadding from "../../../components/skeleton";
import { sellCoinSelect } from "../buySkeleton_views";
import { useIsFocused } from "@react-navigation/native";

const ExchangaCard = React.memo((props: any) => {
  const styles = useStyleSheet(themedStyles);
  const [exchangaCardsLoader, setExchangaCardsLoader] = useState<boolean>(false);
  const [exchangaCardsList, setExchangaCardsList] = useState<any>([]);
  const [errormsg, setErrormsg] = useState(null);
  const exchangacardSkeltons = sellCoinSelect(10);
  const isFocused = useIsFocused()
  useEffect(() => {
    getCryptoReceiveData();

  }, [isFocused]);
  const backArrowHandler = () => {
    props.navigation.navigate('Dashboard', { screen: 'Home', animation: "slide_from_left" });

  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => { backArrowHandler(); return true; }
    );
    return () => backHandler.remove();
  }, [])

  const getCryptoReceiveData = async () => {
    setExchangaCardsLoader(true);
    try {
      const response: any = await CryptoServices.getExchangaCards();
      if (response?.status === 200) {
        setExchangaCardsList(response?.data);
        setExchangaCardsLoader(false);
        setErrormsg(null);
      }
      else {
        setErrormsg(isErrorDispaly(response));
        setExchangaCardsLoader(false);
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleCardDetalis = (item: any) => {
    props.navigation.navigate("CardDetails", {
      cardId: item.id
    })
  };
  const handleCloseError = () => {
    setErrormsg(null);
  };
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ScrollView>
        <Container style={[commonStyles.container]}>
          <View
            style={[
              commonStyles.dflex,
              commonStyles.alignCenter,
              commonStyles.gap16,
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
              <TouchableOpacity style={[]} onPress={backArrowHandler}>
                <View>
                  <AntDesign
                    name="arrowleft"
                    size={s(22)}
                    color={NEW_COLOR.TEXT_BLACK}
                    style={{ marginTop: 3 }}
                  />
                </View>
              </TouchableOpacity>
              <ParagraphComponent
                text="Exchanga Pay Card"
                style={[
                  commonStyles.fs16,
                  commonStyles.textBlack,
                  commonStyles.fw700,
                ]}
              />
            </View>
            <TouchableOpacity activeOpacity={0.8} onPress={getCryptoReceiveData}>
              <IconRefresh />
            </TouchableOpacity>
          </View>
          {errormsg && <ErrorComponent message={errormsg} onClose={handleCloseError} />}
          <View style={[commonStyles.mb43]} />
          {exchangaCardsLoader && (<Loadding contenthtml={exchangacardSkeltons} />)}
          {(!exchangaCardsLoader && exchangaCardsList.length > 0) && exchangaCardsList.map((item: any, index: number) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => { handleCardDetalis(item) }}>
              <View key={index}
                style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.gap16,
                  commonStyles.justifyContent,
                  styles.rowStyle,
                  commonStyles.mb16
                ]}
              >
                <View style={[commonStyles.relative, { marginRight: 20 }]}>
                  <Image style={[styles.cardRotate]} source={{ uri: item.logo }} />
                </View>

                <View style={[
                  commonStyles.dflex,
                  commonStyles.alignCenter,
                  commonStyles.gap8,
                  commonStyles.justifyContent,
                  commonStyles.flex1
                ]}>
                  <View style={[commonStyles.flex1, commonStyles.gap4,]}>
                    <ParagraphComponent
                      text={item.cardName || item.name}
                      style={[
                        commonStyles.fs14,
                        commonStyles.textBlack,
                        commonStyles.fw600,
                      ]}
                      numberOfLines={1}
                    />
                    <ParagraphComponent
                      text={item.cardNumber}
                      style={[
                        commonStyles.fs12,
                        commonStyles.textGrey,
                        commonStyles.fw400,
                      ]}
                      numberOfLines={1}
                    />
                  </View>
                  <View style={[commonStyles.gap4, { justifyContent: "flex-end" }]}>
                    <ParagraphComponent
                      text={` ${formatCurrency(item.amount || 0, 2)}`}
                      style={[
                        commonStyles.fs14,
                        commonStyles.textBlack,
                        commonStyles.fw600,
                        commonStyles.textRight,
                      ]}
                      numberOfLines={1}
                    />
                    <ParagraphComponent
                      text={item.currency}
                      style={[
                        commonStyles.fs12,
                        commonStyles.textGrey,
                        commonStyles.fw400,
                        commonStyles.textRight,
                      ]}
                      numberOfLines={1}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {(!exchangaCardsLoader && exchangaCardsList?.length < 1) && <><NoDataComponent Description="You currently have no cards available." /></>}
        </Container>
      </ScrollView>
    </SafeAreaView >

  );
});

export default ExchangaCard;

const themedStyles = StyleService.create({
  darkCircle: {
    backgroundColor: NEW_COLOR.DARK_BG,
    height: 50, width: 50, borderRadius: 50 / 2
  },
  cardRotate: {
    height: 30,
    width: 50, borderRadius: 8,
  },
  rowStyle: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: NEW_COLOR.MENU_CARD_BG
  },
});
