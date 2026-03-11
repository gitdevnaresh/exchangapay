import React from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useField } from 'formik';
import { MaterialIcons } from '@expo/vector-icons';
import ViewComponent from '../../view/view';
import TextMultiLangauge from '../../textComponets/multiLanguageText/textMultiLangauge';
import { commonStyles } from '../../../components/CommonStyles';
import { s } from '../../../constants/theme/scale';
import { NEW_COLOR } from '../../../constants/theme/variables';


interface CommonCheckboxProps {
    label: string;
    name: string;
    style?: object;
    labelStyle?: object;
    customStyle?:any;
}

const CommonCheckbox: React.FC<CommonCheckboxProps> = ({ label, name, style = {}, labelStyle = {},customStyle }) => {
    const [field, meta, helpers] = useField(name);
    const colorScheme = useColorScheme();
    const toggleCheckbox = () => {
        helpers.setValue(!field.value);
    };
    return (
        <ViewComponent  >
            <ViewComponent style={[]}>
                <TouchableOpacity onPress={toggleCheckbox} style={[commonStyles.dflex, commonStyles.gap4, commonStyles.alignCenter,customStyle]}>
                    {field.value ? (
                        <MaterialIcons name="check-box" size={s(24)} color={NEW_COLOR.PRiMARY_COLOR} />
                    ) : (
                        <MaterialIcons name="check-box-outline-blank" size={s(24)} color={NEW_COLOR.TEXT_GREY} />
                    )}
                    <TextMultiLangauge style={[labelStyle, commonStyles.fs14,commonStyles.fw400,commonStyles.textGrey]} text={label} />
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
