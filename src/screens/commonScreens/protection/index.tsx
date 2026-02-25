import React, { useEffect, useMemo, useRef } from 'react';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import { ms } from '../../../constants/styels/scale';
import CustomRBSheet from '../../../components/models/commonBottomSheet';
import ButtonComponent from '../../../components/buttons/button';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import ViewComponent from '../../../components/view/view';
import ParagraphComponent from '../../../components/textComponets/paragraphText/paragraph';
import TextMultiLanguage from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import { s } from '../../../constants/styels/scale';
import { Feather } from "@expo/vector-icons";
import { ProtectionIcon } from '../../../assets/svg';

const EnableProtectionModel = (props: any) => {
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

    const handleEnableProtection = () => {
        props?.navigation?.navigate('Security');
        propsCloseModel();
    }
    return (
        <CustomRBSheet
            refRBSheet={rbSheetRef}
            height={'Small'}
            onClose={propsCloseModel}
        >
            <ViewComponent>

                <ViewComponent style={[commonStyles.sectionGap, commonStyles.gap10, commonStyles.alignCenter]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]} >
                        <ProtectionIcon width={s(40)} height={s(40)} />
                    </ViewComponent>
                    <TextMultiLanguage
                        style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite, commonStyles.textCenter]}
                        text={"GLOBAL_CONSTANTS.TRANSACTION_PROTECTION_REQUIRED"}
                    />
                    <ParagraphComponent
                        style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.textCenter]}
                        text={"GLOBAL_CONSTANTS.ENABLE_EMAIL_OR_PHONE_VERFICATION_TO_PROTECT_YOUR_WITHDRAWLS_AND_TRANSFERS"}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.CANCEL"}
                            onPress={propsCloseModel}
                            solidBackground={true}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.flex1]}>
                        <ButtonComponent
                            title={"GLOBAL_CONSTANTS.ENABLE_PROTECTION"}
                            onPress={handleEnableProtection}
                        />
                    </ViewComponent>

                </ViewComponent>
            </ViewComponent>
        </CustomRBSheet>
    );
};

export default EnableProtectionModel;

