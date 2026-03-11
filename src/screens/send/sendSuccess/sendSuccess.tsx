import React, {useState } from "react";
import { useNavigation } from "@react-navigation/native";
import ViewComponent from "../../../newComponents/view/view";
import Container from "../../../newComponents/container/container";
import { useThemeColors } from "../../../hooks/useThemeColors";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import BottomNavigation from "../../commonScreens/BottomNavigation/BottomNavigation";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import ImageUri from "../../../newComponents/imageComponents/image";
import { SEND_URLS } from "../../../assets/blobUrls";
import { s } from "../../../constants/theme/scale";

const SendSuccess: React.FC = (props: any) => {
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const insets = useSafeAreaInsets();
  const [loaders, setLoaders] = useState<any>({
    viewBtnLoader: false,
    backBtnLoader: false
  })
  const handleDetails = () => {
    setLoaders({ ...loaders, viewBtnLoader: true });
    const actionData: ActionLogParams = {
      screename: 'WithdrawSuccess',
      actionName: 'button_click',

      actionType: 'Button',
      nextScreenName: 'withdraw Details',
      actionObj: {

      }
    }
    logEvent('withdraw_Details', actionData);
    navigation.navigate("SendTransactionStatus", {
      transactionId: props?.route?.params?.transactionId
    });
    setLoaders({ ...loaders, viewBtnLoader: false });
  };

  useHardwareBackHandler(() => {
    const actionData: ActionLogParams = {
      screename: 'WithdrawSuccess',
      actionName: 'system back',
      actionType: 'Button',
      nextScreenName: 'Dashboard',
    }
    logEvent('back_press', actionData);
   handleBack();
  })
  const handleBack = () => {
    navigation.navigate("Dashboard")
  }
  return (
    <SafeAreaProvider>
      <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <Container >
          <PageHeader  onBackPress={handleBack}/>
          <ViewComponent style={[commonStyles.myAuto]}>
            <ViewComponent style={[commonStyles.mxAuto]}>
              <ImageUri uri={SEND_URLS.sendSuccess} width={s(120)} height={s(120)} />
            </ViewComponent>

            <TextMultiLanguage style={[commonStyles.textCenter, commonStyles.textWhite, commonStyles.fs24, commonStyles.fw700,commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.SEND_SUCCESSFULL"} />
            <TextMultiLanguage style={[commonStyles.textCenter, commonStyles.textGrey, commonStyles.fs14, commonStyles.fw400]} text={"GLOBAL_CONSTANTS.VIEW_DETAILS"} onPress={handleDetails} />

          </ViewComponent>
          {/* Success Icon */}
          <ViewComponent style={[commonStyles.sectionGap]}>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.sectionGap]} />
          </ViewComponent>

        </Container>
        
        <ViewComponent style={{
          position: 'absolute',
          bottom: insets.bottom,
          left: 0,
          right: 0
        }}>
          <BottomNavigation />
        </ViewComponent>
      </ViewComponent>
    </SafeAreaProvider>
  );
};
export default SendSuccess;