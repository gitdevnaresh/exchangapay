import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import Text from './Text'; // Assuming './Text' is a valid custom component
import { NEW_COLOR } from '../constants/theme/variables'; // Assuming these are valid imports
import { text } from '../constants/theme/mixins';
import { FieldProps } from 'formik';
import { ms, s } from '../constants/theme/scale';

interface OtpEntryProps extends FieldProps {
    label?: string;
    length?: number;
    containerStyle?: any;
    inputBoxStyle?: any;
    // onChangeText is already part of Formik's setFieldValue, so it's a bit redundant,
    // but we can keep it for flexibility.
    onChangeText?: (text: string) => void;
}

const DefaultOtpInput: React.FC<OtpEntryProps> = ({
    field,
    form,
    label,
    length = 6,
    containerStyle,
    inputBoxStyle,
    onChangeText,
}) => {
    const { name, value } = field;
    const { setFieldValue, touched, errors } = form;
    const refs = useRef<Array<TextInput | null>>([]);

    // ✅ REQUIREMENT 4: "Resend Not Clearing"
    // This effect runs when the parent component clears the Formik value.
    // e.g., form.setFieldValue('otp', '')
    useEffect(() => {
        if (value === '') {
            // Clear all visible inputs and focus the first one.
            refs.current.forEach((ref) => ref?.clear());
            refs.current[0]?.focus();
        }
    }, [value]); // Reruns only when the OTP value changes

    const handleChange = (inputText: string, index: number) => {
        const newOtp = (value || '').split('');

        // ✅ REQUIREMENT 5: "Pasting from clipboard"
        // If the user pastes a code, distribute it across the inputs.
        if (inputText.length > 1) {
            inputText.split('').forEach((char, i) => {
                if (index + i < length) {
                    newOtp[index + i] = char;
                }
            });
            // Focus the last input that was filled
            const nextFocusIndex = Math.min(index + inputText.length, length - 1);
            refs.current[nextFocusIndex]?.focus();
        } else {
            // ✅ REQUIREMENT 1: "Single click entry"
            // Handle single character entry
            newOtp[index] = inputText;
            // Move focus to the next input if a character was entered
            if (inputText && index < length - 1) {
                refs.current[index + 1]?.focus();
            }
        }

        const finalOtp = newOtp.join('').slice(0, length);
        setFieldValue(name, finalOtp);
        if (onChangeText) {
            onChangeText(finalOtp);
        }
    };
    
    // ✅ REQUIREMENT 2 & 3: "Single click clear" and "Clear multiple"
    // This handles the backspace key press.
    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!value?.[index] && index > 0) {
                // If current is empty, move focus back and clear previous
                refs.current[index - 1]?.focus();
                let newOtp = (value || '').split('');
                newOtp[index - 1] = '';
                setFieldValue(name, newOtp.join(''));
                if (onChangeText) onChangeText(newOtp.join(''));
            } else if (value?.[index] && index === length - 1) {
                // If last input and not empty, clear it immediately
                let newOtp = (value || '').split('');
                newOtp[index] = '';
                setFieldValue(name, newOtp.join(''));
                if (onChangeText) onChangeText(newOtp.join(''));
            }
        }
    };


    const errorMsg = touched[name] && errors[name];

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.row}>
                {Array.from({ length }).map((_, i) => (
                    <TextInput
                        key={i}
                        ref={(r) => (refs.current[i] = r)}
                        style={[styles.input, inputBoxStyle]}
                        keyboardType="numeric"
                        value={value?.[i] || ''}
                        onChangeText={(text) => handleChange(text, i)}
                        onKeyPress={(e) => handleKeyPress(e, i)}
                        // *** CRITICAL FIX FOR PASTING ***
                        // The first input can accept the full length of the OTP for pasting.
                        // Subsequent inputs only accept 1 character.
                        maxLength={i === 0 ? length : 1}
                    />
                ))}
            </View>
            {/* Show error message, but keep space to prevent layout shifts */}
            <Text style={styles.error}>{errorMsg ? String(errorMsg) : ' '}</Text>
        </View>
    );
};

export default DefaultOtpInput;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        width: s(45),
        height: s(46),
        textAlign: 'center',
        fontSize: s(20),
        fontWeight: '500',
        backgroundColor: '#463C4D',
        borderRadius: s(8),
        borderWidth: s(2),
        borderColor: '#7C7C7C',
        color: '#ffffff',
    },
    label: {
        color: '#AFAFAF',
        fontSize: s(20),
        marginBottom: s(7),
        marginLeft: s(11),
    },
    error: {
        ...text(13, 16.8, 400, NEW_COLOR.TEXT_RED),
        minHeight: s(17),
        alignSelf: 'flex-end',
        marginTop: ms(4), // Added some margin for better spacing
    },
});