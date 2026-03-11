import React, { useState, useRef, useEffect } from 'react';
import { TextInput, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { s } from '../../../constants/theme/scale';

interface OtpInputProps {
  length: number;
  onOtpChange: (otp: string) => void; // Changed from onComplete to onOtpChange
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, onOtpChange, disabled = false }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const NEW_COLOR = useThemeColors();

  useEffect(() => {
    onOtpChange(otp.join(''));
  }, [otp, onOtpChange]);

  const handleTextChange = (text: string, index: number) => {
    if (disabled) return;

    // Handle paste
    if (text.length > 1) {
      const pastedCode = text.slice(0, length).split('');
      const newOtp = [...pastedCode, ...new Array(length - pastedCode.length).fill('')];
      setOtp(newOtp);
      const nextFocusIndex = Math.min(pastedCode.length, length - 1);
      if (inputRefs.current[nextFocusIndex]) {
        inputRefs.current[nextFocusIndex]?.focus();
      } else {
        Keyboard.dismiss();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === length - 1 && text) {
      // If the last input is filled, dismiss keyboard
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (disabled) return;
    
    // Additional backspace handling for better reliability
    if (e.nativeEvent.key === 'Backspace') {
      // If current input is empty and not the first input, move to previous
      if (otp[index] === '' && index > 0) {
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 50);
      }
    }
  };

  const handleContainerPress = () => {
    if (disabled) return;
    // Focus the first empty input
    const firstEmptyIndex = otp.findIndex(digit => digit === '');
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus(); // If all filled, focus last one
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap:s(10),
      marginBottom: s(20),
      marginTop:s(10)
    },
    inputBox: {
      width: s(45),
      height:s(55),
      borderWidth: 1,
      borderRadius: 8,
      textAlign: 'center',
      fontSize: s(22),
      fontWeight: 'bold',
      color: NEW_COLOR.TEXT_WHITE,
      borderColor: NEW_COLOR.BORDER_COLOR,
      backgroundColor: NEW_COLOR.INPUT_BG_COLOR,
    },
  });

  return (
    <Pressable onPress={handleContainerPress} style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput 
          key={index} 
          ref={ref => (inputRefs.current[index] = ref)} 
          style={styles.inputBox} 
          keyboardType="number-pad" 
          onChangeText={text => handleTextChange(text, index)} 
          onKeyPress={e => handleKeyPress(e, index)} 
          value={otp[index]} 
          selectTextOnFocus={true} 
          editable={!disabled} 
        />
      ))}
    </Pressable>
  );
};

export default OtpInput;
