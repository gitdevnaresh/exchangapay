import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import ViewComponent from '../../../newComponents/view/view';
import FlatListComponent from '../../../newComponents/flatList/flatList';
import NoDataComponent from '../../../newComponents/noData/noData';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../newComponents/textComponets/paragraphText/paragraph';
import TextMultiLangauge from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import ImageUri from '../../../newComponents/imageComponents/image';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { WithDrawServices } from '../../../apiServices/withdrawApis/withdrawServices';
import { isErrorDispaly } from '../../../utils/helpers';
import { s } from '../../../newComponents/theme/scale';

export interface Network {
  id: string;
  code: string;
  coinNetWork: string;
  logo?: string;
  minLimit: number;
}

interface NetworkSelectionComponentProps {
  coinData: any;
  onNetworkSelect: (network: Network) => void;
  errorMessage?: (error: string) => void;
}

const NetworkSelectionComponent: React.FC<NetworkSelectionComponentProps> = ({
  coinData,
  onNetworkSelect,
  errorMessage

}) => {
  const isFocused = useIsFocused();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  const [loading, setLoading] = useState(true);
  const [networks, setNetworks] = useState<Network[]>([]);

  useEffect(() => {
    if (coinData?.walletCode && isFocused) {
      fetchNetworks();
    }
  }, [coinData?.walletCode, isFocused]);



  const fetchNetworks = async () => {
    errorMessage?.("");
    setLoading(true);
    try {
      const response: any = await WithDrawServices.getWalletNetwork(coinData?.walletCode);
      if (response.status === 200) {
        setNetworks(response.data);
      } else {
        errorMessage?.(isErrorDispaly(response));
        setNetworks([]);
      }
    } catch (error) {
      errorMessage?.(isErrorDispaly(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNetwork = (network: Network) => {
    onNetworkSelect(network);
  };

  const renderNetworkItem = ({ item }: { item: Network }) => {
    return (
      <CommonTouchableOpacity 
        style={[commonStyles.list]}
        onPress={() => handleSelectNetwork(item)}
        activeOpacity={0.8}
      >
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
          <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
            <ImageUri uri={item?.logo} height={s(24)} width={s(24)} />
          </ViewComponent>
          <ViewComponent>
            <TextMultiLangauge 
              text={`${item?.coinNetWork} (${item.code})`} 
              style={[commonStyles.fw400, commonStyles.fs14, commonStyles.list_text, commonStyles.mb4]} 
            />
            <ParagraphComponent 
              text={`${t("GLOBAL_CONSTANTS.MINIMUM_WITHDRAW_AMOUNT")}: ${item.minLimit} ${coinData?.walletCode || ""}`} 
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
    <FlatListComponent
      data={networks}
      renderItem={renderNetworkItem}
      keyExtractor={(item, index) => item?.id ? `${item.id}-${index}` : `network-${index}`}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <ViewComponent style={commonStyles.menuitemspace} />}
    />
  );
};

export default NetworkSelectionComponent;