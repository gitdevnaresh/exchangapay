import React from "react";
import CustomRBSheet from "../../../../../../components/models/commonBottomSheet";
import ViewComponent from "../../../../../../components/view/view";
import TextMultiLanguage from "../../../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import ButtonComponent from "../../../../../../components/buttons/button";
import { s } from "../../../../../../constants/styels/scale";

interface DeleteConfirmSheetProps {
  refRBSheet: any;
  height?: any;
  onClose: () => void;
  onConfirm: () => void;
  commonStyles: any;
}

const DeleteConfirmSheet: React.FC<DeleteConfirmSheetProps> = ({
  refRBSheet,
  height = "Small",
  onClose,
  onConfirm,
  commonStyles
}) => (
  <CustomRBSheet
    refRBSheet={refRBSheet}
    height={height}
    modeltitle={false}
    closeicon={false}
  >
    <ViewComponent>
      <TextMultiLanguage text={"GLOBAL_CONSTANTS.ARE_YOU_WANT_TO_DELETE_THIS_ITEM"} style={[commonStyles.textWhite, commonStyles.fs20, commonStyles.fw600]} />
      <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mt30]}>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent solidBackground={true} title={"GLOBAL_CONSTANTS.NO"} onPress={onClose} />
        </ViewComponent>
        <ViewComponent style={[commonStyles.flex1]}>
          <ButtonComponent title={"GLOBAL_CONSTANTS.YES"} onPress={onConfirm} />
        </ViewComponent>
      </ViewComponent>
    </ViewComponent>
  </CustomRBSheet>
);

export default DeleteConfirmSheet;