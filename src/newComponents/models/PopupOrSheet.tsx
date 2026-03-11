import React, { ReactNode, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Modal, StyleSheet } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import RBSheet from 'react-native-raw-bottom-sheet';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../hooks/useLngTranslation';
import { useThemeColors } from '../../hooks/useThemeColors';
import { s } from '../theme/scale';
import ViewComponent from '../view/view';
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import ErrorComponent from '../errorDisplay/errorDisplay';


export interface PopupOrSheetRef {
  open: () => void;
  close: () => void;
}

interface PopupOrSheetProps {
  children: ReactNode;
  title?: string;
  displayType?: 'modal' | 'bottom-sheet'; // Made optional with default

  showCloseIcon?: boolean;
  onClose?: () => void;
  onOpen?: () => void;

  // Common height props
  height?: number;
  customStyles?: any;
  titleStyle?: object;

  // RBSheet specific props
  closeOnPressMask?: boolean;
  closeOnDragDown?: boolean;
  draggable?: boolean;
  dragFromTopOnly?: boolean;
  errorMessage?: string;
  onErrorClose?: () => void;
  showCloseIconAndTittle?:boolean;
}

const PopupOrSheet = forwardRef<PopupOrSheetRef, PopupOrSheetProps>(({
  children,
  title,
  displayType = 'bottom-sheet', // Default to bottom-sheet
  showCloseIcon = true,
  onClose,
  onOpen,
  // Common props
  height = s(300), // Common default height
  customStyles = {},
  titleStyle = {},
  // RBSheet props
  closeOnPressMask = true,
  closeOnDragDown = true,
  draggable = true,
  dragFromTopOnly = true,
  showCloseIconAndTittle=true,
  errorMessage,
  onErrorClose,
}, ref) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const rbSheetRef = useRef<RBSheet>(null);
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const commonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

  

  useImperativeHandle(ref, () => ({
    open: () => {
      if (displayType === 'modal') {
        setIsModalVisible(true);
      } else {
        rbSheetRef.current?.open();
      }
      onOpen?.();
    },
    close: () => {
      if (displayType === 'modal') {
        setIsModalVisible(false);
        onClose?.();
      } else {
        rbSheetRef.current?.close();
      }
    },
  }));

  const handleModalClose = () => {
    setIsModalVisible(false);
    onClose?.();
  }

  if (displayType === 'modal') {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleModalClose}
      >
        <ViewComponent style={[commonStyles.flex1, {justifyContent: 'center', alignItems: 'center',backgroundColor: 'rgba(0, 0, 0, 0.49)' }]}>
          <ViewComponent
            style={[
              commonStyles.sheetbg,
              {
                width: '90%',
                height: s(height),
                borderRadius: s(24),
                padding: s(20),
                ...customStyles
              }]
            }
          >
            {title && <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
              <ParagraphComponent
                text={t(title)}
               style={[commonStyles.textWhite,commonStyles.fw700,commonStyles.fs18, {...titleStyle }]}
              />
              {showCloseIcon && (
                <CommonTouchableOpacity onPress={handleModalClose} style={{ position: 'absolute', top: 0, right: 0 }}>
                  <AntDesign name="close" size={s(22)} color={REVERSE_NEW_COLOR.TEXT_WHITE} />
                </CommonTouchableOpacity>
              )}
            </ViewComponent>}

            <ViewComponent style={[commonStyles.mt20,{ flex: 1, justifyContent: 'center' },]}>
              {children}
            </ViewComponent>
          </ViewComponent>
        </ViewComponent>
      </Modal>
    );
  }

  return (
    <RBSheet
      ref={rbSheetRef}
      height={height}
      onClose={onClose}
      animationType="slide"
      closeOnDragDown={closeOnDragDown}
      closeOnPressMask={closeOnPressMask}
      openDuration={300}
      closeDuration={300}
      dragFromTopOnly={dragFromTopOnly}
      draggable={draggable}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0, 0, 0, 0.49)',
        },
        draggableIcon: {
          backgroundColor: draggable ? REVERSE_NEW_COLOR.DRAGABLEICON : 'transparent',
          width: s(50),
          height: draggable ? s(6) : 0,
          borderRadius: s(100),
          alignSelf: 'center',
          marginTop: s(16),
          marginBottom: s(16),
        },
        container: {
          backgroundColor: REVERSE_NEW_COLOR.TEXT_BLACK,   
          borderTopLeftRadius: s(20),
          borderTopRightRadius: s(20),
          paddingTop: draggable ? 0 : s(16),
          paddingBottom: 0,
          ...customStyles?.container,
        },
      }}
    >
      <ViewComponent style={[{ 
          flex: 1, 
          borderTopLeftRadius: s(20), 
          borderTopRightRadius: s(20), 
          paddingBottom: 0,
          paddingTop: draggable ? 0 : s(8)
        }, commonStyles.sheetbg]}>
       {showCloseIconAndTittle &&(<ViewComponent style={[
          commonStyles.dflex, 
          commonStyles.alignCenter, 
          commonStyles.px18,
          commonStyles.mb16,
          { justifyContent: title ? 'space-between' : 'flex-end' }
        ]}>
          {title&&( <TextMultiLanguage style={[commonStyles.pageTitle]} text={title} />)}
          {showCloseIcon && (
            <CommonTouchableOpacity onPress={() => rbSheetRef.current?.close()}>
              <Ionicons name="close" size={s(25)} color={REVERSE_NEW_COLOR.TEXT_WHITE} />
            </CommonTouchableOpacity>
          )}
        </ViewComponent>)}
        {errorMessage && (
          <ViewComponent style={[commonStyles.px16, commonStyles.pt8, styles.errorContainer, commonStyles.pb10]}>
            <ErrorComponent
              message={errorMessage}
              onClose={onErrorClose || (() => { })}
            />
          </ViewComponent>
        )}
        <ViewComponent style={[commonStyles.px24, { flex: 1, paddingBottom: 0 }]}>
          {children}
        </ViewComponent>
      </ViewComponent>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  errorContainer: {
    paddingVertical: s(8),
  }
});

export default PopupOrSheet;