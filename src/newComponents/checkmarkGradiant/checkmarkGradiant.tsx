import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import { useThemeColors } from '../../hooks/useThemeColors';
import { s } from '../../constants/theme/scale';

interface GradientCheckmarkIconProps {
  size?: number;
  iconSize?: number;
  containerStyle?: object; 
}

const GradientCheckmarkIcon: React.FC<GradientCheckmarkIconProps> = ({
  size = s(18),
  iconSize = s(14),
  containerStyle,
}) => {
  const NEW_COLOR = useThemeColors();

  return (
    <LinearGradient
      colors={['#11998e', '#38ef7d']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        containerStyle, 
      ]}
    >
      <Entypo name="check" size={iconSize} color={NEW_COLOR.TEXT_ALWAYS_BLACK} />
    </LinearGradient>
  );
};

export default GradientCheckmarkIcon;
