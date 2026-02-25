import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { CommonActions } from "@react-navigation/native";
import ViewComponent from "../../../components/view/view";
import TextMultiLangauge from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import ButtonComponent from "../../../components/buttons/button";
import CardLogoComponent from "../../../components/arthacardlogo/cardlogo";
import { Image, useColorScheme, Dimensions } from "react-native";
import { useIsDarkTheme } from "../../../hooks/themedHook";
import Container from "../../../components/container/container";

// Screen Dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const OnboardingStepTwo: React.FC = (props: any) => {
  const dispatch = useDispatch();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isDarkTheme = useIsDarkTheme();
  const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
  const colorScheme = useColorScheme();

  // Responsive sizing
  const responsiveTopSpacing = SCREEN_HEIGHT * 0.0;
  const responsiveImageWidth = SCREEN_WIDTH * 0.7;
  const responsiveImageHeight = SCREEN_HEIGHT * 0.32;

  const handleSkip = () => {
    dispatch({ type: "ISONBOARDINGSTEPS", payload: true });
    props?.navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "SplaceScreenW2" }],
      })
    );
  };

  // Theme-based background selection
  let backgroundSource;
  if (appThemeSetting !== "system") {
    backgroundSource =
      appThemeSetting === "dark"
        ? require("../../../assets/images/registration/onboardingcards.png")
        : require("../../../assets/images/registration/onboardinglightpayin.png");
  } else {
    backgroundSource =
      colorScheme === "dark"
        ? require("../../../assets/images/registration/onboardingcards.png")
        : require("../../../assets/images/registration/onboardinglightpayin.png");
  }

  return (
    <Container style={[commonStyles.container]}>
      <ViewComponent style={[commonStyles.spacebetween]}>

        {/* TOP SECTION */}
        <ViewComponent>

          {/* Logo */}
          <ViewComponent
            style={[
              commonStyles.mxAuto,
              commonStyles.titleSectionGap,
              { marginTop: responsiveTopSpacing }
            ]}
          >
            <CardLogoComponent />
          </ViewComponent>

          {/* Image (Responsive) */}
          <ViewComponent
            style={[
              commonStyles.mxAuto,
              commonStyles.titleSectionGap,
              { width: responsiveImageWidth }
            ]}
          >
            <Image
              source={backgroundSource}
              style={{
                width: "100%",
                height: responsiveImageHeight,
                resizeMode: "contain",
              }}
            />
          </ViewComponent>

          {/* Text */}
          <ViewComponent>
            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.WHITE_LABEL_PAYMENT"}
              style={[
                commonStyles.onboardingsectiontitle
              ]}
            />

            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.CARD_SOLUTION"}
              style={[
                commonStyles.onboardingsectionpara
              ]}
            />
          </ViewComponent>
        </ViewComponent>

        {/* BOTTOM BUTTONS */}
        <ViewComponent>
          <ViewComponent style={[commonStyles.sectionGap]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONTINUE"}
              onPress={handleSkip}
              multiLanguageAllows={true}
            />

            <ViewComponent style={[commonStyles.buttongap]} />

            <ButtonComponent
              title={"GLOBAL_CONSTANTS.SKIP"}
              onPress={handleSkip}
              solidBackground={true}
              multiLanguageAllows={true}
            />
          </ViewComponent>
        </ViewComponent>

      </ViewComponent>
    </Container>
  );
};

export default OnboardingStepTwo;
