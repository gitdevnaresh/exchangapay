import React, { useEffect, useRef, useState, useMemo } from "react";
import { RefreshControl } from "react-native";
import "moment-timezone";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../utils/helpers"; // Keep s if used directly, else remove
import RecentTransactions from "../commonScreens/transactions/recentTransactions";
import SafeAreaViewComponent from "../../newComponents/safeArea/safeArea";
import ViewComponent from "../../newComponents/view/view";
import { useSelector } from "react-redux";
import { getTabsConfigation } from "../../../configuration";
import KycVerifyPopup from "../commonScreens/kycVerify";
import { CurrencyInfoInterface, LearnList } from "./constant";
import useBiometricAuth from "../commonScreens/biometricAuthentication/biometricAuth";
import { useThemeColors } from "../../hooks/useThemeColors";
import CryptoServices from "../../services/crypto";
import ScrollViewComponent from "../../newComponents/scrollView/scrollView";
import { ScrollView } from "react-native-gesture-handler";
import KycVerificationBanner from "./components/KycVerificationBanner";
import { showAppToast } from "../../newComponents/ToasterMessages/ShowMessage";
import AccountDashboardScreen from "./components/AccountDashboardBalnce";
import { AlertItem, ApiCallsCompletedState, UserInfo } from "./interface";
import AdvertisementCarousel from "./components/AdvertisementCarousel";
import SwokipayDashboardLoader from "../../newComponents/swokipayloader";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import Container from "../../newComponents/container/container";
import { cardsService } from "../../apiServices/cardsApis/cardsApiServices";
import useMemberLogin from "../../hooks/userInfoHook";
import CaseAlertsCarousel from "./components/caseAlertCarousel";
import ProfileService from "../../services/profile";

