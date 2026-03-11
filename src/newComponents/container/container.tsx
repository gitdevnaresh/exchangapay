import React from 'react';
import { View, ViewStyle } from 'react-native';
import useLayout from '../../hooks/useLayout';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';

interface ContainerProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  useSafeArea?: boolean;
  transparentBg?: boolean;
}

const Container: React.FC<ContainerProps> = ({ children, style, useSafeArea = true, transparentBg = false }) => {
  const { top, bottom } = useLayout();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <View
      style={[
        { flex: 1 }, transparentBg ? commonStyles.containerBgTransparent : commonStyles.container,
        // useSafeArea && { paddingTop: top, paddingBottom: bottom },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default Container;
