import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { s } from '../../constants/styels/scale';
import { useThemeColors } from '../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../CommonStyles';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import ViewComponent from '../view/view';

type Props = {
  onPress: () => void;
  size?: number;
  copyIconColor?: string;
};

type CopyCardRef = {
  triggerCopy: () => void;
};

const CopyCard = forwardRef<CopyCardRef, Props>(
  ({ onPress, size, copyIconColor }, ref) => {
    const [toolTipVisible, setToolTipVisible] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const COLORS = useThemeColors();
    const commonStyles = getThemedCommonStyles(COLORS);

    useImperativeHandle(ref, () => ({
      triggerCopy: () => setToolTipVisible(true),
    }));

    useEffect(() => {
      if (toolTipVisible) {
        timerRef.current = setTimeout(() => {
          setToolTipVisible(false);
        }, 2000);
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [toolTipVisible]);

    return (
      // 👇 IMPORTANT: prevent clipping on tablet
      <ViewComponent style={styles.wrapper}>
        <TouchableOpacity
          onPress={() => {
            onPress();
            setToolTipVisible(true);
          }}
          style={[
            styles.iconContainer,
            {
              width: size ?? s(40),
              height: size ?? s(40),
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="copy-outline"
            size={size ?? s(20)}
            color={copyIconColor ?? COLORS.LINKPRIMARY_COLOR}
          />
        </TouchableOpacity>

        {toolTipVisible && (
          <ViewComponent
            style={[
              styles.tooltip,
              commonStyles.copytooltip,
              commonStyles.px10,
              commonStyles.py8,
            ]}
          >
            <MaterialCommunityIcons
              name="check"
              size={s(16)}
              color={COLORS.TEXT_GREEN}
              style={{ marginRight: s(4) }}
            />
            <TextMultiLanguage
              text="GLOBAL_CONSTANTS.COPIED"
              style={[
                commonStyles.fs12,
                commonStyles.fw400,
                commonStyles.textWhite,
              ]}
            />
          </ViewComponent>
        )}
      </ViewComponent>
    );
  }
);

export default CopyCard;
const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible', // 🔥 CRITICAL
    alignSelf: 'flex-start',
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  tooltip: {
    position: 'absolute',
    top: -s(36),      // ✅ safe for tablet
    right: 0,         // ✅ no negative values
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: s(110),
    borderRadius: s(6),

    zIndex: 999,      // iOS
    elevation: 10,    // Android
  },
});
