import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Svg, { Line } from 'react-native-svg';
import { commonStyles } from '../../../../newComponents/theme/commonStyles';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const DOT_SIZE = 60;
const GRID_PADDING = 40;

const getDotPosition = (idx: number) => {
  const row = Math.floor(idx / GRID_SIZE);
  const col = idx % GRID_SIZE;
  const spacing = (width - GRID_PADDING * 2 - DOT_SIZE * GRID_SIZE) / (GRID_SIZE - 1);
  return {
    x: col * (DOT_SIZE + spacing) + DOT_SIZE / 2,
    y: row * (DOT_SIZE + spacing) + DOT_SIZE / 2,
  };
};

export default function PatternLock({
  mode = 'create', // 'create' | 'disable'
  savedPattern = '',
  onSuccess,
  onFail,
  onClose,
  handleTittlePattern
}: {
  mode?: 'create' | 'disable',
  savedPattern?: string,
  onSuccess?: (pattern: string) => void,
  onFail?: () => void,
  onClose?: () => void,
  handleTittlePattern: (title: any) => void
}) {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<'create' | 'confirm' | 'disable'>(mode === 'disable' ? 'disable' : 'create');
  const [pattern, setPattern] = useState<number[]>([]);
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [color, setColor] = useState<'default' | 'green' | 'red'>('default');
  const SINFO_KEY = 'APP_PATTERN_LOCK';
  useEffect(() => {
    if (color === 'green' || color === 'red') {
      const timer = setTimeout(() => {
        setColor('default');
        if (color === 'green') {
          if (onSuccess) onSuccess(firstPattern.join('-'));
          const patternStr = firstPattern.join('-');

          if (onClose) onClose();
        } else if (color === 'red') {
          if (onFail) onFail();
        }
        setPattern([]);
        if (step === 'confirm' || step === 'disable') setStep('create');
        handleTittlePattern('create');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [color]);

  const handleDotPress = (idx: number) => {
    if (pattern.includes(idx)) return;
    const newPattern = [...pattern, idx];
    setPattern(newPattern);
    setError('');
    // Auto-submit when pattern length >= 4
    if (newPattern.length >= 4) {
      setTimeout(() => handleDone(newPattern), 200); // slight delay for UI feedback
    }
  };

  const handleDone = (customPattern?: number[]) => {
    const currentPattern = customPattern || pattern;
    if (currentPattern.length < 4) {
      setError('Pattern must connect at least 4 dots');
      setColor('red');
      return;
    }
    if (step === 'create') {
      setFirstPattern(currentPattern);
      setPattern([]);
      setStep('confirm');
      handleTittlePattern('confirm');
    } else if (step === 'confirm') {
      if (firstPattern.join('-') === currentPattern.join('-')) {
        setColor('green');
      } else {
        setError('Patterns do not match');
        setColor('red');
        setFirstPattern([]);
        setStep('create');
         handleTittlePattern('create');
      }
    } else if (step === 'disable') {
      if (savedPattern === currentPattern.join('-')) {
        setColor('green');
      } else {
        setError('Pattern does not match');
        setColor('red');
      }
    }
  };

  // Dots positions
  const dots = Array.from({ length: 9 }, (_, i) => getDotPosition(i));
  // Lines between selected dots
  const lines = pattern.map((dotIdx, i) => {
    if (i === 0) return null;
    const from = dots[pattern[i - 1]];
    const to = dots[dotIdx];
    return (
      <Line
        key={i}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : '#3B82F6'}
        strokeWidth={8}
        strokeLinecap="round"
      />
    );
  });

  return (
    <SafeAreaView style={[commonStyles.flex1,commonStyles.screenBg]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
      
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.patternContainer}>
          <Svg width={width - GRID_PADDING * 2} height={width - GRID_PADDING * 2} style={StyleSheet.absoluteFill}>
            {lines}
          </Svg>
          {dots.map((pos, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dot,
                {
                  left: pos.x - DOT_SIZE / 2,
                  top: pos.y - DOT_SIZE / 2,
                  backgroundColor: pattern.includes(idx)
                    ? color === 'green'
                      ? '#22c55e'
                      : color === 'red'
                      ? '#ef4444'
                      : '#3B82F6'
                    : '#374151',
                  borderColor: pattern.includes(idx)
                    ? color === 'green'
                      ? '#22c55e'
                      : color === 'red'
                      ? '#ef4444'
                      : '#3B82F6'
                    : '#4B5563',
                },
              ]}
              onPress={() => handleDotPress(idx)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      </View>

      {/* Done button removed for auto-submit behavior */}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instruction: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  patternContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternGrid: {
    position: 'relative',
    width: width - GRID_PADDING * 2,
    height: width - GRID_PADDING * 2,
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 3,
  },
  dotSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
    transform: [{ scale: 1.1 }],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  continueButtonDisabled: {
    backgroundColor: '#374151',
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  continueTextDisabled: {
    color: '#6B7280',
  },
  patternInfo: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  patternInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  doneBtn: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, marginTop: 8, width: 120, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontWeight: 'bold' },
});
