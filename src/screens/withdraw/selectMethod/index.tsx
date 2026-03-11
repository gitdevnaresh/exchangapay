import React, { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import ViewComponent from "../../../newComponents/view/view";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { s } from "../../../constants/theme/scale";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import ImageUri from "../../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../../assets/blobUrls";
const WithdrawMethodSelect = () => {
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

  const handleWithdrawCrypto = () => {
    navigation.navigate("WithdrawSelectCurrency");
  };
  const handleBackPress = () => {
    navigation.navigate("Dashboard");
  };
  const handleWithdrawFiat = () => {
        navigation.navigate("WithdrawFiat");
  };

  useHardwareBackHandler(() => {
    handleBackPress();
  });
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container>
        <PageHeader
          title="GLOBAL_CONSTANTS.SELECT_WITHDRAWAL_METHOD"
          onBackPress={handleBackPress}
        />
        <CommonTouchableOpacity
          style={[commonStyles.list, commonStyles.gap16]}
          activeOpacity={0.8}
          onPress={handleWithdrawCrypto}
        >
          <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
            <ImageUri uri={COMMON_SVG_URLS.cryptoImage} height={s(24)} width={s(24)}/>
          </ViewComponent>
          <ViewComponent style={[commonStyles.flex1]}>
            <TextMultiLanguage
              text="GLOBAL_CONSTANTS.WITHDRAW_CRYPTO"
              style={[commonStyles.fw400, commonStyles.fs14, commonStyles.list_text, commonStyles.mb4]}
            />
            <TextMultiLanguage
              text="GLOBAL_CONSTANTS.SEND_CRYPTOCURRENCY_TO_AN_EXTERNAL_WALLET_OR_EXCHANGE"
              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]}
            />
          </ViewComponent>

          <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
        </CommonTouchableOpacity>
        <ViewComponent style={[commonStyles.mb16]} />

        <CommonTouchableOpacity
          style={[commonStyles.list, commonStyles.gap16]}
          onPress={handleWithdrawFiat}
          activeOpacity={0.8}
        >
          <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
            <ImageUri uri={COMMON_SVG_URLS.doller} height={s(24)} width={s(24)}/>
          </ViewComponent>
          <ViewComponent style={[commonStyles.flex1]}>
            <TextMultiLanguage
              text={"GLOBAL_CONSTANTS.WITHDRAW_FIAT"}
              style={[commonStyles.fw400, commonStyles.fs14, commonStyles.list_text, commonStyles.mb4]}
            />
            <TextMultiLanguage
              text={"GLOBAL_CONSTANTS.TRANSFER_FIAT_DIRECTLY_INTO_YOUR_LOCAL_BANK_ACCOUNT"}
              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]}
            />
          </ViewComponent>
          <ViewComponent>
            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
          </ViewComponent>
        </CommonTouchableOpacity>
      </Container>
    </ViewComponent>
  );
};

export default WithdrawMethodSelect;
