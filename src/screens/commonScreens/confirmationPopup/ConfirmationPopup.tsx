import React from 'react';
import { s } from 'react-native-size-matters';
import ViewComponent from '../../../newComponents/view/view';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import ImageUri from '../../../newComponents/imageComponents/image';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../newComponents/buttons/button';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useThemeColors } from '../../../hooks/useThemeColors';

interface ConfirmationPopupProps {
    rbSheetRef: React.RefObject<any>;
    title: string;
    message: string;
    confirmButtonText: string;
    cancelButtonText: string;
    onConfirm: () => void;
    onCancel: () => void;
    height?: number;
    iconUri?: string;
    iconWidth?: number;
    iconHeight?: number;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
    rbSheetRef,
    title,
    message,
    confirmButtonText,
    cancelButtonText,
    onConfirm,
    onCancel,
    height = s(300),
    iconUri = COMMON_SVG_URLS?.alert_Icon,
    iconWidth = s(90),
    iconHeight = s(70),
}) => {
    const NEW_COLOR = useThemeColors();
    const REVERSE_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const reverseCommonStyles = getThemedCommonStyles(REVERSE_COLOR);

    return (
        <PopupOrSheet ref={rbSheetRef} height={height} closeOnPressMask={false} showCloseIcon={false} showCloseIconAndTittle={false}>
            <ViewComponent style={[commonStyles.alignCenter]}>
                <ViewComponent>
                    <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                        <ImageUri uri={iconUri} width={iconWidth} height={iconHeight} />
                    </ViewComponent>
                    <TextMultiLanguage style={[commonStyles.fs16, commonStyles.fw700, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]} text={title} />
                    <TextMultiLanguage style={[commonStyles.fs14, commonStyles.fw400, reverseCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb32]} text={message} />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title={cancelButtonText} onPress={onCancel} capitalizeTitle={false} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent title={confirmButtonText} onPress={onConfirm} capitalizeTitle={false} solidBackground={true} />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </PopupOrSheet>
    );
};

export default ConfirmationPopup;
