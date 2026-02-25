import React, { useRef, useEffect, useMemo } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { s } from '../../constants/styels/scale';
import { CoinImages, getThemedCommonStyles } from '../CommonStyles';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import ViewComponent from '../view/view';
import ImageUri from '../imageComponents/image';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { CurrencyText } from '../textComponets/currencyText/currencyText';

type Currency = {
  id: string;
  name: string;
  code: string;
  logo: string;
  amount?: number;
  networkDetails: {
    network: string; // Changed from code to network, assuming this is the network identifier
    name?: string;    // Optional display name for the network within this currency's details
    [key: string]: any;
  }[];
};

type Network = {
  id: string;
  name: string;
  network: string;
  code: string;
};

type Props = {
  currencyData: Currency[];
  networkData: Network[];
  selectedCurrency: string;
  selectedNetwork: string;
  onSelect: (currencyCode: string) => void;
};

const CurrencyNetworkSelector: React.FC<Props> = ({
  currencyData,
  networkData,
  selectedCurrency,
  selectedNetwork,
  onSelect
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const flatListRef = useRef<FlatList>(null);

  const combinedData = useMemo(() => {
    return currencyData.flatMap((currency) => {
      // const details = Array.isArray(currency.networkDetails) ? currency.networkDetails : [];
      // return details.map((networkDetail) => {
      //   const matchedNetwork = networkData?.find((n) => n.code === networkDetail.network);

      return {
        id: `${currency.code}`,
        currencyCode: currency.code,
        currencyIcon: currency.logo,
        currencyName: currency.name,
        amount: currency?.amount ?? 0,
        // network: networkDetail.network,
        // networkName: matchedNetwork?.name || networkDetail.name || networkDetail.network, // Display name for network
      };
      // });
    });
  }, [currencyData]);
  const selectedIndex = useMemo(() => {
    return combinedData.findIndex(
      item => item.currencyCode === selectedCurrency
    );
  }, [combinedData, selectedCurrency]);
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < combinedData.length && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedIndex, combinedData]);

  useEffect(() => {
    if (combinedData.length > 0 && !selectedCurrency) {
      const firstItem = combinedData[0];
      onSelect(firstItem.currencyCode);
    }
  }, [combinedData, selectedCurrency, onSelect]);


  const renderItem = ({ item }: { item: typeof combinedData[number] }) => {
    const isSelected =
      item.currencyCode === selectedCurrency;

    const gradientColors = isSelected
      ? ['#3354CC ', '#3354CC '] // Colors for selected item's gradient border
      : [NEW_COLOR.INPUT_BORDER, NEW_COLOR.INPUT_BORDER]; // Colors for unselected item's border (using gradient)

    return (
      <TouchableOpacity onPress={() => onSelect(item.currencyCode)}>
        <ViewComponent
          style={[
            commonStyles.sectionBorder,
            commonStyles.rounded5,
            commonStyles.py8,
            { width: s(100), MinHeight: s(90) },
            isSelected && {
              borderWidth: 2,
              borderColor: NEW_COLOR.BUTTON_BG
            },
          ]}
        >
          <ViewComponent style={[commonStyles.mxAuto, { width: s(26), height: s(20) }]}>
            <ImageUri uri={CoinImages[item?.currencyName?.toLowerCase()]} width={s(24)} height={s(24)} />
          </ViewComponent>
          <ParagraphComponent
            text={item.currencyName}
            style={[
              commonStyles.topupcurrencytext
            ]}
          />
          {/* <ParagraphComponent
            text={item.network}
            style={[
              commonStyles.topupcurrencylabeltext
            ]}
          /> */}
          <CurrencyText value={item?.amount || 0} decimalPlaces={4} style={[commonStyles.topupcurrencylabeltext]} />
        </ViewComponent>

      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={combinedData}
      renderItem={renderItem}
      keyExtractor={(item: typeof combinedData[number]) => item.id}
      horizontal
      ItemSeparatorComponent={() => <View style={{ width: s(8) }} />}
      contentContainerStyle={{}}
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={selectedIndex > 0 ? selectedIndex : 0}
      getItemLayout={(data: any, index: number) => ({
        length: s(120), // The width of a single item
        offset: (s(120) + s(25)) * index, // (ItemWidth + SeparatorWidth) * index
        index,
      })}
    />
  );
};

export default CurrencyNetworkSelector;


