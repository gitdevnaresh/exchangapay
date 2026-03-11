import { View, Image, SafeAreaView } from "react-native";
import React, { useMemo, useState } from "react";
import { isLogin, loginAction, setUserInfo } from "../../redux/actions/actions";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import Container from "../../newComponents/container/container";
import ConfirmLogout from "./confirmLogout/comfirmLogout";
import { useThemeColors } from "../../hooks/useThemeColors";
import ButtonComponent from "../../newComponents/buttons/button";
import Keychain from 'react-native-keychain';
import { SessionImage } from "../../assets/svg";
import ViewComponent from "../../newComponents/view/view";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
import { logout } from "@frontegg/react-native";
import { getTabsConfigation } from "../../../configuration";
import { FrontEggService } from "../../apiServices/fronteggApiServices/fronteggServices";
import { isErrorDispaly, userDetails } from "../../utils/helpers";
import { showAppToast } from "../../newComponents/ToasterMessages/ShowMessage";
const RelogIn = (props: any) => {
  const navigation = useNavigation();
  const dispatch = useDispatch<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const isDarkTheme = NEW_COLOR.isDarkTheme;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
  const Configuration: any = useMemo(
    () => getTabsConfigation("IDENITY_CONFIG"),
    []
  );

  const handleLgout = async () => {
    setIsLogoutLoading(true);
    dispatch(setUserInfo(""));
    dispatch(isLogin(false));
    dispatch(loginAction(null));
    if (Configuration.FFRONTEGG?.enabled === true) {
      if (Configuration.FFRONTEGG?.manualForm) {
        try {
          const refresh = await userDetails();
          const reponse = await FrontEggService.userLogOut({
            refreshId: refresh
          });
        } catch (e) {
          const errorMessage = isErrorDispaly(e);
          showAppToast(errorMessage, "error");
          return;
        }
      } else {
        await logout();//sdk
      }

    }
    await Keychain.resetGenericPassword({ service: 'authTokens' });
    setIsLogoutLoading(false);
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: "SplaceScreen" }],
        })
      );
    }, 1000);
  };
  const handleClose = () => {
    setIsVisible(false)
  }
  const handleConfirm = () => {
    setIsVisible(false)
  }
  return (
    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container >
        <ViewComponent style={[commonStyles.sectionGap]} />
        <View>
          <View style={[commonStyles.alignCenter, commonStyles.sectionGap]}>
            {isDarkTheme ? <SessionImage /> : <SessionImage />}
          </View>
          <ParagraphComponent style={[commonStyles.fs24, commonStyles.fw700, commonStyles.textWhite, commonStyles.textCenter,]} text={'Session Expired'} />
          <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.textCenter]} text={`For your security, your session has expired due to inactivity.`} />
          <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.textCenter, commonStyles.mt8]} text={`Please log in again to continue accessing your account.`} />

          <View style={commonStyles.mt30} />
          <ButtonComponent
            title={"Click here to Re-Login"}
            onPress={handleLgout}
            loading={isLogoutLoading}
          />
        </View>
        <ConfirmLogout
          isVisible={isVisible}
          onClose={handleClose}
          onConfirm={handleConfirm} />
      </Container>
    </SafeAreaView>
  );
};

export default RelogIn;

