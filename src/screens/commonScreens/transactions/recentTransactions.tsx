import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { isErrorDispaly } from '../../../utils/helpers';
import NoDataComponent from '../../../components/noData/noData';
import { s } from '../../../constants/styels/scale';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import TransactionDetails from './details';
import { getStatusColor, getThemedCommonStyles, TransactionBlobIcons } from '../../../components/CommonStyles';
import TransactionService from '../../../apiServices/common/transaction';
import { SvgUri } from 'react-native-svg';
import ViewComponent from '../../../components/view/view';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import Loadding from '../../../components/skelton/skeltons';
import { transactionCard } from '../../../skeletons/skeltonViews';
import { CurrencyText } from '../../../components/textComponets/currencyText/currencyText';
import CommonTouchableOpacity from '../../../components/touchableComponents/touchableOpacity';
import { FormattedDateText } from '../../../components/textComponets/dateTimeText/dateTimeText';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import { useSelector } from 'react-redux';
import FlatListComponent from '../../../components/flatList/flatList';

// Helper to normalize API response
function extractTransactionData(response: any) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

interface RecentTransactionsProps {
  initialData?: any[];
  accountType: string;
  currency?: string;
  cardId?: string;
  typeName?: string;
  recentTranscationReload?: boolean;
  handleRecentTranscationReloadDetails: (reload: boolean, error?: string | null) => void;
  dashboardLoading?: boolean;
  id?: string;
}

