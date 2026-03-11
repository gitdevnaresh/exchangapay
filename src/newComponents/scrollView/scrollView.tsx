import React, { forwardRef } from 'react';
import { ScrollView, RefreshControl, ScrollViewProps } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ScrollViewComponentProps extends ScrollViewProps {
  children: React.ReactNode;
  style?: any;
  refreshing?: boolean; 
  onRefresh?: () => void;
}

const ScrollViewComponent = forwardRef<ScrollView, ScrollViewComponentProps>(
  ({ style, children, refreshing = false, onRefresh, showsVerticalScrollIndicator = false, ...props }, ref) => {
    const NEW_COLOR = useThemeColors();
    return (
      <ScrollView
        ref={ref}
        style={[style]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={
          onRefresh && (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={NEW_COLOR.BG_YELLOW}
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
