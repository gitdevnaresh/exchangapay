import React, { useState, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import ViewComponent from '../view/view';
import FlatListComponent from '../flatList/flatList';
import NoDataComponent from '../noData/noData';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import TextMultiLangauge from '../textComponets/multiLanguageText/textMultiLangauge';
import SwokipayDashboardLoader from '../swokipayloader';
import ImageUri from '../imageComponents/image';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { WithDrawServices } from '../../apiServices/withdrawApis/withdrawServices';
import { isErrorDispaly } from '../../utils/helpers';
import { s } from '../theme/scale';

export interface Currency {
  id: string;
  name: string;
  logo: string;
  walletCode: string;
  code: string;
  balance?: number;
}

interface CurrencySelectionComponentProps {
  onCurrencySelect: (currency: Currency) => void;
  fetchService?: () => Promise<any>;
  ErrorMessage?: (error: string) => void;

}

const CurrencySelectionComponent: React.FC<CurrencySelectionComponentProps> = ({
  onCurrencySelect,
  fetchService,
 ErrorMessage
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const [loading, setLoading] = useState<boolean>(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);


  useEffect(() => {
    fetchCurrencies();
  }, []);



  const fetchCurrencies = async () => {
    ErrorMessage?.("");
    setLoading(true);
    try {
      const service = fetchService || WithDrawServices.getWalletCurrencies;
      const response: any = await service();
      if (response.status === 200) {
        setCurrencies(response.data);
      } else {
        const errorMsg = isErrorDispaly(response);
      ErrorMessage?.(errorMsg);
        setCurrencies([]);
      }
    } catch (error) {
      const errorMsg = isErrorDispaly(error);
      ErrorMessage?.(errorMsg);
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCurrency = (currency: Currency) => {
    onCurrencySelect(currency);
  };

  const renderCurrencyItem = ({ item }: { item: Currency }): JSX.Element => {
    return (
      <CommonTouchableOpacity 
        style={[commonStyles.list]}
        onPress={() => handleSelectCurrency(item)}
        activeOpacity={0.8}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
          <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
            <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
          </ViewComponent>
          <ViewComponent>
            <TextMultiLangauge 
              text={item.walletCode} 
              style={[commonStyles.fw400, commonStyles.fs14, commonStyles.list_text, commonStyles.mb4]} 
            />
            <TextMultiLangauge 
              text={item.name || item.walletCode} 
              style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} 
            />
          </ViewComponent>
        </ViewComponent>
        <ViewComponent>
              <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
        </ViewComponent>
      </CommonTouchableOpacity>
    );
  };

  const ListEmptyComponent = () => <NoDataComponent />;

  if (loading) {
    return <SwokipayDashboardLoader />;
  }

  return (
    <ViewComponent>
      <FlatListComponent
        data={currencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item?.id?.toString()}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <ViewComponent style={commonStyles.mb10} />}
      />
    </ViewComponent>
  );
};

export default CurrencySelectionComponent;