import React from "react";
import { FormikValues } from "formik";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useActionLogging } from "../../../../hooks/loggingHook";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import ViewComponent from "../../../../newComponents/view/view";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import AddNicknameComponent from "../../../commonScreens/whitelistWalletaddress/addNicknameComponent/AddNicknameComponent";

const AddWhiteListNickname = () => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const navigation = useNavigation<any>();
  const { logEvent } = useActionLogging();
  const route = useRoute();
  const { walletAddress, selectedNetwork, coinCode, nickname: existingNickname, isEditFlow, coinData } = route.params as {
    walletAddress: string;
    selectedNetwork: string;
    nickname?: string;
    isEditFlow?: boolean;
    coinCode: string;
    coinData: any;
  };

  useHardwareBackHandler(() => {
    handleBackPress();
  });

  const handleBackPress = () => {
    const actionData = {
      action: "back_press",
      actionType: "button_click",
      screen: "AddAccountNickname",
      nextscreen: "AddNewAddress",
    };
    logEvent("back_press", actionData);
    navigation.goBack();
  };

  const handleContinue = (values: FormikValues) => {
    const actionData = {
      action: "add_nickname",
      actionType: "button_click",
      screen: "AddAccountNickname",
      nextscreen: "WhitelistConfirmDetails",
      data: { nickname: values.nickname },
    };
    logEvent("add_nickname", actionData);
    
    if (isEditFlow) {
      navigation.navigate({
        name: "WhitelistConfirmDetails",
        params: {
          walletAddress: walletAddress,
          selectedNetwork: selectedNetwork,
          nickname: values.nickname,
          coinCode: coinCode,
          coinData: coinData
        },
        merge: true,
      });
    } else {
      navigation.navigate({
        name: "WhitelistConfirmDetails",
        params: {
          walletAddress: walletAddress,
          selectedNetwork: selectedNetwork,
          nickname: values.nickname,
          coinCode: coinCode,
          coinData: coinData
        },
      });
    }
  };
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[{ flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <Container style={[commonStyles.sectionGap]}>
          <PageHeader title={"GLOBAL_CONSTANTS.ADD_A_NICKNAME"} onBackPress={handleBackPress} />
          <AddNicknameComponent
            onSubmit={handleContinue}
            initialNickname={existingNickname}
          />
        </Container>
      </KeyboardAwareScrollView>
    </ViewComponent>
  );
};

export default AddWhiteListNickname;