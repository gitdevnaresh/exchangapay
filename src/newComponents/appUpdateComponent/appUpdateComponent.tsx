import { Linking, Platform, Alert } from "react-native";
import ButtonComponent from "../buttons/button";
import ImageUri from "../imageComponents/image";
import CommonModal from "../models/customModel"
import { s } from "../theme/scale";
import ViewComponent from "../view/view";
import { useEffect, useState } from "react";
import TextMultiLangauge from "../textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import { COMMON_SVG_URLS } from "../../assets/blobUrls";
import { useLngTranslation } from "../../hooks/useLngTranslation";
import { useActionLogging } from "../../hooks/loggingHook";
import DeviceInfo from "react-native-device-info";
const AppUpdate = (props: any) => {
  const { show, forceUpdate } = props;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  const { logEvent } = useActionLogging();
  const applicationId = DeviceInfo.getBundleId();

  useEffect(() => {
    setIsVisible(show || forceUpdate);
  }, [show, forceUpdate])
 const storeUrl = `market://details?id=${applicationId}`;
 
  const toggleModal = () => {
    setIsVisible(!isVisible)
  }

  const handleUpdate = () => {
    logEvent("Button Pressed", { action: "App Update Button", nextScreen: Platform.OS == 'android'? "Play Store":"App Store", currentScreen: "App update" })
    if (Platform.OS === 'android') {
      Linking.openURL(storeUrl);
    } else {
      Alert.alert(
        t("GLOBAL_CONSTANTS.UPDATE_AVAILABLE"),
        t("GLOBAL_CONSTANTS.NEW_VERSION_AVAILABLE_TESTFLIGHT"),
        [
          { text: t("GLOBAL_CONSTANTS.OK"), style: "default" }
        ]
      );
    }
  }


  const updateView = (
    <ViewComponent style={[commonStyles.flex1,commonStyles.justifyContent]}>
    <ViewComponent style={[commonStyles.myAuto]}>
      <ViewComponent style={[]}>
        <ImageUri style={{ width: s(120), height: s(120), alignSelf: 'center'}} uri={COMMON_SVG_URLS.alert_Icon } />
      </ViewComponent>
      <ViewComponent style={[commonStyles.sectionGap, commonStyles.mt8]}>
        {forceUpdate && (
          <TextMultiLangauge text={"GLOBAL_CONSTANTS.WE_ADDED_NEW_FEATURES_AND_FIX_SOME_BUGS_TO_MAKE_YOUR_EXPERIENCE_AS_SMOOTH_AS_POSSIBLE"} style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textGrey, commonStyles.textCenter]} />
        )}

        {!forceUpdate && (
          <TextMultiLangauge text={"GLOBAL_CONSTANTS.WE_RECOMMEND_YOU_TO_UPDATE_YOUR_APP"} style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textGrey, commonStyles.textCenter]} />
        )}
      </ViewComponent>
         </ViewComponent>
      <ViewComponent>
        <ButtonComponent
          onPress={handleUpdate}
          title={"GLOBAL_CONSTANTS.UPDATE"}
        />
      </ViewComponent>
      {!forceUpdate && (
        <ViewComponent style={[commonStyles.mt24]}>
          <ButtonComponent title={"GLOBAL_CONSTANTS.NO_I_WILL_UPDATE_LATER"} onPress={() => {
            props.updateLatter();
            toggleModal();
          }} 
          solidBackground={true}/>
        </ViewComponent>
      )}
   
<ViewComponent style={[commonStyles.sectionGap]}/>
    </ViewComponent>
  )
  return (

    <CommonModal
      visible={isVisible}
      togglePopup={toggleModal}
      title={"GLOBAL_CONSTANTS.UPDATE_AVAILABLE"}
      showCloseIcon={!forceUpdate}
      titleStyle={[commonStyles.fs16,commonStyles.fw700,commonStyles.textWhite]}
    >
      {updateView}
    </CommonModal>

  )
}
export default AppUpdate;