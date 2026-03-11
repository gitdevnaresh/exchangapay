declare module 'react-native-wheel-picker' {
  import * as React from 'react';
  import { ViewStyle } from 'react-native';

  export interface WheelPickerProps {
    style?: ViewStyle;
    selectedItem: number;
    data: string[];
    onItemSelected: (index: number) => void;
  }

  export default class WheelPicker extends React.Component<WheelPickerProps> {
    static Item: React.ComponentType<any>;
  }
} 