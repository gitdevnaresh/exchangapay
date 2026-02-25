import React, { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { CoinImages, getThemedCommonStyles } from '../CommonStyles';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import ViewComponent from '../view/view';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import { s } from '../../constants/styels/scale';
import { FlatList } from 'react-native-gesture-handler';
import NoDataComponent from '../noData/noData';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import ImageUri from '../imageComponents/image';
import { Keyboard } from 'react-native';

interface CommonDropdownProps<T> {
  data: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  renderItem: (item: T, isSelected: boolean, dropdownOpen: boolean) => React.ReactNode;
  placeholder?: string;
  dropdownOpen?: boolean;
  setDropdownOpen?: (open: boolean) => void;
  dropdownHeight?: number;
  error?: string;
  currencyMapping?: (key: string) => string;
}

function CommonDropdown<T extends { [key: string]: any }>({
  data,
  selectedItem,
  onSelect,
  renderItem,
  placeholder = 'Select',
  dropdownOpen: controlledDropdownOpen,
  setDropdownOpen: setControlledDropdownOpen,
  dropdownHeight,
  error,
  currencyMapping,
}: Readonly<CommonDropdownProps<T>>) {
  const [internalDropdownOpen, setInternalDropdownOpen] = useState(false);
  const dropdownOpen = controlledDropdownOpen !== undefined ? controlledDropdownOpen : internalDropdownOpen;
  const setDropdownOpen = setControlledDropdownOpen || setInternalDropdownOpen;
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const { t } = useLngTranslation();
  return (
    <ViewComponent
      style={{
        position: "relative",
        zIndex: dropdownOpen ? 9999 : 1,
        elevation: dropdownOpen ? 9999 : 0,
      }}
    >
      <ViewComponent style={commonStyles.relative}>
        <CommonTouchableOpacity
          style={[
            commonStyles.dflex,
            commonStyles.alignCenter,
            commonStyles.justifyContent,
            commonStyles.input,
            commonStyles.textred,
            error && [commonStyles.errorBorder]
          ]}
          onPress={() => {
            setDropdownOpen(!dropdownOpen);
            Keyboard.dismiss();
          }}
          activeOpacity={0.8}
        >
          {selectedItem ? (
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
              {/* Show image only for coins/fiat, not for network objects */}
              {!selectedItem.network ? (
                <ViewComponent style={{ width: s(32), height: s(32) }}>
                  <ImageUri
                    uri={
                      currencyMapping ?
                        currencyMapping((selectedItem.coinCode || selectedItem.code || selectedItem.name)?.trim().toLowerCase()) :
                        CoinImages[
                        (selectedItem.coinCode || selectedItem.code || selectedItem.name)
                          ?.trim()
                          .toLowerCase()
                        ] || selectedItem.image
                    }
                    width={s(30)}
                    height={s(30)}
                  />
                </ViewComponent>
              ) : null}
              <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fs16]}>
                {selectedItem.network ? selectedItem.code :
                  (selectedItem.coinCode
                    ? `${selectedItem.coinCode} (${selectedItem.networkName})`
                    : selectedItem.code || selectedItem?.name)}
              </ParagraphComponent>
            </ViewComponent>
          ) : (
            <ParagraphComponent
              style={[
                commonStyles.textGrey,
                { fontSize: Math.round(s(16)), color: NEW_COLOR.PLACEHOLDER_COLOR }
              ]}
            >
              {placeholder}
            </ParagraphComponent>
          )}

          <Feather
            name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={Math.round(s(20))}
            style={[commonStyles.textCenter, commonStyles.textWhite]}
          />
        </CommonTouchableOpacity>

        {dropdownOpen && (
          <>
            {/* ✅ Full-area tap catcher */}
            <CommonTouchableOpacity
              style={{
                position: "absolute",
                top: -2000,
                left: -2000,
                right: -2000,
                bottom: -2000,
                backgroundColor: "transparent",
                zIndex: 1,
              }}
              onPress={() => setDropdownOpen(false)}
              activeOpacity={1}
            />

            {/* ✅ Dropdown list with elevation */}
            <ViewComponent
              style={[
                commonStyles.rounded8,
                {
                  position: "absolute",
                  top: Math.round(s(55)),
                  left: 0,
                  right: 0,
                  zIndex: 9999,
                  elevation: 9999,
                  backgroundColor: NEW_COLOR.INPUTDROPDOWN_BG,
                  maxHeight: dropdownHeight ?? Math.round(s(260)),
                  overflow: 'hidden',
                }]}
            >
              <FlatList
                scrollEnabled
                data={data}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item, index) =>
                  `${item?.coinCode || item?.id || index}-${item?.networkCode || ''}`
                }
                ListEmptyComponent={<NoDataComponent />}
                renderItem={({ item }) => {
                  const isSelected = selectedItem && (
                    // ✅ Network selection (match by code)
                    (item.network && selectedItem.network &&
                      item.code === selectedItem.code) ||

                    // ✅ Crypto coin selection (match by coinCode + networkCode)
                    (!item.network && item.coinCode && selectedItem.coinCode &&
                      item.coinCode === selectedItem.coinCode &&
                      item.networkCode === selectedItem.networkCode) ||

                    // ✅ Fiat selection (match by code + id)
                    (!item.network && item.code && selectedItem.code &&
                      item.code === selectedItem.code &&
                      item.id === selectedItem.id)
                  );

                  return (
                    <CommonTouchableOpacity
                      style={{}} // No background or border styling here!
                      onPress={() => {
                        onSelect(item);
                        setDropdownOpen(false);
                      }}
                    >
                      {renderItem(item, isSelected, dropdownOpen)}
                    </CommonTouchableOpacity>
                  );
                }}
              />
            </ViewComponent>
          </>
        )}
      </ViewComponent>

      {error && (
        <ViewComponent style={[commonStyles.mb4]}>
          <ParagraphComponent
            style={[
              commonStyles.textError,
              commonStyles.fs12
            ]}
            text={t(error)}
          />
        </ViewComponent>
      )}
    </ViewComponent>
  );
}

export default CommonDropdown;

