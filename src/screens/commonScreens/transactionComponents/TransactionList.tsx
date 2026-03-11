import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import FlatListComponent from "../../../newComponents/flatList/flatList";
import ViewComponent from "../../../newComponents/view/view";
import Container from "../../../newComponents/container/container";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";
import Loadding from "../skeltons";
import SafeAreaViewComponent from "../../../newComponents/safeArea/safeArea";
import SwokipayDashboardLoader from "../../../newComponents/swokipayloader";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useTransactionFilters } from "../../transactions/useTransactionFilters";
import TransactionFilterSheets from "./transactionHeaderSheets";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import { FormattedDateText } from "../../../newComponents/textComponets/dateTimeText/dateTimeText";
import { CurrencyText } from "../../../newComponents/textComponets/currencyText/currencyText";
import TransactionService from "../../../services/transaction";
import NoDataComponent from "../../../newComponents/noData/noData";
import { useTransactionData } from "./useTransactionData";
import TransactionFilterHeader from "./transactionHeader";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";
import { allTransactionList } from "../transactions/skeltonViews";
import { ReferralServices } from "../../../apiServices/referApis/referServices";
import { s } from "../../../newComponents/theme/scale";

interface TransactionListProps {
  transactionType: 'cryptoback' | 'referral';
}

const TransactionListItemSeparator = React.memo(({ commonStyles }: any) => (
  <ViewComponent style={[commonStyles.transactionsGap]} />
));

