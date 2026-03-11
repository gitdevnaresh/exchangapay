import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Ionicons, Feather, SimpleLineIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { s } from '../../../../constants/theme/scale';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';

interface AboutOption {
    id: string;
    iconSet: string;
    icon: string;
    title: string;
    rightContent?: { type: string; value: string };
    onPress: () => void;
}

interface AboutOptionsProps {
    options: AboutOption[];
    isCheckingUpdate: boolean;
    updateAvailable: boolean;
}

const AboutOptions: React.FC<AboutOptionsProps> = ({ options, isCheckingUpdate, updateAvailable }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const renderRightContent = (option: AboutOption) => {
        if (!option.rightContent) return null;
        if (option.rightContent.type === 'version') {
            if (isCheckingUpdate) {
                return <ActivityIndicator size="small" color={NEW_COLOR.ICON_YELLOW_LOADER} />;
            }
            return (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}>
                  {updateAvailable && <Ionicons name="information-circle-outline" size={s(16)} color={NEW_COLOR.BG_YELLOW} />}
                    <ParagraphComponent text={option.rightContent.value} style={[commonStyles.fs14,commonStyles.fw400, commonStyles.textGrey]} />
                </ViewComponent>
            );
        }
        return <ParagraphComponent text={option.rightContent.value} style={[commonStyles.fs14, commonStyles.textGrey]} />;
    };

    const renderIcon = (option: AboutOption) => {
        const iconProps = { name: option.icon as any, size: s(20), color: NEW_COLOR.TEXT_WHITE };
        switch (option.iconSet) {
            case 'Feather': return <Feather {...iconProps} />;
            case 'SimpleLineIcons': return <SimpleLineIcons {...iconProps} />;
            case 'MaterialCommunityIcons': return <MaterialCommunityIcons {...iconProps} />;
            default: return <Ionicons {...iconProps} />;
        }
    };

    return (
        <ViewComponent style={[commonStyles.gap6,commonStyles.p24, commonStyles.sectionGap]}>
            {options.map((option) => (
                <CommonTouchableOpacity 
                    key={option.id} 
                    style={[{ borderWidth: 1, borderColor: NEW_COLOR.INPUT_BORDER }, commonStyles.rounded12, commonStyles.p8]} 
                    onPress={option.onPress}
                >
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.communityiconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                            {renderIcon(option)}
                        </ViewComponent>
                        <TextMultiLanguage 
                            text={`GLOBAL_CONSTANTS.${option.title.toUpperCase().replace(/ /g, '_')}`} 
                            style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite]} 
                        />
                        <ViewComponent style={[{ marginLeft: 'auto', marginRight: s(8) }]}>
                            {renderRightContent(option)}
                        </ViewComponent>
                        <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                    </ViewComponent>
                </CommonTouchableOpacity>
            ))}
        </ViewComponent>
    );
};

export default AboutOptions;