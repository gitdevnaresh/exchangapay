import React, { useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, TextInput, StyleSheet } from 'react-native';
import AntDesign from "react-native-vector-icons/AntDesign";
import { useIsFocused } from '@react-navigation/native';
import { text } from '../../../constants/styels/mixins';
import { ms, s } from '../../../constants/styels/scale';
import { SvgUri } from 'react-native-svg';
import { useLngTranslation } from '../../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { CoinImages, getThemedCommonStyles } from '../../../components/CommonStyles';
import CommonTouchableOpacity from '../../../components/touchableComponents/touchableOpacity';
import ViewComponent from '../../../components/view/view';
import ImageUri from '../../../components/imageComponents/image';
import { CurrencyText } from '../../../components/textComponets/currencyText/currencyText';
import { getTabsConfigation } from '../../../../configuration';
import { useSelector } from 'react-redux';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import NoDataComponent from '../../../components/noData/noData';

interface AddVaultProps {
    vaultsList: [],
    coinsList: [],
    valutsPrevList: [],
    isLoading: boolean,
    handleNavigate?: (data: any, selectedVault: any) => void,
    setCoinsList: (data: any) => void,
    handleChangeSearch: (val: any) => void,
    defaultIndex?: any,
    disable?: boolean,
    isAccordion?: boolean
};
interface VaultItem {
    id?: string;
    name?: string;
    amountInUSD?: number;
    totalInBaseAmount?: number;
    totalBalanceInUsd?: number;
    totalBanlance?: number;
    balance?: number;
    code?: string;
    image?: string;
    logo?: string;
    merchantsDetails?: VaultItem[];
    assets?: VaultItem[];
    details?: VaultItem[];
    coinName?: string;
    amount?: number;
}

