import { FC, useRef, useEffect } from "react";
import ButtonComponent from "../../../newComponents/buttons/button";
import ViewComponent from "../../../newComponents/view/view";
import TextMultiLangauge from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { s } from "../../../constants/theme/scale";
import PopupOrSheet from "../../../newComponents/models/PopupOrSheet";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";

interface ConfirmationPros {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    btnLoading?: boolean;
}

const Confirmation: FC<ConfirmationPros> = ({ isVisible, onClose, onConfirm, btnLoading }) => {
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
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_TO_DELETE_THIS_PAYEE"} style={[commonStyles.textAlwaysBlack, commonStyles.fs16, commonStyles.fw500]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mt30]}>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CANCEL"} onPress={onClose} solidBackground={true} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent title={"GLOBAL_CONSTANTS.CONFIRM"} onPress={onConfirm} loading={btnLoading} />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );
    return (
        <PopupOrSheet
            title={'GLOBAL_CONSTANTS.CONFIRMATION'}
            ref={refRBSheet}
            modeltitle={false}
            showCloseIcon={false}
            height={s(300)} // Adjusted height for better fit
            closeOnPressMask={true}
            customStyles={{
                wrapper: { backgroundColor: "rgba(0,0,0,0.7)" },
                draggableIcon: { backgroundColor: "#5D5A5D" },
                container: {
                    // backgroundColor: NEW_COLOR.SHEET_BG,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                },
            }}
            onClose={onClose}
        >
            {data}
        </PopupOrSheet>

    )
}
export default Confirmation