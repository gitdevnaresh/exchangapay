import React, { forwardRef } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';

interface ScrollViewComponentProps extends ScrollViewProps {
  children: React.ReactNode;
  style?: any;
  refreshing?: boolean; 
  onRefresh?: () => void;
}
const NEW_COLOR = useThemeColors();
const ScrollViewComponent = forwardRef<ScrollView, ScrollViewComponentProps>(
  ({ style, children, refreshing = false, onRefresh, showsVerticalScrollIndicator = false, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        style={[style]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh && (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={NEW_COLOR.BUTTON_BG}
            />
          )
        }
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
);

export default ScrollViewComponent;
