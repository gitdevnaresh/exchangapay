import React, { useMemo, useState } from "react";
import CommonTouchableOpacity from '../../../../../components/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../../components/textComponets/paragraphText/paragraph';
import { s } from '../../../../../constants/styels/scale';
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import NoDataComponent from '../../../../../components/noData/noData';
import { FiatAsset } from './interface';
import FlatListComponent from '../../../../../components/flatList/flatList';
import ViewComponent from '../../../../../components/view/view';
import { CoinImages, getThemedCommonStyles } from '../../../../../components/CommonStyles';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import ImageUri from '../../../../../components/imageComponents/image';
import SearchComponent from '../../../../../components/searchComponents/searchComponent';
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";

const EmptyListComponent: React.FC = () => {

  return (
    <ViewComponent style={[]}>
      <NoDataComponent />
    </ViewComponent>
  );
};

interface AssetListComponentProps {
  assets: FiatAsset[];
  selectedItem: FiatAsset | null;
  onItemSelect: (item: FiatAsset) => void;
  onItemPress?: (item: FiatAsset) => void;
  onSearchResult?: (result: any[]) => void;
}

const AssetListComponent: React.FC<AssetListComponentProps> = ({
  assets,
  selectedItem,
  onItemSelect,
  onItemPress,
  onSearchResult
}) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
  const [filteredAssets, setFilteredAssets] = useState(assets);

  const handleSearchResult = (result: any[]) => {
    setFilteredAssets(result);
    if (onSearchResult) {
      onSearchResult(result);
    }
  };

  return (
    <ViewComponent>
      <ViewComponent >
        <SearchComponent
          data={assets || []}
          customBind="code"
          onSearchResult={handleSearchResult}
          placeholder={t("GLOBAL_CONSTANTS.SEARCH")}
        />
      </ViewComponent>
      <FlatListComponent
        data={filteredAssets}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <CommonTouchableOpacity
              onPress={() => {
                onItemSelect(item);
                if (onItemPress) {
                  onItemPress(item);
                }
              }}
              activeOpacity={0.85}
              style={[commonStyles.cardsbannerbg, commonStyles.transactionsListGap]}
            >
              <ViewComponent
                style={[onItemPress ? false : isSelected && commonStyles.tabactivebg, commonStyles.gap16, commonStyles.dflex, commonStyles.justifyContent]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                  <ViewComponent style={{ width: s(30), height: s(30) }}>
                    <ImageUri uri={item?.code?.toLowerCase() === 'usd' ? CoinImages['bankusd'] : CoinImages[item?.code?.toLowerCase()] || ""} />
                  </ViewComponent>
                  <ParagraphComponent text={item?.code || ""} style={[commonStyles.primarytext, commonStyles.assetslistcoin]} />
                </ViewComponent>
                <CurrencyText value={item?.amount || 0} decimalPlaces={2} currency={item?.code} style={[commonStyles.primarytext, commonStyles.assetslistcurrency]} />
              </ViewComponent>
            </CommonTouchableOpacity>
          );
        }}
        ListEmptyComponent={EmptyListComponent}
      />
    </ViewComponent>
  );
};

export default AssetListComponent;