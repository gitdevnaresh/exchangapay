import React from "react";
import ViewComponent from "../../../../newComponents/view/view";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { s } from "../../../../newComponents/theme/scale";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { Formik, FormikValues } from "formik";
import TextMultiLanguage from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import FormikTextInput from "../../../../newComponents/textInputComponents/formik/textInput";
import { addNickNameSchema } from "../../../addPayee/addNickName/addNickNameSchema";
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";

interface AddNicknameComponentProps {
  onSubmit: (values: FormikValues) => void;
  initialNickname?: string;
}

const AddNicknameComponent: React.FC<AddNicknameComponentProps> = ({
  onSubmit,
  initialNickname = ""
}) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  return (
    <>
      <TextMultiLanguage
        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.TITLE_GREY, commonStyles.mb16]}
        text={"GLOBAL_CONSTANTS.ADD_A_UNIQUE_NICKNAME"}
      />
      <Formik
        initialValues={{ nickname: initialNickname }}
        validationSchema={addNickNameSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ handleSubmit,values, errors}) => (
          <>
            <FormikTextInput
              name="nickname"
              placeholder={"GLOBAL_CONSTANTS.ENTER_NICKNAME"}
              placeholderTextColor={NEW_COLOR.TEXT_GREY}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              multiline={false}
              maxLength={30}
              numberOfLines={1}
              containerStyle={{ marginBottom: s(16) }}
              custInput={[
                {
                  backgroundColor: NEW_COLOR.BANNER_BG,
                  color: NEW_COLOR.TEXT_WHITE,
                },
                commonStyles.px16,
                commonStyles.py12,
                commonStyles.rounded8,
                commonStyles.fs16,
                commonStyles.fw400,
              ]}
            />
            <ViewComponent style={{ flex: 1 }} />
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.CONTINUE"}
              onPress={handleSubmit}
              disable={values.nickname === "" || !!errors.nickname}
            />
          </>
        )}
      </Formik>
    </>
  );
};

export default AddNicknameComponent;