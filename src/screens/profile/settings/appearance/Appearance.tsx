import { useNavigation } from "@react-navigation/native";
import React from "react"; // Using useState to manage selection for this example
import { useThemeColors } from "../../../../hooks/useThemeColors";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ViewComponent from "../../../../newComponents/view/view";
import { MaterialIcons } from '@expo/vector-icons';
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useDispatch, useSelector } from "react-redux";
import { setAppTheme } from "../../../../redux/actions/actions";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import { themes } from "../constants";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";

const Appearance = () => {
    const navigation = useNavigation();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const appThemeSetting = useSelector((state: any) => state.userReducer?.appTheme);
    const dispatch = useDispatch();

    const onBackPress = () => {
        navigation.goBack();
    }
    useHardwareBackHandler(() => {
        onBackPress();
    })
    const handleChangeTheme = (themeKey: string) => {
        dispatch(setAppTheme(themeKey));
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.APPEARANCE"} onBackPress={onBackPress} />

                <ViewComponent>
                    {themes?.map((theme) => (
                        <CommonTouchableOpacity
                            key={theme.key}
                            style={[commonStyles.appLock, commonStyles.mb16,commonStyles.dflex,commonStyles.justifyContent, commonStyles.mb10]}
                            onPress={() => handleChangeTheme(theme.key)}
                        >
                            {/* Left Side: Label and Description */}
                            <ViewComponent style={{ flex: 1 }}>
                                <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.mb4]}>
                                    {theme.label}
                                </ParagraphComponent>
                                {theme.description && (
                                    <TextMultiLanguage style={[commonStyles.fs12, commonStyles.textGrey, commonStyles.fw400]} text={theme?.description} />
                                )}
                            </ViewComponent>

                            {appThemeSetting === theme.key ? (
                                // Selected state: Yellow circle with a checkmark
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignEnd, commonStyles.justifyend, commonStyles.radioDot]}>
                                    <MaterialIcons name="check" size={16} color={NEW_COLOR.BgAlwaysBlack} />
                                </ViewComponent>
                            ) : (
                                // Unselected state: Empty circle
                                <ViewComponent style={[commonStyles.radioOuter]} />
                            )}
                        </CommonTouchableOpacity>
                    ))}
                </ViewComponent>
            </Container>
        </ViewComponent>
    )
}
export default Appearance;
