import React, { FC, useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
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

  const handleToolTip = () => {
    setToolTipVisible(false)
  };

  const handleShowContent = () => {
    onPress();
    setToolTipVisible(true);
  };


  return (
    <>
      <View style={{ position: "relative" }}>
        <Tooltip
          tooltipStyle={{}}
          backgroundColor='transparent'
          isVisible={toolTipVisible}
          contentStyle={{ backgroundColor: NEW_COLOR.SECTION_BG, position: "absolute", top: 100 }}
          onClose={handleToolTip}
          content={<><ParagraphComponent text='Copied' style={{ color: NEW_COLOR.TEXT_ALWAYS_WHITE }} /></>}
        >

        </Tooltip>
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