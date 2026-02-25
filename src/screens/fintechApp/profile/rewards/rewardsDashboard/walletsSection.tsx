import React from "react";
import { CoinImages, getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { s } from "../../../../../constants/styels/scale";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import ImageUri from "../../../../../components/imageComponents/image";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import { XPPoints } from "../../../../../assets/svg";
import { KpiItem } from "../interface";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";

interface RewardsKPIProps {
    kpiData: KpiItem[];
    onRedeem: () => void;
}

const RewardsKPI: React.FC<RewardsKPIProps> = ({ kpiData, onRedeem }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.titleSectionGap]}>
                <TextMultiLangauge text={"GLOBAL_CONSTANTS.REWORDS_WALLET"} style={[commonStyles.sectionTitle]} />
                <CommonTouchableOpacity onPress={onRedeem} style={[commonStyles.dflex, commonStyles.alignCenter]}>
                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.REDEEM"} style={[commonStyles.sectionLink]} />
                </CommonTouchableOpacity>
            </ViewComponent>
            <ViewComponent style={[commonStyles.flex1, commonStyles.justifyContent, commonStyles.sectionGap]}>
                {kpiData.filter(item => item.currencyCode === 'XP').map((item) => (
                    <ViewComponent key={item.id} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.listGap]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                            <XPPoints />
                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={t(item?.currencyCode) || ""} />
                        </ViewComponent>
                        <CurrencyText style={[commonStyles.listprimarytext]} value={parseFloat(String(item?.balance ?? 0)) || 0} />
                    </ViewComponent>
                ))}
                {kpiData.filter(item => item.currencyCode === 'USDT').map((item) => (
                    <ViewComponent key={item.id} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.alignCenter]}>
                            <ViewComponent style={{ width: s(24), height: s(24) }}>
                                <ImageUri uri={CoinImages[item?.currencyCode?.toLowerCase()]} />
                            </ViewComponent>
                            <ParagraphComponent style={[commonStyles.listprimarytext]} text={t(item?.currencyCode) || ""} />
                        </ViewComponent>
                        <CurrencyText style={[commonStyles.listprimarytext]} value={parseFloat(String(item?.balance ?? 0)) || 0} />
                    </ViewComponent>
                ))}
            </ViewComponent>
        </ViewComponent>
    );
};

export default RewardsKPI;