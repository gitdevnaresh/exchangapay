
import React, { useEffect, useMemo, useRef } from 'react';
import { Linking } from 'react-native';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import CustomRBSheet from '../../../components/models/commonBottomSheet';
import ButtonComponent from '../../../components/buttons/button';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../components/view/view';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { s } from '../../../constants/styels/scale';
import { Logger } from '../../../utils/Logger';



const PermissionModel = (props: any) => {
    const rbSheetRef = useRef<any>(null);
    const NEW_COLOR = useMemo(() => useThemeColors(), []);
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
                        Logger.error("KycVerifyPopup: Ref still not available after requestAnimationFrame.");
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
        <CustomRBSheet
            refRBSheet={rbSheetRef}
            height={"Small"}
            onClose={propsCloseModel}
        >
            <ViewComponent>
                <ViewComponent style={[commonStyles.sectionGap, commonStyles.gap10]}>
                    <TextMultiLanguage
                        style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textWhite]}
                        text={props?.title || "GLOBAL_CONSTANTS.PERMISSION_REQUIRED"}
                    />
                    <ParagraphComponent
                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]}
                        text={props?.permissionDeniedContent || "GLOBAL_CONSTANTS.COMMON_PERMISSION_DENIED_MESSAGE"}
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
        </CustomRBSheet>
    );
};

export default PermissionModel;

