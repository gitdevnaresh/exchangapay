import React from 'react';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import ViewComponent from '../../../../newComponents/view/view';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../../newComponents/buttons/button';
import PopupOrSheet, { PopupOrSheetRef } from '../../../../newComponents/models/PopupOrSheet';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS, PROFILE_URLS } from '../../../../assets/blobUrls';
import { s } from '../../../../constants/theme/scale';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';

interface AppUpdatePopupProps {
    popupRef: React.RefObject<PopupOrSheetRef>;
    updatePopupType: 'update' | 'latest';
    onUpdateNow: () => void;
    onClose: () => void;
}

const AppUpdatePopup: React.FC<AppUpdatePopupProps> = ({ 
    popupRef, 
    updatePopupType, 
    onUpdateNow, 
    onClose 
}) => {
    const NEW_COLOR = useThemeColors();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

    return (
        <PopupOrSheet ref={popupRef} height={updatePopupType === 'update' ? s(330) : s(300)} showCloseIconAndTittle={false}>
            <ViewComponent style={[commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.gap16]}>
                <ViewComponent style={[commonStyles.mb16]}>
                    <ViewComponent style={[commonStyles.justifyCenter, commonStyles.alignCenter, commonStyles.mb16]}>
                        <ImageUri
                            uri={updatePopupType === 'update' ? COMMON_SVG_URLS.alert_Icon : PROFILE_URLS.approvedLogo}
                            width={s(90)}
                            height={s(70)}
                        />
                    </ViewComponent>
                    <TextMultiLanguage
                        style={[commonStyles.fs16, commonStyles.fw700, reversCommonStyles.textWhite, commonStyles.textCenter, commonStyles.mb16]}
                        text="GLOBAL_CONSTANTS.APP_UPDATE"
                    />
                    {updatePopupType !== 'update' && <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.YOU_APP_VERSION_IS_UP_TO_DATE"
                        style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite, commonStyles.textCenter]}
                    />}
                    {updatePopupType == 'update' && <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.THERE_IS_A_NEW_VERSION_OF_THE_APP"
                        style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite, commonStyles.textCenter]}
                    />}
                    {updatePopupType == 'update' && <TextMultiLanguage
                        text="GLOBAL_CONSTANTS.WOULD_YOU_LIKE_TO_UPDATE"
                        style={[commonStyles.fs14, commonStyles.fw400, reversCommonStyles.textWhite, commonStyles.textCenter]}
                    />}
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.gap16]}>
                    {updatePopupType === 'update' ? (
                        <>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ButtonComponent
                                    title="GLOBAL_CONSTANTS.CANCEL"
                                    solidBackground={true}
                                    onPress={() => popupRef.current?.close()}
                                />
                            </ViewComponent>
                            <ViewComponent style={[commonStyles.flex1]}>
                                <ButtonComponent
                                    title="GLOBAL_CONSTANTS.UPDATE"
                                    onPress={onUpdateNow}
                                />
                            </ViewComponent>
                        </>
                    ) : (
                        <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.mb16]}>
                            <ButtonComponent
                                title="GLOBAL_CONSTANTS.CLOSE"
                                onPress={onClose}
                                customContainerStyle={[reversCommonStyles.bg_yellow, reversCommonStyles.rounded100, { width: s(160), height: s(50) }]}
                                customTitleStyle={[reversCommonStyles.fs14, reversCommonStyles.fw700, reversCommonStyles.textAlwaysBlack]}
                                solidBackground={false}
                                capitalizeTitle={false}
                            />
                        </ViewComponent>
                    )}
                </ViewComponent>
            </ViewComponent>
        </PopupOrSheet>
    );
};

export default AppUpdatePopup;