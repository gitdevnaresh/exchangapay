import React, { ReactNode } from 'react';
import { Modal, View, TouchableOpacity, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { s } from '../theme/scale';
import Container from '../container/container';
import ViewComponent from '../view/view';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';


interface ReusableModalProps {
  visible: boolean;
  togglePopup: () => void;
  title: string;
  children: ReactNode;
  showCloseIcon?: boolean;
  modalHeight?: number;
  modalStyles?: object;
  titleStyle?: object;
}

const CommonModal: React.FC<ReusableModalProps> = ({
  visible,
  togglePopup,
  title,
  children,
  showCloseIcon = true,
  modalStyles = {},
  titleStyle = {},
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
     <ViewComponent style={[]}>
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={showCloseIcon ? togglePopup : () => {}}
      style={modalStyles}
    >
          <Container>

      <View style={[commonStyles.screenBg,commonStyles.flex1]}>
        <View style={[commonStyles.dflex,commonStyles.justifyContent,  Platform.OS === 'ios' ? commonStyles.mt40:commonStyles.mt10 ]}>
          <TextMultiLanguage
            text={title}
            style={titleStyle}
          />
          {showCloseIcon && (
            <TouchableOpacity onPress={togglePopup} >
              <AntDesign name="close" size={s(22)} color={NEW_COLOR.TEXT_WHITE} />
            </TouchableOpacity>
          )}
        </View>

        <View style={[commonStyles.flex1]}>
          {children}
        </View>
      </View>
          </Container>

    </Modal>
    </ViewComponent>
  );
};

export default CommonModal;
