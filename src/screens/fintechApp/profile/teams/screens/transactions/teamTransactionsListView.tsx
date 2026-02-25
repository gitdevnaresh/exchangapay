import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getThemedCommonStyles, getStatusColor } from '../../../../../../components/CommonStyles';
import { s } from '../../../../../../constants/styels/scale';
import FlatListComponent from '../../../../../../components/flatList/flatList';
import ViewComponent from '../../../../../../components/view/view';
import CommonTouchableOpacity from '../../../../../../components/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../../../components/textComponets/paragraphText/paragraph';
import Container from '../../../../../../components/container/container';
import PageHeader from '../../../../../../components/pageHeader/pageHeader';
import ErrorComponent from '../../../../../../components/errorDisplay/errorDisplay';
import SearchCompApi from '../../../../../../components/searchComponents/searchCompApi';
import { useThemeColors } from '../../../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../../../components/loader';
import SafeAreaViewComponent from '../../../../../../components/safeArea/safeArea';
import { formatDateTimeForAPI, isErrorDispaly } from '../../../../../../utils/helpers';
import TeamsService from '../../../../../../apiServices/profile/primary/teams';
import CustomRBSheet from '../../../../../../components/models/commonBottomSheet';
import FilterIconImage from '../../../../../../components/svgIcons/mainmenuicons/transactionfilter';
import { CurrencyText } from '../../../../../../components/textComponets/currencyText/currencyText';
import { FormattedDateText } from '../../../../../../components/textComponets/dateTimeText/dateTimeText';
import CustomPicker from '../../../../../../components/pickerComponents/basic/customPickerNonFormik';
import ButtonComponent from '../../../../../../components/buttons/button';
import { useLngTranslation } from '../../../../../../hooks/languagesHook/useLngTranslation';
import NoDataComponent from '../../../../../../components/noData/noData';
import Loadding from '../../../../../../components/skelton/skeltons';
import { allTransactionList } from '../../../../../../skeletons/skeltonViews';
import TransactionDetails from '../../../../../commonScreens/transactions/details';
import { ReceivedImages, Transactionwithdraw } from '../../../../../../assets/svg';
import { Formik } from 'formik';
import DatePickerComponent from '../../../../../../components/datePickers/formik/datePicker';
import { Transaction, TransactionsResponse, TeamsLuResponse, TeamTransactionsListNavigationProps, TransactionListItemSeparatorProps, FormikDateValues, StatusLookup } from '../../utils/interfaces';
import { STATUS, UI, PAGINATION, DECIMAL_PLACES } from '../../constants';

const TransactionListItemSeparator = React.memo(({ commonStyles }: TransactionListItemSeparatorProps) => (
  <ViewComponent style={[commonStyles.transactionsListGap]} />
));

const createItemSeparator = (commonStyles: any) => () => (
  <TransactionListItemSeparator commonStyles={commonStyles} />
);

