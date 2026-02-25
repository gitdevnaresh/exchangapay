
import * as React from "react";
import { BackHandler } from "react-native";
import BankLocal from './local';

import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import SafeAreaViewComponent from "../../../../../components/safeArea/safeArea";
import ViewComponent from "../../../../../components/view/view";
import PageHeader from "../../../../../components/pageHeader/pageHeader";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { Logger } from "../../../../../utils/Logger";

const Bank = (props: any) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const backArrowButtonHandler = React.useCallback(() => {
    try {
      if (props?.route?.params?.screenName === "AccountDetail") {
        (props.navigation as any).navigate("Currencypop", {
          name: props?.route?.params?.name,
          selectedId: props?.route?.params?.selectedId,
          animation: "slide_from_left"
        });
        return;
      }
      if (props?.route?.params?.screenName === "Accounts") {
        (props.navigation as any).navigate("Accounts", {
          animation: "slide_from_left",
          fromDeposit: true
        });
        return;
      }
      if (props?.route?.params?.screenName === "WalletsAllCoinsList") {
        (props.navigation as any).navigate("WalletsAllCoinsList", { initialTab: 1, animation: "slide_from_left", screenType: props?.route?.params?.screenType });
      }
      else {
        (props.navigation as any).navigate("Dashboard", { initialTab: "GLOBAL_CONSTANTS.BANK", animation: "slide_from_left" });
      }
    } catch (error) {
      Logger.error('backArrowButtonHandler failed', { error, screenName: props?.route?.params?.screenName });
    }
  }, [props.navigation, props?.route?.params?.screenName, props?.route?.params?.name]);

  React.useEffect(() => {
    try {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        backArrowButtonHandler();
        return true;
      });
      return () => backHandler.remove();
    } catch (error) {
      Logger.error('BackHandler useEffect failed', { error });
    }
  }, [backArrowButtonHandler]);
  return (
    <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <ViewComponent style={[commonStyles.pagePt50]}>
        <PageHeader
          title={` ${props?.route?.params?.currency}`}
          onBackPress={backArrowButtonHandler}
        />
      </ViewComponent>
      <ViewComponent style={[commonStyles.flex1]}>
        <BankLocal
          accountId={props.route?.params?.accountId}
          customerId={props.route?.params?.customerId}
          currency={props?.route?.params?.currency}
          screenName={props?.route?.params?.screenName}
          onBackPress={backArrowButtonHandler}
        />
      </ViewComponent>
    </SafeAreaViewComponent>
  );
};

export default Bank;
