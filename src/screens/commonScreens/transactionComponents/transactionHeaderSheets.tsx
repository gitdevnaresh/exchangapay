import React, { useState } from 'react';
import { s } from '../../../newComponents/theme/scale';
import ViewComponent from '../../../newComponents/view/view';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import { useThemeColors } from '../../../hooks/useThemeColors';
import DateRangeWheelPicker from '../../../newComponents/datePickers/DateRangeWheelPicker';
import ButtonComponent from '../../../newComponents/buttons/button';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { MaterialIcons } from '@expo/vector-icons';
import NoDataComponent from '../../../newComponents/noData/noData';
import { NEW_COLOR } from '../../../constants/theme/variables';


interface TransactionFilterSheetsProps {
  filterState: {
    selectedTransactionType: string;
    selectedCurrency: string;
    selectedDateRange: { start: Date | null; end: Date | null };
  };
  filterOptions: {
    transactionTypeOptions: any[];
    currencyOptions: any[];
    dateQuickSelectOptions: any[];
  };
  transactionTypeSheetRef: React.RefObject<any>;
  transactionTypeOptions:any;
  dateSheetRef: React.RefObject<any>;
  onSelectTransactionType: (value: string) => void;
  setFilterState: React.Dispatch<React.SetStateAction<{
    selectedTransactionType: string;
    selectedCurrency: string;
    selectedDateRange: { start: Date | null; end: Date | null };
  }>>;
}

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};


