import React, { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { formatDateTimes, isErrorDispaly } from '../../../../../utils/helpers';
import NoDataComponent from '../../../../../components/noData/noData';
import { s } from '../../../../../constants/styels/scale';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { getStatusColor, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import ViewComponent from '../../../../../components/view/view';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { CurrencyText } from '../../../../../components/textComponets/currencyText/currencyText';
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import { ProfileGeneralServices } from '../../../../../apiServices/profile/general';
import { UserInfo } from '../interface';
import { useSelector } from 'react-redux';
import Container from '../../../../../components/container/container';
import PageHeader from '../../../../../components/pageHeader/pageHeader';
import DashboardLoader from "../../../../../components/loader";
import { transactionCard } from '../../../../../skeletons/skeleton_views';
import Loadding from '../../../../../components/skelton/skeltons';
import GraphIconImage from '../../../../../components/svgIcons/mainmenuicons/graph';
import RewardsDeposistIconImage from '../../../../../components/svgIcons/mainmenuicons/rewardsdeposist';
import CardPurchaseIconImage from '../../../../../components/svgIcons/mainmenuicons/cardpurchase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopUpIcon from '../../../../../components/svgIcons/cardsicons/topUpIcon';
import ErrorComponent from '../../../../../components/errorDisplay/errorDisplay';
import { useHardwareBackHandler } from '../../../../../hooks/backHandleHook';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';

// Helper to normalize API response
function extractTransactionData(response: any) {
  if (Array.isArray(response?.data)) {
    return { data: response.data, totalCount: response.totalCount || response.data.length };
  }
  if (Array.isArray(response?.data?.data)) {
    return { data: response.data.data, totalCount: response.data.totalCount || response.data.data.length };
  }
  return { data: [], totalCount: 0 };
}

const TABS = [
  { name: "Home", sourceType: "Rule" },
  { name: "Quests", sourceType: "Quest" },
  { name: "Mystery Boxes", sourceType: "MysteryBox" }
];

const PAGE_SIZE = 10;

const RewardsTransactionList = () => {
  const [recentData, setRecentData] = useState<any>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState(TABS[0].sourceType);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const isCustodial = false;
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const statusColor = getStatusColor(NEW_COLOR);
  const userInfo = useSelector((state: { userReducer: { userDetails: UserInfo } }) => state.userReducer?.userDetails);
  const LoadeMoreSkeltns = transactionCard(10);
  const [errorMessage, setErrorMessage] = useState<any>('');

  useEffect(() => {
    if (userInfo && isFocused) {
      setPage(0);
      setRecentData([]);
      setHasMore(true);
      fetchData(activeTab, 0, false);
    }
  }, [userInfo, isFocused, activeTab]);

  const fetchData = async (sourceType: string, pageNumber: number, isLoadMore: boolean) => {
    if (isLoadMore) {
      setIsFetchingMore(true);
    } else {
      setDataLoading(true);
    }

    try {
      const response = await ProfileGeneralServices.rewardsTransactions(
        userInfo?.id,
        sourceType,
        pageNumber,
        PAGE_SIZE
      );

      if (response.ok) {
        const { data } = extractTransactionData(response);
        if (isLoadMore) {
          setRecentData((prevData: any[]) => [...prevData, ...data]);
        } else {
          setRecentData(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setErrorMessage(isErrorDispaly(response))
        if (!isLoadMore) {
          setRecentData([]);
        }
      }
    } catch (error) {
      setErrorMessage(isErrorDispaly(error))
      if (!isLoadMore) {
        setRecentData([]);
      }
    } finally {
      setDataLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(activeTab, nextPage, true);
    }
  }, [activeTab, fetchData, hasMore, isFetchingMore, page]);

  const handleReload = useCallback(() => {
    setPage(0);
    setRecentData([]);
    setHasMore(true);
    fetchData(activeTab, 0, false);
  }, [activeTab, fetchData]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useHardwareBackHandler(() => {
    handleBackPress();
    return true;
  });

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const txType = item.triggerEvent || item?.source || "";
    const amount = item?.volume || item?.amount || item?.value || 0;
    const state =
      (isCustodial && (item?.state || item?.remarks || item?.status || "")) ||
      (!isCustodial && (item?.state || item?.status));

    const iconsList = {
      upgrade: { icon: <GraphIconImage />, iconBg: NEW_COLOR.BANNER_BG },
      deposit: { icon: <RewardsDeposistIconImage />, iconBg: NEW_COLOR.BANNER_BG },
      cardspurchage: { icon: <CardPurchaseIconImage />, iconBg: NEW_COLOR.BANNER_BG },
      topup: { icon: <TopUpIcon color={NEW_COLOR.TEXT_WHITE} width={s(16)} height={s(16)} />, iconBg: NEW_COLOR.BANNER_BG },
      consume: { icon: <Ionicons name="cart-outline" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />, iconBg: NEW_COLOR.BANNER_BG },
      default: { icon: <Ionicons name="cart-outline" size={s(20)} color={NEW_COLOR.TEXT_WHITE} />, iconBg: NEW_COLOR.GRAY },
    };

    return (
      <ViewComponent >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
            <ViewComponent style={[commonStyles.iconbg, { minHeight: s(30), minWidth: s(30) }]}>
              {iconsList[txType?.toLowerCase()?.replaceAll(" ", "") as keyof typeof iconsList]?.icon || iconsList.default.icon}
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1, commonStyles.gap6]}>
              <ViewComponent>
                <ParagraphComponent text={txType || ""} numberOfLines={1} style={[commonStyles.primarytext]} />
                <ParagraphComponent text={formatDateTimes(item?.transactionDate || item?.date)} style={[commonStyles.secondarytext]} />
              </ViewComponent>
              <ViewComponent>
                {typeof amount === 'string' && amount.includes('/') ? (
                  <ParagraphComponent text={amount} style={[commonStyles.secondarytext]} />
                ) : (
                  <CurrencyText value={amount} currency={item?.wallet} style={[commonStyles.primarytext, commonStyles.textRight]} />
                )}
                <ParagraphComponent text={state} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, { color: statusColor[state?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
        {index !== recentData.length - 1 && <ViewComponent style={[commonStyles.listGap]} />}
      </ViewComponent>
    );
  };
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {dataLoading && <DashboardLoader />}
      {!dataLoading && <Container style={[commonStyles.container, { paddingBottom: 0 }]}>
        <PageHeader
          title={"GLOBAL_CONSTANTS.TRANSACTIONS"}
          onBackPress={handleBackPress}
          isrefresh={true}
          onRefresh={handleReload}
        />
        {errorMessage && <ErrorComponent message={errorMessage} onClose={() => setErrorMessage('')} />}
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10, commonStyles.listGap]}>
          {TABS?.map((tab) => (
            <CommonTouchableOpacity
              key={tab.sourceType}
              style={[
                commonStyles.flex1,
                commonStyles.p10,
                commonStyles.rounded100,
                commonStyles.alignCenter,
                { backgroundColor: activeTab === tab.sourceType ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.BANNER_BG },
              ]}
              onPress={() => setActiveTab(tab.sourceType)}
            >
              <ParagraphComponent text={tab.name} style={[commonStyles.fs14, activeTab === tab.sourceType ? commonStyles.textAlwaysWhite : commonStyles.textWhite, commonStyles.fw500]} />
            </CommonTouchableOpacity>
          ))}
        </ViewComponent>
        <ViewComponent style={[commonStyles.flex1]}>
          {recentData?.length > 0 ? (
            <FlatList
              data={recentData}
              renderItem={renderItem}
              keyExtractor={(item, index) => index?.toString()}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isFetchingMore ? <Loadding contenthtml={LoadeMoreSkeltns} /> : null}
            />
          ) : (
            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
          )}
        </ViewComponent>
      </Container>}
    </ViewComponent>
  );
};

export default RewardsTransactionList;

