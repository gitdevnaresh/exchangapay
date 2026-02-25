import React from "react";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { TextInput } from "react-native";
import ViewComponent from "../../../../components/view/view";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import LabelComponent from "../../../../components/textComponets/lableComponent/lable";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
interface VerificationPopupProps {
  code?: string;
  onChangeText?: (text: string) => void;
  error?: string;
}

const VerificationPopup = ({ code, onChangeText, error }: VerificationPopupProps) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  return (
    <>
      <LabelComponent
        style={[commonStyles.inputLabel, commonStyles.mb10]}
        text={"GLOBAL_CONSTANTS.ENTER_YOUR_ONE_TIME_CODE"}
        children={<LabelComponent text={" *"} style={[commonStyles.textRed]} />}
      />
      <ViewComponent style={[commonStyles.textInput]}>
        <TextInput
          style={[commonStyles.fs14, commonStyles.fw400, commonStyles.mt16, commonStyles.textWhite]}
          value={code}
          onChangeText={onChangeText}
          placeholder={"Enter your one-time code"}
          placeholderTextColor={NEW_COLOR.PLACEHOLDER_TEXTCOLOR}
          keyboardType="numeric"
          maxLength={6}
        />

      </ViewComponent>
      {error && (
        <ParagraphComponent
          style={[
            commonStyles.fs12,
            commonStyles.fw400,
            commonStyles.textError,
            { marginTop: 4 }
          ]}
          text={error}




        />
      )}
    </>
  );
};

export default VerificationPopup;
