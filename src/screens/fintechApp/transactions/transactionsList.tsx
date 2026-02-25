import React, { useEffect, useRef, useState, useMemo } from 'react';
import moment from 'moment';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { getStatusColor, getThemedCommonStyles, TransactionBlobIcons } from '../../../components/CommonStyles';
import { s } from '../../../constants/styels/scale';
import { SvgUri } from 'react-native-svg';
import FlatListComponent from '../../../components/flatList/flatList';
import ViewComponent from '../../../components/view/view';
import CommonTouchableOpacity from '../../../components/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import Container from '../../../components/container/container';
import ErrorComponent from '../../../components/errorDisplay/errorDisplay';
import { FormattedDateText } from '../../../components/textComponets/dateTimeText/dateTimeText';
import { CurrencyText } from '../../../components/textComponets/currencyText/currencyText';
import SearchCompApi from '../../../components/searchComponents/searchCompApi';
import { ReceivedImages, Transactionwithdraw } from '../../../assets/svg';
import CustomRBSheet from '../../../components/models/commonBottomSheet';
import { allTransactionList } from '../../../skeletons/skeltonViews';
import Loadding from '../../../components/skelton/skeltons';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { TRANSACTION_CONST } from '../../commonScreens/transactions/constants';
import DashboardLoader from '../../../components/loader';
import TransactionFilterSheetContent from './transactionFilterSheetContent';
import { useTransactionFilters } from './useTransactionFilters';
import { useTransactionData } from './useTransactionData';
import SafeAreaViewComponent from '../../../components/safeArea/safeArea';
import { useHardwareBackHandler } from '../../../hooks/backHandleHook';
import TransactionDetails from '../../commonScreens/transactions/details';
import PageHeader from '../../../components/pageHeader/pageHeader';
import { useSelector } from 'react-redux';
import { RefreshControl } from 'react-native';

const TransactionListItemSeparator = React.memo(({ commonStyles }: any) => (
  <ViewComponent style={[commonStyles.transactionsListGap]} />
));

const createItemSeparator = (commonStyles: any) => () => (
  <TransactionListItemSeparator commonStyles={commonStyles} />
);



