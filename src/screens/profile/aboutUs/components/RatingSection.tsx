import React from 'react';
import { FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../../newComponents/touchableComponents/touchableOpacity';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import CommonInputText from '../../../../newComponents/textInputComponents/basic/inputText';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { s } from '../../../../constants/theme/scale';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';

const ratingOptions = [
    { value: 1, iconSet: 'Ionicons', name: 'sad-outline' as const, customSize: s(32) },
    { value: 2, iconSet: 'MaterialCommunityIcons', name: 'emoticon-sad-outline' as const, customSize: s(34) },
    { value: 3, iconSet: 'FontAwesome6', name: 'meh' as const, customSize: s(28) },
    { value: 4, iconSet: 'FontAwesome6', name: 'smile' as const, customSize: s(28) },
    { value: 5, iconSet: 'FontAwesome6', name: 'laugh' as const, customSize: s(28) },
];

interface RatingSectionProps {
    rating: number | null;
    showReasons: boolean;
    resonsList: any[];
    selectedReason: any;
    description: string;
    ratingLoading: boolean;
    onRatingSelect: (option: any) => void;
    onReasonSelect: (reason: any) => void;
    onDescriptionChange: (text: string) => void;
    onSubmit: () => void;
}

const RatingSection: React.FC<RatingSectionProps> = ({
    rating, showReasons, resonsList, selectedReason, description, ratingLoading,
    onRatingSelect, onReasonSelect, onDescriptionChange, onSubmit
}) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const renderIcon = (option: any) => {
        const isSelected = rating === option.value;
        const iconColor = isSelected ? NEW_COLOR.BG_YELLOW : NEW_COLOR.TEXT_WHITE;
        const iconProps = { name: option.name, size: option.customSize, color: iconColor };
        
        switch (option.iconSet) {
            case 'Ionicons': return <Ionicons {...iconProps} />;
            case 'MaterialCommunityIcons': return <MaterialCommunityIcons {...iconProps} />;
            case 'FontAwesome6': return <FontAwesome6 {...iconProps} />;
            default: return null;
        }
    };

    return (
        <ViewComponent>
            <ViewComponent style={[commonStyles.alignCenter, { marginTop: s(40), marginBottom: s(20) }]}>
                <TextMultiLanguage text="GLOBAL_CONSTANTS.HOW_WOULD_YOU_RECOMMEND" style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite]} />
                <TextMultiLanguage text="GLOBAL_CONSTANTS.BULLSWIPE_TO_A_FRIEND" style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite, { marginTop: s(4) }]} />
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyCenter, commonStyles.gap16, { marginTop: s(24) }]}>
                    {ratingOptions.map((option) => (
                        <CommonTouchableOpacity
                            key={option.value}
                            style={[{ width: s(44), height: s(44), justifyContent: 'center', alignItems: 'center', borderRadius: s(22) }]}
                            onPress={() => onRatingSelect(option)}
                        >
                            {renderIcon(option)}
                        </CommonTouchableOpacity>
                    ))}
                </ViewComponent>
            </ViewComponent>
            {(rating || showReasons) && (
                <ViewComponent style={[commonStyles.p16]}>
                    {showReasons && (
                        <FlatList
                            data={resonsList}
                            keyExtractor={(item) => item.name.toString()}
                            contentContainerStyle={[commonStyles.alignStart]}
                            renderItem={({ item }) => {
                                const isSelected = selectedReason?.name === item.name;
                                return (
                                    <CommonTouchableOpacity
                                        onPress={() => onReasonSelect(item)}
                                        style={[commonStyles.py8, commonStyles.px16, commonStyles.mb8, commonStyles.rounded10, { borderWidth: 1, borderColor: isSelected ? NEW_COLOR.BG_YELLOW : NEW_COLOR.TEXT_GREY }]}
                                    >
                                        <ParagraphComponent text={item?.name} style={[commonStyles.fs14, commonStyles.textWhite, { borderColor: isSelected ? NEW_COLOR.BG_YELLOW : NEW_COLOR.TEXT_WHITE }]} />
                                    </CommonTouchableOpacity>
                                );
                            }}
                        />
                    )}
                    {rating && (
                        <CommonInputText
                            style={[commonStyles.mb16]}
                            placeholder="GLOBAL_CONSTANTS.PLEASE_SHARE_THE_REASON_FOR_YOUR_RATING"
                            value={description}
                            onChangeText={onDescriptionChange}
                            multiline
                            numberOfLines={4}
                            maxLength={256}
                            inputStyle={[{
                                color: NEW_COLOR.TEXT_WHITE,
                                fontSize: s(14),
                                borderWidth: 1,
                                borderRadius: s(10),
                                borderColor: NEW_COLOR.TEXT_GREY,
                                backgroundColor: NEW_COLOR.INPUT_BG_GRAY,
                                paddingHorizontal: s(12),
                                paddingVertical: s(10),
                                minHeight: s(70),
                                textAlignVertical: 'top',
                            }]}
                        />
                    )}
                    <ViewComponent style={[commonStyles.mb32]} />
                    {(rating || showReasons) && (
                        <ButtonComponent
                            title="GLOBAL_CONSTANTS.SUBMIT"
                            onPress={onSubmit}
                            loading={ratingLoading}
                            disable={ratingLoading}
                        />
                    )}
                </ViewComponent>
            )}
        </ViewComponent>
    );
};

export default RatingSection;