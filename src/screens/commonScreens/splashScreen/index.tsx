import * as React from "react";
import { useSelector } from "react-redux";
import SafeAreaViewComponent from "../../../components/safeArea/safeArea";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import ViewComponent from "../../../components/view/view";
import { s } from "../../../constants/styels/scale";
import ButtonComponent from "../../../components/buttons/button";
import { Dimensions, Image, ImageBackground, StyleSheet, useColorScheme } from "react-native";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import TextMultiLangauge from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { CircleBg, FasstDarkImage, LightCircle, LoginSplashCard } from "../../../assets/svg";
import CardLogoComponent from "../../../components/arthacardlogo/cardlogo";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsDarkTheme } from "../../../hooks/themedHook";

const SplashScreen = React.memo(() => {
  const isOnboardingSteps = useSelector((state: any) => state.userReducer.isOnboardingSteps);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("window");
  const isDarkTheme = useIsDarkTheme();


  const handleLogin = () => {
    if (isOnboardingSteps) {
      navigation.dispatch(
        CommonActions.reset({ index: 1, routes: [{ name: "SplaceScreenW2" }] })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({ index: 1, routes: [{ name: "OnboardingStepOne" }] })
      );
    }
  };

  let backgroundSource;
  if (appThemeSetting !== "system") {
    backgroundSource =
      appThemeSetting === "dark"

        ? require("../../../assets/images/registration/fastdarkbg.png")
        : require("../../../assets/images/registration/fastlight.png");
  } else {
    backgroundSource =
      colorScheme === "dark"
        ? require("../../../assets/images/registration/fastdarkbg.png")
        : require("../../../assets/images/registration/fastlight.png");
  }

  return (
    <SafeAreaViewComponent
      style={[commonStyles.screenBg,]}
    >
      <ImageBackground
        source={backgroundSource}
        resizeMode="cover"
        style={[commonStyles.flex1,]}

      >
        <ViewComponent style={[commonStyles.spacebetween, commonStyles.sectionGap]}>
          <ViewComponent>
            <ViewComponent
              style={[{
                width: width * 1,
                height: height * 0.47,  // ⭐ BIG SIZE FIXED BASED ON SCREEN HEIGHT
              }, commonStyles.sectionGap]}
            >
              {isDarkTheme ? (
                <FasstDarkImage width="100%" height="100%" />
              ) : (
                <FasstDarkImage width="100%" height="100%" />
              )}
            </ViewComponent>
            <ViewComponent style={[commonStyles.px24,]}>
              <ViewComponent style={[commonStyles.titleSectionGap]}>
                <CardLogoComponent />
              </ViewComponent>

              <TextMultiLangauge
                text="GLOBAL_CONSTANTS.FAST_AND_EASY_PAYMENT_SOLUTION"
                style={[
                  commonStyles.splacesectiontitle
                ]}
              /></ViewComponent>
          </ViewComponent>
          <ViewComponent style={[commonStyles.px24, commonStyles.sectionGap]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.GET_STARTED"}
              onPress={handleLogin}
              multiLanguageAllows={true}
            />
          </ViewComponent>



        </ViewComponent>
      </ImageBackground>
    </SafeAreaViewComponent>






  );
});

const styles = StyleSheet.create({

});

export default SplashScreen;