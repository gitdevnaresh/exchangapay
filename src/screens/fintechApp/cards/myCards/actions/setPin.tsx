import React from "react";
import { TextInput, View } from "react-native";
import ViewComponent from "../../../../../components/view/view";
import TextMultiLangauge from "../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../components/buttons/button";
import { useThemeColors } from "../../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../../components/CommonStyles";

interface CardActionsSheetSetPinProps {
  pin: string[];
  pinInputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handlePinChange: (value: string, index: number) => void;
  buttonLoader: boolean;
  rbSheetErrorMsg: string;
  handleRbSheetErrorMsgClose: () => void;
  onSetPinConfirm: () => void;
}
const CardActionsSheetSetPin: React.FC<CardActionsSheetSetPinProps> = ({
  pin,
  pinInputRefs,
  handlePinChange,
  buttonLoader,
  rbSheetErrorMsg,
  handleRbSheetErrorMsgClose,
  onSetPinConfirm,
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <ViewComponent style={[commonStyles.p16]}>
      {rbSheetErrorMsg !== "" && (
        <ViewComponent style={[commonStyles.mb8]}>
          <TextMultiLangauge
            text={rbSheetErrorMsg}
            style={[commonStyles.textError, commonStyles.fs12]}
          />
          <ButtonComponent
            title="Close"
            onPress={handleRbSheetErrorMsgClose}
            style={[commonStyles.mt8]}
          />
        </ViewComponent>
      )}
      <ViewComponent style={[commonStyles.mt16]}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>
          {Array.from({ length: 4 }, (_, i) => i).map((pinPosition) => (
            <TextInput
              key={`pin-input-${pinPosition}`}
              ref={(ref) => (pinInputRefs.current[pinPosition] = ref)}
              value={pin[pinPosition]}
              onChangeText={(value) => handlePinChange(value, pinPosition)}
              maxLength={1}
              keyboardType="decimal-pad"
              autoCapitalize="words"
              style={[
                commonStyles.sectionBorder,
                commonStyles.rounded5,
                { width: 54, height: 54 },
                commonStyles.fs24,
                commonStyles.fw500,
                commonStyles.textWhite,
                commonStyles.textCenter,
              ]}
            />
          ))}
        </View>
      </ViewComponent>
      <ViewComponent style={[commonStyles.sectionGap]} />
      <ButtonComponent
        title={"GLOBAL_CONSTANTS.CONFIRM"}
        loading={buttonLoader}
        onPress={onSetPinConfirm}
      />
    </ViewComponent>
  );
};

export default CardActionsSheetSetPin;