import React from 'react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../newComponents/buttons/button';
import PopupOrSheet, { PopupOrSheetRef } from '../../../../newComponents/models/PopupOrSheet';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../assets/blobUrls';
import { s } from '../../../../constants/theme/scale';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';

interface ClearCachePopupProps {
    popupRef: React.RefObject<PopupOrSheetRef>;
    onConfirm: () => void;
}

const ClearCachePopup: React.FC<ClearCachePopupProps> = ({ popupRef, onConfirm }) => {
    const NEW_COLOR = useThemeColors();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

    return (
        <PopupOrSheet ref={popupRef} height={s(350)} showCloseIconAndTittle={false}>
            <ViewComponent style={[commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap16]}>
                <ViewComponent style={[commonStyles.mb16]}>
                    <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                        <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
                    </ViewComponent>
                    <TextMultiLanguage
                        style={[commonStyles.fs16, commonStyles.fw700, reversCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]}
                        text="GLOBAL_CONSTANTS.CLEAR_CACHE_TITLE"
                    />
                    <TextMultiLanguage 
                        text="GLOBAL_CONSTANTS.CLEAR_CACHE_MESSAGE" 
                        style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite, commonStyles.textCenter]} 
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent 
                            title="GLOBAL_CONSTANTS.CANCEL" 
                            solidBackground={true} 
                            onPress={() => popupRef.current?.close()} 
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent 
                            title="GLOBAL_CONSTANTS.CONFIRM" 
                            onPress={onConfirm} 
                            customTitleStyle={[reversCommonStyles.fs16, reversCommonStyles.fw700]} 
                        />
                    </ViewComponent>
                </ViewComponent>
            </ViewComponent>
        </PopupOrSheet>
    );
};

export default ClearCachePopup;