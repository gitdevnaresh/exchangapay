import React, { ReactNode } from 'react';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';
import ErrorComponent from '../errorDisplay/errorDisplay';
import { s } from '../../constants/styels/scale';


interface CustomRBSheetProps {
  height?: number | 'Small' | 'Medium' | 'Large' | 'Extra Large';
  width?: number | string;
  children: ReactNode;
  title?: string;
  onClose?: () => void;
  onPressCloseIcon?: () => void;
  customStyles?: any;
  closeOnPressMask?: boolean;
  refRBSheet?: React.RefObject<RBSheet>;
  errorMessage?: string;
  onErrorClose?: () => void;
  closeOnDragDown?: boolean;
  openDuration?: number;
  closeDuration?: number;
  dragFromTopOnly?: boolean;
  draggable?: boolean;
  modeltitle?: boolean;
  closeicon?: boolean;
}

const CustomRBSheet: React.FC<CustomRBSheetProps> = ({
  height,
  width = '100%',
  children,
  title,
  onClose,
  onPressCloseIcon,
  customStyles,
  closeOnPressMask = true,
  refRBSheet,
  errorMessage,
  onErrorClose,
  closeOnDragDown = true,
  openDuration = 500,
  closeDuration = 400,
  draggable = true,
  dragFromTopOnly = true,
  modeltitle = false,
  closeicon = false
}) => {
  const { t } = useLngTranslation();
  const { height: screenHeight } = Dimensions.get('window');

  const getSheetHeight = () => {
    if (typeof height === 'number') return height;
    switch (height) {
      case 'Small': return screenHeight * 0.3;
      case 'Medium': return screenHeight * 0.5;
      case 'Large': return screenHeight * 0.7;
      case 'Extra Large': return screenHeight * 1.0;
      default: return screenHeight * 0.5;
    }
  };
  const sheetHeight = getSheetHeight();

  const handleClose = () => {
    refRBSheet?.current?.close();
  };
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <RBSheet
      ref={refRBSheet}
      height={sheetHeight}
      width={width}
      onClose={onClose} // Pass the onClose prop to the RBSheet component
      animationType="slide" // Explicitly set to ensure slide from bottom animation
      closeOnDragDown={closeOnDragDown}
      closeOnPressMask={closeOnPressMask}
      openDuration={openDuration}
      closeDuration={closeDuration}
      dragFromTopOnly={dragFromTopOnly}
      draggable={draggable}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0, 0, 0, 0.49)',
        },
        draggableIcon: {
          backgroundColor: '#5D5A5D',
          width: 40,
          height: 4
        },
        container: {
          backgroundColor: NEW_COLOR.SHEET_BG,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: sheetHeight,
          ...customStyles?.container,
        },
      }}
      scrollViewProps={{
        contentContainerStyle: { flexGrow: 1 },
        bounces: false,
        showsVerticalScrollIndicator: true,
      }}
    >
      <View
        style={[
          commonStyles.sheetbg,
          { minHeight: 150, height: sheetHeight },
        ]}
      >
        {(modeltitle || closeicon) && <View
          style={[
            commonStyles.dflex,
            commonStyles.justifyContent,
            commonStyles.alignCenter,

            commonStyles.sheetHeaderbg,
            commonStyles.px18,
            commonStyles.py20,

          ]}
        >
          {modeltitle && <Text style={[commonStyles.pageTitle]}>{t(title)}</Text>}
          {closeicon && <TouchableOpacity onPress={onPressCloseIcon || handleClose}>
            <Ionicons name="close" size={25} color={NEW_COLOR.TEXT_WHITE} />
          </TouchableOpacity>}
        </View>}
        <View style={commonStyles.mt20} />
        {errorMessage && (
          <View style={[commonStyles.px16, commonStyles.pt8, styles.errorContainer, commonStyles.pb10]}>
            <ErrorComponent
              message={errorMessage}
              onClose={onErrorClose}
            />
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[commonStyles.px18, { flexGrow: 1, minHeight: 50 }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  // padding: {
  //   paddingBottom: 20,
  // },
  // header: {
  //   paddingVertical: s(10),
  // },
  errorContainer: {
    paddingVertical: s(8),
  }
});

export default CustomRBSheet;
