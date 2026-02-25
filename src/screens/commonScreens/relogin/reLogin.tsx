import { SafeAreaView, Dimensions } from "react-native";
import React, { useState } from "react";
import ConfirmLogout from "../logout/comfirmLogout";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { ExpiredTime, } from "../../../assets/svg";
import { useIsDarkTheme } from "../../../hooks/themedHook";
import useLogout from "../../../hooks/logout/useLogout";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import Container from "../../../components/container/container";
import ViewComponent from "../../../components/view/view";
import TextMultiLanguage from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../components/buttons/button";
import { getTabsConfigation } from '../../../../configuration';
const RelogIn = (props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isDarkTheme = useIsDarkTheme();
  const { width, height } = Dimensions.get("window");
  const { logout } = useLogout();
  const [isVisible, setIsVisible] = useState(false);
  const identityConfig = getTabsConfigation("IDENITY_CONFIG");
  const handleLgout = async () => {
    let navigation = identityConfig?.AUTH0 ? "Auth0Signin" : ""
    await logout(identityConfig?.AUTH0_SDK_LOGIN, navigation)
  };
  const handleClose = () => {
    setIsVisible(false)
  }
  const handleConfirm = () => {
    setIsVisible(false)
  }
  return (

    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={[commonStyles.container]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter]}>
            <ViewComponent
              style={[{
                width: width * 0.8,
                height: height * 0.30,  // ⭐ BIG SIZE FIXED BASED ON SCREEN HEIGHT
                alignSelf: "center",
                // marginTop: s(20),
              }, commonStyles.titleSectionGap]}
            >
              {isDarkTheme ? (
                <ExpiredTime width="100%" height="100%" />
              ) : (
                <ExpiredTime width="100%" height="100%" />
              )}
            </ViewComponent>
            <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6]} text={'GLOBAL_CONSTANTS.SIGNED_OUT'} />
            <TextMultiLanguage style={[commonStyles.sectiontitlepara, commonStyles.textCenter, commonStyles.mb6]} text={'GLOBAL_CONSTANTS.TOKEN_EXPIRED_CONTENT'} />
          </ViewComponent>

          <ViewComponent style={[commonStyles.sectionGap]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.LOGIN"}
              onPress={handleLgout}
            />

          </ViewComponent>
          <ConfirmLogout
            isVisible={isVisible}
            onClose={handleClose}
            onConfirm={handleConfirm} />
        </ViewComponent>
      </Container>

    </SafeAreaView>
  );
};

export default RelogIn;


