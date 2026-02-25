import React, { useEffect, useState } from 'react';
import { StyleService, useStyleSheet } from '@ui-kitten/components';
import { View, TouchableOpacity, LayoutAnimation, TextInput } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { text } from '../../constants/styels/mixins';
import { LinearGradient } from 'expo-linear-gradient';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { formatCurrency } from '../../utils/helpers';
import { commonStyles } from '../theme/commonStyles';
import { NEW_COLOR } from '../../constants/styels/variables';
import Loadding from '../skelton/skeltons';
import SvgFromUrl from '../svgIcon';
import NoDataComponent from '../noData/noData';
import { ms, s } from '../../constants/styels/scale';
import RadioButton from '../radiobutton/RadioButton';
import ButtonComponent from '../buttons/button';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { FIAT_CONSTANTS } from '../../screens/fintechApp/bank/withdraw/vaultsConstants';
import { commonVaultsSkeleton } from '../../skeletons/cardsSkeletons';

interface AddVaultProps {
  vaultsList: any[];
  coinsList: any[];
  valutsPrevList: any[];
  isLoading: boolean;
  handleNavigate?: (data: any, selectedVault: any) => void;
  setCoinsList: (data: any) => void;
  setVaultsList?: (data: any) => void;
  handleChangeSearch: (val: any) => void;
  defaultIndex?: any;
  disable?: boolean;
  isSelectCoupon?: boolean
};

