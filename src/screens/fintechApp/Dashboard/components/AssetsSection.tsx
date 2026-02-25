import React, { useCallback } from "react";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ImageUri from "../../../../components/imageComponents/image";
import { CurrencyText } from "../../../../components/textComponets/currencyText/currencyText";
import { CoinImages } from "../../../../components/CommonStyles";
import NoDataComponent from "../../../../components/noData/noData";
import TextMultiLanguage from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { useNavigation } from "@react-navigation/native";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import { setNavigationSource } from "../../../../redux/actions/actions";
import { useDispatch } from "react-redux";
import { s } from "../../../../components/theme/scale";
import { walletsTabsNavigation } from '../../../../../configuration';

interface CommonStyles {
    sectionGap: object;
    dflex: object;
    justifyContent: object;
    alignCenter: object;
    titleSectionGap: object;
    sectionTitle: object;
    sectionLink: object;
    cardsbannerbg: object;
    gap16: object;
    flex1: object;
    primarytext: object;
    secondarytext: object;
    alignEnd: object;
    transactionsListGap: object;
}

interface GraphConfiguration {
    ASSETS: {
        Crypto?: boolean;
    };
}

interface Asset {
    code: string;
    amount: number;
    name?: string;
    image?: string;
}

interface NewColor {
    [key: string]: string;
}

interface VaultsList {
    vaultsList: Array<{ [key: string]: unknown }>;
}

interface AssetsSectionProps {
    commonStyles: CommonStyles;
    GraphConfiguration: GraphConfiguration;
    assets?: Asset[];
    handleNavigate: (item: Asset, selectedVault?: unknown) => void;
    NEW_COLOR: NewColor;
    setCoinsList?: (data: Asset[] | null) => void;
    vaultsLists?: VaultsList;
    vaultCoinsLists?: { coinsList: Asset[]; coinsPrevList: Asset[] };
    handleChangeSearch?: (val: string) => void;
    handleNaviagetePaymentModes?: () => void;
    showHeader?: boolean;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ commonStyles, GraphConfiguration, setCoinsList, vaultsLists, vaultCoinsLists, handleChangeSearch, handleNaviagetePaymentModes, assets, handleNavigate, NEW_COLOR, showHeader = true }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const handleSeeAll = useCallback(() => {
        dispatch(setNavigationSource("Dashboard"));
        navigation.navigate({ name: walletsTabsNavigation });
    }, [navigation]);

    if (!GraphConfiguration.ASSETS.Crypto) {
        return null;
    }

    return (
        <ViewComponent style={[commonStyles.sectionGap]}>
            {showHeader && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.titleSectionGap]}>
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.WALLETS"} style={commonStyles.sectionTitle} />
                    {(assets?.length || 0) > 0 && <CommonTouchableOpacity style={[commonStyles.dflex, commonStyles.alignCenter]} onPress={handleSeeAll}>
                        <TextMultiLanguage text={"GLOBAL_CONSTANTS.SEE_ALL"} style={[commonStyles.sectionLink]} />
                    </CommonTouchableOpacity>}
                </ViewComponent>
            )}

            {(assets && assets.length > 0) ? (
                <ViewComponent>
                    {(assets || []).slice(0, 5).map((item: Asset, index: number) => (
                        <ViewComponent key={item?.code ?? index} style={[commonStyles.cardsbannerbg, commonStyles.transactionsListGap]}>
                            <CommonTouchableOpacity activeOpacity={0.5} onPress={() => handleNavigate(item, vaultsLists?.vaultsList?.[0])}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <ViewComponent style={{ width: s(36), height: s(36) }}><ImageUri uri={CoinImages[item?.code?.toLowerCase()] || item?.image} /></ViewComponent>
                                    <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                                        <ViewComponent>
                                            <ParagraphComponent text={item?.name || item?.code} style={[commonStyles.primarytext]} />
                                            <ParagraphComponent text={`${item?.code ?? ''}`} style={[commonStyles.secondarytext]} />
                                        </ViewComponent>
                                        <ViewComponent style={[commonStyles.alignEnd,]}>
                                            <CurrencyText value={item?.amount ?? 0} decimalPlaces={4} currency={item?.code} style={[commonStyles.primarytext]} />
                                            {/* <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                                <ParagraphComponent text={`${tradeValue[item?.code] ?? 0}%`} style={[Number(tradeValue[item?.code] ?? 0) < 0 ? commonStyles.textRed : commonStyles.textGreen, commonStyles.colorstatus]} />
                                            </ViewComponent> */}
                                        </ViewComponent>
                                    </ViewComponent>
                                </ViewComponent>
                                {index !== Math.min(assets.length, 5) - 1 && <ViewComponent style={[commonStyles.transactionsListGap]} />}
                            </CommonTouchableOpacity>
                        </ViewComponent>
                    ))}
                </ViewComponent>
            ) : (
                <ViewComponent>
                    <NoDataComponent Description={"GLOBAL_CONSTANTS.NO_DATA_AVAILABLE"} />
                </ViewComponent>
            )}
        </ViewComponent>

    );
};

export default React.memo(AssetsSection);