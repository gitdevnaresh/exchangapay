import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import moment from 'moment';
import { s } from '../../../constants/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TransactionFilterHeaderProps {
  filterState: {
    selectedTransactionType: string;
    selectedCurrency: string;
    selectedDateRange: { start: Date | null; end: Date | null };
  };
  filterOptions: {
    transactionTypeOptions: any[];
    currencyOptions: any[];
  };
  filterLoading: {
    currencyLoading: boolean;
    transactionTypeLoading: boolean;
  };
  onOpenTransactionTypeSheet: () => void;
  onOpenCurrencySheet: () => void;
  onOpenDateSheet: () => void;
  onClearTransactionType: () => void;
  onClearCurrency: () => void;
  onClearDate: () => void;
  screenName?: string;
}

const TransactionFilterHeader: React.FC<TransactionFilterHeaderProps> = ({
  filterState,
  filterOptions,
  filterLoading,
  onOpenTransactionTypeSheet,
  onOpenCurrencySheet,
  onOpenDateSheet,
  onClearTransactionType,
  onClearCurrency,
  onClearDate,
  screenName
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      <ViewComponent style={[commonStyles.dflex, commonStyles.mb32, commonStyles.gap16]}>
        {/* Transaction Type Filter */}
        <CommonTouchableOpacity
          style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.textCenter, commonStyles.gap8, commonStyles.justifyCenter,
          {
            backgroundColor: filterState.selectedTransactionType !== 'All' ? NEW_COLOR.BG_YELLOW : NEW_COLOR.BANNER_BG,
            borderRadius: s(32), paddingHorizontal: s(16), minWidth: s(110), height: s(40),
          }]}
          activeOpacity={0.8}
          onPress={onOpenTransactionTypeSheet}
        >
          <ParagraphComponent
            text={filterLoading.transactionTypeLoading ? 'Loading...' : (filterOptions.transactionTypeOptions.find((opt: any) => opt.value === filterState.selectedTransactionType)?.label || 'All')}
            style={[commonStyles.fw400, commonStyles.textAlwaysBlack, commonStyles.fs12, { color: filterState.selectedTransactionType !== 'All' ? NEW_COLOR.TEXT_ALWAYS_BLACK : NEW_COLOR.TEXT_WHITE }]} />
          {filterState.selectedTransactionType !== 'All' && (
            <CommonTouchableOpacity onPress={onClearTransactionType} style={[commonStyles.p6]}>
              <Ionicons name="close" size={20} color={NEW_COLOR.textAlwaysBlack} />
            </CommonTouchableOpacity>
          )}
        </CommonTouchableOpacity>



        <CommonTouchableOpacity
          style={[
            commonStyles.dflex,
            commonStyles.alignCenter,
            commonStyles.textCenter,
            commonStyles.gap8,
            commonStyles.justifyCenter,
            {
              backgroundColor:
                filterState.selectedCurrency !== 'All'
                  ? NEW_COLOR.BG_YELLOW
                  : NEW_COLOR.BANNER_BG,
              borderRadius: s(32),
              paddingHorizontal: s(16),
              minWidth: s(110),
              height: s(40)
            }
          ]}
          activeOpacity={0.8}
          onPress={onOpenCurrencySheet}
        >
          <ParagraphComponent
            text={
              screenName === 'MyCards'
                ? (filterState.selectedCurrency !== 'All'
                  ? `**** ${filterOptions.currencyOptions.find(
                    (opt: any) => opt.value === filterState.selectedCurrency
                  )?.label?.slice(-4) || ''
                  }`
                  : 'All Cards'
                )
                : filterLoading.currencyLoading
                  ? 'Loading...'
                  : (
                    filterOptions.currencyOptions.find(
                      (opt: any) => opt.value === filterState.selectedCurrency
                    )?.label || 'All currencies'
                  )
            }
            style={[
              commonStyles.fw400,
              commonStyles.textAlwaysBlack,
              commonStyles.fs12,
              {
                color:
                  filterState.selectedCurrency !== 'All'
                    ? NEW_COLOR.TEXT_ALWAYS_BLACK
                    : NEW_COLOR.TEXT_WHITE
              }
            ]}
          />

          {filterState.selectedCurrency !== 'All' && (
            <CommonTouchableOpacity onPress={onClearCurrency} style={[commonStyles.p6]}>
              <Ionicons name="close" size={20} color={NEW_COLOR.textAlwaysBlack} />
            </CommonTouchableOpacity>
          )}
        </CommonTouchableOpacity>


        {/* Date Filter */}
        <CommonTouchableOpacity onPress={onOpenDateSheet}
          style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.textCenter, commonStyles.gap8, commonStyles.justifyCenter,
          { backgroundColor: filterState.selectedDateRange.start && filterState.selectedDateRange.end ? NEW_COLOR.BG_YELLOW : NEW_COLOR.BANNER_BG, borderRadius: s(32), paddingHorizontal: s(16), height: s(40), minWidth: s(110) }]}
          activeOpacity={0.8}>
          <ParagraphComponent text={filterState.selectedDateRange.start && filterState.selectedDateRange.end ? `${moment(filterState.selectedDateRange.start).format('DD MMM YYYY')} - ${moment(filterState.selectedDateRange.end).format('DD MMM YYYY')}` : 'Date'}
            style={[commonStyles.fw400, commonStyles.fs12, { color: filterState.selectedDateRange.start && filterState.selectedDateRange.end ? NEW_COLOR.TEXT_ALWAYS_BLACK : NEW_COLOR.TEXT_WHITE }]} />
          {filterState.selectedDateRange.start && filterState.selectedDateRange.end && (
            <CommonTouchableOpacity onPress={onClearDate} style={[commonStyles.p6]}>
              <Ionicons name="close" size={20} color={NEW_COLOR.textAlwaysBlack} />
            </CommonTouchableOpacity>
          )}
        </CommonTouchableOpacity>
      </ViewComponent>
    </ScrollView>
  );
};

export default TransactionFilterHeader; 