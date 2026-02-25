import React, { ReactNode } from 'react';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';
import { s } from '../../constants/styels/scale';
import { useLngTranslation } from '../../hooks/languagesHook/useLngTranslation';
import Ionicons from '@expo/vector-icons/Ionicons';
import ErrorComponent from '../errorDisplay/errorDisplay';

interface CustomRBSheetProps {
  height?: 'Small' | 'Medium' | 'Large' | 'Extra Large';
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
  scrollEnabled?: boolean;
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
  openDuration = 300,
  closeDuration = 300,
  draggable = true,
  dragFromTopOnly = true,
  modeltitle = false,
  closeicon = false,
  scrollEnabled = true
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
          backgroundColor: 'rgba(0, 0, 0, 0.33)',
        },
        draggableIcon: {
          backgroundColor: NEW_COLOR.DRAGABLEICON,
          width: s(40),
          height: s(4)
        },
        container: {
          backgroundColor: NEW_COLOR.SHEET_BG,
          borderTopLeftRadius: s(20),
          borderTopRightRadius: s(20),
          ...customStyles?.container,
        },
      }}
      {...(scrollEnabled && {
        scrollViewProps: {
          contentContainerStyle: { flexGrow: 1 },
          bounces: false,
          showsVerticalScrollIndicator: true,
          keyboardShouldPersistTaps: 'always',
        }
      })}
    >
      <View
        style={[
          commonStyles.sheetbg,
          // This View should expand to fill the RBSheet's actual rendered height
          { flex: 1, minHeight: s(150) }, // minHeight can prevent collapse if content is very small
        ]}
      >
        {(modeltitle || closeicon) && <View
          style={[
            commonStyles.dflex,
            commonStyles.justifyContent,
            commonStyles.alignCenter,
            commonStyles.px18,
            commonStyles.py20,

          ]}
        >
          {modeltitle && title && <Text style={[commonStyles.pageTitle]}>{t(title)}</Text>}
          {closeicon && <TouchableOpacity onPress={onPressCloseIcon || handleClose}>
            <Ionicons name="close" size={s(25)} color={NEW_COLOR.TEXT_WHITE} />
          </TouchableOpacity>}
        </View>}
        <View style={commonStyles.mt20} />
        {errorMessage && (
          <View style={[commonStyles.px16, commonStyles.pt8, styles.errorContainer, commonStyles.pb10]}>
            <ErrorComponent
              message={errorMessage}
              onClose={onErrorClose || (() => { })}
            />
          </View>
        )}

        {scrollEnabled ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[commonStyles.px18, { flexGrow: 1, minHeight: s(50) }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, commonStyles.px18]}>
            {children}
          </View>
        )}
      </View>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    paddingVertical: s(8),
  }
});

export default CustomRBSheet;