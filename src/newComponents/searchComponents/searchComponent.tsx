import React, { useState } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ViewComponent from '../view/view';
import { ms, s } from '../theme/scale';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

// Define a base type for items that can be searched.
// It must have an optional 'name' property for default search
// and an index signature to allow searching on other properties via `customBind`.
interface SearchableItem {
  name?: string;
  [key: string]: any;
}

interface SearchBoxProps<T extends SearchableItem> {
  data: T[];
  customBind?: string;
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
  const NEW_COLOR = useThemeColors(true);
  const commonStyles = getThemedCommonStyles(NEW_COLOR);


  // Only search when icon is pressed
  const handleSearch = () => {
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
      // Show all data if search is empty or only spaces
      onSearchResult(data);
    }
  };

  return (
    <ViewComponent style={commonStyles.sectionGap}>
      <ViewComponent style={commonStyles.searchContainer}>
        {microPhone && <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />}
        <TextInput
          style={[
            commonStyles.fs16,
            commonStyles.fw400,
            commonStyles.logintext,
            commonStyles.flex1,
            { backgroundColor: NEW_COLOR.TRANSPARENT },
          ]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={t(placeholder)}  // Use the translated placeholder or the default 'Search'
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          returnKeyType="search"
          onSubmitEditing={handleSearch} // Optional: allow search on keyboard submit
        />
        <TouchableOpacity onPress={handleSearch}>
          {microPhone ? (
            <MaterialCommunityIcons name="microphone-outline" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
          ) : (
            <AntDesign name="search1" color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />
          )}
        </TouchableOpacity>
      </ViewComponent>
    </ViewComponent>
  );
};

export default SearchComponent;
