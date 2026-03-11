import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { ms } from '../../../constants/theme/scale';
import { TextInput } from 'react-native-gesture-handler';
import AntDesign from "@expo/vector-icons/AntDesign";
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ImageUri from '../../imageComponents/image';
import ViewComponent from '../../view/view';
import { s } from '../../theme/scale';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import NoDataComponent from '../../noData/noData';
import { MaterialIcons } from '@expo/vector-icons';

interface PickerItem {
  id?: string | number;
  name?: string;
  code?: string;
  [key: string]: any;
}

interface DisplayPickerItem extends PickerItem {
  displayName: string;
}

interface PickerProps {
  changeModalVisible: (visible: boolean) => void;
  data: PickerItem[];
  setData: (item: PickerItem) => void;
  customBind: Array<string>;
  selectedValue?: PickerItem | string | null | undefined;
  showCountryImages?: boolean;
  isIconsDisplay?: boolean;
  searchPlaceholder?: string;
}

const Picker = ({
  changeModalVisible,
  data = [],
  setData,
  searchPlaceholder,
  customBind,
  selectedValue,
  isIconsDisplay = false,
  showCountryImages = false
}: PickerProps) => {
  const [countryList, setCountryList] = useState<DisplayPickerItem[]>([]);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

  useEffect(() => {
    const listData = data.map((item: PickerItem) => ({
      ...item,
      displayName: (customBind ? customBind.map((property) => (item[property] ?? property)).join("") : item.name) ?? ''
    }));
    setCountryList(listData);
  }, [data, customBind]);

  const onPressItem = (option: DisplayPickerItem) => {
    changeModalVisible(false);
    setData(option);
  };

  const handleChangeSearch = (searchText: string) => {
    const trimmedText = searchText.trim().toLowerCase();
    if (trimmedText) {
      const filterData = data.filter((item: PickerItem) => {
        const name = item.name?.toLowerCase() || "";
        const code = item.code?.toLowerCase() || "";
        const mobileCode = item.mobileCode?.toLowerCase() || "";

        return (
          name.includes(trimmedText) ||
          code.includes(trimmedText) ||
          mobileCode.includes(trimmedText)
        );
      });

      const listData = filterData.map((item) => ({
        ...item,
        displayName: customBind
          ? customBind.map((prop) => item[prop] ?? prop).join("")
          : item.name ?? "",
      }));
      setCountryList(listData);
    } else {
      const fullListData = data.map((item) => ({
        ...item,
        displayName: customBind
          ? customBind.map((prop) => item[prop] ?? prop).join("")
          : item.name ?? "",
      }));
      setCountryList(fullListData);
    }
  };
  const isSelected = (item: DisplayPickerItem) => {
    if (typeof selectedValue === 'string') {
      return selectedValue === item.code || selectedValue === item.mobileCode || selectedValue === item.id;
    }
    if (typeof selectedValue === 'object' && selectedValue !== null) {
      if (selectedValue?.code && item.code) {
        return selectedValue.code === item.code;
      }
      if (selectedValue?.mobileCode && item.mobileCode) {
        return selectedValue.mobileCode === item.mobileCode;
      }
      if (selectedValue?.id && item.id) {
        return selectedValue.id === item.id;
      }
      if (selectedValue?.name && item.name) {
        return selectedValue.name === item.name;
      }
    }
    return false;
  };

  const renderItem = ({ item, index }: { item: DisplayPickerItem; index: number }) => {
    const selected = isSelected(item);
    
    return (
      <React.Fragment>
        <TouchableOpacity onPress={() => onPressItem(item)} activeOpacity={0.8}>
          <View style={[
            reversCommonStyles.dflex,
            reversCommonStyles.alignCenter,
            reversCommonStyles.justifyContent,
            reversCommonStyles.rounded5,
            selected && reversCommonStyles.bgBlack,
            reversCommonStyles.p10
          ]}>
            <ViewComponent style={[reversCommonStyles.gap8, reversCommonStyles.dflex, reversCommonStyles.alignCenter]}>
              {(item.image && isIconsDisplay) &&
                <ViewComponent style={{ width: s(26), height: s(26) }}>
                  <ImageUri uri={item.image} />
                </ViewComponent>
              }
              {((item.image || item?.flag) && showCountryImages) &&
                <ImageUri uri={item?.image || item?.flag} style={{ width: s(26), height: s(26), borderRadius: 100 / 2 }} />
              }
              <ParagraphComponent
                text={item?.displayName ?? item?.name}
                style={[reversCommonStyles.fs14, reversCommonStyles.fw500, reversCommonStyles.textWhite, reversCommonStyles.flex1]}
              />
              {selected && (
                <ViewComponent style={[commonStyles.radioDot, commonStyles.dflex]}>
                       <MaterialIcons name="check" size={s(16)} color={'black'} />
                </ViewComponent>)}
            </ViewComponent>
          </View>
        </TouchableOpacity>
        {index !== countryList.length - 1 && <View style={[reversCommonStyles.rbsheetList]} />}
      </React.Fragment>
    );
  };

  const SearchBoxComponent = (
    <View style={reversCommonStyles.sectionGap}>
      <View style={commonStyles.searchContainer}>
        <TextInput
          style={[reversCommonStyles.searchInput, reversCommonStyles.fs16, reversCommonStyles.fw400]}
          onChangeText={handleChangeSearch}
          placeholder={t(searchPlaceholder || "GLOBAL_CONSTANTS.SEARCH")}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
        />
        <AntDesign name="search1" color={NEW_COLOR.TEXT_WHITE} size={ms(22)} style={styles.searchIcon} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.modal, { flex: 1 }]}>
        {SearchBoxComponent}
        {countryList?.length > 0 ? (
          <FlatList
            data={countryList}
            keyExtractor={(item, index) => String(item.id ?? item.name ?? item.code ?? `picker-item-${index}`)}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: s(100) }}
          />
        ) : (
          <View style={[reversCommonStyles.mt24]}>
            <NoDataComponent isPopup={true} Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export { Picker };

const screenStyles = (NEW_COLOR: Record<string, string>) => StyleSheet.create({
  searchIcon: {
    width: ms(22),
    height: ms(22),
    position: 'absolute',
    right: 12,
    top: 12
  },
  modal: {
    paddingVertical: 0,
    borderRadius: 0,
  },
});