const TeamTransactionsListView = (props: TeamTransactionsListNavigationProps) => {
  const transactionListLoader = allTransactionList(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errormsg, setErrormsg] = useState<string>("");
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [pageNo, setPageNo] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const filterSheetRef = useRef<any>(null);
  const isInitialMount = useRef(true);

  const [transactionStatusLu, setTransactionStatusLu] = useState<StatusLookup[]>([]);
  const [selectedTransactionStatus, setSelectedTransactionStatus] = useState<string>(STATUS.ALL);
  const [tempSelectedTransactionStatus, setTempSelectedTransactionStatus] = useState<string>(STATUS.ALL);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const today = new Date();
  const navigation = useNavigation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const statusColor = getStatusColor(NEW_COLOR);
  const { t } = useLngTranslation();
  const itemSeparator = createItemSeparator(commonStyles);

  const memberId = props?.route?.params?.memberId;
  const memberData = props?.route?.params?.memberData;
  const memberName = memberData?.fullName || t('GLOBAL_CONSTANTS.TEAMS');

  // Track if we should clear filters (only on refresh or coming from another screen)
  const [shouldClearFilters, setShouldClearFilters] = useState(false);
  const [formKey, setFormKey] = useState(0); // Force Formik re-render

  useEffect(() => {
    if (memberId) {
      if (isInitialMount.current) {
        getTransactionsList(1, false);
        getTeamsLookup();
        isInitialMount.current = false;
      } else {
        setPageNo(1);
        setTransactionsList([]);
        getTransactionsList(1, false);
      }
    }
  }, [memberId, searchQuery]);

  // Clear filters only when shouldClearFilters is true
  useEffect(() => {
    if (shouldClearFilters) {
      setSelectedTransactionStatus(STATUS.ALL);
      setTempSelectedTransactionStatus(STATUS.ALL);
      setStartDate(null);
      setEndDate(null);
      setTempStartDate(null);
      setTempEndDate(null);
      setFormKey(prev => prev + 1); // Force Formik re-render
      setShouldClearFilters(false);
    }
  }, [shouldClearFilters]);

  useFocusEffect(
    useCallback(() => {
      // Clear filters when coming from another screen (not on first mount)
      if (!isInitialMount.current) {
        setShouldClearFilters(true);
      }

      const onBackPress = () => {
        backArrowButtonHandler();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [])
  );

  const getTransactionsListWithParams = async (
    page: number = 1,
    isLoadMore: boolean = false,
    statusFilter: string = selectedTransactionStatus,
    searchFilter: string = searchQuery,
    fromDate: Date | null = startDate,
    toDate: Date | null = endDate
  ) => {
    if (!isLoadMore) {
      setLoading(true);
      setErrormsg("");
    } else {
      setLoadMoreLoading(true);
    }

    try {
      const formattedStartDate = fromDate ? formatDateTimeForAPI(fromDate) : "";
      const formattedEndDate = toDate ? formatDateTimeForAPI(toDate) : "";



      const response = (await TeamsService.getMemberTransactions(
        memberId,
        statusFilter,
        searchFilter || "",
        formattedStartDate,
        formattedEndDate,
        STATUS.ALL,
        page,
        PAGINATION.DEFAULT_PAGE_SIZE
      )) as TransactionsResponse;

      if (response?.ok !== false) {
        const data = response?.data?.data || [];
        const totalCount = response?.data?.total || 0;

        if (isLoadMore && page > 1) {
          const existingIds = new Set(transactionsList.map(t => t.id));
          const newData = data.filter(item => !existingIds.has(item.id));

          if (newData.length === 0) {
            setTotal(transactionsList.length);
          } else {
            setTransactionsList(prev => [...prev, ...newData]);
          }
        } else {
          setTransactionsList(data);
        }
        setTotal(response?.data?.total || data.length);
      } else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      } else {
        setLoadMoreLoading(false);
      }
    }
  };

  const getTransactionsList = async (page: number = 1, isLoadMore: boolean = false) => {
    return getTransactionsListWithParams(page, isLoadMore, selectedTransactionStatus, searchQuery, startDate, endDate);
  };



  const backArrowButtonHandler = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getTeamsLookup = async () => {
    try {
      const response = (await TeamsService.getTeamsLu()) as TeamsLuResponse;

      if (response?.ok) {
        const data = response.data || response;
        const transactionStatuses = data?.TeamMemberTransactionLookUp || [];

        setTransactionStatusLu(transactionStatuses);
      }
      else {
        setErrormsg(isErrorDispaly(response));
      }
    } catch (error) {
      setErrormsg(isErrorDispaly(error));
    }
  };

  const handleRefresh = () => {
    setPageNo(1);
    setTransactionsList([]);
    setSearchQuery("");

    // Clear all filter states immediately
    setSelectedTransactionStatus(STATUS.ALL);
    setTempSelectedTransactionStatus(STATUS.ALL);
    setStartDate(null);
    setEndDate(null);
    setTempStartDate(null);
    setTempEndDate(null);
    setFormKey(prev => prev + 1);

    // Pass reset values directly to avoid stale state
    getTransactionsListWithParams(1, false, STATUS.ALL, UI.EMPTY_STRING, null, null);
  };

  const handleMainSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const openFilterSheet = () => {
    setTempSelectedTransactionStatus(selectedTransactionStatus);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    filterSheetRef?.current?.open();
  };

  const handleSaveFilter = () => {
    setSelectedTransactionStatus(tempSelectedTransactionStatus);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPageNo(1);
    setTransactionsList([]);

    getTransactionsListWithParams(1, false, tempSelectedTransactionStatus, searchQuery, tempStartDate, tempEndDate);
    filterSheetRef?.current?.close();
  };

  const handleCancelFilter = () => {
    setTempSelectedTransactionStatus(selectedTransactionStatus);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    filterSheetRef?.current?.close();
  };

  const loadMoreData = () => {
    if (transactionsList.length < total && !loading && !loadMoreLoading && transactionsList.length > 0) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      getTransactionsList(nextPage, true);
    }
  };

  const renderFooter = () => {
    if (loadMoreLoading) {
      return (
        <Loadding contenthtml={transactionListLoader} />
      );
    }
    return null;
  };

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    setSelectedTransactionId(transaction?.id);
    setModalVisible(true);
  }, []);



  const iconsList = useMemo(() => ({
    buy: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(30), height: s(30), borderRadius: s(30) / 2 }]}>
      <ViewComponent>
        <Transactionwithdraw width={s(14)} height={s(14)} />
      </ViewComponent>
    </ViewComponent>,
    withdraw: <ViewComponent style={[commonStyles.bgwithdraw, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(30), height: s(30), borderRadius: s(30) / 2 }]}>
      <ViewComponent>
        <Transactionwithdraw width={s(14)} height={s(14)} />
      </ViewComponent>
    </ViewComponent>,
    deposit: <ViewComponent style={[commonStyles.bgdeposist, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, { width: s(30), height: s(30), borderRadius: s(30) / 2 }]}>
      <ViewComponent>
        <ReceivedImages width={s(14)} height={s(14)} />
      </ViewComponent>
    </ViewComponent>,
  }), [commonStyles]);

  const renderItem = useCallback(({ item }: { item: Transaction }) => {
    const txType = item.txType || item.type || "";
    const amount = item?.amount || 0;
    const state = item?.state;

    return (
      <CommonTouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleTransactionPress(item)}
        style={[commonStyles.cardsbannerbg]}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
            <ViewComponent style={[{ minHeight: s(30), minWidth: s(30) }]}>
              {iconsList[(txType?.toLowerCase()?.replaceAll(UI.SPACE_CHAR, UI.EMPTY_STRING) || item?.type?.toLowerCase()?.replaceAll(UI.SPACE_CHAR, UI.EMPTY_STRING)) as keyof typeof iconsList]}
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.flex1, commonStyles.gap6]}>
              <ViewComponent>
                <ParagraphComponent text={item?.vaultOrCardName || ""} numberOfLines={1} style={[commonStyles.primarytext]} />
                <ParagraphComponent text={txType || ""} numberOfLines={1} style={[commonStyles.secondarytext]} />
                <FormattedDateText value={item?.date} style={[commonStyles.secondarytext]} conversionType='UTC-to-local' />
              </ViewComponent>
              <ViewComponent>
                <CurrencyText value={amount} currency={item?.wallet} style={[commonStyles.primarytext, commonStyles.textRight]} decimalPlaces={DECIMAL_PLACES.FIAT} />
                <ParagraphComponent text={state} style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textRight, { color: statusColor[state?.toLowerCase()] || NEW_COLOR.TEXT_GREEN }]} />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  }, [commonStyles, iconsList, statusColor, NEW_COLOR, handleTransactionPress]);

  // Show Dashboard Loader for initial load, refresh, or when coming to screen first time
  if (loading && (pageNo === 1 || transactionsList.length === 0)) {
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
          title={`${memberName} ${t('GLOBAL_CONSTANTS.TRANSACTIONS')}`}
          onBackPress={backArrowButtonHandler}
          isrefresh={true}
          onRefresh={handleRefresh}
        />

        {errormsg !== "" && (
          <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />
        )}

        <FlatListComponent
          ListHeaderComponent={
            <ViewComponent style={[commonStyles.sectionGap]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                <ViewComponent style={[commonStyles.flex1]}>
                  <SearchCompApi
                    placeholder={"GLOBAL_CONSTANTS.SERACH_WALLET_CARD_NAME"}
                    onSearch={handleMainSearch}
                    searchQuery={searchQuery}
                  />
                </ViewComponent>
                <CommonTouchableOpacity
                  activeOpacity={0.8}
                  onPress={openFilterSheet}
                  style={[commonStyles.roundediconbg]}
                >
                  <FilterIconImage width={s(20)} height={s(20)} />
                </CommonTouchableOpacity>
              </ViewComponent>
            </ViewComponent>
          }
          data={transactionsList}
          extraData={transactionsList.length}
          keyExtractor={(item: Transaction) => item.id}
          ItemSeparatorComponent={itemSeparator}
          renderItem={renderItem}
          isLoading={loading}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerStyle={{ paddingBottom: s(UI.CARDS_LIST_BOTTOM_PADDING) }}
          ListEmptyComponent={
            !loading ? (
              <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt20]}>
                <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
              </ViewComponent>
            ) : null
          }
        />

        <CustomRBSheet refRBSheet={filterSheetRef} title="GLOBAL_CONSTANTS.FILTER_TRANSACTIONS" height={"Large"}>
          <ViewComponent>
            <CustomPicker
              label="GLOBAL_CONSTANTS.STATUS"
              data={transactionStatusLu}
              value={tempSelectedTransactionStatus}
              onChange={(selected: StatusLookup) => {
                const statusValue = (selected?.code || selected?.name || selected?.value || 'All') as string;
                setTempSelectedTransactionStatus(statusValue);
              }}
              selectionType={t("GLOBAL_CONSTANTS.STATUS")}
            />
            <ViewComponent style={[commonStyles.sectionGap]} />

            <Formik<FormikDateValues>
              key={formKey}
              initialValues={{
                startDate: tempStartDate,
                endDate: tempEndDate
              }}
              onSubmit={(values: FormikDateValues) => {
                setTempStartDate(values.startDate);
                setTempEndDate(values.endDate);
              }}
              enableReinitialize
            >
              {(formik) => {
                // Update temp states when formik values change
                useEffect(() => {
                  setTempStartDate(formik.values.startDate);
                  setTempEndDate(formik.values.endDate);
                }, [formik.values.startDate, formik.values.endDate]);

                return (
                  <ViewComponent>
                    <DatePickerComponent
                      name="startDate"
                      label="GLOBAL_CONSTANTS.START_DATE"
                      maximumDate={today}
                      required={false}
                    />
                    <ViewComponent style={[commonStyles.formItemSpace]} />
                    <DatePickerComponent
                      name="endDate"
                      label="GLOBAL_CONSTANTS.END_DATE"
                      maximumDate={today}
                      minimumDate={formik.values.startDate || undefined}
                      required={false}
                    />
                  </ViewComponent>
                );
              }}
            </Formik>

            <ViewComponent style={[commonStyles.sectionGap]} />


            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
              <ViewComponent style={[commonStyles.flex1]}>
                <ButtonComponent
                  multiLanguageAllows={true}
                  title={"GLOBAL_CONSTANTS.CANCEL"}
                  onPress={handleCancelFilter}
                  solidBackground={true}
                />
              </ViewComponent>
              <ViewComponent style={[commonStyles.flex1]}>
                <ButtonComponent
                  multiLanguageAllows={true}
                  title={"GLOBAL_CONSTANTS.SAVE"}
                  onPress={handleSaveFilter}
                />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </CustomRBSheet>

        {modalVisible && (
          <TransactionDetails
            modalVisible={modalVisible}
            transactionId={selectedTransactionId}
            closePopUp={() => setModalVisible(false)}
            accountType={props.accountType}
          />
        )}
      </Container>
    </ViewComponent>
  );
};

export default TeamTransactionsListView;
