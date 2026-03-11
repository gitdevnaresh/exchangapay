import React from 'react';
import { View } from 'react-native';

interface ViewProps {
  style?: any;
  children?: React.ReactNode;
}

const ViewComponent: React.FC<ViewProps> = ({ style,children }) => {
  return (
    <View style={[style]}>
      {children}
    </View>
  );
};

export default ViewComponent;
