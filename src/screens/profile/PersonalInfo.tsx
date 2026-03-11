import { ScrollView, View as RNView, Image } from "react-native";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Formik } from "formik";
import { useSelector } from "react-redux";
import { useThemeColors } from "../../hooks/useThemeColors";
import { s } from "../../constants/theme/scale";
import Clipboard from "@react-native-clipboard/clipboard";
import CommonTouchableOpacity from "../../newComponents/touchableComponents/touchableOpacity";
import ViewComponent from "../../newComponents/view/view";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useEncryptDecrypt from "../../hooks/encDecHook";
import { Ionicons, Octicons } from "@expo/vector-icons";
import useMemberLogin from "../../hooks/userInfoHook";
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
import ProfileService from "../../services/profile";
import { showAppToast } from "../../newComponents/ToasterMessages/ShowMessage";
import { getFormattedEmail, isErrorDispaly } from "../../utils/helpers";
import { ActionLogParams, useActionLogging } from "../../hooks/loggingHook";
import * as Yup from "yup";
import PopupOrSheet from "../../newComponents/models/PopupOrSheet";
import RBSheet from "react-native-raw-bottom-sheet";
import { useLngTranslation } from "../../hooks/useLngTranslation";
import ButtonComponent from "../../newComponents/buttons/button";
import ErrorComponent from "../../newComponents/errorDisplay/errorDisplay";
import { MainStackParamList, PersonalInfoProps, RootState } from "./profileTypes";
import KycVerifyPopup from "../commonScreens/kycVerify";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import Container from "../../newComponents/container/container";
import PageHeader from "../../newComponents/pageHeader/pageHeader";
import CopyCard from "../../newComponents/copyComponent/CopyCard";
import { CustomerStateBadge } from "../../newComponents/customerStatusbadge/CustomerStateBadge";
import TextMultiLanguage from "../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import FormikTextInput from "../../newComponents/textInputComponents/formik/textInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHardwareBackHandler } from "../../hooks/HardwareBackHandler";
import InactiveAccountPopup from "../commonScreens/inactiveSheet/accountInactive";

