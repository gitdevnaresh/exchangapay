import React from "react";
import ViewComponent from "../../../../components/view/view";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ActionButton from "../../../../components/gradianttext/gradiantbg";
import WithdrawIcon from "../../../../components/svgIcons/mainmenuicons/dashboardwithdraw";
import DeposistIcon from "../../../../components/svgIcons/mainmenuicons/dashboarddeposist";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";


interface CommonStyles {
    // Define specific style properties, e.g., dflex: object, justifyContent: object, etc.
    // Replace with actual style definitions
    [key: string]: string;
}

interface Configuration {
    QUCIKLINKS?: {
        Deposit?: boolean;
        Withdraw?: boolean;
    };
    // Add other properties of Configuration
}

interface NewColor {
    TEXT_ALWAYS_BLACK: string;
    TEXT_WHITE: string;
    BUTTON_TEXT: string;
    // Add other color properties
}
interface QuickActionButtonsProps {
    Configuration: Configuration;
    handleSellNavigateDeposit: () => void;
    handleWithdrawPress: () => void;
    withdrawButtonLoader: boolean;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ Configuration, handleSellNavigateDeposit, handleWithdrawPress, withdrawButtonLoader }) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    return (
        <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap10, commonStyles.sectionGap]}>
            {Configuration?.QUCIKLINKS?.Deposit && (
                <ViewComponent style={[commonStyles.flex1]}>
                    <CommonTouchableOpacity activeOpacity={0.7}>
                        <ActionButton
                            text="GLOBAL_CONSTANTS.DEPOSIT"
                            useGradient
                            onPress={handleSellNavigateDeposit}
                            disable={withdrawButtonLoader}
                            customIcon={<DeposistIcon />}
                        />
                    </CommonTouchableOpacity>
                </ViewComponent>
            )}
            {Configuration?.QUCIKLINKS?.Withdraw && (
                <ViewComponent style={[commonStyles.flex1]}>
                    <CommonTouchableOpacity>
                        <ActionButton
                            text="GLOBAL_CONSTANTS.WITHDRAW"
                            onPress={handleWithdrawPress}
                            customTextColor={NEW_COLOR.ACTIONSECONDARYBUTTON_BG}
                            loading={withdrawButtonLoader}
                            disable={withdrawButtonLoader}
                            customIcon={<WithdrawIcon />}
                        />

                    </CommonTouchableOpacity>

                </ViewComponent>

            )}
        </ViewComponent>

    );
};

export default React.memo(QuickActionButtons);