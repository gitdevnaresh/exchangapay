import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { ms } from '../../constants/styels/scale';
import { CoinImages, getThemedCommonStyles } from '../CommonStyles';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import ImageUri from '../imageComponents/image';
import ViewComponent from '../view/view';
import { s } from '../../constants/styels/scale';
import { CurrencyText } from '../textComponets/currencyText/currencyText';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import SearchComponent from '../searchComponents/searchComponent';
import NoDataComponent from '../noData/noData';
interface PickerItem {
  id?: string | number;
  name?: string;
  code?: string;
  [key: string]: any; // Allows for other properties
}

interface DisplayPickerItem extends PickerItem {
  displayName: string;
}

interface PickerProps {
  changeModalVisible: (visible: boolean) => void;
  data: PickerItem[];
  setData: (item: PickerItem) => void;
  customBind: Array<string>;
  selectedValue?: PickerItem | string | null | undefined; // To track the selected item
  showCountryImages?: boolean; // New flag
  isIconsDisplay?: boolean;
  isOnlycountry?: boolean;
  showBalance?: boolean; // New flag to control balance display
}

const Picker = ({ changeModalVisible, data = [], setData, customBind, selectedValue, isIconsDisplay = false, showCountryImages = false, isOnlycountry, showBalance = false }: PickerProps) => {
  const [countryList, setCountryList] = useState<DisplayPickerItem[]>([]);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);

  useEffect(() => {
    const listData = data.map((item: PickerItem) => ({ ...item, displayName: (customBind ? customBind.map((property) => (item[property] ?? property)).join("") : item.name) ?? '' }))
    setCountryList([...listData]);
  }, [data, customBind]);

  const onPressItem = (option: DisplayPickerItem) => {
    changeModalVisible(false);
    const { displayName, ...itemToSet } = option;

    setData(option);
  };
  // const handleChangeSearch = (searchText: string) => {
  //   if (searchText) {
  //     const filterData = data.filter((item: PickerItem) => {
  //       return item.name?.toLowerCase().includes(searchText.toLowerCase())
  //     })
  //     const listData = filterData.map((item: PickerItem) => ({ ...item, displayName: (customBind ? customBind.map((property) => (item[property] ?? property)).join("") : item.name) ?? '' }))
  //     setCountryList([...listData]);
  //   } else {
  //     const fullListData = data.map((item: PickerItem) => ({ ...item, displayName: (customBind ? customBind.map((property) => (item[property] ?? property)).join("") : item.name) ?? '' }));
  //     setCountryList([...fullListData]);
  //   }
  // };


  const handleSearchResult = (result: any[]) => {
    const listData = result?.map((item: PickerItem) => ({
      ...item,
      displayName: (customBind ? customBind?.map((property) => (item[property] ?? property)).join("") : item.name) ?? ''
    }));
    setCountryList([...listData]);
  };

  const renderItem = ({ item, index }: { item: DisplayPickerItem; index: number }) => (
    <React.Fragment key={item.id ?? item.name?.toString() ?? item.code ?? `picker-item-${index?.toString()}`}>
      <TouchableOpacity onPress={() => onPressItem(item)} activeOpacity={0.8}>
        <View style={[
          commonStyles.dflex,
          commonStyles.alignCenter,
          commonStyles.justifyContent,
          commonStyles.px10,

          (typeof selectedValue === 'object' && selectedValue?.id === item.id && selectedValue?.name === item.name) && commonStyles.activeItemBg

        ]}>

          <ViewComponent style={[commonStyles.gap16, commonStyles.dflex, commonStyles.alignCenter]}>
            {(item.image && isIconsDisplay) && <ViewComponent style={{ width: s(30), height: s(30) }}><ImageUri uri={CoinImages[item?.name?.toLowerCase()]} style={{ borderRadius: s(24) }} /></ViewComponent>}
            {(item.image && showCountryImages) && <ImageUri uri={item?.image} style={{ width: s(26), height: s(26) }} />

            }
            {!item.image && isOnlycountry && <View style={[commonStyles.bottomsheetroundediconbg, (typeof selectedValue === 'object' && selectedValue?.id === item.id && selectedValue?.name === item.name) && commonStyles.bottomsheetroundedactiveiconbg]}>
              <ParagraphComponent style={[commonStyles.twolettertext, (typeof selectedValue === 'object' && selectedValue?.id === item.id && selectedValue?.name === item.name) && commonStyles.twoActivelettertext]} text={item.name?.slice(0, 2)?.toUpperCase()} />
            </View>}

            <ParagraphComponent
              text={item?.displayName ?? item?.name}
              style={[commonStyles.bottomsheetprimarytext, (typeof selectedValue === 'object' && selectedValue?.id === item.id && selectedValue?.name === item.name) && commonStyles.bottomsheetactiveprimaryText,]}
            />
            {showBalance && item?.balance !== undefined && (
              <CurrencyText
                value={item.balance || 0}
                decimalPlaces={4}
                style={[commonStyles.listprimarytext]}
              />
            )}
            {/* {(typeof selectedValue === 'object' && selectedValue?.id === item.id && selectedValue?.name === item.name) && (
              <Feather name="check" size={ms(18)} color={NEW_COLOR.TEXT_GREEN} />
            )} */}
          </ViewComponent>

        </View>
      </TouchableOpacity>
      {index !== countryList.length - 1 && <View style={[commonStyles.listGap]} />}
    </React.Fragment>
  );

  return (
    <View style={[styles.modal, { flex: 1 }]}>
      <View >
        <SearchComponent
          data={data || []}
          customBind={["name", "code", "mobileCode"]}
          onSearchResult={handleSearchResult}
          placeholder="GLOBAL_CONSTANTS.SEARCH"
        />
      </View>
      <FlatList
        data={countryList}
        renderItem={renderItem}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: (typeof selectedValue === 'object' && selectedValue?.id === countryList[countryList.length - 1]?.id) ? ms(30) : 0
        }}
        keyExtractor={(item, index) => item.id ?? item.name ?? item.code ?? `picker-item-${index}`}
        ListEmptyComponent={
          <View style={[commonStyles.mt24]}>
            <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
          </View>
        }
      />
    </View>
  );
};
export { Picker };

const screenStyles = (NEW_COLOR: Record<string, string>) => StyleSheet.create({
  searchIcon: {
    width: ms(22),
    height: ms(22), position: 'absolute', right: 18, top: 14
  },
  modal: {
    paddingVertical: 0,
    borderRadius: 0,
  },
  coinStyle: {
    height: s(34), width: s(34),
    borderRadius: s(32) / 2,
    backgroundColor: NEW_COLOR.QUICK_LINKS,
  },
});
