import React, { useCallback } from "react";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";
import ViewComponent from "../../../../../components/view/view";
import CommonTouchableOpacity from "../../../../../components/touchableComponents/touchableOpacity";
import FlatListComponent from "../../../../../components/flatList/flatList";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { CurrencyText } from "../../../../../components/textComponets/currencyText/currencyText";
import ParagraphComponent from "../../../../../components/textComponets/paragraphText/paragraph";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomRBSheet from "../../../../../components/models/commonDrawer";
import ButtonComponent from "../../../../../components/buttons/button";
import ErrorComponent from "../../../../../components/errorDisplay/errorDisplay";
import { KpiItem } from "../interface";
import { useLngTranslation } from "../../../../../hooks/languagesHook/useLngTranslation";

const ListItemSeparator = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return <ViewComponent style={[commonStyles.mb10]} />;
};

interface RedeemModalProps {
    refRBSheet: any;
    kpiData: KpiItem[];
    errorMsg: string;
    setErrorMsg: (msg: string) => void;
    onSelectCurrency: (item: any) => void;
}

const RedeemModal: React.FC<RedeemModalProps> = ({
    refRBSheet,
    kpiData,
    errorMsg,
    setErrorMsg,
    onSelectCurrency
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();

    const closeInviteSheet = useCallback(() => {
        refRBSheet.current?.close();
    }, [refRBSheet]);

    const renderRedeemWallets = ({ item }: { item: KpiItem }) => (
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.listGap]}>
            <ParagraphComponent style={[commonStyles.textWhite, commonStyles.fw500, commonStyles.fs14]} text={t(item?.currencyCode) || ""} />
            <ViewComponent>
                <CurrencyText style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.mb6, commonStyles.textRight]} value={parseFloat(String(item?.balance ?? 0)) || 0} />
                <ViewComponent>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]}>
                        <CommonTouchableOpacity onPress={() => onSelectCurrency(item)}>
                            <TextMultiLangauge style={[commonStyles.fs14, commonStyles.textprimary]} text="GLOBAL_CONSTANTS.ADD_TO_MY_WALLET" />
                        </CommonTouchableOpacity>
                        <AntDesign name="arrowright" size={16} style={[commonStyles.textprimary, commonStyles.mt2]} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );

    return (
        <CustomRBSheet
            refRBSheet={refRBSheet}
            height={"Small"}
            closeOnPressMask={true}
            onClose={() => { }}
        >
            <ViewComponent>
                <ViewComponent style={[]}>
                    <FlatListComponent
                        scrollEnabled={false}
                        nestedScrollEnabled={true}
                        data={kpiData}
                        renderItem={({ item }) => renderRedeemWallets({ item })}
                        keyExtractor={(item, index) => index?.toString()}
                        ListHeaderComponent={errorMsg ? <ErrorComponent message={errorMsg} onClose={() => setErrorMsg("")} /> : null}
                        ItemSeparatorComponent={ListItemSeparator}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.gap16, commonStyles.mt24, commonStyles.sectionGap]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title={"GLOBAL_CONSTANTS.CLOSE"} onPress={closeInviteSheet} solidBackground={true} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </CustomRBSheet>
    );
};

export default RedeemModal;