const TransactionList: React.FC<TransactionListProps> = ({ transactionType }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const lastCallTime = useRef(0);
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const allTransactionListLoader = allTransactionList(10);
  const config = {
    cryptoback: {
      title: 'GLOBAL_CONSTANTS.CRYPTOBACK_EARNINGS',
      detailScreen: 'CryptoBackTransactionDetails',
      apiCall: TransactionService.getCryptobackRewardsAllTransactions,
      lookupCall: TransactionService.getCashBackLu,
      lookupKey: 'CashBack'
    },
    referral: {
      title: 'GLOBAL_CONSTANTS.MY_REFERRAL_REWARDS',
      detailScreen: 'ReferralTransactionDetails',
      apiCall: ReferralServices.getReferralTransactionList,
      lookupCall: TransactionService.getCashBackLu,
      lookupKey: 'Referral'
    }
  }[transactionType];

  const {
    filterState,
    setFilterState,
    filterOptions,
    filterLoading,
    transactionTypes,
    transactionTypeSheetRef,
    dateSheetRef,
    resetFilters,
  } = useTransactionFilters(transactionType, transactionType);

  const {
    pageNo,
    setPageNo,
    transactionListLoading,
    errormsg,
    setErrormsg,
    transactionsList,
    setTransactionData,
    getAllTransactionsList,
    loadMoreData: loadMoreHookData,
    hasMoreData,
  } = useTransactionData({ transactionType });

  // Remove separate lookup call since useTransactionFilters handles it

  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  });

  useEffect(() => {
    if (isFocused) {
      const now = Date.now();
      if (now - lastCallTime.current < 500) return; // Prevent calls within 500ms
      lastCallTime.current = now;
      setPageNo(1);
      setTransactionData([]);
      getAllTransactionsList(
        1,
        filterState.selectedTransactionType,
        filterState.selectedDateRange.start ?? undefined,
        filterState.selectedDateRange.end ?? undefined,
        isFirstLoad
      );
      if (isFirstLoad) setIsFirstLoad(false);
    }
  }, [
    isFocused,
    filterState.selectedTransactionType,
    filterState.selectedCurrency,
    filterState.selectedDateRange,
    searchQuery,
    refreshCounter,
  ]);

  const handleRefresh = () => {
    setSearchQuery("");
    resetFilters();
    setRefreshCounter((prev) => prev + 1);
  };

  const backArrowButtonHandler = () => {
    navigation.goBack();
  };

  const loadMoreData = () => {
    if (transactionListLoading || !hasMoreData) return;
    loadMoreHookData(
      filterState.selectedTransactionType,
      filterState.selectedDateRange.start,
      filterState.selectedDateRange.end
    );
  };

  const renderFooter = () => {
    if (transactionListLoading && pageNo > 1) {
      return <Loadding contenthtml={allTransactionListLoader} />;
    }
    return null;
  };

  const handleTransactionDetails = (item: any) => {
    navigation.navigate(config.detailScreen, { 
      transactionId: item?.id || item?.transactionId,
      transactionType: transactionType 
    });
  };

  const renderItem = ({ item }: any) => {
    const transactionTitle = item?.merchantName;
    const amount = parseFloat(String(item?.amount ?? "0")) || 0;
    const currency = item?.currency || "";
    const status = item?.state || "";
    let statusColor;
    if (status === "Completed" || status === "Approved") {
      statusColor = NEW_COLOR.TEXT_GREEN;
    } else if (status === "Failed") {
      statusColor = NEW_COLOR.TEXT_RED;
    } else {
      statusColor = NEW_COLOR.BG_YELLOW;
    }


    return (
      <CommonTouchableOpacity
        activeOpacity={0.8}
        key={item?.id ?? item?.transactionId}
        style={[ commonStyles.transactionsCard,
        ]}
        onPress={() => handleTransactionDetails(item)}
      >
        <ViewComponent
          style={[
            commonStyles.dflex,
            commonStyles.justifyContent,
            commonStyles.alignStart,
          ]}
        >
        <ViewComponent style={{width:s(250)}}>
            <ParagraphComponent
            style={[
              commonStyles.primaryText,{
              }
            ]}
            text={transactionTitle}
          />
        </ViewComponent>
          <CurrencyText
            currency={currency}
            value={amount ?? 0}
            prifix={amount > 0 ? '+' : ''}
            style={[
              commonStyles.primaryText
            ]}
          />
        </ViewComponent>

        <ViewComponent
          style={[
            commonStyles.dflex,
            commonStyles.justifyContent,
            commonStyles.alignCenter,
            commonStyles.mt4,
          ]}
        >
          <FormattedDateText
            value={item?.txDate || item?.date || ""}
            conversionType="UTC-to-local"
            style={[
              commonStyles.secondaryText
            ]}
          />
          <ViewComponent
            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap4]}
          >
            <ViewComponent
              style={{
                width: s(8),
                height: s(8),
                borderRadius: s(4),
                backgroundColor: statusColor,
              }}
            />
            <ParagraphComponent
              text={status}
              style={[
                commonStyles.secondaryText
              ]}
            />
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  };

  // Lookup data is now handled by useTransactionFilters hook

  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {pageNo === 1 && transactionListLoading ? (
        <SafeAreaViewComponent>
          <SwokipayDashboardLoader />
        </SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader
            title={config.title}
            onBackPress={backArrowButtonHandler}
            isrefresh={false}
            onRefresh={handleRefresh}
          />
          {errormsg !== "" && (
            <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} screen={true} />
          )}
          <FlatListComponent
            ListHeaderComponent={
              <TransactionFilterHeader
                filterState={filterState}
                filterLoading={filterLoading}
                onOpenTransactionTypeSheet={() =>
                  transactionTypeSheetRef.current?.open()
                }
                onOpenDateSheet={() => dateSheetRef.current?.open()}
                onClearTransactionType={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    selectedTransactionType: "All",
                  }))
                }
                onClearDate={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    selectedDateRange: { start: null, end: null },
                  }))
                }
                transactionTypeOptions={transactionTypes}
              />
            }
            data={(transactionsList as any)?.data?.data ?? []}
            keyExtractor={(item: any, index: number) => `${item.id}-${index}`}
            ItemSeparatorComponent={() => (
              <TransactionListItemSeparator commonStyles={commonStyles} />
            )}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            isLoading={transactionListLoading}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <ViewComponent style={[commonStyles.mt40]}>
                <NoDataComponent isPopup={false} />
              </ViewComponent>
            }
          />

          <TransactionFilterSheets
            filterState={filterState}
            filterOptions={filterOptions}
            transactionTypeSheetRef={transactionTypeSheetRef}
            dateSheetRef={dateSheetRef}
            transactionTypeOptions={transactionTypes}
            onSelectTransactionType={(val: string) =>
              setFilterState((prev) => ({
                ...prev,
                selectedTransactionType: val,
              }))
            }
            setFilterState={setFilterState}
          />
        </Container>
      )}
    </ViewComponent>
  );
};

export default TransactionList;