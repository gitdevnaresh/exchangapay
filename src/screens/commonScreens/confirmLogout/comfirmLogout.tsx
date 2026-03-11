import { FC, useRef, useEffect } from "react";
import ButtonComponent from "../../../newComponents/buttons/button";
import ViewComponent from "../../../newComponents/view/view";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { s } from "../../../constants/theme/scale";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import ImageUri from "../../../newComponents/imageComponents/image";
import { COMMON_SVG_URLS } from "../../../assets/blobUrls";
import TextMultiLanguage from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";

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

    const NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const data = (
        <ViewComponent>
            <ViewComponent style={[]}>
                <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                    <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
                </ViewComponent>
                <TextMultiLanguage
                    style={[commonStyles.fs16, commonStyles.fw700, commonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]}
                    text={`${"GLOBAL_CONSTANTS.ARE_YOU_WANT_LOGOUT"}`}
                />
                <TextMultiLanguage text={"GLOBAL_CONSTANTS.YOU_WILL_NEED_TO_SIGN_IN_AGAIN_TO_ACCESS_YOUR_ACCOUNT"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite, commonStyles.textCenter]} />
            </ViewComponent>
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mt30]}>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={onClose} solidBackground={true} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CONFIRM"} onPress={onConfirm} />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    )
    return (
        <PopupOrSheet
            title={'GLOBAL_CONSTANTS.CONFIRM_LOGOUT'}
            ref={refRBSheet}
            height={s(320)} // Adjusted height for better fit
            closeOnPressMask={true}
            onClose={onClose}
            showCloseIconAndTittle={false}
        >
            {data}
        </PopupOrSheet>

    )
}
export default ConfirmLogout