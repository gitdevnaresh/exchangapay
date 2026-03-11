import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import FlatListComponent from '../../newComponents/flatList/flatList';
import ViewComponent from '../../newComponents/view/view';
import Container from '../../newComponents/container/container';
import PageHeader from '../../newComponents/pageHeader/pageHeader';
import ErrorComponent from '../../newComponents/errorDisplay/errorDisplay';
import { BackHandler } from 'react-native';
import { allTransactionList } from '../commonScreens/transactions/skeltonViews';
import Loadding from '../commonScreens/skeltons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTransactionData } from './useTransactionData';
import SafeAreaViewComponent from '../../newComponents/safeArea/safeArea';
import SwokipayDashboardLoader from '../../newComponents/swokipayloader';
import TransactionDetails from '../TransactionDetails';

// Import new components
import TransactionFilterHeader from './components/TransactionFilterHeader';
import TransactionListItem from './components/TransactionListItem';
import TransactionFilterSheets from './components/TransactionFilterSheets';
import { useTransactionFilters } from './useTransactionFilters';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

const TransactionListItemSeparator = React.memo(({ commonStyles }: any) => (
  <ViewComponent style={[commonStyles.transactionsGap]} />
));

const TransactionList: React.FC = (props: any) => {
  const [transactionDetailModel, setTransactionDetailModel] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [transactionId, setTransactionId] = useState<any>("");
  const [txType, setTxType] = useState<any>("");
  const [refreshCounter, setRefreshCounter] = useState(0);

  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const initialModuleFromRoute = props?.route?.params?.trasactionType;
  const allTransactionListLoader = allTransactionList(10);


  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  // Use custom hooks
  const {
    filterState,
    setFilterState,
    filterOptions,
    filterLoading,
    transactionTypes,
    transactionTypeSheetRef,
    currencySheetRef,
    dateSheetRef,
    getTransactionTypes,
    getCurrencyOptions,
    getSelectedQuickOption,
    handleQuickSelectDate,
    resetFilters,
  } = useTransactionFilters(props?.route?.params?.trasactionType, props?.route?.params?.screenName);



  const {
    pageNo, setPageNo,
    transactionListLoading,
    transactionsList, setTransactionData,
    getAllTransactionsList,
    loadMoreData: loadMoreHookData,
    errormsg, setErrormsg,
  } = useTransactionData({ initialModule: initialModuleFromRoute, screenName: props?.route?.params?.screenName });

  // Effect for fetching transaction lookups and currencies
  useEffect(() => {
    if (isFocused) {
      getTransactionTypes();
      getCurrencyOptions();
    }
  }, [isFocused]);

  // Effect for fetching transaction data
  useEffect(() => {
    if (isFocused) {
      setPageNo(1);
      setTransactionData([]);
      getAllTransactionsList(1, searchQuery, filterState.selectedTransactionType, filterState.selectedCurrency, filterState.selectedDateRange.start, filterState.selectedDateRange.end);
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => { backArrowButtonHandler(); return true; });
      return () => backHandler.remove();
    }
  }, [
    isFocused,
    filterState.selectedTransactionType,
    filterState.selectedCurrency,
    filterState.selectedDateRange,
    searchQuery,
    refreshCounter,
    initialModuleFromRoute
  ]);

  const handleRefresh = () => {
    setSearchQuery("");
    resetFilters();
    setRefreshCounter(prev => prev + 1);
    getCurrencyOptions();
    getTransactionTypes();
  };

  const neoTransactionpopup = (val: any) => {
    setTransactionId(val?.id ?? val?.id);
    setTransactionDetailModel(true);
    setTxType(val?.action);
    //  navigation.navigate("ComingSoon",{ pageHeader: false, customHeader: { title: "Details", showBackButton: true } })
  };  

  const backArrowButtonHandler = () => {
    navigation.goBack();
  };

  const loadMoreData = () => {
    loadMoreHookData(searchQuery, '', '', null, null, filterState.selectedTransactionType, filterState.selectedCurrency);
  };

  const renderFooter = () => {
    if (!transactionListLoading) return null;
    return <Loadding contenthtml={allTransactionListLoader} />;
  };

  const renderItem = ({ item }: any) => (
    <TransactionListItem
      item={item}
      transactionTypes={transactionTypes}
      transactionType={initialModuleFromRoute}
      onPress={neoTransactionpopup}
    />
  );

  const renderItemSeparator = React.useCallback(() => (
    <TransactionListItemSeparator commonStyles={commonStyles} />
  ), [commonStyles]);

  // Filter handlers
  const handleSelectTransactionType = (value: string) => {
    setFilterState(prev => ({ ...prev, selectedTransactionType: value }));
    transactionTypeSheetRef.current?.close();
  };

  const handleSelectCurrency = (value: string) => {
    setFilterState(prev => ({ ...prev, selectedCurrency: value }));
    currencySheetRef.current?.close();
  };

  const handleClearTransactionType = () => {
    setFilterState(prev => ({ ...prev, selectedTransactionType: 'All' }));
  };
  const handleClearCurrency = () => setFilterState(prev => ({ ...prev, selectedCurrency: 'All' }));
  const handleClearDate = () => setFilterState(prev => ({ ...prev, selectedDateRange: { start: null, end: null } }));

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {pageNo === 1 && transactionListLoading ? (
        <SafeAreaViewComponent><SwokipayDashboardLoader /></SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader title={"GLOBAL_CONSTANTS.TRANSACTIONS"} onBackPress={backArrowButtonHandler} isrefresh={false} onRefresh={handleRefresh} />
          {errormsg !== "" && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")}  screen={true} />}
          <FlatListComponent
            ListHeaderComponent={
              <TransactionFilterHeader
                filterState={filterState}
                filterOptions={filterOptions}
                filterLoading={filterLoading}
                onOpenTransactionTypeSheet={() => transactionTypeSheetRef.current?.open()}
                onOpenCurrencySheet={() => currencySheetRef.current?.open()}
                onOpenDateSheet={() => dateSheetRef.current?.open()}
                onClearTransactionType={handleClearTransactionType}
                onClearCurrency={handleClearCurrency}
                onClearDate={handleClearDate}
                screenName={props?.route?.params?.screenName}
              />
            }
            data={transactionsList ?? []}
            keyExtractor={(item: any, index: number) => `${item.id ?? 'item'}-${index}`}
            ItemSeparatorComponent={renderItemSeparator}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            isLoading={transactionListLoading}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          {transactionDetailModel && (
            <TransactionDetails
              modalVisible={transactionDetailModel}
              transactionId={transactionId}
              txType={txType}
              closePopUp={() => setTransactionDetailModel(false)}
            />
          )}

          <TransactionFilterSheets
            filterState={filterState}
            filterOptions={filterOptions}
            filterLoading={filterLoading}
            transactionTypeSheetRef={transactionTypeSheetRef}
            currencySheetRef={currencySheetRef}
            dateSheetRef={dateSheetRef}
            onSelectTransactionType={handleSelectTransactionType}
            onSelectCurrency={handleSelectCurrency}
            onQuickSelectDate={handleQuickSelectDate}
            getSelectedQuickOption={getSelectedQuickOption}
            setFilterState={setFilterState}
            screenName={props?.route?.params?.screenName}
          />
        </Container>
      )}
    </ViewComponent>
  );
};

export default TransactionList;