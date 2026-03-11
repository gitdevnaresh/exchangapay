import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useFormikContext } from 'formik';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ParagraphComponent from '../../textComponets/paragraphText/paragraph';
import PhoneCodePicker from '../../../screens/commonScreens/phonePicker';
import { s } from '../../theme/scale';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ViewComponent from '../../view/view';
import { AntDesign } from '@expo/vector-icons';
import LabelComponent from '../../textComponets/lableComponent/lable';

interface PhoneInputWithPickerProps {
  label?: string;
  isRequired?: boolean;
  phoneFieldName: string;
  codeFieldName: string;
  placeholder: string;
  modalTitle?: string;
  customBind: string[];
  data: any[];
  sheetHeight?: number;
  showCountryImages?: boolean;
  maxLength?: number;
  searchPlaceholder?: string;
  disabled?: boolean;
  isCodeDisable?: boolean;
}

const PhoneInputWithPicker = ({
  label,
  isRequired = true,
  phoneFieldName,
  codeFieldName,
  placeholder,
  modalTitle,
  customBind,
  data,
  sheetHeight = 600,
  showCountryImages,
  maxLength,
  searchPlaceholder,
  disabled,
  isCodeDisable = false
}: PhoneInputWithPickerProps) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const { setFieldValue, handleBlur, touched, errors, values } = useFormikContext<any>();

  const phoneTouched = touched[phoneFieldName];
  const codeTouched = touched[codeFieldName];
  const phoneError = errors[phoneFieldName];
  const codeError = errors[codeFieldName];

  const errorToDisplay = (phoneTouched || codeTouched) && (phoneError || codeError) ? phoneError || codeError : undefined;

  return (
    <View style={commonStyles.mt20}>
      {label && (
      <LabelComponent style={[commonStyles.inputLabel]}>
         {t(label)}
        {isRequired && <LabelComponent style={[commonStyles.textRed]}> *</LabelComponent>}
     </LabelComponent>
      )}

      <View
        style={[
          commonStyles.dflex,
          commonStyles.gap10,
        ]}
      >
        <PhoneCodePicker
          inputStyle={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, {
            borderRadius: s(8),

          }]}
          modalTitle={modalTitle}
          customBind={customBind}
          data={data}
          value={values[codeFieldName]}
          placeholder={t('GLOBAL_CONSTANTS.PHONE_NUMBER_SELECT')}
          searchPlaceholder={searchPlaceholder}
          onChange={(item: any) => setFieldValue(codeFieldName, item.mobileCode || item.code)}
          sheetHeight={sheetHeight}
          showCountryImages={showCountryImages}
          disabled={isCodeDisable}
        />

        <TextInput
          style={[
            commonStyles.textInput,
            { flex: 1, backgroundColor: disabled ? NEW_COLOR.INPUT_BORDER : NEW_COLOR.INPUTFIELD_BG },
          ]}
          // placeholder={t(placeholder)}
          onChangeText={text => {
            const formattedText = text?.replace(/\D/g, '').slice(0, 13);
            setFieldValue(phoneFieldName, formattedText);
          }}
          onBlur={handleBlur(phoneFieldName)}
          value={values[phoneFieldName]}
          keyboardType="phone-pad"
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          multiline={false}
          editable={!disabled}
          maxLength={maxLength}
        />
      </View>

      {errorToDisplay && (
        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
          <AntDesign
            name="closecircleo"
            size={s(14)}
            color={NEW_COLOR.TEXT_RED}
            style={[commonStyles.mt6]}
          />
          <ParagraphComponent
            multiLanguageAllows={true}
            style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textError, commonStyles.mt4, commonStyles.flex1]}
            text={errorToDisplay}
          />
        </ViewComponent>
      )}
    </View>
  );
};

export default PhoneInputWithPicker;