import React from "react";
import { View, StyleSheet } from "react-native";
import CircularProgressBar from "./progressCircle";
import { s } from "../../constants/styels/scale";
import { useLngTranslation } from "../../hooks/languagesHook/useLngTranslation";
import { useThemeColors } from "../../hooks/themedHook/useThemeColors";
import { getStatusColor, getThemedCommonStyles } from "../CommonStyles";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";

interface ProgressHeaderProps {
  progress?: number;
  total?: number;
  NextTitle?: string;
  title?: string;
  status?: string;
  showBadge?: boolean;
}

const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  progress,
  total,
  NextTitle,
  title,
  status,
  showBadge = false,
}) => {
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const statusColor = getStatusColor(NEW_COLOR);
  return (
    <View style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.gap12, commonStyles.sectionGap]}>
      <CircularProgressBar progress={progress} total={total} size={s(80)} strokeWidth={s(5)} />
      <View>
        <ParagraphComponent style={[commonStyles.fs20, commonStyles.fw600, commonStyles.textRight, commonStyles.textWhite, commonStyles.mb2]} text={t(title)} />
        {NextTitle && <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textlinkgrey, commonStyles.textRight]} text={`${t("GLOBAL_CONSTANTS.NEXT")} : ${t(NextTitle)}`} />}
        {(showBadge && status) && <View><ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, commonStyles.textWhite, commonStyles.textRight]} text={status} /></View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

});

export default ProgressHeader;

