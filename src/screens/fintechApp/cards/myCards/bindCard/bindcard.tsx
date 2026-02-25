
import React from 'react'
import ViewComponent from '../../../../../components/view/view'
import TextMultiLanguage from '../../../../../components/textComponets/multiLanguageText/textMultiLangauge'
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors'
import { getThemedCommonStyles } from '../../../../../components/CommonStyles'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { s } from '../../../../../components/theme/scale'
const BindCardNote = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <ViewComponent style={[]}>
            <TextMultiLanguage style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]} text={"GLOBAL_CONSTANTS.CARD_BINDING_SUCCESS_POINTS_TITLE"} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]}>
                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} style={[commonStyles.mt2]} />
                <ViewComponent>
                    <TextMultiLanguage style={[commonStyles.sectionSubTitleText]} text={"GLOBAL_CONSTANTS.PHYSICAL_CARD_DETAILS_TITLE"} />
                    <TextMultiLanguage style={[commonStyles.sectionsubtitlepara, commonStyles.titleSectionGap, { width: s(350) }]} text={"GLOBAL_CONSTANTS.PHYSICAL_CARD_DETAILS_CONTENT"} />
                </ViewComponent>
            </ViewComponent>


            <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]}>
                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} style={[commonStyles.mt2]} />
                <ViewComponent>
                    <TextMultiLanguage style={[commonStyles.sectionSubTitleText]} text={"GLOBAL_CONSTANTS.PERSONAL_ID_DOC_TITLE"} />
                    <TextMultiLanguage style={[commonStyles.sectionsubtitlepara, commonStyles.titleSectionGap, { width: s(340) }]} text={"GLOBAL_CONSTANTS.PERSONAL_ID_DOC_CONTENT"} />
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]}>
                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} style={[commonStyles.mt2]} />
                <ViewComponent>
                    <TextMultiLanguage style={[commonStyles.sectionSubTitleText]} text={"GLOBAL_CONSTANTS.SELFIE_WITH_CARD_TITLE"} />
                    <TextMultiLanguage style={[commonStyles.sectionsubtitlepara, commonStyles.titleSectionGap, { width: s(350) }]} text={"GLOBAL_CONSTANTS.SELFIE_WITH_CARD_CONTENT"} />


                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]} >
                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} style={[commonStyles.mt2]} />

                <ViewComponent>
                    <TextMultiLanguage style={[commonStyles.sectionSubTitleText]} text={"GLOBAL_CONSTANTS.STABLE_INTERNET_TITLE"} />
                    <TextMultiLanguage style={[commonStyles.sectionsubtitlepara, commonStyles.titleSectionGap, { width: s(350) }]} text={"GLOBAL_CONSTANTS.STABLE_INTERNET_CONTENT"} />

                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]}>
                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} style={[commonStyles.mt2]} />

                <ViewComponent>
                    <TextMultiLanguage style={[commonStyles.sectionSubTitleText]} text={"GLOBAL_CONSTANTS.GOOD_LIGHTING_TITLE"} />
                    <TextMultiLanguage style={[commonStyles.sectionsubtitlepara, commonStyles.titleSectionGap, { width: s(340) }]} text={"GLOBAL_CONSTANTS.GOOD_LIGHTING_CONTENT"} />
                </ViewComponent>
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap6]}>
                <MaterialIcons name="check-circle-outline" size={s(18)} color={NEW_COLOR.TEXT_PRIMARY} style={[commonStyles.mt2]} />

                <ViewComponent>
                    <TextMultiLanguage style={[commonStyles.sectionSubTitleText]} text={"GLOBAL_CONSTANTS.APP_PERMISSIONS_TITLE"} />
                    <TextMultiLanguage style={[commonStyles.sectionsubtitlepara, commonStyles.titleSectionGap, { width: s(350) }]} text={"GLOBAL_CONSTANTS.APP_PERMISSIONS_CONTENT"} />

                </ViewComponent>
            </ViewComponent>



        </ViewComponent>
    )
}

export default BindCardNote


