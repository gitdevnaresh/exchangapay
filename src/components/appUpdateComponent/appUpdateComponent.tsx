import { Alert, Dimensions, Linking, Platform } from "react-native";
import ButtonComponent from "../buttons/button";
import CommonModal from "../models/customModel"
import ViewComponent from "../view/view";
import { useEffect, useState } from "react";
import { getThemedCommonStyles } from "../../components/CommonStyles";
import TextMultiLangauge from "../textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { AppUpdateImg, AppUpdateImglight } from "../../assets/svg";
import { getAllEnvData } from "../../../Environment";
import { logEvent } from "../../hooks/loggingHook";
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import { useIsDarkTheme } from "../../hooks/themedHook";
import { useDispatch } from "react-redux";
import { setAppUpdateVisible } from "../../redux/actions/actions";
const AppUpdate = (props: any) => {
  const { show, forceUpdate } = props;
  const isDarkTheme = useIsDarkTheme();
  const { width, height } = Dimensions.get("window");
  const dispatch = useDispatch();

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { oAuthConfig } = getAllEnvData();
  const playStoreUrl = oAuthConfig?.playStoreUrl
  const { t } = useLngTranslation();
  useEffect(() => {
    const modalVisible = show ?? forceUpdate;
    setIsVisible(modalVisible);
    dispatch(setAppUpdateVisible(modalVisible));
  }, [show, forceUpdate, dispatch])


  const toggleModal = () => {
    if (!forceUpdate) {
      setIsVisible(false);
      dispatch(setAppUpdateVisible(false));
    }
  }
  const handleUpdate = () => {
    logEvent("Button Pressed", { action: "App Update Button", nextScreen: Platform.OS == 'android' ? "Play Store" : "App Store", currentScreen: "App update" })
    if (Platform.OS === 'android') {
      Linking.openURL(playStoreUrl);
    } else {
      if (oAuthConfig?.appStoreUrl) {
        Linking.openURL(oAuthConfig?.appStoreUrl);
      } else {
        Alert.alert(
          t("GLOBAL_CONSTANTS.UPDATE_AVAILABLE"),
          t("GLOBAL_CONSTANTS.A_NEW_VERSION_IS_AVAILABLE"),
          [
            { text: "OK", style: "default" }
          ]
        );
      }

    }
  }

  const updateView = (
    <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent]}>
      <ViewComponent style={[commonStyles.alignCenter, commonStyles.myAuto]}>
        {/* <AppUpdateImg width={s(250)} height={s(250)} /> */}
        <ViewComponent
          style={[{
            width: width * 0.8,
            height: height * 0.30,  // ⭐ BIG SIZE FIXED BASED ON SCREEN HEIGHT

            // marginTop: s(20),
          }, commonStyles.mxAuto, commonStyles.titleSectionGap]}
        >
          {isDarkTheme ? (
            <AppUpdateImg width="100%" height="100%" />
          ) : (
            <AppUpdateImglight width="100%" height="100%" />
          )}
        </ViewComponent>

        <ViewComponent style={[commonStyles.mt8]}>
          <TextMultiLangauge style={[commonStyles.nodatascreentitle]} text={"GLOBAL_CONSTANTS.APP_UPDATE"} />
          {forceUpdate ? (
            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.WE_ADDED_NEW_FEATURES_AND_FIX_SOME_BUGS_TO_MAKE_YOUR_EXPERIENCE_AS_SMOOTH_AS_POSSIBLE"}
              style={[
                commonStyles.nodatascreentitle
              ]}
            />
          ) : (
            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.WE_RECOMMEND_YOU_TO_UPDATE_YOUR_APP"}
              style={[
                commonStyles.nodatascreenPara
              ]}
            />
          )}
        </ViewComponent>
      </ViewComponent>

      <ViewComponent>
        <ButtonComponent
          onPress={handleUpdate}
          title={"GLOBAL_CONSTANTS.UPDATE"}

        />

        {!forceUpdate && (
          <ViewComponent style={[commonStyles.buttongap]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.NO_I_WILL_UPDATE_LATER"}
              onPress={() => {
                props.updateLatter?.();
                toggleModal();
              }}
              solidBackground={true}
            />
          </ViewComponent>
        )}
      </ViewComponent>
    </ViewComponent>
  );

  return (
    <ViewComponent style={[]}>
      <CommonModal
        visible={isVisible}
        togglePopup={toggleModal}
        title={"GLOBAL_CONSTANTS.UPDATE_AVAILABLE"}
        titleStyle={[commonStyles.sectionTitle]}
        showCloseIcon={!forceUpdate}
      >
        {updateView}
      </CommonModal>
    </ViewComponent>
  );
};

export default AppUpdate;