import React, { useEffect, useState } from "react";
import { StyleSheet} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useThemeColors } from "../../hooks/useThemeColors";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import SafeAreaViewComponent from "../../newComponents/safeArea/safeArea";
import ViewComponent from "../../newComponents/view/view";
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
import { s } from "react-native-size-matters";
import { CurrencyText } from "../../newComponents/textComponets/currencyText/currencyText";
import CryptoServices from "../../services/crypto";
import DepositeService from "../../services/depositeService";
import { isErrorDispaly } from "../../utils/helpers";
import { ActionLogParams, useActionLogging } from "../../hooks/loggingHook";
import CommonTouchableOpacity from "../../newComponents/touchableComponents/touchableOpacity";
import Container from "../../newComponents/container/container";
import PageHeader from "../../newComponents/pageHeader/pageHeader";
import ImageUri from "../../newComponents/imageComponents/image";
import SwokipayDashboardLoader from "../../newComponents/swokipayloader";
import FlatListComponent from "../../newComponents/flatList/flatList";
import NoDataComponent from "../../newComponents/noData/noData";
import { useHardwareBackHandler } from "../../hooks/HardwareBackHandler";
import ErrorComponent from "../../newComponents/errorDisplay/errorDisplay";

interface Asset {
  walletCode: string;
  avilable: number;
  logo?: string;
  code: string;
}

const AssetsScreen = () => {
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { logEvent } = useActionLogging();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
const [error,setError]=useState<string>("");
  useEffect(() => {
    setError("");
    const screenViewData: ActionLogParams = {
      screename: "AssetsScreen",
      actionName: "Screen Loaded",
      actionType: "View",
    };
    logEvent("screen_view", screenViewData);
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      // Try the same service that was used in AccountDashboardBalance
      let response: any = await DepositeService.getDepositCurrecies();

      if (response?.data) {
        // Transform the data to match our Asset interface
        const transformedAssets = response.data.map((item: any) => ({
          walletCode: item.walletCode || item.code,
          avilable: item.avilable || item.available || 0,
          logo: item.logo,
          code: item.code || item.walletCode,
        }));
        setAssets(transformedAssets);
      } else {
        response = await CryptoServices.getCryptoTotalBalance(
          userInfo?.customerId
        );
        if (response?.data) {
          const transformedAssets = response.data.map((item: any) => ({
            walletCode: item.walletCode || item.code,
            avilable: item.avilable || item.available || 0,
            logo: item.logo,
            code: item.code || item.walletCode,
          }));
          setAssets(transformedAssets);
        } else {
          setError(isErrorDispaly(response));
        }
      }
    } catch (error) {
      setError(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAssetPress = (asset: Asset) => {
    const actionData: ActionLogParams = {
      screename: "AssetsScreen",
      actionName: "Asset Pressed",
      actionType: "Button",
      actionObj: { assetCode: asset.walletCode },
    };
    logEvent("button_press", actionData);

    // Navigate to ComingSoon for now since CoinDetails doesn't exist
    // navigation.navigate("ComingSoon", {
    //   pageHeader: false,
    //   customHeader: {
    //     title: `${asset.walletCode} Details`,
    //     showBackButton: true,
    //   },
    // });
  };
 useHardwareBackHandler(() => {
        handleBackPress();
    });
  const handleBackPress = () => {
    navigation.goBack();
  };
  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {loading && <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>}
      {!loading && <Container>
        <PageHeader title={"GLOBAL_CONSTANTS.ASSETS"} onBackPress={handleBackPress} />
        {error&&<ErrorComponent message={error} screen={true}/>}
        <FlatListComponent
          data={assets}
          keyExtractor={(item, index) => `${item.walletCode}-${index}`}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={() => (
            <ViewComponent
              style={[commonStyles.py20, commonStyles.alignCenter]}
            >
              <NoDataComponent />
            </ViewComponent>
          )}
          renderItem={({ item: asset }) => (
            <CommonTouchableOpacity
              style={[commonStyles.list, commonStyles.menuitemspace]}
              onPress={() => handleAssetPress(asset)} activeOpacity={1}
            >
              <ViewComponent
                style={[
                  commonStyles.flexRow,
                  commonStyles.alignCenter,
                  commonStyles.justifyContent,
                ]}
              >
                <ViewComponent
                  style={[commonStyles.iconbg, commonStyles.alignCenter, commonStyles.justifyCenter]}
                >
                  <ImageUri uri={asset?.logo} height={s(24)} width={s(24)} />
                </ViewComponent>

                <ViewComponent style={[commonStyles.flex1, commonStyles.ml16]}>
                  <ParagraphComponent
                    text={asset.walletCode}
                    style={[
                      commonStyles.textWhite,
                      commonStyles.fs14,
                      commonStyles.fw400,
                    ]}
                  />
                  <ParagraphComponent
                    text={asset.walletCode}
                    style={[
                      commonStyles.textlinkgrey,
                      commonStyles.fs12,
                      commonStyles.mt2,
                      commonStyles.fw400
                    ]}
                  />
                </ViewComponent>

                {/* Asset Value and Arrow */}
                <ViewComponent
                  style={[commonStyles.dflex, commonStyles.gap6, commonStyles.alignCenter]}
                >
                  <CurrencyText
                    value={asset.avilable || 0}
                    style={[
                      commonStyles.textWhite,
                      commonStyles.fs14,
                      commonStyles.fw500,
                    ]}
                  />
                </ViewComponent>
              </ViewComponent>
            </CommonTouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />

      </Container>}
    </ViewComponent>
  );
};

export default AssetsScreen;
