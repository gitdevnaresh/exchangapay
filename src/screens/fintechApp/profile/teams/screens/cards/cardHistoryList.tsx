import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getThemedCommonStyles, getStatusColor } from '../../../../../../components/CommonStyles';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import ViewComponent from '../../../../../../components/view/view';
import Container from '../../../../../../components/container/container';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import TeamsService from '../../../../../../apiServices/profile/primary/teams';
import { FormattedDateText } from '../../../../../../components/textComponets/dateTimeText/dateTimeText';
import NoDataComponent from '../../../../../../components/noData/noData';
import DashboardLoader from '../../../../../../components/loader';
import Loadding from '../../../../../../components/skelton/skeltons';
import { allTransactionList } from '../../../../../../skeletons/skeltonViews';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import SearchComponent from '../../../../../../components/searchComponents/searchComponent';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import { s } from '../../../../../../constants/styels/scale';
import { isErrorDispaly } from '../../../../../../utils/helpers';
import { HistoryItem, CardHistoryResponse, NavigationProps, HistoryDataResponse } from '../../utils/interfaces';
import { PAGINATION, UI } from '../../constants';

const CardHistoryList: React.FC<NavigationProps> = (props) => {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [filteredData, setFilteredData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState<boolean>(false);
  const [pageNo, setPageNo] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const historyLoader = useMemo(() => allTransactionList(10), []);

  const navigation = useNavigation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const statusColor = getStatusColor(NEW_COLOR);

  const cardId = props?.route?.params?.cardId;
  const cardName = props?.route?.params?.cardName || ""

  const resetAndFetchHistory = useCallback(async () => {
    setPageNo(1);
    setHistoryData([]);
    setFilteredData([]);
    await getCardHistory(1, false);
  }, []);

  useEffect(() => {
    if (cardId) {
      resetAndFetchHistory();
    }
  }, [cardId, resetAndFetchHistory]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        backArrowButtonHandler();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [])
  );

  const getCardHistory = async (page: number = 1, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setErrorMessage("");
    } else {
      setLoadMoreLoading(true);
    }

    try {
      const response = await TeamsService.getCardHistory(page, PAGINATION.DEFAULT_PAGE_SIZE, cardId) as CardHistoryResponse;

      if (response?.ok !== false) {
        const responseData = response?.data as HistoryDataResponse | HistoryItem[];
        const data = Array.isArray(responseData) ? responseData : responseData?.data || [];
        const totalCount = Array.isArray(responseData) ? data.length : responseData?.total || data.length;

        if (isLoadMore && page > 1) {
          setHistoryData(prev => [...prev, ...data]);
          setFilteredData(prev => [...prev, ...data]);
        } else {
          setHistoryData(data);
          setFilteredData(data);
          setInitialLoadComplete(true);
        }

        setTotal(totalCount);
      } else {
        setErrorMessage(isErrorDispaly(response));
      }
    } catch (error) {
      setErrorMessage(isErrorDispaly(error));
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      } else {
        setLoadMoreLoading(false);
      }
    }
  };

  const hasData = historyData.length > 0;
  const hasMoreData = historyData.length < total;
  const isNotBusy = !loading && !loadMoreLoading;
  const canLoadMore = !isSearchActive && hasData && hasMoreData && isNotBusy && initialLoadComplete;

  const loadMoreData = () => {
    if (canLoadMore) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      getCardHistory(nextPage, true);
    }
  };

  const backArrowButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSearchResult = useCallback((searchResults: HistoryItem[]) => {
    setFilteredData(searchResults);
    setIsSearchActive(searchResults.length !== historyData.length);
  }, [historyData.length]);

  const renderItem = useCallback(({ item }: { item: HistoryItem; index: number }) => {
    return (
      <ViewComponent style={[commonStyles.cardsbannerbg]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
          <ParagraphComponent
            style={[commonStyles.primarytext]}
            text={item.cardName}
            numberOfLines={1}
          />
          <ParagraphComponent
            style={[
              commonStyles.colorstatus,
              { color: statusColor[item.action?.toLowerCase()] || NEW_COLOR.TEXT_GREY }
            ]}
            text={item.action}
          />
        </ViewComponent>

        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
          <ParagraphComponent
            style={[commonStyles.primarytext]}
            text={item.createdBy}
          />
          <FormattedDateText
            value={item.createdDate}
            conversionType='UTC-to-local'
            style={[commonStyles.secondarytext]}
          />
        </ViewComponent>
      </ViewComponent>
    );
  }, [commonStyles, statusColor, NEW_COLOR]);

  const renderFooter = useCallback(() => {
    if (!loadMoreLoading) return null;
    return <Loadding contenthtml={historyLoader} />;
  }, [loadMoreLoading, historyLoader]);

  if (pageNo === 1 && loading) {
    return (
      <SafeAreaViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
        <DashboardLoader />
      </SafeAreaViewComponent>
    );
  }

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <PageHeader
          title={cardName}
          onBackPress={backArrowButtonHandler}
        />

        {errorMessage !== "" && (
          <ErrorComponent message={errorMessage} onClose={() => setErrorMessage("")} />
        )}

        <SearchComponent
          data={historyData}
          customBind="action"
          onSearchResult={handleSearchResult}
          placeholder={"GLOBAL_CONSTANTS.SEARCH_STATUS"}
        />

        <FlatListComponent
          data={filteredData}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <ViewComponent style={[commonStyles.transactionsListGap]} />}
          keyExtractor={(item: HistoryItem, index: number) => item?.id || index.toString()}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerStyle={{ paddingBottom: s(UI.LIST_BOTTOM_PADDING) }}
          ListEmptyComponent={
            !loading ? (
              <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
                <NoDataComponent Description="GLOBAL_CONSTANTS.NO_DATA_AVAILABLE" />
              </ViewComponent>
            ) : null
          }
        />
      </Container>
    </ViewComponent>
  );
};

export default CardHistoryList;
