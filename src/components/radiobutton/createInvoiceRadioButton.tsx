import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getThemedCommonStyles } from '../CommonStyles';
import { NEW_COLOR } from '../../constants/styels/variables';
import { ms, s } from '../../constants/styels/scale';
import { CreateInvoiceRadioButtonProps } from './interface';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { PAYMENT_LINK_CONSTENTS } from '../../screens/fintechApp/payments/constants';
import { PAYOUT_CONSTANTS } from '../../screens/fintechApp/payments/payout/payOutConstants';


const CreateInvoiceRadioButton: React.FC<CreateInvoiceRadioButtonProps> = ({
  options,
  radioIsSide = "true",
  selectedOption,
  onSelect,
  nameField = 'label',
  valueField = 'value',
  isDisabled = false
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <View style={[styles.container, { flexDirection: radioIsSide ? "row" : "column" }]}>
      {options.map((option: any) => (
        <TouchableOpacity
          key={option[valueField]}
          style={[
            styles.optionButton,
            {
              backgroundColor: option[valueField] === selectedOption ? NEW_COLOR.BG_BLUE : PAYMENT_LINK_CONSTENTS.TRANSPARENT,
              borderTopLeftRadius: option[valueField] === PAYMENT_LINK_CONSTENTS.STATIC || option[valueField] === PAYOUT_CONSTANTS.PAYOUT_TITLE.BTN_FIAT ? 30 : 0,
              borderBottomLeftRadius: option[valueField] === PAYMENT_LINK_CONSTENTS.STATIC || option[valueField] === PAYOUT_CONSTANTS.PAYOUT_TITLE.BTN_FIAT ? 30 : 0,
              borderTopRightRadius: option[valueField] === PAYMENT_LINK_CONSTENTS.INVOICE || option[valueField] === PAYOUT_CONSTANTS.PAYOUT_TITLE.BTN_CRYPTO ? 30 : 0,
              borderBottomRightRadius: option[valueField] === PAYMENT_LINK_CONSTENTS.INVOICE || option[valueField] === PAYOUT_CONSTANTS.PAYOUT_TITLE.BTN_CRYPTO ? 30 : 0
            }
          ]}
          onPress={!isDisabled ? () => onSelect(option[valueField]) : null}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.radioIcon,
              {
                borderColor: "#fff"
              }
            ]}
          >
            {option[valueField] === selectedOption && (
              <View style={styles.radioSelected} />
            )}
          </View>
          <Text
            style={[
              styles.optionText, commonStyles.fw400, commonStyles.textWhite
            ]}
          >
            {option[nameField]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    padding: 2,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20, borderWidth: 1, borderColor: NEW_COLOR.BG_BLUE,
    height: ms(63)
  },
  radioIcon: {
    height: ms(18),
    width: ms(18),
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  optionText: {
    fontSize: ms(20),
  },
});

export default CreateInvoiceRadioButton;
