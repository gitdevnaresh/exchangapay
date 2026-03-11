declare module 'react-native-raw-bottom-sheet' {
  import React from 'react';
  import { ScrollViewProps, ViewStyle } from 'react-native';

  interface RBSheetProps {
    height?: number;
    width?: number | string;
    onClose?: () => void;
    onOpen?: () => void;
    animationType?: 'none' | 'fade' | 'slide';
    closeOnDragDown?: boolean;
    closeOnPressMask?: boolean;
    closeOnPressBack?: boolean;
    openDuration?: number;
    closeDuration?: number;
    dragFromTopOnly?: boolean;
    draggable?: boolean;
    customStyles?: {
      wrapper?: ViewStyle;
      draggableIcon?: ViewStyle;
      container?: ViewStyle;
    };
    scrollViewProps?: ScrollViewProps;
    children?: React.ReactNode;
  }

  class RBSheet extends React.Component<RBSheetProps> {
    open(): void;
    close(): void;
  }

  export default RBSheet;
}