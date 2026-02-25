import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { ms } from '../../constants/styels/scale';
import ViewComponent from '../view/view';
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import { getThemedCommonStyles } from '../CommonStyles';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  returnKeyType?: 'search' | 'done' | 'go' | 'next';
  searchQuery?: string;
  placeholderTextColor?: string;
  inputStyle?: object;
  clearSearch?: boolean;
}

const SearchCompApi: React.FC<SearchBoxProps> = ({
  placeholder = "GLOBAL_CONSTANTS.SEARCH",
  onSearch,
  returnKeyType = 'search',
  searchQuery: initialSearchQuery = '',
  placeholderTextColor = '#999',
  inputStyle,
  clearSearch = false
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);
  useEffect(() => {
    if (clearSearch) {
      setSearchQuery('');
    }
  }, [clearSearch])
  const handleSearchData = (data: string) => {
    setSearchQuery(data);
  };
  const handleSearch = () => {
    onSearch(searchQuery.trim());
    Keyboard.dismiss();
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <ViewComponent >
      <ViewComponent style={commonStyles.searchContainer}>
        <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
          <AntDesign name={"search1"} color={NEW_COLOR.TEXT_WHITE} size={ms(22)} />
        </TouchableOpacity>
        <TextInput
          // Apply local searchInput style first for base styling (like padding and text color),
          // then merge with inputStyle prop for any parent-defined overrides.
          style={[commonStyles.searchInput, inputStyle]}
          value={searchQuery}
          onChangeText={handleSearchData}
          placeholder={t(placeholder)}
          placeholderTextColor={placeholderTextColor}
          returnKeyType={returnKeyType}
          onSubmitEditing={handleSearch}
          onKeyPress={handleKeyPress}
        />

      </ViewComponent>
    </ViewComponent>
  );
};

export default SearchCompApi;
const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  searchInput: {
    fontSize: 14,
    lineHeight: 16.8,
    fontWeight: '400',
    color: NEW_COLOR.TEXT_link,
    position: 'relative',
    // zIndex is usually not needed here if the icon is positioned correctly.
    width: '100%',
    paddingVertical: ms(12), // Increased vertical padding for a larger touch target
    paddingRight: ms(45),    // Ensure text doesn't overlap with the icon
  },
  // searchIcon: {
  //   position: 'absolute',
  //   right: ms(5), // Adjust right positioning as needed
  //   top: '50%',   // Position the top edge of the TouchableOpacity at the container's vertical midpoint
  //   // Vertically center the TouchableOpacity. (IconSize + VerticalPadding*2) / 2
  //   // IconSize is ms(22), padding ms(8) => (22 + 16)/2 = 19
  //   transform: [{ translateY: -ms(21) }], 
  //   padding: ms(10), // Increased padding for a larger touch target for the icon
  //   // zIndex: 10, // Add if necessary, but usually not required with absolute positioning
  // },

});
