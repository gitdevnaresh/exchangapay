import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles } from '../CommonStyles';
import ParagraphComponent from '../Paragraph/Paragraph';
import { NEW_COLOR } from '../../constants/theme/variables';

const RadioButton = ({ options, radioIsSide = "true", selectedOption, onSelect, nameField = 'label', valueField = 'value', disabled = false }: any) => {

  return (
    <View style={[commonStyles.gap20, { flexDirection: radioIsSide ? "row" : "column" }]}>
      {options?.map((option: any) => (
        <TouchableOpacity
          key={option[valueField]}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, }}
          onPress={() => onSelect(option[valueField])}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <View
            style={{
              height: 18,
              width: 18,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: option[valueField] === selectedOption ? NEW_COLOR.BG_ORANGE : NEW_COLOR.SEARCH_BORDER,
              alignItems: 'center',
              justifyContent: 'center',

            }}
          >
            {option[valueField] === selectedOption && (
              <View
                style={{
                  height: 8,
                  width: 8,
                  borderRadius: 6,
                  backgroundColor: NEW_COLOR.BG_ORANGE,
                }}
              />
            )}
          </View>
          <ParagraphComponent
            text={option[nameField]}
            style={[
              commonStyles.fs14,
              commonStyles.fw500,
              { color: option[valueField] === selectedOption ? NEW_COLOR.TEXT_BLACK : NEW_COLOR.TEXT_LABEL }
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default RadioButton;
