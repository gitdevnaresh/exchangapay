import React, { useEffect, useRef } from 'react';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';
import ViewComponent from '../../../newComponents/view/view';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ButtonComponent from '../../../newComponents/buttons/button';
import { s } from '../../../constants/theme/scale';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import ImageUri from '../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../assets/blobUrls';

interface InactiveAccountPopupProps {
    isVisibleModel: boolean; // visibility control
    onClose: () => void;
}

const InactiveAccountPopup = (props: InactiveAccountPopupProps) => {
    const popupRef = useRef<any>(null);
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

    useEffect(() => {
        if (props.isVisibleModel) {
            if (popupRef.current) {
                popupRef.current.open();
            } else {
                const frameId = requestAnimationFrame(() => {
                    if (props.isVisibleModel && popupRef.current) {
                        popupRef.current.open();
                    } else if (props.isVisibleModel) {
                    }
                });
                return () => cancelAnimationFrame(frameId);
            }
        } else {
            if (popupRef.current) {
                popupRef.current.close();
            }
        }
    }, [props.isVisibleModel]);

    const handleClose = () => {
        props.onClose();
    };

    return (
        <PopupOrSheet
            ref={popupRef}
            height={s(350)}
            showCloseIconAndTittle={false}
            onClose={handleClose}
            showCloseIcon={false}
        >
            <ViewComponent style={[reversCommonStyles.mb43]}>
                <ViewComponent style={[reversCommonStyles.justifyCenter, reversCommonStyles.alignCenter, reversCommonStyles.mb16]}>
                    <ImageUri uri={COMMON_SVG_URLS.alert_Icon} width={s(90)} height={s(70)} />
                </ViewComponent>
                <TextMultiLanguage style={[reversCommonStyles.fs18, reversCommonStyles.fw700, reversCommonStyles.textWhite, reversCommonStyles.textCenter, reversCommonStyles.mb16]} text={"GLOBAL_CONSTANTS.ACCOUNT_INACTIVE"} />
                <TextMultiLanguage
                    style={[
                        reversCommonStyles.fs14,
                        reversCommonStyles.fw400,
                        reversCommonStyles.textWhite,
                        reversCommonStyles.textCenter
                    ]}
                    text={"GLOBAL_CONSTANTS.YOUR_ACCOUNT_ISINACTIVE"}
                />

                <ViewComponent style={[reversCommonStyles.sectionGap]} />
                <ViewComponent>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CLOSE"}
                        onPress={handleClose}

                    />
                </ViewComponent>
                <ViewComponent style={[reversCommonStyles.sectionGap]} />
            </ViewComponent>
        </PopupOrSheet>
    );
};

export default InactiveAccountPopup;
