import React, { useState, useEffect } from 'react';
import { TextInput, View, StyleProp, ViewStyle } from 'react-native'; // Import StyleProp and ViewStyle
import AntDesign from '@expo/vector-icons/AntDesign';
import { ms } from '../theme/scale';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

// Define a base type for items that can be searched.
interface SearchableItem {
  name?: string;
  [key: string]: any;
}

interface SearchBoxProps<T extends SearchableItem> {
  data: T[];
  customBind?: string;
  onSearchResult: (result: T[]) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>; // FIX: Add style prop
  placeholderTextColor?: string;
  inputColor?: StyleProp<ViewStyle>;
  isSearchIconShow?: boolean;
}

const LiveSearchComponent = <T extends SearchableItem>({
  data,
  customBind,
  onSearchResult,
  placeholder = "GLOBAL_CONSTANTS.SEARCH",
  style, // FIX: Destructure style prop
  placeholderTextColor,
  inputColor,
  isSearchIconShow=false
}: SearchBoxProps<T>) => {
  const [searchText, setSearchText] = useState<string>('');
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

  useEffect(() => {
    const value = searchText.trim().toLowerCase();
    if (value.length > 0) {
      const filteredData = data.filter((item) => {
        if (customBind && item[customBind] != null) {
          return String(item[customBind]).toLowerCase().includes(value);
        } else {
          return item.name?.toLowerCase().includes(value);
        }
      });
      onSearchResult(filteredData);
    } else {
      onSearchResult(data);
    }
  }, [searchText, data, customBind, onSearchResult]);

  return (
    // FIX: Apply the custom style alongside the default styles
    <View style={[commonStyles.sectionGap]}>
      <View style={[commonStyles.searchContainer,style]}>
        <TextInput
          style={[
            commonStyles.fs16,
            commonStyles.fw400,
            reversCommonStyles.textWhite,
            commonStyles.flex1,
            inputColor
          ]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t(placeholder)}
          placeholderTextColor={placeholderTextColor||NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          returnKeyType="search"
        />
      { isSearchIconShow&& <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />}
      </View>
    </View>
  );
};

export default LiveSearchComponent;