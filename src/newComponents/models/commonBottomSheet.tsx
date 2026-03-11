import React, { ReactNode } from 'react';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useThemeColors } from '../../hooks/useThemeColors';
import { s } from '../theme/scale';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import ErrorComponent from '../errorDisplay/errorDisplay';

interface CustomRBSheetProps {
  height?: number;
  width?: number | string;
  children: ReactNode;
  title: string;
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
  modeltitle?:boolean;
  closeicon?:boolean;
  containerStyle?: any; // Optional style for the container
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
  draggable=true,
  dragFromTopOnly= true,
  modeltitle=false,
  closeicon=false,
  containerStyle,
}) => {
  const { t } = useLngTranslation();
  const { height: screenHeight } = Dimensions.get('window');
  // Use a larger default maxHeight if no height prop is passed.
  // This primarily affects other uses of CustomRBSheet, not SignatureDrawer which passes s(400).
  const maxHeight = screenHeight * 0.8; 
  const sheetHeight = height ?? maxHeight;

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
          height: sheetHeight, // Use height directly for the container
          // maxHeight: sheetHeight, // Can be a fallback if direct height causes issues
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
          // This View should expand to fill the RBSheet's actual rendered height
          { flex: 1, minHeight: s(150) }, // minHeight can prevent collapse if content is very small
          containerStyle,
        ]}
      >
        {(modeltitle||closeicon)&&<View
          style={[
            commonStyles.dflex,
            commonStyles.justifyContent,
            commonStyles.alignCenter,
            commonStyles.px18,
            commonStyles.py20,
            
          ]}
        >
        { modeltitle &&  <Text style={[commonStyles.pageTitle]}>{t(title)}</Text>}
         {closeicon && <TouchableOpacity onPress={onPressCloseIcon || handleClose}>
            <Ionicons name="close" size={25} color={NEW_COLOR.TEXT_WHITE} />
          </TouchableOpacity>}
        </View>}
        <View style={commonStyles.mt20}/>
        {errorMessage && (
          <View style={[commonStyles.px16, commonStyles.pt8, styles.errorContainer,commonStyles.pb10]}>
            <ErrorComponent
              message={errorMessage}
              onClose={onErrorClose || (() => {})}
            />
          </View>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[commonStyles.px18,  { flexGrow: 1, minHeight: 50 }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
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