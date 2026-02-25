import React, { useMemo } from "react";
import { CheckBox } from 'react-native-elements';
import { useField } from 'formik';
import ViewComponent from '../../../view/view';
import ParagraphComponent from '../../../textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../../../hooks/languagesHook/useLngTranslation';
import { NEW_COLOR } from '../../../../constants/styels/variables';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import { s } from '../../../../constants/styels/scale';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import LabelComponent from '../../../textComponets/lableComponent/lable';

interface RadioButtonOption {
    label: string;
    value: string;
    disabled?: boolean;
}

interface RadioButtonProps {
    name: string;
    options: RadioButtonOption[];
    label?: string;
    containerStyle?: object;
    labelStyle?: object;
    optionStyle?: object;
    selectedOptionStyle?: object;
    checkedColor?: string;
    isRequired?: boolean;
    textStyle?: any;
    onOptionSelect?: (value: any) => void;
    disabled?: boolean;   // ? new prop
}

const FormikRadioButton: React.FC<RadioButtonProps> = ({
    name,
    options,
    label,
    containerStyle = {},
    labelStyle = {},
    optionStyle = {},
    selectedOptionStyle = {},
    checkedColor = NEW_COLOR.BUTTON_BG,
    isRequired = false,
    textStyle,
    onOptionSelect,
    disabled = false,  // ? default false
}) => {
    const [field, meta, helpers] = useField(name);

    const NEW_COLOR = useThemeColors();
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    const handleSelect = (value: string) => {
        if (!disabled) {   // ? prevent changes when disabled
            helpers.setValue(value);
            if (onOptionSelect) {
                onOptionSelect(value);
            }
        }
    };

    const { t } = useLngTranslation();

    return (
        <ViewComponent style={[containerStyle]}>
            {label && (
                <LabelComponent style={[{ marginBottom: s(4) }, commonStyles.inputLabel, labelStyle]}>
                    {t(label)}
                    {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                </LabelComponent>
            )}
            <ViewComponent style={[commonStyles.dflex, optionStyle, { marginLeft: s(6) }]}>
                {options?.map((option) => {
                    const isSelected = field.value === option.value;
                    const isOptionDisabled = disabled || option.disabled;
                    return (
                        <ViewComponent key={option.value} style={[{ borderColor: NEW_COLOR.TEXT_link, marginLeft: s(-10) }]}>
                            <CheckBox
                                checked={isSelected}
                                onPress={() => handleSelect(option.value)}
                                title={t(option.label)}
                                iconType="material-community"
                                checkedIcon="radiobox-marked"
                                uncheckedIcon="radiobox-blank"
                                checkedColor={checkedColor}
                                uncheckedColor={isOptionDisabled ? NEW_COLOR.INACTIVE_Radio : NEW_COLOR.INACTIVE_Radio}
                                size={s(20)}
                                disabled={isOptionDisabled}   // ? disable checkbox itself
                                containerStyle={{
                                    backgroundColor: 'transparent',
                                    borderRadius: 0,
                                    padding: 0,
                                    margin: 0,
                                    borderWidth: 0,
                                    opacity: isOptionDisabled ? 0.5 : 1,  // ? show disabled state
                                    ...selectedOptionStyle,
                                }}
                                textStyle={[
                                    commonStyles.fs16,
                                    commonStyles.fw400,
                                    commonStyles.textWhite,
                                    textStyle,
                                    { fontWeight: 400 },
                                ]}
                            />
                        </ViewComponent>
                    );
                })}
            </ViewComponent>
            {meta?.touched && meta?.error ? (
                <ParagraphComponent
                    multiLanguageAllows={true}
                    style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]}
                    text={meta?.error}
                />
            ) : null}
        </ViewComponent>
    );
};

export default FormikRadioButton;

