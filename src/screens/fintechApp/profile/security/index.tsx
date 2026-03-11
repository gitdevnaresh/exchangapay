import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { s } from "../../../../constants/styels/scale";
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Container from "../../../../components/container/container";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import ViewComponent from "../../../../components/view/view";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import SecurityIcon from "../../../../components/svgIcons/mainmenuicons/securityicon";
import CustomRBSheet from "../../../../components/models/commonBottomSheet";
import ButtonComponent from "../../../../components/buttons/button";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import { useDispatch, useSelector } from "react-redux";
import { isErrorDispaly } from "../../../../utils/helpers";
import { Linking, Platform } from "react-native";
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { DeleteAccount } from "./interface";
import useMemberLogin from "../../../../hooks/userInfoHook";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import ResetPasswordIcon from "../../../../components/svgIcons/mainmenuicons/resetpassword";
import MailRefreshIcon from "../../../../components/svgIcons/mainmenuicons/emailsend";
import { setShowBiometricPrompt } from "../../../../redux/actions/actions";
import Toggle from "../../../../components/toggle/toggle";
import * as LocalAuthentication from 'expo-local-authentication';
import useBiometricAuth from "../../../commonScreens/biometricAuthentication/biometricAuth";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProfileGeneralServices } from "../../../../apiServices/profile/general";
const SecurityDashboard = (props: any) => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { t } = useLngTranslation();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const [deleteBtnLoader, setDeleteBtnLoader] = useState<boolean>(false);
    const [btnDtlLoading, setBtnDtlLoading] = useState(false);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
    const [errormsg, setErrormsg] = useState("");
    const { getMemDetails } = useMemberLogin();
    const changePasswordSheetRef = useRef<any>(null);
    const deleteAccountSheetRef = useRef<any>(null);
    const navigation = useNavigation<any>();
    const showBiometricPrompt = useSelector((state: any) => state.userReducer.showBiometricPrompt);
    const dispatch = useDispatch();
    const { authenticateUser } = useBiometricAuth();
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                backArrowButtonHandler();
                return true;
            });

            return () => {
                backHandler.remove();
            };
        }, 100);

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);
    const backArrowButtonHandler = useCallback(() => {
        navigation.navigate("NewProfile", { animation: 'slide_from_left' });
    }, [navigation]);

    const handleOpenChangePassword = useCallback(() => {
        setErrormsg("");
        setResetPasswordSuccess(false);
        changePasswordSheetRef.current?.open();
    }, []);

    const handleOpenDeleteAccountPopup = useCallback(() => {
        deleteAccountSheetRef.current?.open();
    }, []);

    const handleSecuritityNav = useCallback(() => {
        props.navigation.navigate("Security")
    }, [props.navigation]);

    const handleErrorMsg = useCallback(() => {
        setErrormsg("");
    }, []);

    const resetPassWord = useCallback(async () => {
        setErrormsg("");
        setBtnDtlLoading(true);
        setResetPasswordSuccess(false);
        try {
            let response = await ProfileGeneralServices.resetPassword();
            if (response?.ok) {
                setErrormsg("");
                setBtnDtlLoading(false);
                setResetPasswordSuccess(true);
            } else {
                setErrormsg(isErrorDispaly(response));
                setBtnDtlLoading(false);
                setResetPasswordSuccess(false);
            }
        } catch (error) {
            setErrormsg(isErrorDispaly(error));
            setBtnDtlLoading(false);
            setResetPasswordSuccess(false);
        }
    }, []);

    const handleClickMail = useCallback(() => {
        const url = `mailto:${decryptAES(userInfo?.email)}`;
        Linking.openURL(url);
    }, [decryptAES, userInfo?.email]);

    const deleteMessage = useCallback(async () => {
        setDeleteBtnLoader(true);
        const Obj: DeleteAccount = { customerId: userInfo?.id, state: "close" }
        try {
            const response = await ProfileGeneralServices.deleteAccount(Obj);
            if (response?.ok) {
                showAppToast(t("GLOBAL_CONSTANTS.DELETE_ACCOUNT_SUCCESS_MESSAGE"), 'success');
                setDeleteBtnLoader(false);
                deleteAccountSheetRef.current?.close();
                navigation.navigate("CloseAccount");
            } else {
                showAppToast(isErrorDispaly(response), 'error');
                setDeleteBtnLoader(false);
                deleteAccountSheetRef.current?.close();
            }
        } catch (error) {
            setDeleteBtnLoader(false);
            showAppToast(isErrorDispaly(error), 'error');
        }

    }, [navigation, t, userInfo?.id]);

    const closeDeleteAccountSheet = useCallback(() => {
        deleteAccountSheetRef.current?.close();
    }, []);

    const closeResetPwd = useCallback(() => {
        changePasswordSheetRef.current?.close();
    }, []);

    const ChangePasswordSheetContent = useMemo(() => (
        <ViewComponent>
            {errormsg && <ErrorComponent message={errormsg} onClose={handleErrorMsg} />}
            {!resetPasswordSuccess ? (
                <>
                    <ViewComponent style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}>
                        <ResetPasswordIcon />
                    </ViewComponent>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.ARE_YOU_SURE_YOU_WANT_RESET_PASSWORD"} style={[commonStyles.bottomsheetprimarytexttitle, commonStyles.mb6, commonStyles.textCenter]} />
                    <ParagraphComponent style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.CHOOSE_UNIQUE_PASSWORD"} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.gap10, commonStyles.mb20, commonStyles.mt44]}>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CANCEL"}
                                onPress={closeResetPwd}
                                solidBackground={true}
                                disable={deleteBtnLoader}
                            />
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.RESET_PASSWORD"}
                                onPress={resetPassWord}
                                loading={btnDtlLoading}
                                disable={btnDtlLoading}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </>
            ) : (
                <ViewComponent>

                    <ViewComponent style={[commonStyles.mxAuto,]}>
                        <MailRefreshIcon />
                    </ViewComponent>
                    <ParagraphComponent text={"GLOBAL_CONSTANTS.EMAIL_SEND_SUCCESSFULLY"}
                        style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.textCenter, commonStyles.mb2]} />
                    <ParagraphComponent onPress={handleClickMail} style={[commonStyles.sectionLink, commonStyles.textCenter]}> {decryptAES(userInfo?.email)}{" "}
                    </ParagraphComponent>
                    <ParagraphComponent style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.PLEASE_CHECK_AND_RESET"}></ParagraphComponent>

                    <ViewComponent style={[commonStyles.sectionGap]} />
                    <ViewComponent style={[commonStyles.sectionGap]} />

                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CLOSE"}
                        onPress={closeResetPwd}
                        solidBackground={true}
                        disable={deleteBtnLoader}
                    />
                </ViewComponent>
            )}
        </ViewComponent>
    ), [btnDtlLoading, closeResetPwd, commonStyles, decryptAES, deleteBtnLoader, errormsg, handleClickMail, handleErrorMsg, resetPassWord, resetPasswordSuccess, userInfo?.email]);

    const handleBiometricPrompt = useCallback(async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (hasHardware) {
                const isEnrolled = await LocalAuthentication.isEnrolledAsync();
                if (isEnrolled) {
                    const res = await authenticateUser();
                    if (res) {
                        dispatch(setShowBiometricPrompt(!showBiometricPrompt));
                        showAppToast(!showBiometricPrompt ? t("GLOBAL_CONSTANTS.FACE_ID_ENABLED", { authentication_type: Platform.OS === 'ios' ? "Face ID" : "Biometric" }) : t("GLOBAL_CONSTANTS.FACE_ID_DISABLED", { authentication_type: Platform.OS === 'ios' ? "Face ID" : "Biometric" }), 'success');
                    } else {
                        showAppToast(t("GLOBAL_CONSTANTS.BIOMETRIC_IS_FAILED"), 'error');
                    }
                } else {
                    showAppToast(t("GLOBAL_CONSTANTS.BIOMETRIC_NOT_ENROLLED"), 'error');
                }
            } else {
                showAppToast(t("GLOBAL_CONSTANTS.BIOMETRIC_HARDWARE_NOT_SUPPORTED"), 'error');
            }
        } catch (error: any) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    }, [authenticateUser, dispatch, showBiometricPrompt, t]);

    const DeleteAccountSheetContent = useMemo(() => (
        <ViewComponent>
            <ViewComponent style={[commonStyles.mxAuto, commonStyles.titleSectionGap]}>
                <SimpleLineIcons name="close" size={70} color={NEW_COLOR.TEXT_WHITE} />

            </ViewComponent>

            <ParagraphComponent text={"GLOBAL_CONSTANTS.CLOSE_ACCOUNT_CONFIRMATION_MESSAGE"} style={[commonStyles.bottomsheetprimarytexttitle, commonStyles.textCenter, commonStyles.mb6]} />
            <ParagraphComponent text={"GLOBAL_CONSTANTS.DELETE_ACCOUNT_FINTECH_CONFIRMATION_MESSAGE"} style={[commonStyles.bottomsheetsecondarytexttitlepara, commonStyles.sectionGap, commonStyles.textCenter,]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10,]}>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CANCEL"}
                        onPress={closeDeleteAccountSheet}
                        solidBackground={true}
                        disable={deleteBtnLoader}
                    />
                </ViewComponent>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.OK"}
                        onPress={deleteMessage}
                        customButtonStyle={[{ backgroundColor: NEW_COLOR.TEXT_RED }]}
                        loading={deleteBtnLoader}
                        disable={deleteBtnLoader}
                    />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    ), [NEW_COLOR.TEXT_RED, NEW_COLOR.TEXT_WHITE, closeDeleteAccountSheet, commonStyles, deleteMessage, deleteBtnLoader]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.ACCOUNT_SECURITY"} onBackPress={backArrowButtonHandler} />
                <ScrollViewComponent>
                    <CommonTouchableOpacity onPress={handleOpenChangePassword} >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.roundediconbg]} >
                                <Feather name="lock" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.CHANGE_PASSWORD"} style={[commonStyles.profilemenutext, commonStyles.flex1,]} />
                            <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={commonStyles.listGap} />
                    <CommonTouchableOpacity onPress={handleSecuritityNav}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.roundediconbg]} >
                                <SecurityIcon width={s(16)} height={s(16)} />
                            </ViewComponent>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.SECURITY_SETTINGS"} style={[commonStyles.profilemenutext, commonStyles.flex1,]} />
                            <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={commonStyles.listGap} />
                    <CommonTouchableOpacity onPress={handleOpenDeleteAccountPopup}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.roundediconbg]} >
                                <SimpleLineIcons name="close" size={16} color={NEW_COLOR.TEXT_WHITE} />
                            </ViewComponent>
                            <ParagraphComponent text={"GLOBAL_CONSTANTS.DELETE_ACCOUNT"} style={[commonStyles.profilemenutext, commonStyles.flex1, { flexWrap: 'wrap' }]} />
                            <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                        </ViewComponent>
                    </CommonTouchableOpacity>
                    <ViewComponent style={commonStyles.listGap} />
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.roundediconbg]} >
                            {Platform.OS === 'android' && <Ionicons name="finger-print-outline" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />}
                            {Platform.OS === 'ios' && <MaterialCommunityIcons name="face-recognition" size={s(16)} color={NEW_COLOR.TEXT_WHITE} />}
                        </ViewComponent>
                        <ParagraphComponent text={Platform.OS === 'ios' ? "GLOBAL_CONSTANTS.FACE_BIOMETRIC_VERIFICATION" : "GLOBAL_CONSTANTS.BIOMETRIC_VERIFICATION"} style={[commonStyles.profilemenutext, commonStyles.flex1, { flexWrap: 'wrap' }]} />
                        <Toggle value={showBiometricPrompt} onValueChange={handleBiometricPrompt} />
                    </ViewComponent>
                </ScrollViewComponent>
            </Container>

            <CustomRBSheet
                refRBSheet={changePasswordSheetRef}
                title={"GLOBAL_CONSTANTS.CHANGE_PASSWORD"}
                height={"Medium"}
            >
                {ChangePasswordSheetContent}
            </CustomRBSheet>

            <CustomRBSheet
                refRBSheet={deleteAccountSheetRef}
                title={"GLOBAL_CONSTANTS.DELETE_ACCOUNT"}
                height={"Medium"}
            >
                {DeleteAccountSheetContent}
            </CustomRBSheet>

        </ViewComponent>
    );
};

export default SecurityDashboard;
