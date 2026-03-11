import React from 'react';
import { TouchableOpacity } from 'react-native';

interface CommonTouchableOpacityProps {
    onPress?: () => void; 
    style?: any; 
    disabled?: boolean; 
    children?: React.ReactNode; 
    activeOpacity?: number; 
}

const CommonTouchableOpacity: React.FC<CommonTouchableOpacityProps> = ({
    onPress,
    style = {},
    disabled = false,
    children,
    activeOpacity = 0.7,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[style, disabled && { opacity: 0.6 }]}
            disabled={disabled}
            activeOpacity={activeOpacity}
        >
            {children}
        </TouchableOpacity>
    );
};


export default CommonTouchableOpacity;
