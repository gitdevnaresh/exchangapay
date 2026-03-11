import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface TopUpIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const TopUpIcon: React.FC<TopUpIconProps> = ({ 
  width = 24, 
  height = 24, 
  color = '#ffffff' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L12 22M12 2L8 6M12 2L16 6M7 12H17M7 12L3 8M7 12L3 16M17 12L21 8M17 12L21 16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default TopUpIcon;