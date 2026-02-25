import { FC, useRef, useEffect } from "react";
import ButtonComponent from "../../../components/buttons/button";
import { getThemedCommonStyles } from "../../../components/CommonStyles";
import ViewComponent from "../../../components/view/view";
import TextMultiLangauge from "../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../../hooks/themedHook/useThemeColors";
import CustomRBSheet from "../../../components/models/commonBottomSheet";
import { s } from "../../../constants/styels/scale";

interface ConfirmLogoutProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmLogout: FC<ConfirmLogoutProps> = ({ isVisible, onClose, onConfirm }) => {
    const refRBSheet = useRef<any>();

    useEffect(() => {
        if (isVisible) {
            refRBSheet.current?.open();
        } else {
            refRBSheet.current?.close();
            // The onClose() call here was redundant.
            // CustomRBSheet's own onClose (wired to this component's onClose prop) handles updating the parent's isVisible state.
            // The useEffect then reacts to the new isVisible value to ensure the sheet is closed via its ref.
        }
    }, [isVisible]);

    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const data = (
        <ViewComponent>
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.ARE_YOU_WANT_LOGOUT"} style={[commonStyles.textlinkgrey, commonStyles.fs16, commonStyles.fw500]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mt30]}>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent transparent={true} title={"GLOBAL_CONSTANTS.NO"} solidBackground={true} onPress={onClose} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.YES"} onPress={onConfirm} />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    )
    return (
        <CustomRBSheet
            title={'GLOBAL_CONSTANTS.CONFIRM_LOGOUT'}
            refRBSheet={refRBSheet}
            height={'Small'} // Adjusted height for better fit
            modeltitle={true}
            closeOnPressMask={true}
            onClose={onClose}
        >
            {data}
        </CustomRBSheet>

    )
}
export default ConfirmLogout