const RecentTransactions = (props: RecentTransactionsProps) => {
  const [recentData, setRecentData] = useState<any>(props.initialData || []);
  const [dataLoading, setDataLoading] = useState<boolean>(props.initialData === undefined);
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const isFocused = useIsFocused();
  const isCustodial = false;

  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const statusColor = useMemo(() => getStatusColor(NEW_COLOR), [NEW_COLOR]);
  const transactionCardContent = useMemo(() => transactionCard(5), []);
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);

  useEffect(() => {
    if (props.initialData !== undefined) {
      setRecentData(props.initialData);
      setDataLoading(false);
      props?.handleRecentTranscationReloadDetails(false, null);
      return;
    }

    if (props.initialData === undefined && props?.accountType && isFocused) {
      fetchData(props?.accountType);
    }
  }, [props.initialData, props?.accountType, props?.cardId, isFocused]);

  useEffect(() => {
    if (props.recentTranscationReload && props?.accountType) {
      fetchData(props?.accountType);
    }
  }, [props.recentTranscationReload, props?.accountType]);

  const fetchData = useCallback(async (accountType: string) => {
    setDataLoading(true);
    try {
      const response: any = await TransactionService.getNonCustodianTransactions(
        accountType,
        props?.currency || null,
        props?.cardId,
        props?.id
      );

      if (response.ok) {
        setRecentData(extractTransactionData(response));
        props?.handleRecentTranscationReloadDetails(false, null);
      } else {
        const errorMessage = isErrorDispaly(response);
        props?.handleRecentTranscationReloadDetails(false, errorMessage);
      }
    } catch (error) {
      const errorMessage = isErrorDispaly(error);
      props?.handleRecentTranscationReloadDetails(false, errorMessage);
    } finally {
      setDataLoading(false);
    }
  }, [props?.currency, props?.cardId, props?.id, props?.handleRecentTranscationReloadDetails]);

  const handleSeeAll = useCallback(() => {
    navigation?.navigate('CardsTransactions', {
      trasactionType: props?.typeName || props?.accountType,
      cardId: props?.cardId,
      id: props?.id,
      currency: props?.accountType == 'CryptoCoinBalance' ? '' : props?.currency,
    });
  }, [navigation, props?.typeName, props?.accountType, props?.cardId, props?.id, props?.currency]);

  const handleDetails = useCallback((item: any) => {
    setTransactionId(item?.id || item?.transactionId);
    setModalVisible(true);
  }, []);

  // ✅ Memoized SVG icon renderer with proper icons
  const getTransactionIcon = useCallback((txType: string) => {
    const iconKey = txType?.toLowerCase()?.replaceAll(' ', '') || '';

    const iconConfig = {
      buy: { uri: TransactionBlobIcons.buy, size: 18, style: commonStyles.buy },
      sell: { uri: TransactionBlobIcons.sell, size: 18, style: commonStyles.sell },
      withdraw: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      withdrawcrypto: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      withdrawfiat: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      withdrawlevelbonus: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      withdrawcryptolevelbonus: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      payoutfiat: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      payoutcrypto: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      payoutcryptolevelbonus: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      deposit: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      depositfiat: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      depositcrypto: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      depositlevelbonus: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      depositcryptolevelbonus: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      payinfiat: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      payincrypto: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      payincryptolevelbonus: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
      refund: { uri: TransactionBlobIcons.refund, size: 12, style: commonStyles.refumdbg },
      purchase: { uri: TransactionBlobIcons.purchase, size: 12, style: null },
      purchasefiat: { uri: TransactionBlobIcons.purchasefiat, size: 12, style: null },
      purchasecrypto: { uri: TransactionBlobIcons.purchasecrypto, size: 12, style: null },
      exchangewallettransfer: { uri: TransactionBlobIcons.exchangewallettransfer, size: 12, style: null },
      accountdeposit: { uri: TransactionBlobIcons.accountdeposit, size: 50, style: null },
      levelbonus: { uri: TransactionBlobIcons.referralbonus, size: 18, style: commonStyles.refumdbg },
      buyreferralbonus: { uri: TransactionBlobIcons.buy, size: 18, style: commonStyles.buy },
      sellreferralbonus: { uri: TransactionBlobIcons.sell, size: 18, style: commonStyles.sell },
      applycard: { uri: TransactionBlobIcons.applycard, size: 18, style: commonStyles.cardapply },
      fee: { uri: TransactionBlobIcons.applycard, size: 14, style: commonStyles.bgdeposist },
      consume: { uri: TransactionBlobIcons.applycard, size: 14, style: commonStyles.bgdeposist },
      topupcard: { uri: TransactionBlobIcons.applycard, size: 14, style: commonStyles.bgdeposist },
      bankwithdrawfiat: { uri: TransactionBlobIcons.withdraw, size: 12, style: commonStyles.bgwithdraw },
      bankdepositfiat: { uri: TransactionBlobIcons.deposit, size: 12, style: commonStyles.bgdeposist },
    }[iconKey] || { uri: TransactionBlobIcons.refund, size: 18, style: commonStyles.refumdbg };

    if (iconConfig.style) {
      return (
        <ViewComponent style={[iconConfig.style, { minHeight: s(30), minWidth: s(30), borderRadius: s(15), justifyContent: 'center', alignItems: 'center' }]}>
          <SvgUri width={s(iconConfig.size)} height={s(iconConfig.size)} uri={iconConfig.uri} />
        </ViewComponent>
      );
    }

    return <SvgUri width={s(iconConfig.size)} height={s(iconConfig.size)} uri={iconConfig.uri} />;
  }, [commonStyles]);

  if (props.dashboardLoading) return null;
  if (props.dashboardLoading !== undefined && props.initialData === undefined) return null;

  const formatAmount = (value: number, decimalPlaces: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
  };

  const renderTransactionAmount = (amount: string) => {
    if (!amount) return null;

    if (amount.includes('/')) {
      const parts = amount.split('/');
      return (
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.textRight, commonStyles.flexWrap]}>
          <ParagraphComponent
            text={formatAmount(Number.parseFloat(parts[0].trim()) || 0, 4)}
            style={[commonStyles.primarytext]}
          />
          <ParagraphComponent text=" / " style={[commonStyles.primarytext]} />
          <ParagraphComponent
            text={formatAmount(Number.parseFloat(parts[1].trim()) || 0, 2)}
            style={[commonStyles.primarytext]}
          />
        </ViewComponent>
      );
    }

    return (
      <CurrencyText
        value={Number.parseFloat(amount) || 0}
        decimalPlaces={4}
        style={[commonStyles.primarytext, commonStyles.textRight]}
      />
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const txType = item.txType || item.actionType || item.transactionType || item.type || item.action || '';
      const amount = item?.volume || item?.amount || item?.value || 0;
      const state =
        (isCustodial && (item?.state || item?.remarks || item?.status || '')) ||
        (!isCustodial && (item?.state || item?.status));

      return (
        <CommonTouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleDetails(item)}
          style={[commonStyles.cardsbannerbg]}
        >
          <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
            <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              <ViewComponent style={[{ minHeight: s(30), minWidth: s(30) }]}>
                {getTransactionIcon(item?.action || item.txType || item.transactionType || item?.type)}
              </ViewComponent>

              <ViewComponent style={[commonStyles.flex1]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8]}>
                  <ParagraphComponent
                    text={txType || ''}
                    numberOfLines={1}
                    style={[commonStyles.primarytext, { width: s(200) }, commonStyles.flex1]}
                  />

                  <ViewComponent>
                    {typeof amount === 'string' && amount.includes('/') ? (
                      <ViewComponent>
                        {renderTransactionAmount(amount)}
                        <ParagraphComponent text={item?.wallet || item?.walletCode || ''} style={[commonStyles.primarytext, commonStyles.textRight]} />
                      </ViewComponent>
                    ) : (
                      <CurrencyText
                        value={amount || item?.netAmount}
                        currency={item?.walletCode || item?.wallet || userInfo?.currency}
                        style={[commonStyles.primarytext, commonStyles.textRight]}
                        decimalPlaces={item?.isFiatOrCrypto?.toLowerCase() === 'crypto' ? 4 : 2}
                      />
                    )}
                  </ViewComponent>
                </ViewComponent>

                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, typeof amount === 'string' && amount.includes('/') ? commonStyles.mtnagtive4 : null]}>
                  <FormattedDateText
                    value={item?.transactionDate || item?.date}
                    style={[commonStyles.secondarytext, commonStyles.flex1]}
                    conversionType="UTC-to-local"
                  />
                  <ParagraphComponent
                    text={state}
                    style={[
                      commonStyles.fs12,
                      commonStyles.fw400,
                      commonStyles.textRight,
                      { color: statusColor[state?.toLowerCase()] || NEW_COLOR.TEXT_GREEN },
                    ]}
                  />
                </ViewComponent>
              </ViewComponent>
            </ViewComponent>
          </ViewComponent>
        </CommonTouchableOpacity>
      );
    },
    [NEW_COLOR.TEXT_GREEN, commonStyles, handleDetails, getTransactionIcon, statusColor, userInfo?.currency, isCustodial]
  );

  const keyExtractor = useCallback((item: any, index: number) =>
    String(item?.id || item?.transactionId || index), []
  );

  const ItemSeparator = useCallback(() =>
    <ViewComponent style={[commonStyles.transactionsListGap]} />, [commonStyles.transactionsListGap]
  );

  return (
    <ViewComponent>
      <ViewComponent>
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
          <ParagraphComponent text={'GLOBAL_CONSTANTS.TRANSACTIONS'} style={[commonStyles.sectionTitle]} />
          {recentData && recentData?.length > 0 && (
            <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={handleSeeAll}>
              <ParagraphComponent text={'GLOBAL_CONSTANTS.SEE_ALL'} style={[commonStyles.sectionLink]} />
            </CommonTouchableOpacity>
          )}
        </ViewComponent>

        {dataLoading && <Loadding contenthtml={transactionCardContent} />}

        {!dataLoading && recentData?.length > 0 && (
          <ViewComponent style={[commonStyles.rounded5]}>
            <FlatListComponent
              data={recentData}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              scrollEnabled={false}
              removeClippedSubviews={true}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={7}
              ItemSeparatorComponent={ItemSeparator}
            />
          </ViewComponent>
        )}

        {!dataLoading && (!recentData || recentData?.length < 1) && !props.dashboardLoading && (
          <ViewComponent>
            <NoDataComponent Description={'GLOBAL_CONSTANTS.NO_DATA_AVAILABLE'} />
          </ViewComponent>
        )}
      </ViewComponent>

      {modalVisible && (
        <TransactionDetails
          modalVisible={modalVisible}
          transactionId={transactionId}
          closePopUp={() => setModalVisible(false)}
        />
      )}
    </ViewComponent>
  );
};

export default React.memo(RecentTransactions);