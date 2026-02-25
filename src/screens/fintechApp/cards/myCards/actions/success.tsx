import React from "react";
import { useLngTranslation } from '../../../../../hooks/languagesHook/useLngTranslation';
import ViewComponent from '../../../../../components/view/view';
import { getThemedCommonStyles } from '../../../../../components/CommonStyles';
import CommonSuccess from '../../../../commonScreens/successPage/commonSucces';
import { useThemeColors } from '../../../../../hooks/themedHook/useThemeColors';
import { useSelector } from "react-redux";
interface CardActionsSheetSuccessProps {
  navigation: any;
  amount?: string | number;
  currency?: string;
  cardName?: string;
  onDone: () => void;
  isWithdraw?: boolean;
}

const CardActionsSheetSuccess: React.FC<CardActionsSheetSuccessProps> = React.memo((props) => {
  const {
    amount,
    currency,
    cardName,
    navigation,
    onDone,
    isWithdraw = false,
  } = props;
  const { t } = useLngTranslation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const handleDoneAction = () => {
    if (onDone) {
      onDone();
    }
  };
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
  return (
    <ViewComponent>
      <CommonSuccess
        navigation={navigation}
        successMessage={isWithdraw ? "GLOBAL_CONSTANTS.WITHDRAW_SUCCESSFUL" : "GLOBAL_CONSTANTS.TRANSFER_SUCCESSFULLY"}
        subtitle={isWithdraw ? `${t("GLOBAL_CONSTANTS.YOUR")} ${cardName} ${t("GLOBAL_CONSTANTS.WITHDRAW_SUCCESS_MSG")}` : `${t("GLOBAL_CONSTANTS.TOPPED_UP_MSG")}`}
        buttonText={"GLOBAL_CONSTANTS.DONE"}
        buttonAction={handleDoneAction}
        amount={amount?.toString()}
        prifix={currency}
        cardName={cardName}
        isCardTopUp={!isWithdraw}
      />
      <ViewComponent style={[commonStyles.mb40]} />
    </ViewComponent>
  );
});

export default CardActionsSheetSuccess;