const SelectRadioVault = ({
  vaultsList = [],
  coinsList,
  isLoading,
  handleNavigate,
  handleChangeSearch,
  valutsPrevList,
  setCoinsList,
  defaultIndex,
  disable,
  isSelectCoupon
}: AddVaultProps) => {
  const NEW_COLOR = useThemeColors();
  const styles = useStyleSheet(themedStyles);
  const buyCoinListSkelton = commonVaultsSkeleton(8);
  const isFocused = useIsFocused();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedVault, setSelectedVault] = useState<any>({});
  const [detailsSelection, setDetailsSelection] = useState<number | null>(null);
  const navigation = useNavigation()
  const { t } = useLngTranslation();
  useEffect(() => {
    if (vaultsList?.length >= 0) {
      // Optional initialization logic here
    };
  }, [isFocused, vaultsList]);

  const toggleItem = (index: number, item: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
    setSelectedVault(item);
    setDetailsSelection(null)

    const vaultCoins = valutsPrevList?.find((value: any) => value?.merchantName === item?.merchantName);
    setCoinsList(vaultCoins?.merchantsDetails);
  };

  const SearchBoxComponent = (
    <View style={commonStyles.mb6}>
      <View style={[commonStyles.accordianSearchContainer, commonStyles.mt6]}>
        <TextInput
          style={[commonStyles.searchInput, commonStyles.fs16, commonStyles.fw500]}
          onChangeText={handleChangeSearch}
          placeholder={t('GLOBAL_CONSTANTS.SEARCH_COIN')}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
        />
        <AntDesign name={FIAT_CONSTANTS?.SEARCH1} color={NEW_COLOR.SEARCH_ICON} size={ms(22)} style={styles.searchIcon} />
      </View>
    </View>
  );

  const gradients = [
    ['rgba(64, 123, 255, 0.26)', 'rgba(237, 243, 255, 0.26)'],
    ['rgba(10, 202, 224, 0.26)', 'rgba(237, 243, 255, 0.26)'],
    ['rgba(229, 156, 133, 0.26)', 'rgba(237, 243, 255, 0.26)'],
    ['rgba(215, 229, 133, 0.26)', 'rgba(237, 243, 255, 0.26)'],
  ];

  const handleRadioSelect = (value: any, index: number) => {
    setExpandedIndex(index);
  };

  const handleRadioDetailSelect = (value: any, index: number) => {
    // setSelectedVault(value); // Update the selected vault

    setDetailsSelection(index); // Update the details selection index
  };

  const handleDetailsSelection = (index: any) => {
    setDetailsSelection(index);
  };
  const handleSelectcoupon = () => {
    navigation.navigate('SelectCoupons')
  }

  return (
    <View>
      {isLoading && <Loadding contenthtml={buyCoinListSkelton} />}
      {(!isLoading && vaultsList) && vaultsList?.map((item, index) => (
        <View key={index} style={[index !== vaultsList?.length - 1 && commonStyles.listGap, expandedIndex === index ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder]}>
          <TouchableOpacity key={item?.index} onPress={() => toggleItem(index, item)} activeOpacity={0.8} style={[commonStyles.rounded5, commonStyles.vAccordinBg]}>
            <LinearGradient
              colors={gradients[index % gradients.length]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomLeftRadius: expandedIndex === index ? 0 : 5, borderBottomRightRadius: expandedIndex === index ? 0 : 5 }}
            >
              <TouchableOpacity key={index} onPress={() => toggleItem(index, item)} activeOpacity={1} style={[commonStyles.p16]}>
                <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                  <ParagraphComponent
                    style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw600]}
                    text={item?.merchantName}
                  />
                  <View style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                    <ParagraphComponent style={[commonStyles.fs14, commonStyles.textWhite, commonStyles.fw600]} text={`$${formatCurrency(item?.amountInUSD, 2 || 0)}`} />
                    <RadioButton
                      options={[{ name: item?.merchantName, name: item }]}
                      selectedOption={expandedIndex === index ? item : null}
                      onSelect={(value) => handleRadioSelect(value, index)}
                      nameField="name"
                      valueField="name"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
          {expandedIndex === index && (
            <View>
              {item?.merchantName !== "coupon" && isSelectCoupon && (<View>{SearchBoxComponent}</View>)}
              <View>
                {
                  item?.merchantName === "coupon" && !isSelectCoupon ? (
                    <ButtonComponent
                      title={`${t("GLOBAL_CONSTANTS.SelectCoupon")}`}
                      onPress={handleSelectcoupon}
                      customTitleStyle={[{ color: NEW_COLOR.TEXT_BLACK }]}
                      customButtonStyle={{ backgroundColor: NEW_COLOR.BACKGROUND_WHITE }}
                    />
                  ) : (
                    !isLoading && coinsList?.map((subItem: any, subIndex: number) => (
                      <TouchableOpacity key={subIndex} disabled={disable} onPress={() => handleDetailsSelection(subIndex)}>
                        <View style={[commonStyles.dflex, commonStyles.gap8, commonStyles.alignCenter, commonStyles.accordianListStyle, { borderTopWidth: 1, borderBottomWidth: subIndex === coinsList.length - 1 ? 0 : 1 }]}>
                          <View>
                            <SvgFromUrl uri={subItem?.logo} width={s(24)} height={s(24)} />
                          </View>
                          <View style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.dflex, commonStyles.justify]}>
                            <ParagraphComponent
                              text={subItem?.code}
                              style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite]}
                            />
                            <ParagraphComponent
                              style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite]}
                              numberOfLines={1}
                              text={formatCurrency(subItem?.balance, 2)}
                            />
                            <RadioButton
                              options={[{ pannelDetails: item?.merchantName, value: item }]}
                              selectedOption={detailsSelection === subIndex ? item : null}
                              onSelect={(value) => handleRadioDetailSelect(value, subIndex)}
                              nameField="pannelDetails"
                              valueField="value"
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  )
                }
                {(!coinsList || coinsList?.length === 0) && !isLoading && (
                  <View>
                    <NoDataComponent Description={FIAT_CONSTANTS?.NO_DATA_AVAILABLE} />
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      ))}
      {(!vaultsList || vaultsList?.length === 0) && !isLoading && (
        <View>
          <NoDataComponent Description={FIAT_CONSTANTS?.NO_DATA_AVAILABLE} />
        </View>
      )}
    </View>
  );
};

export default SelectRadioVault;

const themedStyles = StyleService.create({
  searchInput: {
    ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
    position: 'relative',
    zIndex: 2,
    width: '100%',
    paddingVertical: 1,
    color: NEW_COLOR.TEXT_WHITE,
    paddingRight: 50,
  },
  searchIcon: {
    marginTop: 4,
    width: ms(22),
    height: ms(22),
    position: 'absolute',
    right: 12,
  },
  coinStyle: {
    height: 36,
    width: 36,
    borderRadius: 36 / 2,
    backgroundColor: '#00A478',
  },
  greybg: {
    backgroundColor: NEW_COLOR.SHEET_BG,
    flex: 1,
  },
  sheetHeader: {
    flex: 1,
    backgroundColor: NEW_COLOR.SHEET_HEADER_BG,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
});
