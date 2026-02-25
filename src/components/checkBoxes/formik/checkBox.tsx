import React, { useMemo } from "react";
import { TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useField } from 'formik';
import { MaterialIcons } from '@expo/vector-icons';
import ViewComponent from '../../view/view';
import TextMultiLangauge from '../../textComponets/multiLanguageText/textMultiLangauge';
import { s } from '../../../constants/styels/scale';
import { NEW_COLOR } from '../../../constants/styels/variables';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';


interface CommonCheckboxProps {
    label: string;
    name: string;
    style?: object;
    labelStyle?: object;
    customStyle?: any;
    disabled?: boolean;
}

const CommonCheckbox: React.FC<CommonCheckboxProps> = ({
    label,
    name,
    style = {},
    labelStyle = {},
    customStyle,
    disabled = false
}) => {
    const [field, meta, helpers] = useField(name);
    const colorScheme = useColorScheme();
    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);

    const toggleCheckbox = () => {
        if (!disabled) {
            helpers.setValue(!field.value);
        }
    };

    const getCheckboxColor = () => {
        if (disabled) {
            return NEW_COLOR.DISABLED_COLOR || '#D3D3D3'; // Fallback to light grey if DISABLED_COLOR is not defined
        }
        return field.value ? NEW_COLOR.TEXT_PRIMARY : NEW_COLOR.TEXT_GREY;
    };

    return (
        <ViewComponent>
            <ViewComponent style={[]}>
                <TouchableOpacity
                    onPress={toggleCheckbox}
                    style={[
                        commonStyles.dflex,
                        commonStyles.gap4,
                        commonStyles.alignCenter,
                        customStyle,
                        disabled && { opacity: 0.6 }
                    ]}
                    disabled={disabled}
                >
                    {field.value ? (
                        <MaterialIcons
                            name="check-box"
                            size={s(24)}
                            color={getCheckboxColor()}
                        />
                    ) : (
                        <MaterialIcons
                            name="check-box-outline-blank"
                            size={s(24)}
                            color={getCheckboxColor()}
                        />
                    )}
                    <TextMultiLangauge
                        style={[
                            labelStyle,
                            commonStyles.fs14,
                            commonStyles.fw400,
                            disabled ? { color: getCheckboxColor() } : commonStyles.textGrey
                        ]}
                        text={label}
                    />
                </TouchableOpacity>
            </ViewComponent>
            {meta?.touched && meta?.error ? (
                <TextMultiLangauge style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]} text={meta?.error} />
            ) : null}
        </ViewComponent>
    );
};

const styles = StyleSheet.create({

});

export default CommonCheckbox;

