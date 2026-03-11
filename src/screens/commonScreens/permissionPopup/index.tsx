
import React, { useEffect, useMemo, useRef } from 'react';
import { Linking } from 'react-native';
import { s } from '../../../constants/theme/scale';
import ButtonComponent from '../../../newComponents/buttons/button';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import PopupOrSheet from '../../../newComponents/models/PopupOrSheet';



const PermissionModel = (props: any) => {
    const rbSheetRef = useRef<any>(null);
    const NEW_COLOR = useMemo(() => useThemeColors(true), []);
    const commonStyles = useMemo(() => getThemedCommonStyles(NEW_COLOR), [NEW_COLOR]);
    useEffect(() => {
        if (props?.addModelVisible) {
            if (rbSheetRef.current) {
                rbSheetRef.current.open();
            } else {
                const frameId = requestAnimationFrame(() => {
                    if (props?.addModelVisible && rbSheetRef.current) { // Re-check props.addModelVisible
                        rbSheetRef.current.open();
                    } else if (props?.addModelVisible) {
                        console.error("KycVerifyPopup: Ref still not available after requestAnimationFrame.");
                    }
                });
                return () => cancelAnimationFrame(frameId);
            }
        } else {
            if (rbSheetRef.current) {
                rbSheetRef.current.close();
            }
        }
    }, [props?.addModelVisible]);
    const propsCloseModel = () => {
        props?.closeModel()
    }
    // Don't remove this function.This is manual kyc/kyb flow

    const RedirectoSettings = () => {
         propsCloseModel();
        Linking.openSettings();
       
    }
    return (
      <PopupOrSheet
        displayType="bottom-sheet"
        ref={rbSheetRef}
        height={s(270)}
        title={props?.title||"GLOBAL_CONSTANTS.PERMISSION_REQUIRED"}
        onClose={propsCloseModel}
      >
            <ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap,commonStyles.gap10]}>
                       
                    <TextMultiLanguage
                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]}
                        text={props?.permissionDeniedContent||"GLOBAL_CONSTANTS.COMMON_PERMISSION_DENIED_MESSAGE"}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.NOT_NOW"}
                            onPress={propsCloseModel}
                            solidBackground={true}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.GO_TO_SETTINGS"}
                            onPress={RedirectoSettings}
                        />
                    </ViewComponent>

                </ViewComponent>
            </ViewComponent>
        </PopupOrSheet>
    );
};

export default PermissionModel;

