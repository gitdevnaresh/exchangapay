import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { s } from "../../../../constants/theme/scale";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ViewComponent from "../../../../newComponents/view/view";
import { Ionicons } from '@expo/vector-icons';
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { showAppToast } from "../../../../newComponents/ToasterMessages/ShowMessage";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";
import { languages } from "../constants";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { getLanguageConfiguration } from "../../../../../configuration";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import ImageUri from "../../../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../../../assets/blobUrls";


const Language = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t, changeLanguage, currentLanguage } = useLngTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
    const enabledLanguages = getLanguageConfiguration()
    const onBackPress = () => {
        navigation.goBack();
    }
    useHardwareBackHandler(() => {
        onBackPress();
    })
    const handleLanguageChange = async (langKey: string) => {
        await changeLanguage(langKey);
        showAppToast(t("GLOBAL_CONSTANTS.YOUR_LANGUAGE_HAS_BEEN_CHANGED"), 'success');
        setSelectedLanguage(langKey);
    }
    const filteredLanguages = useMemo(() => {
        return languages?.filter(lang => enabledLanguages.includes(lang.key));
    }, [languages, enabledLanguages]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.LANGUAGE"} onBackPress={onBackPress} />
                <ScrollViewComponent>
                    {/* Warning Message Box */}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap12, commonStyles.mb16]}>
                 <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                        <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, { width: s(300) }]} numberOfLines={3} text={"GLOBAL_CONSTANTS.LANGUAGE_MESSAGE"} />

                    </ViewComponent>


                    {filteredLanguages?.map((lang) => (
                        <CommonTouchableOpacity
                            key={lang.key}
                            style={[commonStyles.appLock, commonStyles.mb16,commonStyles.dflex,commonStyles.justifyContent]}
                            onPress={() => handleLanguageChange(lang.key)}
                        >
                            {/* Language Label */}
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]}>
                                {lang.label}
                            </ParagraphComponent>

                            {/* Selection Indicator */}
                            {selectedLanguage === lang.key ? (
                                <ViewComponent style={commonStyles.radioDot}>
                                    <Ionicons name="checkmark-sharp" size={s(16)} color={NEW_COLOR.TEXT_BLACK} />
                                </ViewComponent>
                            ) : (
                                // Unselected state: Empty circle
                                <ViewComponent style={[commonStyles.radioOuter]} />
                            )}
                        </CommonTouchableOpacity>
                    ))}
                </ScrollViewComponent>
            </Container>
        </ViewComponent>
    )
}
export default Language;