const TransactionList: React.FC = (props: any) => {
  const [transactionDetailModel, setTransactionDetailModel] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const allTransactionListLoader = allTransactionList(10);
  const isFocused = useIsFocused();
  const [transactionId, setTransactionId] = useState<any>("");
  const navigation = useNavigation<any>();
  const [refreshCounter, setRefreshCounter] = useState(0); // New state for refresh trigger
  const rbSheetRef = useRef<any>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const statusColor = getStatusColor(NEW_COLOR);
  const itemSeparator = createItemSeparator(commonStyles);
  const cardId = props?.route?.params?.cardId;
  const initialModuleFromRoute = props?.route?.params?.trasactionType;
  const currency = props?.route?.params?.currency;
  const vaultId = "00000000-0000-0000-0000-000000000000"
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const Id = props?.route?.params?.id;
  const {
    appliedFilters,
    pickerStates,
    popUpErrorMsg,
    handleApplyFilter,
    handleClearFilter,
    handleErrorClose,
    setAppliedAccountMemberName,
  } = useTransactionFilters({ initialModuleFromRoute, rbSheetRef });

  const {
    pageNo, setPageNo,
    transactionListLoading,
    errormsg, setErrormsg,
    transactionsList, setTransactionData,
    stateLu, memberShip,
    getTranscationLookups,
    getAllTransactionsList,
    loadMoreData: loadMoreHookData,
  } = useTransactionData({ initialModule: initialModuleFromRoute });

  // Effect for initializing picker and applied filter based on route params and focus
  useEffect(() => {
    if (isFocused) {
      const initialModule = initialModuleFromRoute ?? "All";
      // Set the picker's initial value if not set or different from initialModule
      if (!pickerStates.selectedAccountMemberInPicker || pickerStates.selectedAccountMemberInPicker.name !== initialModule) {
        pickerStates.setSelectedAccountMemberInPicker({ id: initialModule, name: initialModule, state: 'All' });
      }
      // Set the applied filter value; this will trigger data fetch if it changes.
      if (appliedFilters.moduleName !== initialModule) {
        setAppliedAccountMemberName(initialModule);
      }
    }
  }, [isFocused, initialModuleFromRoute, pickerStates.selectedAccountMemberInPicker, appliedFilters.moduleName, setAppliedAccountMemberName, pickerStates.setSelectedAccountMemberInPicker]);

  // Effect for fetching transaction lookups
  useEffect(() => {
    if (isFocused) {
      getTranscationLookups();
    }
  }, [isFocused, getTranscationLookups]);

  // Effect for fetching transaction data
  useEffect(() => {
    if (isFocused) {
      setPageNo(1);
      setTransactionData([]); // Clear data before new fetch for page 1
      // Destructure appliedFilters to use its properties as dependencies
      const { startDate, endDate, status, moduleName } = appliedFilters;

      const formattedStartDate = startDate ? moment(startDate).format("YYYY-MM-DD") : null;
      const formattedEndDate = endDate ? moment(endDate).format("YYYY-MM-DD") : null;
      const moduleToFetch = moduleName ?? initialModuleFromRoute ?? "All";

      getAllTransactionsList(1, searchQuery, status, moduleToFetch, formattedStartDate, formattedEndDate, vaultId, cardId, currency, Id);
      // BackHandler setup remains the same
    }
  }, [
    isFocused,
    appliedFilters.startDate, // Use individual stable properties from appliedFilters
    appliedFilters.endDate,
    appliedFilters.status,
    appliedFilters.moduleName,
    searchQuery,
    refreshCounter, // Add refreshCounter as a dependency
    getAllTransactionsList, // Assumed to be stable from useCallback
    initialModuleFromRoute, // Keep this dependency
    setPageNo, setTransactionData // State setters are stable
  ]);
  useHardwareBackHandler(() => {
    backArrowButtonHandler();
  })
  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery("")
    handleClearFilter();// This will reset applied filters and picker states
    setRefreshCounter(prev => prev + 1); // Increment counter to force useEffect trigger
    // Data fetching will be triggered by the useEffect due to appliedFilters change
    setRefreshing(false);
  };

  const handleSearch = (value: any) => {
    setSearchQuery(value);
  };

  const neoTransactionpopup = (val: any) => {
    setTransactionId(val?.id ?? val?.transactionId);
    setTransactionDetailModel(true);
  };
  const backArrowButtonHandler = () => {
    navigation.goBack();
  };

  const loadMoreData = () => {
    loadMoreHookData(searchQuery, appliedFilters.status, appliedFilters.moduleName, appliedFilters.startDate, appliedFilters.endDate, vaultId, cardId, currency, Id);
  };

  const renderFooter = () => {
    if (!transactionListLoading) return null;
    else {
      return (
        <Loadding contenthtml={allTransactionListLoader} />
      );
    }
  };
  const formatAmount = (value: number, decimalPlaces: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  };

  const renderTransactionAmount = (amount: string, wallet: string, decimalPlaces: number) => {
    if (amount?.includes('/')) {
      const [firstAmount, secondAmount] = amount.split('/');
      const firstValue = Number.parseFloat(firstAmount?.trim() || '0');
      const secondValue = Number.parseFloat(secondAmount?.trim() || '0');

      return (
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
          <ParagraphComponent
            text={formatAmount(firstValue, 4)}
            style={[commonStyles.listprimarytext, commonStyles.textRight]}
          />
          <ParagraphComponent text=" / " style={[commonStyles.listprimarytext]} />
          <ParagraphComponent
            text={`${formatAmount(secondValue, 2)} ${wallet}`}
            style={[commonStyles.listprimarytext, commonStyles.textRight]}
          />
        </ViewComponent>
      );
    }

    return <CurrencyText style={[commonStyles.listprimarytext, commonStyles.textRight]} decimalPlaces={decimalPlaces} value={Number.parseFloat(amount || '0')} currency={wallet} />;
  };

  const iconsList = {
    buy: (
      <ViewComponent style={[commonStyles.buy]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.buy}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    purchase: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.purchase}
      />
    ),
    purchasefiat: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.purchasefiat}
      />
    ),
    purchasecrypto: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.purchasecrypto}
      />
    ),
    sell: (
      <ViewComponent style={[commonStyles.sell]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.sell}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdraw: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    deposit: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    accountdeposit: (
      <SvgUri
        width={s(50)}
        height={s(50)}
        uri={TransactionBlobIcons.accountdeposit}
      />
    ),
    withdrawcrypto: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    depositfiat: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payinfiat: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    exchangewallettransfer: (
      <SvgUri
        width={s(12)}
        height={s(12)}
        uri={TransactionBlobIcons.exchangewallettransfer}
      />
    ),
    depositcrypto: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdrawfiat: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutfiat: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutcrypto: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payincrypto: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    buyreferralbonus: (
      <ViewComponent style={[commonStyles.buy]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.buy}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    sellreferralbonus: (
      <ViewComponent style={[commonStyles.sell]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.sell}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payoutcryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    payincryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    depositcryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    depositlevelbonus: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdrawcryptolevelbonus: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    withdrawlevelbonus: (
      <ViewComponent style={[commonStyles.bgwithdraw]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.withdraw}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    refund: (
      <ViewComponent style={[commonStyles.refumdbg]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.refund}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    levelbonus: (
      <ViewComponent style={[commonStyles.refumdbg]}>
        <ViewComponent>
          <SvgUri
            width={s(18)}
            height={s(18)}
            uri={TransactionBlobIcons.referralbonus}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    applycard: (
      <ViewComponent style={[commonStyles.cardapply]}>
        <ViewComponent>
          <SvgUri
            width={s(16)}
            height={s(16)}
            uri={TransactionBlobIcons.applycard}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    fee: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.applycard}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    consume: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(14)}
            height={s(14)}
            uri={TransactionBlobIcons.applycard}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    topupcard:
      (
        <ViewComponent style={[commonStyles.bgdeposist]}>
          <ViewComponent>
            <SvgUri
              width={s(14)}
              height={s(14)}
              uri={TransactionBlobIcons.applycard}
            />
          </ViewComponent>
        </ViewComponent>
      ),
    bankwithdrawfiat:
      (
        <ViewComponent style={[commonStyles.bgwithdraw]}>
          <ViewComponent>
            <SvgUri
              width={s(12)}
              height={s(12)}
              uri={TransactionBlobIcons.withdraw}
            />
          </ViewComponent>
        </ViewComponent>
      ),
    bankdepositfiat: (
      <ViewComponent style={[commonStyles.bgdeposist]}>
        <ViewComponent>
          <SvgUri
            width={s(12)}
            height={s(12)}
            uri={TransactionBlobIcons.deposit}
          />
        </ViewComponent>
      </ViewComponent>
    ),
    default: (
      <ViewComponent style={[commonStyles.refumdbg]}>
        <ViewComponent>
          <SvgUri
            width={s(18)}
            height={s(18)}
            uri={TransactionBlobIcons.refund}
          />
        </ViewComponent>
      </ViewComponent>
    ),
  };
  // Define a type for the keys of iconsList
  type IconKey = keyof typeof iconsList;

  const renderItem = ({ item }: any) => {

    const state = item?.status ?? item?.remarks ?? item?.state ?? "";
    const txType = item.actionType || item.transactionType || item.type || item.action || "";
    const decimalPlaces = ["depositcrypto", "withdrawcrypto", "payoutcrypto", "payincrypto"].includes(item?.type?.toLowerCase()?.replaceAll(" ", "") || "") ? 4 : 2;

    // Simplified icon key generation
    const getIconKey = () => {
      const type = item?.action || item?.txType || item?.transactionType || item?.type || "";
      return type.toLowerCase().replaceAll(" ", "");
    };

    const iconKey = getIconKey();
    const displayIcon = iconsList[iconKey as keyof typeof iconsList] || iconsList.default; // fallback icon
    return (
      <CommonTouchableOpacity onPress={() => neoTransactionpopup(item)} activeOpacity={0.8} key={item?.id ?? item?.transactionId} style={[commonStyles.cardsbannerbg]}>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
          <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
            <ViewComponent style={[{ minHeight: s(30), minWidth: s(30) }]}>
              {displayIcon}
            </ViewComponent>

            <ViewComponent style={[commonStyles.flex1]}>
              <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.mb8]}>
                <ParagraphComponent
                  text={txType || ''}
                  numberOfLines={1}
                  style={[commonStyles.primarytext, { width: s(200) }, commonStyles.flex1]}
                />

                <ViewComponent style={[]}>
                  {(item?.type != 'Sell' && item?.type != 'Buy') && <ViewComponent>{props?.route?.params?.trasactionType !== TRANSACTION_CONST.CARDS && <CurrencyText style={[commonStyles.primarytext,]} decimalPlaces={decimalPlaces} value={item?.value ?? item?.amount} currency={`${item?.wallet ?? item?.walletCode ?? userInfo?.currency ?? item?.type ?? ""}`} />}</ViewComponent>}

                  {(item?.type == 'Sell' || item?.type == 'Buy') &&

                    <ParagraphComponent >

                      {props?.route?.params?.trasactionType !== TRANSACTION_CONST.CARDS && renderTransactionAmount(

                        item?.value ?? item?.amount,

                        `${item?.wallet ?? item?.walletCode ?? item?.type ?? ""}`,

                        decimalPlaces

                      )}

                    </ParagraphComponent>

                  }

                  {props?.route?.params?.trasactionType === TRANSACTION_CONST.CARDS && <CurrencyText style={[commonStyles.primarytext,]} value={item?.value ?? item?.amount} currency={`${item?.wallet ?? item?.walletCode ?? item?.type ?? ""}`} decimalPlaces={decimalPlaces} />}

                </ViewComponent>
              </ViewComponent>

              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]} >
                <FormattedDateText value={item?.date ?? item?.dateTime ?? item?.transactionDate ?? ""} conversionType='UTC-to-local' style={[commonStyles.secondarytext]} />
                <ParagraphComponent style={[commonStyles.colorstatus, { color: statusColor[state !== null && state?.toLowerCase()] ?? NEW_COLOR.TEXT_GREEN }]} text={state} />

              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </CommonTouchableOpacity>
    )
  }
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      {pageNo === 1 && transactionListLoading ? (
        <SafeAreaViewComponent><DashboardLoader /></SafeAreaViewComponent>
      ) : (
        <Container style={commonStyles.container}>
          <PageHeader title={"GLOBAL_CONSTANTS.TRANSACTIONS"} onBackPress={backArrowButtonHandler} />
          <ViewComponent>
            {errormsg !== "" && <ErrorComponent message={errormsg} onClose={() => setErrormsg("")} />}
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, commonStyles.sectionGap]}>
              <ViewComponent style={commonStyles.flex1}>
                <SearchCompApi
                  placeholder={"GLOBAL_CONSTANTS.SEARCH_TRANSACTIONS"}
                  onSearch={handleSearch}
                  inputStyle={[commonStyles.textWhite]}
                  searchQuery={searchQuery}
                />
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
          <FlatListComponent
            showsVerticalScrollIndicator={false}
            data={transactionsList ?? []}
            keyExtractor={(item: any, index: number) => `${item.id ?? 'item'}-${index}`}
            ItemSeparatorComponent={<ViewComponent style={[commonStyles.transactionsListGap]} />}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            renderItem={renderItem}
            ListFooterComponent={renderFooter}
            isLoading={transactionListLoading}
            contentContainerStyle={{ paddingBottom: s(180) }}
            refreshControl={<RefreshControl tintColor={NEW_COLOR.BUTTON_BG} refreshing={refreshing} onRefresh={handleRefresh} />}
          />
          {transactionDetailModel && (
            <TransactionDetails
              modalVisible={transactionDetailModel}
              transactionId={transactionId}
              closePopUp={() => setTransactionDetailModel(false)}
            />
          )}
          <CustomRBSheet refRBSheet={rbSheetRef} title="GLOBAL_CONSTANTS.FILTER_TITLE" height={"Large"}>
            <TransactionFilterSheetContent
              popUpErrorMsg={popUpErrorMsg}
              onCloseError={handleErrorClose}
              statusOptions={stateLu}
              selectedStatus={pickerStates.selectedStatusInPicker}
              onSelectStatus={(data) => pickerStates.setSelectedStatusInPicker(data?.code)}
              moduleOptions={memberShip}
              selectedModule={pickerStates.selectedAccountMemberInPicker}
              onSelectModule={pickerStates.setSelectedAccountMemberInPicker}
              startDate={pickerStates.selectedStartDateInPicker}
              onSelectStartDate={pickerStates.setSelectedStartDateInPicker}
              endDate={pickerStates.selectedEndDateInPicker}
              onSelectEndDate={pickerStates.setSelectedEndDateInPicker}
              onApply={handleApplyFilter}
              onClear={handleClearFilter}
            />
          </CustomRBSheet>
        </Container>
      )}
    </ViewComponent>
  );
};
export default TransactionList;


