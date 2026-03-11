import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { s } from '../../../constants/theme/scale';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import ViewComponent from '../../../newComponents/view/view';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ImageUri from '../../../newComponents/imageComponents/image';
import NoDataComponent from '../../../newComponents/noData/noData';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';

export interface Currency {
  id: string;
  name: string;
  logo: string;
  walletCode: string;
  code: string;
  balance?: number;
  avilable?: number|undefined;
}

interface CurrencyDropdownProps {
  onCurrencySelect: (currency: Currency) => void;
  selectedCurrency?: Currency;
  title?: string;
  currencies?: Currency[];
}

export interface CurrencyDropdownRef {
  open: () => void;
  close: () => void;
}

const CurrencyDropdown = forwardRef<CurrencyDropdownRef, CurrencyDropdownProps>(
  ({ onCurrencySelect, selectedCurrency, title = "GLOBAL_CONSTANTS.SELECT_CURRENCY", currencies }, ref) => {
    const currencySheetRef = useRef<any>(null);
    const NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    useImperativeHandle(ref, () => ({
      open: () => currencySheetRef.current?.open(),
      close: () => currencySheetRef.current?.close(),
    }));

    const handleSelectCurrency = (currency: Currency) => {
      onCurrencySelect(currency);
      currencySheetRef.current?.close();
    };

    const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected =
      selectedCurrency &&
      item.walletCode === selectedCurrency.walletCode &&
      item.walletCode === selectedCurrency.walletCode;
    return (
      <CommonTouchableOpacity
       onPress={() => handleSelectCurrency(item)}
      >
        <ViewComponent
          style={[ commonStyles.dflex, commonStyles.alignCenter,commonStyles.gap16, isSelected && commonStyles.bgBlack,
            commonStyles.p10,commonStyles.rounded10 ]} >
          <ViewComponent
            style={[commonStyles.modalIconbg,commonStyles.dflex, commonStyles.justifyCenter]}>
            <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
          </ViewComponent>
          <ViewComponent style={{ flex: 1 }}>
            <ParagraphComponent
              text={`${item.walletCode}`}
              style={[commonStyles.fs14, commonStyles.fw600,commonStyles.textWhite,
              ]}
            />
          </ViewComponent>
          {isSelected && (
            <ViewComponent
              style={[commonStyles.dflex,commonStyles.alignEnd, commonStyles.justifyend,commonStyles.radioDot,
              ]}
            >
              <MaterialIcons name="check" size={16} color={NEW_COLOR.BgAlwaysBlack}/>
            </ViewComponent>
          )}
        </ViewComponent>
        <ViewComponent style={[commonStyles.listGap]} />
      </CommonTouchableOpacity>
    );
  };


    return (
      <PopupOrSheet
        ref={currencySheetRef}
        title={title}
        height={s(400)}
      >
        <FlatListComponent
          data={currencies || []}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item?.id?.toString()}
          ListEmptyComponent={() => <NoDataComponent isPopup={true} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <ViewComponent style={commonStyles.mb10} />}
        />
      </PopupOrSheet>
    );
  }
);

export default CurrencyDropdown;