import React from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { s } from '../../constants/theme/scale';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import ViewComponent from '../view/view';

type Props = {
  message: string;
  children?:any;
  onClose?: () => void;
  handleLink?:any;
  screen?: boolean;
};

const ErrorComponent: React.FC<Props> = ({ message, screen = false }) => {
const NEW_COLOR = useThemeColors();
const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
     <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6, screen ? commonStyles.pb14 : commonStyles.py14]}>
                   <AntDesign
                        name="closecircleo"
                        size={s(14)}
                        color={NEW_COLOR.TEXT_RED}
                        style={[commonStyles.mt2]}
                    />
      <ParagraphComponent style={[commonStyles.fs14,commonStyles.fw400,commonStyles.textRed,commonStyles.flex1]} text={message}/>
    </ViewComponent>
  );
};


export default ErrorComponent;