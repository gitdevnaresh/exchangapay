import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Modal, SafeAreaView, Linking } from 'react-native';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { ms, s } from '../../../constants/styels/scale';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import AuthService from '../../../apiServices/onBoarding/auth';
import { loginAction } from '../../../redux/actions/actions';
import CustomRBSheet from '../../../components/models/commonBottomSheet';
import ButtonComponent from '../../../components/buttons/button';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { useSumsubSDK } from '../../../hooks/sumsubHooks/useSumsubSDK';
import ViewComponent from '../../../components/view/view';
import WebView from 'react-native-webview';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import { Logger } from '../../../utils/Logger';

const KycVerifyPopup = (props: any) => {
  const rbSheetRef = useRef<any>(null);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const titleCondition = userInfo?.accountType == "Business"
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [webUrl, setWebUrl] = useState<string | null>(null);
  const [isModelOpen, setIsModelOpen] = useState<boolean>(false);
  const { launchSumsubSDK } = useSumsubSDK()
  const getMemDetails = async () => {
    try {
      const userLoginInfo: any = await AuthService.getMemberInfo();
      if (userLoginInfo?.status == 200) {
        dispatch(loginAction(userLoginInfo?.data));
      }
    } catch (error) {

    }
  }

  const getWebUrl = async () => {
    try {
      const response: any = await AuthService.getBusinessWebUrl(userInfo?.id);
      if (response.ok) {
        propsCloseModel();
        Linking.openURL(response?.data?.url);

      }
    } catch (error) {

    }
  }
  useEffect(() => {
    if (props?.addModelVisible) {
      if (rbSheetRef.current) {
        rbSheetRef.current.open();
      } else {
        const frameId = requestAnimationFrame(() => {
          if (props?.addModelVisible && rbSheetRef.current) { // Re-check props.addModelVisible
            rbSheetRef.current.open();
          } else if (props?.addModelVisible) {
            Logger.error("KycVerifyPopup: Ref still not available after requestAnimationFrame.");
          }
        });
        return () => cancelAnimationFrame(frameId);
      }
    } else {
      if (rbSheetRef.current) {
        rbSheetRef.current.close();
      }
    }
  }, [props?.addModelVisible]);
  const propsCloseModel = () => {
    getMemDetails();
    props?.closeModel()
  }

  // Handle "I will do it" button - just close popup
  const handleIWillDoIt = () => {
    propsCloseModel();
  }

  // Handle "Continue" button based on context (card or general KYC)
  const handleContinue = () => {
    if (props?.cardKycType?.toLowerCase() === 'manual' || userInfo?.metadata?.kycType?.toLowerCase() === 'manual') {
      return handleSubmit();
    }
    if (props?.cardDetails || props?.navigateToApplyCard || props?.navigateToSumsubNavigation) {
      const kycType = props?.cardDetails?.kycType?.toLowerCase();

      if (kycType === 'sumsub') {
        if (!userInfo?.kycStatus || userInfo?.kycStatus === "Draft" || userInfo?.kycStatus === "Submitted") {
          RedirectoSumsub();
        } else {
          propsCloseModel();
          props?.navigateToSumsubNavigation?.();
        }
      } else {
        if (!userInfo?.kycStatus || userInfo?.kycStatus === "Draft" || userInfo?.kycStatus === "Submitted") {
          RedirectoSumsub();
        } else {
          propsCloseModel();
          props?.navigateToApplyCard?.();
        }
      }
    } else {
      RedirectoSumsub();
    }
  }
  // Don't remove this function.This is manual kyc/kyb flow
  const handleSubmit = () => {
    getMemDetails()
    propsCloseModel();
    if (userInfo?.accountType == "Business") {
      if (userInfo?.kycLevel == 0 || userInfo?.currentKycState == 0 || userInfo?.currentKycState == null || userInfo?.kycLevel == null) {
        navigation.navigate("KybCompanyData");
        return;
      }
      else if (userInfo?.kycLevel == 1 || userInfo?.currentKycState == 1) {
        navigation.navigate("KybUboList");
      } else if (userInfo?.kycLevel == 2 || userInfo?.currentKycState == 2) {
        navigation.navigate("KybDirectorDetailsList");
      } else {
        navigation.navigate("KybInfoPreview");
      }
    } else {
      if (userInfo?.kycLevel == 0 || userInfo?.kycLevel == null || userInfo?.currentKycState == 0 || userInfo?.currentKycState == null) {
        navigation.navigate("KycProfile");
        return;
      }
      else if (userInfo?.kycLevel == 1 || userInfo?.currentKycState == 1) {
        navigation.navigate("KycProfileStep2");
      } else {
        navigation.navigate("KycProfilePreview");
      }
    }
  }
  const RedirectoSumsub = () => {
    if (userInfo?.accountType?.toLowerCase() === 'business') {
      getWebUrl();
    } else {
      propsCloseModel();
      launchSumsubSDK();

    }
  }
  const handleCloseWebView = () => {
    propsCloseModel();
    setIsModelOpen(false);
  };
  const { t } = useLngTranslation();
  const sheetTitle = `${t("GLOBAL_CONSTANTS.COMPLETE")} ${titleCondition ? 'KYB' : "KYC"}`;

  return (
    <CustomRBSheet
      refRBSheet={rbSheetRef}
      height={'Small'}
      title={sheetTitle}
      onClose={propsCloseModel}
    >
      <View>
        <View style={[commonStyles.sectionGap]}>
          <ParagraphComponent
            style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]}
            text={`${t("GLOBAL_CONSTANTS.PLEASE_COMPLETE_YOUR")} ${titleCondition ? 'KYB' : "KYC"} ${t("GLOBAL_CONSTANTS.VERIFICATION")}`}
          />
          <ParagraphComponent
            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
            text={"GLOBAL_CONSTANTS.TO_PROCED_KYC"}
          />
        </View>
        <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
          <ViewComponent style={[commonStyles.flex1]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.I_WILL_DO_IT"}
              onPress={handleIWillDoIt}
              solidBackground={true}
            />
          </ViewComponent>
          <ViewComponent style={[commonStyles.flex1]}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONTINUE"}
              onPress={handleContinue}
            />
          </ViewComponent>

        </View>
      </View>
      {isModelOpen && (
        <Modal
          visible={isModelOpen}
          onRequestClose={handleCloseWebView}
          animationType="slide"
        >
          <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>

            <WebView
              source={{ uri: webUrl || '' }}
              style={[commonStyles.flex1, commonStyles.screenBg]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />

          </SafeAreaView>
        </Modal>
      )
      }
    </CustomRBSheet>
  );
};

export default KycVerifyPopup;

const styles = StyleSheet.create({
  sheetContentContainer: {
    paddingHorizontal: s(16),
    paddingTop: ms(10), // Adjust if CustomRBSheet already has top padding for its header
    paddingBottom: ms(24), // Ensure space at the bottom
  },
});