const SelectVault = ({
    vaultsList,
    coinsList,
    isLoading,
    handleNavigate,
    handleChangeSearch,
    valutsPrevList,
    setCoinsList,
    defaultIndex,
    disable,
    isAccordion = true
}: AddVaultProps) => {
    const isFocused = useIsFocused();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
    const [selectedVault, setSelectedVault] = useState<any>({});
    const NEW_COLOR = useMemo(() => useThemeColors(), []);
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const { t } = useLngTranslation();
    const currency = getTabsConfigation('CURRENCY');
    const baseCurrency = useSelector((state: any) => state.userReducer?.userDetails?.currency);
    useEffect(() => {
        if (vaultsList?.length > 0) {
            setSelectedVault(vaultsList[0]);
        }
        setExpandedIndex(defaultIndex || 0);
    }, [isFocused, vaultsList, defaultIndex]);

    const toggleItem = (index: number, item: VaultItem) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
        setSelectedVault(item);
        // Try all possible coin list property names
        const vaultCoins = valutsPrevList?.find(
            (value: VaultItem) => value?.name === item?.name
        );
        setCoinsList(
            vaultCoins?.assets ||
            vaultCoins?.merchantsDetails ||
            vaultCoins?.details ||
            []
        );
    };

    const SearchBoxComponent = (
        <ViewComponent style={[commonStyles.p12]}>
            <ViewComponent style={[commonStyles.accordianSearchContainer]}>
                <AntDesign name={'search1'} color={NEW_COLOR.SEARCH_ICON} size={ms(22)} />

                <TextInput
                    style={[commonStyles.searchInput, commonStyles.fs14, commonStyles.fw400]}
                    onChangeText={handleChangeSearch}
                    placeholder={t("GLOBAL_CONSTANTS.SEARCH_COIN")}
                    placeholderTextColor={NEW_COLOR.PLACEHOLDER_COLOR}
                />
            </ViewComponent>
        </ViewComponent>
    );
    return (
        <ViewComponent style={commonStyles.sectionGap}>
            {(
                // Show actual content when not loading
                <>
                    {(vaultsList && vaultsList?.length > 0) ? (
                        vaultsList.map((item: VaultItem, index: number) => (
                            <ViewComponent key={item?.id} style={[
                                index !== vaultsList?.length - 1 && commonStyles.mb10,
                                expandedIndex === index ? commonStyles.accordianActiveBorder : commonStyles.accordianInactiveBorder
                            ]}>
                                {isAccordion && <CommonTouchableOpacity onPress={() => toggleItem(index, item)} activeOpacity={0.8} style={[commonStyles.cardsbannerbg]}>
                                    <CommonTouchableOpacity onPress={() => toggleItem(index, item)} activeOpacity={1} style={[commonStyles.p14, commonStyles.rounded5, commonStyles.bannerbg]}>
                                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap16]}>
                                            <ParagraphComponent
                                                style={[commonStyles.fs14, commonStyles.textlinkgrey, commonStyles.fw500]}
                                                text={item?.name}
                                            />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.alignCenter]}>
                                                <CurrencyText value={item?.amountInUSD || item?.totalBalanceInUsd || item?.totalInBaseAmount || 0} prifix={currency[baseCurrency]} style={[commonStyles.accordianprimarytext]} />
                                                <SvgUri width={s(16)} style={[{ transform: [{ rotate: expandedIndex === index ? '180deg' : '0deg' }] }]} uri='https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/accordian_arrow.svg' />
                                            </ViewComponent>
                                        </ViewComponent>
                                    </CommonTouchableOpacity>
                                </CommonTouchableOpacity>}
                                {expandedIndex === index && (
                                    <ViewComponent>
                                        {/* {isAccordion && <ViewComponent>{SearchBoxComponent}</ViewComponent>} */}
                                        <ViewComponent style={commonStyles.mb16}>
                                            {coinsList?.map((subItem: VaultItem, subIndex: number) => (
                                                <React.Fragment key={subItem?.id}>
                                                    <CommonTouchableOpacity onPress={() => {
                                                        if (handleNavigate) {
                                                            handleNavigate(subItem, selectedVault);
                                                        }
                                                    }}>
                                                        <ViewComponent style={[
                                                            commonStyles.dflex,
                                                            commonStyles.gap16,
                                                            commonStyles.alignCenter,
                                                            commonStyles.justifyContent,
                                                            // commonStyles.p8,
                                                            commonStyles.px14,
                                                            commonStyles.mt16


                                                        ]}>
                                                            <ViewComponent style={{ width: s(32), height: s(32) }}>
                                                                <ImageUri uri={CoinImages[subItem?.code?.toLowerCase()] || subItem?.image} />
                                                            </ViewComponent>
                                                            <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.dflex, commonStyles.justifyContent]}>
                                                                <ViewComponent style={[]}>
                                                                    <ParagraphComponent
                                                                        text={subItem?.coinName || subItem?.name}
                                                                        style={[commonStyles.primarytext]}
                                                                    />
                                                                    <ParagraphComponent
                                                                        text={subItem?.code}
                                                                        style={[commonStyles.secondarytext]}
                                                                    />
                                                                </ViewComponent>
                                                                <CurrencyText value={subItem?.amountInUSD || subItem?.amount || 0} decimalPlaces={4} style={[commonStyles.accordianprimarytext]} />
                                                            </ViewComponent>
                                                        </ViewComponent>
                                                    </CommonTouchableOpacity>
                                                    {subIndex !== coinsList?.length - 1 && (<ViewComponent style={[commonStyles.listChildGap]} />)}
                                                </React.Fragment>
                                            ))}
                                            {(!coinsList || coinsList?.length === 0) && (
                                                <ViewComponent>
                                                    <NoDataComponent Description={"No data available"} />
                                                </ViewComponent>
                                            )}
                                        </ViewComponent>
                                    </ViewComponent>
                                )}
                            </ViewComponent>
                        ))
                    ) : (
                        <ViewComponent>
                            <NoDataComponent Description={'No data available'} />
                        </ViewComponent>
                    )}
                </>
            )}
        </ViewComponent>
    );
};

export default SelectVault;

const themedStyles = (NEW_COLOR: any) => StyleSheet.create({
    searchInput: {
        ...text(14, 16.8, 400, NEW_COLOR.TEXT_LIGHT, true),
        position: 'relative',
        zIndex: 2,
        width: "100%",
        paddingVertical: 1,
        color: NEW_COLOR.TEXT_WHITE, paddingRight: 50
    },
    searchIcon: {
        marginTop: 4,
        width: ms(22),
        height: ms(22), position: 'absolute', right: 12
    },
    coinStyle: {
        height: 36, width: 36,
        borderRadius: 36 / 2,
        backgroundColor: "#00A478"
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
