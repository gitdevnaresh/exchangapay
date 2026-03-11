import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { s } from '../../../constants/theme/scale';

interface CheckboxProps {
    value: boolean;
    onChange: (newValue: boolean) => void;
    size?: number;
    style?: ViewStyle;
    checkedColor?: string;
    uncheckedBorderColor?: string;
    backgroundColor?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
    value,
    onChange,
    size = s(12),
    style,
    checkedColor = '#000',
    uncheckedBorderColor = '#ccc',
    backgroundColor = '#e0e0e0',
}) => {
    return (
        <Pressable
            onPress={() => onChange(!value)}
            style={[
                styles.checkboxBase,
                {
                    backgroundColor: value ? backgroundColor : 'transparent',
                    borderColor: !value ? uncheckedBorderColor : 'transparent',
                    borderWidth: !value ? 1 : 0,
                },
                style,
            ]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: value }}
        >
            {value && <MaterialIcons name="check" size={size} color={checkedColor} />}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    checkboxBase: {
        width: s(24),
        height: s(24),
        borderRadius: s(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Checkbox;
