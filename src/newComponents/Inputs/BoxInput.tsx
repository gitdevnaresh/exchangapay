// --- START OF FILE BoxInput.tsx (Final Corrected Version) ---

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Pressable,
    TextInput,
} from 'react-native';
import ViewComponent from '../view/view';
import { useThemeColors } from '../../hooks/useThemeColors';
import { s } from '../theme/scale';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { AntDesign } from '@expo/vector-icons';



interface OTPInputProps {
    code: string;
    setCode: (code: string) => void;
    pinCount?: number;
    onCodeFilled?: (code: string) => void;
    validationStatus?: 'success' | 'error' | null;
    errorMessage?: string;
    isLoading?: boolean;
    autoFocus?: boolean;
    isEdit?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
    code,
    setCode,
    pinCount = 6,
    onCodeFilled,
    validationStatus,
    errorMessage,
    isLoading = false,
    autoFocus = false,
    isEdit = true
}) => {
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    const isFocused = focusedIndex !== null;

    const handleOnPress = useCallback(() => {
        const firstEmptyIndex = code.length < pinCount ? code.length : 0;
        inputRefs.current[firstEmptyIndex]?.focus();
    }, [code, pinCount]);

    useEffect(() => {
        if (autoFocus) {
            const timer = setTimeout(() => {
                handleOnPress();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [handleOnPress, autoFocus]);


    const handleOnBlur = () => {
        setFocusedIndex(null);
    };

    const onCodeFilledRef = useRef(onCodeFilled);
    onCodeFilledRef.current = onCodeFilled;

    useEffect(() => {
        if (code.length === pinCount && !isLoading) {
            onCodeFilledRef.current?.(code);
        }
    }, [code, pinCount, isLoading]);

    const pinBoxes = Array.from({ length: pinCount });

    return (
        <ViewComponent style={styles.otpContainer}>
            <Pressable style={styles.otpPressable} onPress={handleOnPress}>
                {pinBoxes.map((_, index) => {
                    const digit = code[index] || '';
                    const isCurrentBoxToFill = index === code.length && isFocused;
                    const isBoxFocused = index === focusedIndex;
                    const isFilled = !!digit;
                    const boxBorderColor =
                        validationStatus === 'success'
                            ? NEW_COLOR.TEXT_GREEN :
                            validationStatus === 'error'
                                ? NEW_COLOR.TEXT_RED
                                : isCurrentBoxToFill
                                    ? NEW_COLOR.TEXT_WHITE
                                    : isFilled
                                        ? NEW_COLOR.SECTION_BORDER
                                        : NEW_COLOR.INPUT_BORDER;

                    const isEditable = isEdit && validationStatus !== 'success';
                    return (
                        <TextInput
                            key={index}
                            value={digit}
                            editable={isEditable}
                            onChangeText={text => {
                                const newCode = [...code]; // Create a mutable copy

                                // FINAL FIX #1: Handle all input (paste, single digit, overwrite)
                                const cleanedText = text.replace(/[^0-9]/g, '');

                                if (cleanedText.length === 0) {
                                    // Handle deletion via backspace in a non-empty box
                                    newCode[index] = '';
                                } else {
                                    // Handle paste and single-digit entry
                                    for (let i = 0; i < cleanedText.length; i++) {
                                        if (index + i < pinCount) {
                                            newCode[index + i] = cleanedText[i];
                                        }
                                    }
                                }

                                const finalCode = newCode.join('').slice(0, pinCount);
                                setCode(finalCode);

                                // Move focus to the next logical box
                                if (cleanedText.length > 0 && index < pinCount - 1) {
                                    const nextFocusIndex = Math.min(index + cleanedText.length, pinCount - 1);
                                    inputRefs.current[nextFocusIndex]?.focus();
                                }
                            }}
                            ref={ref => (inputRefs.current[index] = ref)}
                            onFocus={() => setFocusedIndex(index)}
                            onBlur={handleOnBlur}
                            maxLength={pinCount} // Important for paste
                            caretHidden={!isBoxFocused}
                            keyboardType="number-pad"
                            style={[
                                pinCount > 6 ? styles.otpMaxBox : styles.otpBox,
                                {
                                    backgroundColor: isEditable ? NEW_COLOR.INPUT_BG_DISABLED : NEW_COLOR.INPUT_BORDER,
                                    borderColor: boxBorderColor,
                                    color: NEW_COLOR.TEXT_WHITE,
                                    textAlign: 'center',
                                    fontSize: s(22),
                                    fontWeight: '600'
                                }
                            ]}
                            returnKeyType="next"
                            onKeyPress={e => {
                                // FINAL FIX #2: Precisely handle backspace on an EMPTY box
                                if (e.nativeEvent.key === 'Backspace' && !digit && index > 0) {
                                    // This logic now correctly removes the character from the PREVIOUS box
                                    // and then moves focus there. It prevents the "first digit clearing" bug.
                                    const newCode = code.substring(0, index - 1) + code.substring(index);
                                    setCode(newCode);
                                    inputRefs.current[index - 1]?.focus();
                                }
                            }}
                        />
                    );
                })}
            </Pressable>
            {validationStatus === 'error' && errorMessage && (
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10,]}>
                    <AntDesign
                        name={"closecircleo"}
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt6]}
                    />
                    <ParagraphComponent style={[{ color: 'red', marginTop: s(5) }, commonStyles.flex1, commonStyles.fs14, commonStyles.fw400]}>{errorMessage}</ParagraphComponent>
                </ViewComponent>
            )}
        </ViewComponent>

    );
};

const styles = StyleSheet.create({
    otpContainer: {
        marginTop: s(32),
        marginBottom: s(32),
    },
    otpPressable: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: s(2),
    },
    otpBox: {
        width: s(50),
        height: s(56),
        borderRadius: 12,
        borderWidth: 1,
    }, otpMaxBox: {
        width: s(40),
        height: s(46),
        borderRadius: 12,
        borderWidth: 1,

    }
});