const NickNameSchema = Yup.object().shape({
    nickName: Yup.string()
        .required("")
        .max(30, "GLOBAL_CONSTANTS.NICKNAME_MAX_LENGTH_ERROR")
        .matches(
            /^[A-Za-z0-9 !@#$%^&*()_.-]+$/, // Added a space to the character set
            "GLOBAL_CONSTANTS.INVALID_NICKNAME"
        ),
});

const PersonalInfo: React.FC<PersonalInfoProps> = (props) => {
    // State for error message
    const [kycModelVisible, setKycModelVisible] = useState(false)
    // Navigation hook
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    // Extract user details and referral details from route params
    const routeParams = props.route.params;
    const { referralDetails } = props.route.params;

    // Hooks for fetching data and listening to focus
    const { getMemDetails } = useMemberLogin();
    const isFocused = useIsFocused();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
    // Get user details from Redux store for real-time updates
    const userDetailsFromRedux = useSelector((state: RootState) => state.userReducer?.userDetails);
    const { logEvent } = useActionLogging();

    // Encryption/decryption hook
    const { encryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    // Theme colors and common styles
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    // Use Redux state as the primary source of truth, fallback to route params if Redux is empty
    const userDetails = userDetailsFromRedux ? { userDetails: userDetailsFromRedux } : routeParams;
    const [isInactive, setIsInactive] = useState<boolean>(false);
    // Refetch user details when the screen comes into focus to ensure data is fresh
    useEffect(() => {
        setNickNameError(null);
        if (isFocused) {
            const screenViewData: ActionLogParams = {
                screename: 'PersonalInfo',
                actionName: 'Screen Loaded',
                actionType: 'View',
            };
            logEvent('screen_view', screenViewData);
            getMemDetails(true);
        }
    }, [isFocused]);


    // Copy UID to clipboard
    const handleCopyUID = () => {
        if (referralDetails?.referralCode) {
            logEvent('button_press', {
                screename: 'PersonalInfo',
                actionName: 'Copy UID',
                actionType: 'Button',
                actionObj: { referralCode: referralDetails.referralCode }
            });
            Clipboard.setString(referralDetails.referralCode);
        }
    };

    const nicknameSheetRef = useRef<RBSheet>(null);
    const [loading, setLoading] = useState(false);
    const [nickNameError, setNickNameError] = useState<string | null>(null);

    const handleOpenNickNameSheet = () => {
        logEvent('button_press', {
            screename: 'PersonalInfo',
            actionName: 'Open Nickname Edit Sheet',
            actionType: 'Button',
        });
        setNickNameError(null);
        setTimeout(() => nicknameSheetRef.current?.open(), 0);
    };

    const handleConfirmNickName = async (values: { nickName: string }) => {
        logEvent('button_press', {
            screename: 'PersonalInfo',
            actionName: 'Confirm Nickname Update',
            actionType: 'Button',
            actionObj: { postObj: { nickName: values.nickName } }
        });
        setLoading(true);
        setNickNameError(null);
        const obj = { "nickName": encryptAES(values.nickName) };
        try {
            const response = await ProfileService?.updateNickNameDetails(obj);
            if (response?.ok) {
                await getMemDetails(true);
                showAppToast(t("GLOBAL_CONSTANTS.NICKNAME_UPDATED_SUCCESSFULLY"), "success");
                nicknameSheetRef.current?.close();
            } else {
                setNickNameError(isErrorDispaly(response));
            }
        } catch (error) {
            setNickNameError(isErrorDispaly(error));
        } finally {
            setLoading(false);
        }
    };
    const closekycModel = () => {
        setKycModelVisible(false)
    }

    const handleProfileAvatarPress = () => {
        navigation.navigate('ProfileUpload')
    };
    const handleClose = () => {
        setIsInactive(false);
    };
    const handleIdentityVerificationPress = useCallback(() => {
        const userInfo = userDetailsFromRedux;
        if (userInfo?.customerAccountStatus === false) {
            setIsInactive(true); // Open the inactive account popup
            return;
        }
        if (userInfo?.isKYC == true) {
            navigation.navigate('IdentityVerifications')
            return;
        }
        if (!userInfo) return;
        logEvent('navigation_action', {
            screename: 'PersonalInfo',
            actionName: 'Navigate to Identity Verification',
            actionType: 'Button',
            actionObj: {
                accountType: userInfo.accountType,
                kycLevel: userInfo.kycLevel
            }
        });
        navigation.navigate('SelectCountry')
    }, [navigation, userDetails]);

    // Helper: Compose a row style using only commonStyles
    const infoRowStyle = [
        commonStyles.dflex,
        commonStyles.alignCenter,
        commonStyles.rounded11,
        commonStyles.notebg, // or borderTransparent if you want no border
        commonStyles.px16,
        commonStyles.py16,
        commonStyles.mb12,
        commonStyles.py16,
        commonStyles.mb12,
        {
            // Optional: shadow/elevation if you want, or remove
            shadowColor: NEW_COLOR.SHADOW,
            shadowOpacity: 0.03,
            shadowRadius: 4,
            elevation: 1,
        }
    ];
    useHardwareBackHandler(() => {
        navigation.goBack();
    });
    const handleChange = () => {
        setNickNameError(null);
    }
    // Main render
    return (
        <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ScrollView contentContainerStyle={commonStyles.flexGrow1}>
                <Container>
                    {/* Page header with back button */}
                    <PageHeader
                        title={"GLOBAL_CONSTANTS.PROFILE"}
                        onBackPress={() => {
                            const actionData: ActionLogParams = {
                                screename: 'PersonalInfo',
                                actionName: 'Navigate Back',
                                actionType: 'Button',
                            };
                            logEvent('navigation_action', actionData);
                            navigation.goBack()
                        }}
                    />
                    {/* Profile image and nickname/email */}
                    <ViewComponent style={[commonStyles.alignCenter]}>

                        {/* Show profile image and upload button if not loading */}
                        {
                            <ViewComponent style={[commonStyles.mb10]}>
                                <CommonTouchableOpacity onPress={handleProfileAvatarPress}>
                                    <ViewComponent style={[commonStyles.profileUploadImageContainer, commonStyles.alignCenter]}>
                                        <Image
                                            style={commonStyles.profileUploadImage}
                                            source={
                                                userInfo?.imageURL || null
                                                    ? { uri: userInfo?.imageURL }
                                                    : require("../../assets/imageAssets/default.png")
                                            }
                                        />
                                        {/* Edit icon overlay */}
                                        <ViewComponent style={[commonStyles.profileUploadEditIconContainer]}>
                                            <Octicons name="pencil" size={s(18)} color={NEW_COLOR.TEXT_GREY} />
                                        </ViewComponent>
                                    </ViewComponent>

                                </CommonTouchableOpacity>
                            </ViewComponent>}
                        <ParagraphComponent
                            text={getFormattedEmail(userInfo?.nickName || "") || ""}
                            style={[commonStyles.fs16, commonStyles.fw500, commonStyles.textWhite]}
                        />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.sectionGap]} />

                    {/* UID Row */}
                    <ViewComponent style={[commonStyles.profilelistbg, commonStyles.menuitemspace]}>
                        <TextMultiLanguage
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.flex1]}
                            text={"GLOBAL_CONSTANTS.BULLSWIPE_ID"}
                        />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent
                                text={referralDetails?.referralCode ?? " -----"}
                                style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]}
                            />
                            {referralDetails?.referralCode && <ViewComponent style={commonStyles.ml10}>
                                <CopyCard
                                    onPress={handleCopyUID}
                                    size={s(20)}
                                />
                            </ViewComponent>}
                        </ViewComponent>
                    </ViewComponent>

                    {/* Nickname Row */}
                    <ViewComponent style={[commonStyles.profilelistbg, commonStyles.menuitemspace]}>
                        <TextMultiLanguage
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.flex1,]}
                            text="GLOBAL_CONSTANTS.SETNICKNAME"
                        />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            <ParagraphComponent
                                text={userInfo?.nickName ? getFormattedEmail(userInfo?.nickName) : ""}
                                numberOfLines={1}
                                style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.textRight, { width: s(150) }]}
                            />
                            {/* Edit nickname button */}
                            <CommonTouchableOpacity onPress={handleOpenNickNameSheet} style={commonStyles.ml10}>
                                <Octicons name="pencil" size={s(18)} color={NEW_COLOR.TEXT_GREY} />
                            </CommonTouchableOpacity>
                        </ViewComponent>
                    </ViewComponent>

                    {/* Identity Verification Row */}
                    <CommonTouchableOpacity onPress={handleIdentityVerificationPress} style={[commonStyles.profilelistbg]}>
                        <ParagraphComponent
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textGrey, commonStyles.flex1]}
                            text={"GLOBAL_CONSTANTS.IDENTITYVERIFICATION"} multiLanguageAllows
                        />
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                            {/* Customer state badge */}
                            <CustomerStateBadge
                                state={userInfo?.isKYC == null || userInfo?.isKYC === false ? 'Not verified' : 'Approved'}
                                NEW_COLOR={NEW_COLOR}
                                commonStyles={commonStyles}
                            />
                            {/* Arrow icon */}
                            <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} style={{ marginLeft: 'auto' }} />

                        </ViewComponent>
                    </CommonTouchableOpacity>
                </Container>
            </ScrollView>
            {isInactive && (<InactiveAccountPopup isVisibleModel={isInactive} onClose={handleClose} />)}

            {kycModelVisible && <KycVerifyPopup closeModel={closekycModel} addModelVisible={kycModelVisible} />}
            {/* Nickname Edit PopupOrSheet */}
            <PopupOrSheet
                ref={nicknameSheetRef}
                displayType="bottom-sheet"
                height={s(350)}
                showCloseIconAndTittle={false}
            >
                <Formik
                    initialValues={{
                        nickName: userInfo?.nickName ? `${userInfo?.nickName}` : ""
                    }}
                    validationSchema={NickNameSchema}
                    onSubmit={handleConfirmNickName}
                    enableReinitialize
                >
                    {({ handleSubmit, values, dirty }) => (

                        <KeyboardAwareScrollView
                            contentContainerStyle={[{ flexGrow: 1 }]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            enableOnAndroid={true} // Good practice to enable explicitly
                        >
                            {nickNameError && <ErrorComponent message={nickNameError} onClose={() => setNickNameError(null)} />}
                            <RNView style={reversCommonStyles.mb16}>
                                <TextMultiLanguage
                                    style={[reversCommonStyles.fs16, reversCommonStyles.fw700, reversCommonStyles.textWhite, commonStyles.textCenter]}
                                    text="GLOBAL_CONSTANTS.SET_NICKNAME"
                                />
                            </RNView>
                            <RNView style={reversCommonStyles.mb16}>
                                <FormikTextInput
                                    isModel={true}
                                    name="nickName"
                                    isRequired
                                    placeholder={"GLOBAL_CONSTANTS.ENTER_NICKNAME"}
                                    maxLength={30}
                                    onChangeText={handleChange}
                                    editable={!loading}
                                />

                                <ViewComponent style={[reversCommonStyles.mb5]} />
                                <ParagraphComponent style={[reversCommonStyles.textWhite, reversCommonStyles.fs14, reversCommonStyles.fw500, reversCommonStyles.textRight]}>
                                    {Math.min(values.nickName.length, 30)}/30
                                </ParagraphComponent>
                            </RNView>
                            <ViewComponent style={[reversCommonStyles.sectionGap]} />
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.CONFIRM"}
                                onPress={handleSubmit}
                                disable={!dirty || loading || !values.nickName}
                                loading={loading}
                                multiLanguageAllows
                            />
                        </KeyboardAwareScrollView>
                    )}
                </Formik>
            </PopupOrSheet>
        </ViewComponent>
    );
};

export default PersonalInfo;
