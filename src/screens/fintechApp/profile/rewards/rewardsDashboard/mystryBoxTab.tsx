import React from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import FlatListComponent from "../../../../../components/flatList/flatList";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import { MysteryBoxIcon } from "../../../../../assets/svg";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";
import NoDataComponent from "../../../../../components/noData/noData";

interface MysteryBoxSectionProps {
    mysteryBoxData: any[];
    onOpenBox: (item: any) => Promise<void>;
}

const MysteryBoxSection: React.FC<MysteryBoxSectionProps> = ({ mysteryBoxData, onOpenBox }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();

    const renderMysteryBoxItem = ({ item }: { item: any }) => {
        return (
            <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.listGap, commonStyles.alignStart]}>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                    <MysteryBoxIcon />
                    <ViewComponent>
                        <TextMultiLangauge text={item.mysteryBoxRewardName} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.mb6]} />
                        {item?.rewardEarned && <ParagraphComponent text={`${t('GLOBAL_CONSTANTS.YOU_HAVE_EARNED')} ${item?.rewardEarned}`} style={[commonStyles.fw400, commonStyles.fs12, commonStyles.textlinkgrey, commonStyles.mb6]} />}
                        {item?.status && <ParagraphComponent text={item?.status} style={[commonStyles.fw400, commonStyles.fs12, commonStyles.textlinkgrey]} />}
                    </ViewComponent>
                </ViewComponent>
                <CommonTouchableOpacity
                    disabled={item?.status == 'Opened'}
                    style={[commonStyles.px24, commonStyles.py8, commonStyles.rounded100, { backgroundColor: item?.status == 'Opened' ? NEW_COLOR.TEXT_GREY : NEW_COLOR.TEXT_PRIMARY }]}
                    onPress={() => onOpenBox(item)}
                >
                    <TextMultiLangauge text={item?.status == 'Opened' ? "GLOBAL_CONSTANTS.LOCKED" : "GLOBAL_CONSTANTS.TAP_TO_OPEN_BOX"} style={[commonStyles.textAlwaysWhite, commonStyles.fw500, commonStyles.fs12]} />
                </CommonTouchableOpacity>
            </ViewComponent>
        );
    };

    return (
        <ViewComponent>
            <FlatListComponent
                data={mysteryBoxData}
                keyExtractor={(item: any) => item.id}
                renderItem={renderMysteryBoxItem}
                ListEmptyComponent={<NoDataComponent />}
            />
        </ViewComponent>
    );
};

export default MysteryBoxSection;