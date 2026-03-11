import React, { useState } from 'react';
import { TextInput } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ViewComponent from '../view/view';
import { ms, s } from '../../constants/styels/scale';
import { getThemedCommonStyles } from '../CommonStyles';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';

// Define a base type for items that can be searched.
// It must have an optional 'name' property for default search
// and an index signature to allow searching on other properties via `customBind`.
interface SearchableItem {
  name?: string;
  [key: string]: any;
}

interface SearchBoxProps<T extends SearchableItem> {
  data: T[];
  customBind?: string | string[];
  onSearchResult: (result: T[]) => void;
  microPhone?: boolean;
  placeholder?: string;
}

const SearchComponent = <T extends SearchableItem>({
  data,
  customBind,
  onSearchResult,
  microPhone,
  placeholder = "GLOBAL_CONSTANTS.SEARCH",
}: SearchBoxProps<T>) => {
  const [searchText, setSearchText] = useState<string>('');
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const handleChangeSearch = (text: string) => {
    setSearchText(text);
    const value = text.trim().toLowerCase();
    if (value.length > 0) {
      const filteredData = data.filter((item) => {
        if (customBind) {
          if (Array.isArray(customBind)) {
            // Search across multiple fields
            return customBind.some(field => {
              const fieldValue = item[field];
              return fieldValue != null && String(fieldValue).toLowerCase().includes(value);
            });
          } else {
            // Search single field
            const fieldValue = item[customBind];
            return fieldValue != null && String(fieldValue).toLowerCase().includes(value);
          }
        } else {
          // Default search by name
          return item.name?.toLowerCase().includes(value);
        }
      });
      onSearchResult(filteredData);
    } else {
      onSearchResult(data);
    }
  };
  return (
    <ViewComponent style={commonStyles.sectionGap}>
      <ViewComponent style={commonStyles.searchContainer}>
        {microPhone ? <MaterialCommunityIcons name="microphone-outline" size={s(22)} color={NEW_COLOR.TEXT_WHITE} /> : <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />}
        <TextInput
          style={[
            commonStyles.fs16,
            commonStyles.fw400,
            commonStyles.textWhite,
            commonStyles.flex1,
            { backgroundColor: NEW_COLOR.TRANSPARENT },
          ]}
          value={searchText}
          onChangeText={handleChangeSearch}
          placeholder={t(placeholder)}  // Use the translated placeholder or the default 'Search'
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
        />
        {/* {microPhone ? <MaterialCommunityIcons name="microphone-outline" size={s(22)} color={NEW_COLOR.TEXT_WHITE} /> : <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />} */}
      </ViewComponent>
    </ViewComponent>
  );
};

export default SearchComponent;

