import React, { FC, useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { NEW_COLOR } from '../constants/theme/variables';
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import ParagraphComponent from './Paragraph/Paragraph';
import { commonStyles } from './CommonStyles';
import { s } from '../constants/theme/scale';

type Props = {
  onPress: () => void;
  contentShow?: boolean;
  iconShow?: boolean;
};

const CopyCard: FC<Props> = ({ onPress, contentShow = true, iconShow = false }) => {
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const clearTimer = useRef(0);

  useEffect(() => {
    if (toolTipVisible) {
      clearTimer.current = setTimeout(() => {
        setToolTipVisible(false);
      }, 400);
    }
    return () => clearTimeout(clearTimer.current);
  }, [toolTipVisible]);

  const handleShowContent = () => {
    onPress();
    setToolTipVisible(true);
  };


  return (
    <>
      <View style={{ position: "relative" }}>
        {/* Drawn in place rather than through react-native-walkthrough-tooltip:
            that opens a Modal, a separate Android window, and the system shades
            the navigation bar for as long as it is up. */}
        {toolTipVisible && (
          <View pointerEvents="none" style={styles.copiedBubble}>
            <ParagraphComponent text='Copied' style={{ color: NEW_COLOR.TEXT_ALWAYS_WHITE }} />
          </View>
        )}
        <TouchableOpacity onPress={handleShowContent}
        >
          {contentShow && <View style={[styles.ml8, styles.copyBtn, { backgroundColor: toolTipVisible ? NEW_COLOR.BG_GREEN : NEW_COLOR.BG_ORANGE, }]}>

            <ParagraphComponent style={[commonStyles.fs12, commonStyles.mb4, commonStyles.fw600, styles.ml4, commonStyles.textAlwaysWhite]} text={'Copy'} />
            <View style={[styles.bgwhite]}>
              {!toolTipVisible ? (
                <Ionicons name='copy-outline' color={NEW_COLOR.TEXT_ORANGE} size={16} />
              ) : (
                <Feather name='check' color={NEW_COLOR.TEXT_ORANGE} size={16} />
              )}
            </View>
          </View>}
          {!contentShow && iconShow && <>
            {!toolTipVisible ? (
              <Ionicons name='copy-outline' color={NEW_COLOR.TEXT_ORANGE} size={16} />
            ) : (
              <Feather name='check' color={NEW_COLOR.TEXT_GREEN} size={16} />
            )}</>
          }


        </TouchableOpacity>
      </View>
    </>
  );
};
export default CopyCard;

const styles = StyleSheet.create({
  copiedBubble: { position: 'absolute', bottom: '100%', alignSelf: 'center', marginBottom: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: NEW_COLOR.SECTION_BG, zIndex: 10, elevation: 10 },
  copyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, minWidth: 90, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: s(10) },
  ml8: {
    marginLeft: 8,
  },
  ml4: {
    marginLeft: 4
  },
  bgwhite: {
    backgroundColor: NEW_COLOR.BACKGROUND_WHITE,
    padding: 4,
    borderRadius: 100
  }
});