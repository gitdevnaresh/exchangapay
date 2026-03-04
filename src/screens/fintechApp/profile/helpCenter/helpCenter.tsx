import { BackHandler } from "react-native";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { useEffect, useState, useCallback } from "react";
import RenderHTML from "react-native-render-html";
import { WINDOW_WIDTH } from "../../../../constants/styels/variables";
import { isErrorDispaly } from "../../../../utils/helpers";
import { useFocusEffect } from "@react-navigation/native";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import ViewComponent from "../../../../components/view/view";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import { ProfileGeneralServices } from "../../../../apiServices/profile/general";
import DashboardLoader from "../../../../components/loader";
import SafeAreaViewComponent from "../../../../components/safeArea/safeArea";

const HelpCenter = (props: any) => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [refresh, setRefresh] = useState<boolean>(false);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  useHardwareBackHandler(() => {
    handleBack();
  })
  const handleBack = useCallback(() => {
    props?.navigation?.goBack();
  }, [props?.navigation]);

  useFocusEffect(
    useCallback(() => {
      getHtmlContent();
    }, [])
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [handleBack]);

  const getHtmlContent = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await ProfileGeneralServices.getHelpCenterContent();

      if (response?.status === 200) {
        setErrorMsg("");
        setHtmlContent(response?.data.templateContent);
      } else {
        setErrorMsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMsg(isErrorDispaly(error));
    } finally {
      setIsLoading(false);
    }
  }, []);



  const handleCloseError = useCallback(() => {
    setErrorMsg("");
  }, []);
  const onRefresh = useCallback(async () => {
    setRefresh(true);
    try {
      await getHtmlContent();
    } finally {
      setRefresh(false);
    }
  }, [getHtmlContent]);

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {isLoading ? (
        <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>
          <DashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader
            title={"GLOBAL_CONSTANTS.HELP_CENTER"}
            onBackPress={handleBack}
          />
          <ScrollViewComponent refreshing={refresh} onRefresh={onRefresh}>
            {errorMsg && (
              <ErrorComponent message={errorMsg} onClose={handleCloseError} />
            )}
           {htmlContent && ( <RenderHTML
            contentWidth={WINDOW_WIDTH}
            source={{ html: htmlContent }}
            tagsStyles={{
              body: { textAlign: "center", color: NEW_COLOR.TEXT_GREY },
              p: { textAlign: "center", color: NEW_COLOR.TEXT_GREY },
              td: { textAlign: "center", color: NEW_COLOR.TEXT_GREY },
              a: { textAlign: "center", color: NEW_COLOR.TEXT_PRIMARY },
              span: { textAlign: "center", color: NEW_COLOR.SUBMIT_TEXTCOLOR },
            }}
          />)}
        </ScrollViewComponent>
      </Container>)} 
   </ViewComponent>
  );
};
export default HelpCenter;
