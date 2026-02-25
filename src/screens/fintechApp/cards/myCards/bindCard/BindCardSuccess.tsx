import React from "react";
import ViewComponent from '../../../../../components/view/view';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import CommonSuccess from '../../../../commonScreens/successPage/commonSucces';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';

interface BindCardSuccessProps {
  cardName?: string;
  onDone: () => void;
  ref?: any;
}

const BindCardSuccess: React.FC<BindCardSuccessProps> = React.memo((props) => {
  const { onDone } = props;
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  const handleDoneAction = () => {
    if (onDone) {
      onDone();
    }
  };

  return (
    <ViewComponent>
      <CommonSuccess
        successMessage={"GLOBAL_CONSTANTS.CARD_REQUESTED_SUCCESSFULLY"} // You'll need to add this translation key
        buttonText={"GLOBAL_CONSTANTS.DONE"}
        buttonAction={handleDoneAction}
        amountIsDisplay={false}
        isCardTopUp={false} // Indicates this is not a top-up success screen
      />
      <ViewComponent style={[commonStyles.mb40]} />
    </ViewComponent>
  );
});

export default BindCardSuccess;