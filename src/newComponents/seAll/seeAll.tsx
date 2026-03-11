import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { useLngTranslation } from "../../hooks/useLngTranslation";
import CommonTouchableOpacity from '../touchableComponents/touchableOpacity';
import ParagraphComponent from '../textComponets/paragraphText/paragraph';
import { commonStyles } from '../theme/commonStyles';

interface SeeAllProps {
  text?: string;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  numberOfLines?: number;
 onPress?: () => void;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}
const SeeAll: React.FC<SeeAllProps> = ({
  text,
  style,
  children,
  numberOfLines,
  onPress,
  ellipsizeMode,
}: SeeAllProps) => {
  const { t } = useLngTranslation();
  const displayText = text ?? t("GLOBAL_CONSTANTS.SEE_ALL");

  return (
    <CommonTouchableOpacity onPress={onPress}>
   <ParagraphComponent style={[commonStyles.textBlue, style]} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode} text={displayText}>
        {children}
      </ParagraphComponent>

    </CommonTouchableOpacity>
  );
};

export default SeeAll;