const TransactionFilterSheets: React.FC<TransactionFilterSheetsProps> = ({
  filterState,
  filterOptions,
  transactionTypeSheetRef,
  dateSheetRef,
  onSelectTransactionType,
  setFilterState,
  transactionTypeOptions,
}) => {
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const [localDateRange, setLocalDateRange] = React.useState({
    start: filterState.selectedDateRange.start,
    end: filterState.selectedDateRange.end,
  });
  const [isConfirmButtonHide, setIsConfirmButtonHide] = useState<boolean>(true);

  // This function handles the press of a quick select button (e.g., "7 Days")
  const handleQuickSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    setLocalDateRange({ start: startDate, end: endDate });
  };

  // This function determines which quick select button should be highlighted
  const getActiveQuickOption = () => {
    const { start, end } = localDateRange;
    if (!start || !end) return null;

    // A preset is only "active" if its end date is today.
    if (!isSameDay(end, new Date())) {
      return null;
    }

    for (const option of filterOptions.dateQuickSelectOptions) {
      const prospectiveStart = new Date();
      prospectiveStart.setDate(new Date().getDate() - (option.days - 1));
      if (isSameDay(start, prospectiveStart)) {
        return option.days;
      }
    }
    return null;
  };

  const handleChangeStart = (date: Date | null) => setLocalDateRange(prev => ({ ...prev, start: date }));
  const handleChangeEnd = (date: Date | null) => setLocalDateRange(prev => ({ ...prev, end: date }));

  React.useEffect(() => {
    setLocalDateRange({ ...filterState.selectedDateRange });
  }, [filterState.selectedDateRange]);

  const handleConfirm = () => {
    setFilterState(prev => ({
      ...prev,
      selectedDateRange: { ...localDateRange }
    }));
    setIsConfirmButtonHide(true);
    dateSheetRef.current?.close();
  };

  const handleReset = () => {
    setLocalDateRange({ start: null, end: null });
    setIsConfirmButtonHide(false);
  }
  return (
    <>
      {/* Transaction Type Or Card Type Bottom Sheet */}
      <PopupOrSheet
        showCloseIcon={true}
        ref={transactionTypeSheetRef}
        title={"GLOBAL_CONSTANTS.CHOOSE_TYPE"}
        titleStyle={[reversCommonStyles.fw700, reversCommonStyles.fs16]}
        height={s(435)}
      >
        <ViewComponent>
          <FlatListComponent
            data={Array.isArray(transactionTypeOptions) ? transactionTypeOptions : []}
            scrollEnabled={true}
            ListEmptyComponent={<NoDataComponent isPopup={true} />}
            keyExtractor={(item: any, index: number) => `${item.name || item.value}-${index}`}
            renderItem={({ item }) => {
              const isSelected = filterState.selectedTransactionType === item?.name || 
                                (filterState.selectedTransactionType === 'All' && item?.name === 'All');
              return (
                  <CommonTouchableOpacity
                    style={[
                      reversCommonStyles.dflex,
                      reversCommonStyles.alignCenter,
                      reversCommonStyles.justifyContent,
                      reversCommonStyles.p12,
                      isSelected && reversCommonStyles.bgBlack,
                      reversCommonStyles.rounded12,
                      reversCommonStyles.mb12
                    ]}
                    onPress={() => onSelectTransactionType(item?.name)}
                  >
                    <ParagraphComponent
                      text={item.name}
                      style={[reversCommonStyles.fs14, reversCommonStyles.fw400, reversCommonStyles.textWhite]}
                    />
                    <ViewComponent
                      style={[
                        reversCommonStyles.justifyCenter,
                        reversCommonStyles.alignCenter,
                        {
                          height: s(24),
                          width: s(24),
                          borderRadius: s(14),
                          backgroundColor: isSelected ? NEW_COLOR.BG_YELLOW : 'transparent',
                          borderWidth: isSelected ? 0 : s(2),
                        }
                      ]}
                    >
                      {isSelected && (<MaterialIcons name="check" size={s(16)} color={NEW_COLOR.TEXT_BLACK} />)}
                    </ViewComponent>
                  </CommonTouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </ViewComponent>
      </PopupOrSheet>

     
      {/* Date Bottom Sheet */}
      <PopupOrSheet
        ref={dateSheetRef}
        title="GLOBAL_CONSTANTS.DATE"
        height={s(550)}
        onOpen={() => setLocalDateRange({ ...filterState.selectedDateRange })}
      >
        <FlatListComponent
          data={filterOptions.dateQuickSelectOptions}
          keyExtractor={item => item.label}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <ViewComponent style={{ width: s(8) }} />}
          renderItem={({ item }) => {
            const isSelected = getActiveQuickOption() === item.days;
            return (
              <CommonTouchableOpacity
                onPress={() => handleQuickSelect(item.days)}
                style={[
                  reversCommonStyles.dflex,
                  reversCommonStyles.alignCenter,
                  reversCommonStyles.textCenter,
                  reversCommonStyles.gap8,
                  reversCommonStyles.justifyCenter,
                  {
                    backgroundColor: isSelected ? REVERSE_NEW_COLOR.BG_YELLOW : REVERSE_NEW_COLOR.BANNER_BG,
                    borderRadius: s(32),
                    paddingHorizontal: s(16),
                    height: s(37),
                    minWidth: s(80),
                    borderWidth: 1,
                    borderColor: isSelected ? REVERSE_NEW_COLOR.BG_YELLOW : NEW_COLOR.TEXT_GREY,
                  },
                ]}
              >
                <ParagraphComponent
                  text={item.label}
                  style={[
                    reversCommonStyles.fs12,
                    { color: isSelected ? REVERSE_NEW_COLOR.TEXT_ALWAYS_BLACK : REVERSE_NEW_COLOR.TEXT_WHITE },
                  ]}
                />
              </CommonTouchableOpacity>
            );
          }}
        />

        <DateRangeWheelPicker
          startDate={localDateRange.start}
          endDate={localDateRange.end}
          onChangeStart={handleChangeStart}
          onChangeEnd={handleChangeEnd}
          onConfirm={handleConfirm}
          onReset={handleReset}
        />

        <ViewComponent style={[reversCommonStyles.dflex, reversCommonStyles.justifyContent, reversCommonStyles.mt16, reversCommonStyles.gap16]} >
          <ViewComponent style={reversCommonStyles.flex1}>
            <ButtonComponent title={"GLOBAL_CONSTANTS.RESET"} onPress={handleReset} solidBackground={true} />
          </ViewComponent>
          <ViewComponent style={reversCommonStyles.flex1}>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONFIRM"}
              onPress={handleConfirm}
              disable={isConfirmButtonHide === false ? isConfirmButtonHide : (!localDateRange.start || !localDateRange.end || (localDateRange.start && localDateRange.end && localDateRange.end < localDateRange.start))}
            />
          </ViewComponent>
        </ViewComponent>
      </PopupOrSheet>
    </>
  );
};

export default TransactionFilterSheets;