import React from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import { s } from "../../../../../constants/styels/scale";
import ViewComponent from "../../../../../components/view/view";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import CustomRBSheet from "../../../../../components/models/commonDrawer";
import ButtonComponent from "../../../../../components/buttons/button";
import { PointsCollect } from "../../../../../assets/svg";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";

interface MysteryBoxModalProps {
    refRBSheet: any;
    giftItemData: any;
    onCollectPrize: () => void;
}

const MysteryBoxModal: React.FC<MysteryBoxModalProps> = ({
    refRBSheet,
    giftItemData,
    onCollectPrize
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();

    return (
        <CustomRBSheet
            refRBSheet={refRBSheet}
            height={"Medium"}
            closeOnPressMask={false}
            onClose={() => { }}
            closeOnDragDown={false}
            draggable={false}
            customStyles={{ container: { borderTopLeftRadius: s(30), borderTopRightRadius: s(30), backgroundColor: NEW_COLOR.BACKGROUND_MODAL } }}
        >
            <ViewComponent>
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.gap10]}>
                    <PointsCollect />
                    <CurrencyText
                        prifix={t("GLOBAL_CONSTANTS.YOU_WON")}
                        value={giftItemData?.amount || '0'}
                        decimalPlaces={2}
                        style={[commonStyles.fs20, commonStyles.textWhite, commonStyles.textCenter, commonStyles.mb20]}
                        currency={giftItemData?.currencyCode || ''}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.listGap]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.mt24, commonStyles.sectionGap]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title={"GLOBAL_CONSTANTS.COLLECT_PRIZE"} onPress={onCollectPrize} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </CustomRBSheet>
    );
};

export default MysteryBoxModal;