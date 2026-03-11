import React, { useMemo, useState } from "react";
import { store } from "../../redux/reducers";
import { loginAction, setBiometricEnabled, setLogin, setUserInfo } from "../../redux/actions/actions";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import Container from "../../newComponents/container/container";
import ConfirmLogout from "./confirmLogout/comfirmLogout";
import { useThemeColors } from "../../hooks/useThemeColors";
import ButtonComponent from "../../newComponents/buttons/button";
import Keychain from 'react-native-keychain';
import ViewComponent from "../../newComponents/view/view";
import useMemberLogin from "../../hooks/userInfoHook";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import TextMultiLanguage from "../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { logout } from "@frontegg/react-native";
import { FrontEggService } from "../../apiServices/fronteggApiServices/fronteggServices";
import { getTabsConfigation } from "../../../configuration";
import { isErrorDispaly, userDetails } from "../../utils/helpers";
import { showAppToast } from "../../newComponents/ToasterMessages/ShowMessage";
import ImageUri from "../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../assets/blobUrls";
import { s } from "../../constants/theme/scale";
const SomethingWentWrong = (props: any) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { getMemDetails } = useMemberLogin();
  const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
  const Configuration: any = useMemo(
    () => getTabsConfigation("IDENITY_CONFIG"),
    []
  );
  const handleRetryChanges = () => {
    getMemDetails();
  };

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const handleLgout = async () => {
    setIsLogoutLoading(true);
    store.dispatch(setLogin(''))
    dispatch(loginAction(null));
    dispatch(setUserInfo(""));
    dispatch(setBiometricEnabled(false));
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

    };
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
  };
  const handleConfirm = () => {
    setIsVisible(false);
    handleLgout();
  };
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      <Container >
        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mt60]}>
          <ViewComponent style={[commonStyles.alignCenter]}>
            <ViewComponent style={[commonStyles.sectionGap]}>
              <ImageUri uri={COMMON_SVG_URLS.somethingWentWrong} height={s(90)} width={s(120)} />
            </ViewComponent>

            <TextMultiLanguage
              style={[
                commonStyles.textCenter,
                commonStyles.textWhite,
                commonStyles.fs24,
                commonStyles.fw700,
                commonStyles.mb16
              ]}
              text={"GLOBAL_CONSTANTS.SOME_THING_WENT_WRONG"}
            />

            <ViewComponent>
              <TextMultiLanguage
                style={[
                  commonStyles.textGrey,
                  commonStyles.textCenter,
                  commonStyles.fw400,
                  commonStyles.fs14
                ]}
                text={"GLOBAL_CONSTANTS.WE_ARE_WORKING_ON_FIXING_THE"}
              />
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        <ViewComponent style={[commonStyles.sectionGap]}>
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.RETRY"}
            onPress={handleRetryChanges}
          />
          <ViewComponent style={commonStyles.mb16} />
          <ButtonComponent
            title={"GLOBAL_CONSTANTS.LOG_OUT"}
            solidBackground={true}
            onPress={handleConfirm}
            customButtonStyle={[{ backgroundColor: NEW_COLOR.LOGIN_BTN }]}
            loading={isLogoutLoading}
          />
        </ViewComponent>
      </Container>
      <ConfirmLogout
        isVisible={isVisible}
        onClose={handleClose}
        onConfirm={handleLgout} />
    </ViewComponent>
  );
};

export default SomethingWentWrong;