const Home = () => {
  const [allBalanceInfo, setAllBalanceInfo] = useState<CurrencyInfoInterface>();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [refresh] = useState<boolean>(false);
  const [recentTranscationReload, setRecentTranscationReload] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const myCards = useSelector((state: any) => state?.sendReducer?.myCardsInfo);
  const isHighlightedWithdraw = useSelector((state: any) => state?.sendReducer?.isHighlightedWithdraw);

  const userInfo: UserInfo = useSelector(
    (state: any) => state.userReducer?.userDetails
  );
  const Configuration: any = useMemo(() => getTabsConfigation("HOME"), []);
  const GraphConfiguration: any = useMemo(
    () => getTabsConfigation("ADDS_AND_GRAPG_CONFIGURATION"),
    []
  );

  const [kycModelVisible, setKycModelVisible] = useState(false);
  const isFocused = useIsFocused();
  const NEW_COLOR = useThemeColors();
  const navigation = useNavigation<any>();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [learnList, setLearnList] = useState<LearnList[]>([]);
  const commonStyles = useMemo(
    () => getThemedCommonStyles(NEW_COLOR),
    [NEW_COLOR]
  );

  const [totalAmountLoading, setTotalAmountLoading] = useState<boolean>(false);
  // const [myCards, setMyCards] = useState<any>([]);
  const { getMemDetails } = useMemberLogin();
  const [apiCallsCompleted, setApiCallsCompleted] =
    useState<ApiCallsCompletedState>({
      balance: false,
      assets: false,
    });
  useBiometricAuth();
  useEffect(() => {
    if (isFocused) {
      initializeData();
      setKycModelVisible(false);
    }
  }, [isFocused]);
  const initializeData = async () => {
    setDashboardLoading(true);
    setApiCallsCompleted({
      balance: false,
      assets: false,
    });
    await Promise.all([
      fetchAlerts(),
      handleGetLearnList(),
      getMemDetails(true)
    ]);
    setDashboardLoading(false);
  };
  useEffect(() => {
    if (isFocused && userInfo?.currency) {
      setDashboardLoading(true);
      getuserAccountsBalances();
    }
  }, [isFocused]);

  useEffect(() => {
    const allCompleted = Object.values(apiCallsCompleted).every(
      (completed) => completed
    );
    if (allCompleted) {
      setDashboardLoading(false);
    }
  }, [apiCallsCompleted]);

  const onRefresh = async () => {
    setDashboardLoading(true);
    await Promise.all([
      getuserAccountsBalances(),
      await getMemDetails(true),
      await fetchAlerts(),
      await handleGetLearnList()     // ✅ also refresh alerts when pull-to-refresh
    ]);
    setRecentTranscationReload(true);
    setDashboardLoading(false);
  };
  const fetchAlerts = async () => {
    try {
      const response: any = await ProfileService.getAlertCasess();
      if (response?.ok && Array.isArray(response.data)) {
        setAlerts(response.data);
      } else {
        showAppToast(isErrorDispaly(response), "error");
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error");
    }
  };

  const getuserAccountsBalances = async (code?: any) => {
    try {
      setTotalAmountLoading(true);
      const response: any = await CryptoServices.getCurrencyTotalBalance(
        code ?? userInfo?.currency?.toUpperCase() ?? ""
      );
      if (response?.data) {
        setAllBalanceInfo({ ...response?.data });
        setTotalAmountLoading(false);
      } else {
        showAppToast(isErrorDispaly(response), "error");
        setTotalAmountLoading(false);
      }
    } catch (error) {
      showAppToast(isErrorDispaly(error), "error");
      setTotalAmountLoading(false);
    } finally {
      setApiCallsCompleted((prev) => ({ ...prev, balance: true }));
      setTotalAmountLoading(false);
    }
  };

  const handleRecentTranscationReloadDetails = (
    reload: boolean,
    error?: string | null
  ) => {
    setRecentTranscationReload(reload);
  };
  const closekycModel = () => {
    setKycModelVisible(false);
  };

  const handleRedirectToApplyCard = () => {
    navigation.navigate("ChooseCard", {
      pageHeader: false,
      customHeader: {
        title: "Apply Card",
        showBackButton: true,
      },
    });
  };

  // const getMyCards = async () => {
  //   try {
  //     let response: any = await cardsService.getMyCards(10, 1);
  //     if (response?.data) {
  //       const cards = response.data;
  //       setMyCards(cards);
  //     }
  //   } catch (error) {
  //     showAppToast(isErrorDispaly(error), "error");
  //   }
  // };
  const handleRefreshCurrency = (value: boolean) => {
    getuserAccountsBalances(value);
  };
  const handleGetLearnList = async () => {
    try {
      const response: any = await cardsService.getAllLearnList();
      if (response?.ok) {
        setLearnList(response?.data?.learns)

      } else {
        showAppToast(isErrorDispaly(response), 'error');
      }

    } catch (error) {
      showAppToast(isErrorDispaly(error), 'error');
    }
  }



  return (
    <SafeAreaViewComponent style={[commonStyles.screenBg]}>
      {dashboardLoading && <SwokipayDashboardLoader />}
      {!dashboardLoading && (
        <ScrollViewComponent
          ref={scrollViewRef}
          onRefresh={onRefresh}
        >
          <Container>
            {userInfo && (
              <KycVerificationBanner
                Configuration={Configuration}
                userInfo={userInfo}
                commonStyles={commonStyles}
                handleRedirectToApplyCard={handleRedirectToApplyCard}
                myCards={myCards}
              />
            )}
            {alerts?.length > 0 && (<CaseAlertsCarousel commonStyles={commonStyles} screenName="Home" alerts={alerts} />)}
            <AccountDashboardScreen
              userInfo={userInfo}
              currencyInfo={allBalanceInfo}
              currencyRefresh={handleRefreshCurrency}
              amountLoading={totalAmountLoading}
              isHighlightedWithdraw={isHighlightedWithdraw}
            />
            <AdvertisementCarousel isTitleDisplayed={true} learnList={learnList} />
            <ViewComponent style={[commonStyles.mb16]}>
              {kycModelVisible && (
                <KycVerifyPopup
                  closeModel={closekycModel}
                  addModelVisible={kycModelVisible}
                />
              )}
            </ViewComponent>
            {GraphConfiguration?.RECENT_ACTIVITY?.HOME && (
              <RecentTransactions
                accountType={"All"}
                recentTranscationReload={recentTranscationReload}
                handleRecentTranscationReloadDetails={
                  handleRecentTranscationReloadDetails
                }
              />
            )}
            <ViewComponent style={[commonStyles.mb5]} />

          </Container>

        </ScrollViewComponent>
      )}
    </SafeAreaViewComponent>
  );
};

export default Home;
