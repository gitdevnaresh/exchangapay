import { Dimensions, SafeAreaView } from "react-native";
import React, { useState } from "react";
import ConfirmLogout from "../../screens/commonScreens/logout/comfirmLogout";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../CommonStyles";
import ButtonComponent from "../buttons/button";
import { SomeTimesWentWrong } from "../../assets/svg";
import ViewComponent from "../view/view";
import useMemberLogin from "../../hooks/userInfoHook";
import { useIsDarkTheme } from "../../hooks/themedHook";
import TextMultiLanguage from "../textComponets/multiLanguageText/textMultiLangauge";
import useLogout from "../../hooks/logout/useLogout";

const SomethingWentWrong = (props: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isDarkTheme = useIsDarkTheme();
  const { getMemDetails } = useMemberLogin();
  const { width, height } = Dimensions.get("window");
  const { logout } = useLogout();

  const handleRetryChanges = () => {
    getMemDetails();
  };

  const [isVisible, setIsVisible] = useState(false);
  const handleLgout = async () => {
    await logout()

  };
  const handleClose = () => {
    setIsVisible(false)
  };

  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ViewComponent style={[commonStyles.flex1, commonStyles.p24]}>
        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter]}>
          {/* <ViewComponent style={[commonStyles.alignCenter, commonStyles.titleSectionGap]}>
            {isDarkTheme ? <SomeTimesWentWrong width={s(300)} /> : <SomeTimesWentWrong width={s(300)} />}
          </ViewComponent> */}
          <ViewComponent
            style={[{
              width: width * 0.8,
              height: height * 0.30,  // ⭐ BIG SIZE FIXED BASED ON SCREEN HEIGHT
              alignSelf: "center",
              // marginTop: s(20),
            }, commonStyles.titleSectionGap]}
          >
            {isDarkTheme ? (
              <SomeTimesWentWrong width="100%" height="100%" />
            ) : (
              <SomeTimesWentWrong width="100%" height="100%" />
            )}
          </ViewComponent>
          {/* <ViewComponent style={[commonStyles.titleSectionGap, commonStyles.alignCenter,commonStyles.mxAuto, { width: s(250), height: s(250) }]}>
            <ImageUri width={s(300)} height={s(300)} uri={somethingwentwrong} />
          </ViewComponent> */}
          <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6]} text={"GLOBAL_CONSTANTS.SOMETHING_WENT_WRONG"} />
          <TextMultiLanguage style={[commonStyles.sectiontitlepara, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.WE_WORKING_ON_FIXING_THE_PROBLEM_PLEASE_REFRESH_THE_PAGE_AND_TRY_AGAIN"} />
        </ViewComponent>

        <ViewComponent style={[commonStyles.sectionGap]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.RETRY"}
            onPress={handleRetryChanges}
          />
          <ViewComponent style={commonStyles.buttongap} />
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.LOGOUT"}
            solidBackground={true}
            loading={undefined}
            onPress={handleLgout}
          />
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]} />
        <ConfirmLogout
          isVisible={isVisible}
          onClose={handleClose}
          onConfirm={handleLgout} />
      </ViewComponent>
    </SafeAreaView>
  );
};

export default SomethingWentWrong;