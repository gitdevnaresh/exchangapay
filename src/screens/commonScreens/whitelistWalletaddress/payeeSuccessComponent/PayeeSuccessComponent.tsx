import React from "react";
import { TouchableOpacity, Linking } from "react-native";
import ViewComponent from "../../../../newComponents/view/view";
import Container from "../../../../newComponents/container/container";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import ButtonComponent from "../../../../newComponents/buttons/button";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useSelector } from "react-redux";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { COMMON_SVG_URLS } from "../../../../assets/blobUrls";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { s } from "../../../../constants/theme/scale";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { useNavigation } from "@react-navigation/native";

interface PayeeSuccessComponentProps {
  onContinue: () => void;
  buttonTitle?: string;
  coinCode?: any;
  screneName?: string;
  coinData?: any;
  selectedNetwork?: any;
}

const PayeeSuccessComponent: React.FC<PayeeSuccessComponentProps> = ({
  onContinue,
  buttonTitle = "GLOBAL_CONSTANTS.CONTINUE_TO_WITHDRAW",
  coinCode,
  coinData,
  selectedNetwork,
  screneName
}) => {
  const NEW_COLOR = useThemeColors();
  const { decryptAES } = useEncryptDecrypt();
  const userInfo = useSelector((state: any) => state?.userReducer?.userDetails);
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
const {t}=useLngTranslation();
  const handleEmailPress = () => {
    const email = decryptAES(userInfo?.email);
    if (email.startsWith('mailto:')) {
      Linking.openURL(email);
    } else {
      Linking.openURL(`mailto:${email}`);
    }
  };
  const handlebackPress=()=>{
      navigation.navigate({
            name: "AmountEnterScreen",
            params: {
                selectedNetwork: selectedNetwork || "",
                coinCode: coinCode || "",
                coinData: coinData
            }
        });
  };

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.sectionGap]}>
       { screneName=="Withdraw" &&<PageHeader  title={`${t("GLOBAL_CONSTANTS.WITHDRAW_SPACE")} ${coinCode}`} onBackPress={handlebackPress}/>}
        <ViewComponent style={[commonStyles.myAuto]}>
          <ViewComponent style={[commonStyles.mxAuto,commonStyles.sectionGap]}>

              <ImageUri uri={COMMON_SVG_URLS.success} width={s(120)} height={s(90)} />
          </ViewComponent>
          <ViewComponent>
            <TextMultiLanguage
              style={[
                commonStyles.textCenter,
                commonStyles.textWhite,
                commonStyles.fs24,
                commonStyles.fw700,
              ]}
              text={"GLOBAL_CONSTANTS.CONFIRM_VIA_EMAIL"}
            />
            <ViewComponent style={[commonStyles.mb10]}/>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
              <TextMultiLanguage
                style={[
                  commonStyles.textlinkgrey,
                  commonStyles.textCenter,
                  commonStyles.fw400,
                  commonStyles.fs14,
                ]}
                text={"GLOBAL_CONSTANTS.VERYFY_PAYEE"}
              />
              <TouchableOpacity onPress={handleEmailPress}>
                <TextMultiLanguage
                  style={[
                    commonStyles.textWhite,
                    commonStyles.textCenter,
                    commonStyles.fw400,
                    commonStyles.fs14,
                  ]}
                  text={decryptAES(userInfo?.email)}
                />
              </TouchableOpacity>
            </ViewComponent>
            <TextMultiLanguage
              style={[
                commonStyles.textlinkgrey,
                commonStyles.textCenter,
                commonStyles.fw400,
                commonStyles.fs14,
              ]}
              text={"GLOBAL_CONSTANTS.CLICK_EMAIL"}
            />
          </ViewComponent>
        </ViewComponent>
        <ButtonComponent
          title={buttonTitle}
          onPress={onContinue}
          capitalizeTitle={false}
        />
      </Container>
    </ViewComponent>
  );
};

export default PayeeSuccessComponent;