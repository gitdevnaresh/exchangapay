import React from 'react';
import { CheckBox } from 'react-native-elements';
import { useField } from 'formik';
import ViewComponent from '../../../view/view';
import ParagraphComponent from '../../../textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import { NEW_COLOR } from '../../../../constants/theme/variables';
import { s } from '../../../../constants/theme/scale';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import LabelComponent from '../../../textComponets/lableComponent/lable';
import { AntDesign } from '@expo/vector-icons';


interface RadioButtonOption {
    label: string;
    value: string;
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
}

const FormikRadioButton: React.FC<RadioButtonProps> = ({
    name,
    options,
    label,
    containerStyle = {},
    labelStyle = {},
    optionStyle = {},
    selectedOptionStyle = {},
    checkedColor = NEW_COLOR.BG_YELLOW,
    isRequired = false,
    textStyle
}) => {
    const [field, meta, helpers] = useField(name);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const handleSelect = (value: string) => {
        helpers.setValue(value);
        helpers.setTouched(true);
    };
    const { t } = useLngTranslation();
    return (
        <ViewComponent style={[containerStyle]}>
            {label && (
                <LabelComponent style={[{ marginBottom: s(4) }, labelStyle]}>
                    {t(label)}
                    {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
                </LabelComponent>
            )}            <ViewComponent style={[commonStyles.dflex, optionStyle]}>
                {options.map((option) => {
                    const isSelected = field.value === option.value;
                    return (
                        <ViewComponent key={option.value} style={{ borderColor: NEW_COLOR.TEXT_link }}>
                            <CheckBox
                                checked={isSelected}
                                onPress={() => handleSelect(option.value)}
                                title={t(option.label)}
                                iconType="material-community"
                                checkedIcon="radiobox-marked"
                                uncheckedIcon="radiobox-blank"
                                checkedColor={checkedColor}
                                uncheckedColor={NEW_COLOR.TEXT_link}
                                size={s(20)}
                                containerStyle={{
                                    backgroundColor: 'transparent',
                                    borderRadius: 0,
                                    padding: 0,
                                    margin: 0,
                                    borderWidth: 0,
                                    ...selectedOptionStyle,
                                }}
                                textStyle={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite, textStyle, { fontWeight: 400 },]}
                            />
                        </ViewComponent>
                    );
                })}
            </ViewComponent>
            {meta?.touched && meta?.error ? (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <AntDesign
                        name="closecircleo"
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt6]}
                    />
                    <ParagraphComponent
                        multiLanguageAllows={true}
                        style={[commonStyles.fs14, commonStyles.mt4, commonStyles.textRed, commonStyles.fw400]}
                        text={typeof meta.error === 'string' ? meta.error : (meta.error.message || Object.keys(meta.error).length > 0 ? JSON.stringify(meta.error) : "")}
                    />
                </ViewComponent>
            ) : null}
        </ViewComponent>
    );
};

export default FormikRadioButton;
