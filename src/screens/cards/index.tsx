import React, { FC } from "react";
import { ScrollView } from "react-native";
import { StyleService } from "@ui-kitten/components";
import { NEW_COLOR } from "../../constants/theme/variables";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/navigation-types";
import { ms, s } from "../../constants/theme/scale";
import { commonStyles } from "../../assets/styles/CommonStyles";
import { SafeAreaView } from "react-native-safe-area-context";
type NewCard = NativeStackScreenProps<RootStackParamList, "About">;
const NewCard: FC<NewCard> = React.memo((props: any) => {

  return (
    <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1, commonStyles.container]}>
      <ScrollView

      >

      </ScrollView>
    </SafeAreaView>
  );
});

export default NewCard;

const themedStyles = StyleService.create({
  badgeStyle: {
    position: "absolute", top: 0, right: 20, paddingVertical: 2, paddingHorizontal: 12,
    borderBottomEndRadius: 12, borderBottomStartRadius: 12,
  },
  darkCircle: {
    backgroundColor: NEW_COLOR.DARK_BG,
    height: 50, width: 50, borderRadius: 50 / 2
  },
  cardRotate: {
    height: s(30),
    width: s(50), borderRadius: s(8)

  },
  serviceStyle: {

  },
  mt8: {
    marginTop: 8,
  },
  sectionStyle: {
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: NEW_COLOR.MENU_CARD_BG,
    padding: 16, gap: 16
  },
  rebate: {
    backgroundColor: NEW_COLOR.BTN_PINK,
    color: NEW_COLOR.TEXT_WHITE,
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 10,
    transform: [{ rotate: "-90deg" }],
    position: "absolute",
    right: -3,
    bottom: "65%",
  },
  textGrey: {
    color: NEW_COLOR.TEXT_GREY,
  },
  cardSmall: {
    borderRadius: 12,
  },
  mb16: {
    marginBottom: 16,
  },
  arrowRotate: {
    transform: [{ rotate: "45deg" }],
  },
  mt14: {
    marginTop: 14,
  },
  mb24: {
    marginBottom: 24,
  },
  noData: {
    fontSize: ms(16),
    fontWeight: "400",
    color: NEW_COLOR.TEXT_GREY,
    marginTop: 22,
  },
  custNodata: {
    marginTop: 22,
    marginBottom: 80,
  },
  cAccount: {
    justifyContent: "center",
    alignItems: "center",
  },
});
