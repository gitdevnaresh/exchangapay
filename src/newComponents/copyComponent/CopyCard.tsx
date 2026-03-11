import React, { FC, useState, useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import { s } from '../theme/scale';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import ViewComponent from '../view/view';
import ImageUri from '../imageComponents/image';
import { COMMON_SVG_URLS } from '../../assets/blobUrls';

type Props = {
  onPress: () => void;
  size?: number;
  copyIconColor?: string;
};

const CopyCard: FC<Props> = ({ onPress, size, copyIconColor }) => {
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const clearTimer = useRef<NodeJS.Timeout>();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  useEffect(() => {
    if (toolTipVisible) {
      const timer = setTimeout(() => {
        setToolTipVisible(false);
      }, 2000);
      clearTimer.current = timer;
    }
    return () => {
      if (clearTimer.current) {
        clearTimeout(clearTimer.current);
      }
    };
  }, [toolTipVisible]);

  return (
    <ViewComponent>
      <TouchableOpacity
        onPress={() => {
          onPress();
          setToolTipVisible(true);
        }}
        style={{
          width: size ?? s(40),
          height: size ?? s(20),
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ImageUri uri={COMMON_SVG_URLS.copyIcon}/>
      </TouchableOpacity>
      
      {toolTipVisible && (
        <ViewComponent style={{
          position: 'absolute',
          top: s(-40),
          left: s(-50),
          width: s(100),
          backgroundColor: NEW_COLOR.TEXT_BLACK,
          borderRadius: s(6),
          paddingHorizontal: s(12),
          paddingVertical: s(8),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: s(80),
          zIndex: 1000,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: s(0), height: s(2) },
          shadowOpacity: 0.25,
          shadowRadius: 3.84
        }}>
          <MaterialCommunityIcons
            name="check"
            size={s(12)}
            color={NEW_COLOR.TEXT_GREEN}
            style={{marginRight: s(4)}}
          />
          <TextMultiLanguage
            text="GLOBAL_CONSTANTS.COPIED"
            style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textWhite, {flexShrink: 0}]}
          />
        </ViewComponent>
      )}
    </ViewComponent>
  );
};

export default CopyCard;