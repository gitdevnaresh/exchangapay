import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import ViewComponent from "../../../../newComponents/view/view";
import Container from "../../../../newComponents/container/container";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { ActionLogParams, useActionLogging } from "../../../../hooks/loggingHook";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../../../assets/blobUrls";
import { s } from "../../../../constants/theme/scale";
import ButtonComponent from "../../../../newComponents/buttons/button";

const TopUpSuccess: React.FC = () => {
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const [loaders, setLoaders] = useState<any>({
    viewBtnLoader: false,
    backBtnLoader: false
  })

  const handleBack = () => {
    const actionData: ActionLogParams = {
      screename: 'Topup Success',
      actionName: 'back button',
      actionType: 'Button',
      nextScreenName: 'My Cards',
    }
    logEvent('back_press', actionData);
    setLoaders({ ...loaders, backBtnLoader: true });
    navigation.navigate("MyCards", { animation: 'slide_from_left', shouldReload: true })
    setLoaders({ ...loaders, backBtnLoader: false });
  }
  
  useHardwareBackHandler(() => {
    handleBack();
    return true;
  })
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container >
        <PageHeader onBackPress={handleBack} />
        <ViewComponent style={[commonStyles.myAuto]}>
          <ViewComponent style={[commonStyles.mxAuto, commonStyles.sectionGap]}>
            <ImageUri uri={COMMON_SVG_URLS.success} width={s(120)} height={s(90)} />
          </ViewComponent>
          <TextMultiLanguage style={[commonStyles.textCenter, commonStyles.textWhite, commonStyles.fs24, commonStyles.fw700, commonStyles.mb16]} text={"GLOBAL_CONSTANTS.TRANSFER_SUCCESSFULLY"} />
        </ViewComponent>
        {/* Success Icon */}
        <ViewComponent style={[commonStyles.sectionGap]}>
          <ViewComponent style={[commonStyles.sectionGap]} />
          <ViewComponent style={[commonStyles.sectionGap]} />
        </ViewComponent>
        <ButtonComponent title={"GLOBAL_CONSTANTS.GOTO_MY_CARDS"} onPress={handleBack} loading={loaders.viewBtnLoader} />
        <ViewComponent style={[commonStyles.sectionGap]} />
      </Container>
    </ViewComponent>
  );
};
export default TopUpSuccess;