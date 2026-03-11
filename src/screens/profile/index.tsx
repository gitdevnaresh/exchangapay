import React, { useCallback, useEffect, useState } from "react";
import ViewComponent from "../../newComponents/view/view";
import { s } from "../../newComponents/theme/scale";
import Loadding from "../commonScreens/skeltons";
import { ProfileUIDLoader } from "./skeltons";
import CommonTouchableOpacity from "../../newComponents/touchableComponents/touchableOpacity";
import { useDispatch, useSelector } from "react-redux";
import { getTabsConfigation } from "../../../configuration";
import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { getFormattedEmail, isErrorDispaly } from "../../utils/helpers";
import { Image, FlatList } from "react-native";
import { setSecurityLevelInfo } from "../../redux/actions/actions";
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThemeColors } from "../../hooks/useThemeColors";
import { AntDesign } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import ProfileService from "../../services/profile";
import ProfileMenuItems from "./ProfileMenuItems";
import { ActionLogParams, useActionLogging } from "../../hooks/loggingHook";
import ParagraphComponent from "../../newComponents/textComponets/paragraphText/paragraph";
import Container from "../../newComponents/container/container";
import PageHeader from "../../newComponents/pageHeader/pageHeader";
// Import types from profileTypes.ts
import {
    RootState,
    SecurityLevelDetails,
    ReferralDetails,
    MainStackParamList,
    NewProfileCustomProps
} from "./profileTypes";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import CopyCard from "../../newComponents/copyComponent/CopyCard";
import { useHardwareBackHandler } from "../../hooks/HardwareBackHandler";
import ErrorComponent from "../../newComponents/errorDisplay/errorDisplay";

type NewProfileScreenProps = NativeStackScreenProps<MainStackParamList, 'NewProfile'> & NewProfileCustomProps;

const NewProfile = (props: NewProfileScreenProps) => {
    /**
     * NewProfile Screen
     * - Displays user profile info, referral banner, and profile menu items.
     * - Handles logout, navigation to personal info, referral dashboard, and KYC/KYB flows.
     * - Loads referral and security level details on focus (unless blocked).
     * - Uses Redux for user info and theme hooks for styling.
     */

    // Redux: Get user info from store
    const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    // Local state for logout loader and logout modal
    const [isVisible, setIsVisible] = useState(false)
    // Navigation and focus
    const isFocused = useIsFocused();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    // Get menu tab config (controls which sections show)
    const menuTabs = getTabsConfigation('MENU_DRAWER_CONGIGURATION');
    // Redux dispatch
    // Theme colors and styles
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { blockFocusEffects } = props;
    const { logEvent } = useActionLogging();
    // Local state for referral and security info
    const [referralDetails, setReferralDetails] = useState<ReferralDetails | null>(null); // State to store referral details
    const [referralDetailsLoading, setReferralDetailsLoading] = useState<boolean>(false);
    const [securityLevelLoading, setSecurityLevelLoading] = useState<boolean>(false);
    const [securityLevelDetails, setSecurityLevelDetails] = useState<SecurityLevelDetails | null>(null);
    const dispatchSecurityLevelDetails = useDispatch();
    const [error, setError] = useState<string>("");
    const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);

    // Helper: Decrypts a string or returns empty string



    // Handles navigation for KYC/KYB profile completion
    const handleKycKybProfile = () => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'handleKycKybProfile',
            actionType: 'Button',
            actionObj: {
                accountType: userInfo?.accountType,
                kycLevel: userInfo?.kycLevel,
            }
        };
        logEvent('button_press', actionData);
        if (userInfo?.accountType == "Business") {
            if (userInfo?.kycLevel == null || userInfo?.kycLevel == undefined) {
                props?.navigation.navigate("KybCompanyData");
                return;
            }
            else if (userInfo?.kycLevel == 'Basic') {
                props?.navigation.navigate("KybUboList");
            } else if (userInfo?.kycLevel == 'Advanced') {
                props?.navigation.navigate("KybDirectorDetailsList");
            } else {
                props?.navigation.navigate("KybInfoPreview", { navigation: "NewProfile" });
            }
        } else if (userInfo?.accountType != "Business") {
            if (userInfo?.kycLevel == null || userInfo?.kycLevel == undefined) {
                props?.navigation.navigate("KycProfile", { navigation: "NewProfile" });
                return;
            }
            else if (userInfo?.kycLevel == 'Basic') {
                props?.navigation.navigate("KycProfileStep2", { navigation: "NewProfile" });
            } else {
                props?.navigation.navigate("KycProfilePreview", { navigation: "NewProfile" });
            }
        }
    }

    useHardwareBackHandler(() => {
        if (isLogoutLoading) {
            return true; // block back action
        }
        handleBackpress();
    })
    // On screen focus: refresh user, referral, and security info (unless blocked)
    useEffect(() => {
        setError("");
        if (isFocused) {
            // Always close logout modal on focus
            handleClose();
            const screenViewData: ActionLogParams = {
                screename: 'NewProfile',
                actionName: 'Screen Loaded',
                actionType: 'View',
            };
            logEvent('screen_view', screenViewData);

            // Only refresh data if not blocked (e.g. after edit)
            if (!blockFocusEffects) {
                getRefferalDetails()
                getSecurityLevelDetails();
            }
        }
    }, [isFocused, blockFocusEffects]);

    // Logout modal close handler
    const handleClose = () => {
        setIsVisible(false)
    }

    // Fetch referral details from API
    const getRefferalDetails = useCallback(async () => {
        setError("");
        setReferralDetailsLoading(true);
        try {
            const response = await ProfileService.getReferralDetails();

            if (response.ok) {
                setReferralDetails(response.data as ReferralDetails); // Store referral details in state
            } else {
                const errorData: ActionLogParams = {
                    screename: 'NewProfile',
                    actionName: 'API Error - getReferralDetails',
                    actionType: 'Error',
                    actionObj: { error: isErrorDispaly(response) }
                };
                logEvent('error', errorData);
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            const errorData: ActionLogParams = {
                screename: 'NewProfile',
                actionName: 'API Exception - getReferralDetails',
                actionType: 'Error',
                actionObj: { error: isErrorDispaly(error) }
            };
            logEvent('error', errorData);
            setError(isErrorDispaly(error));
        } finally {
            setReferralDetailsLoading(false);
        }
    }, []);

    // Fetch security level details from API
    const getSecurityLevelDetails = async () => {
        setError("");
        setSecurityLevelLoading(true);
        try {
            const response = await ProfileService.getsecurityLevelDetails();
            if (response.ok) {
                setSecurityLevelDetails(response.data as SecurityLevelDetails);
                dispatchSecurityLevelDetails(setSecurityLevelInfo(response.data)); // <-- Store in Redux

            } else {
                const errorData: ActionLogParams = {
                    screename: 'NewProfile',
                    actionName: 'API Error - getSecurityLevelDetails',
                    actionType: 'Error',
                    actionObj: { error: isErrorDispaly(response) }
                };
                logEvent('error', errorData);
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            const errorData: ActionLogParams = {
                screename: 'NewProfile',
                actionName: 'API Exception - getSecurityLevelDetails',
                actionType: 'Error',
                actionObj: { error: isErrorDispaly(error) }
            };
            logEvent('error', errorData);
            setError(isErrorDispaly(error));
        } finally {
            setSecurityLevelLoading(false);
        }
    };

    // Navigate to personal info screen
    const onPressPersonalInfo = useCallback(() => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate to Personal Info',
            actionType: 'Button',
            nextScreenName: 'PersonalInfo',
            actionObj: { userDetails: userInfo, referralDetails: referralDetails }
        };
        logEvent('navigation_action', actionData);
        navigation.navigate("PersonalInfo", { userDetails: userInfo, referralDetails: referralDetails });
    }, [navigation, userInfo, referralDetails])

    // Navigate to referral dashboard
    const handleGoToReferral = useCallback(() => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate to Referral Dashboard',
            actionType: 'Button',
            nextScreenName: 'MembersDashBoard'
        };
        logEvent('navigation_action', actionData);
        navigation.navigate('ComingSoon');
    }, [navigation]);

    // Back button handler
    const handleBackpress = () => {
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Navigate Back to Dashboard',
            actionType: 'Button',
            nextScreenName: 'Dashboard'
        };
        logEvent('navigation_action', actionData);
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Dashboard" }] }));

    }

    // Skeleton loader for UID
    const ProfileUIDSkeleton = ProfileUIDLoader(NEW_COLOR);

    // Copy referral code to clipboard
    const handleCopyRef = () => {
        const reference = referralDetails?.referralCode;
        let stringToCopy = ""; // Default to empty string

        if (typeof reference === 'string') {
            const Value = reference; // 'reference' is now definitely a string
            // If decryptedValue is undefined or null, use an empty string.
            stringToCopy = Value ?? "";
        }
        const actionData: ActionLogParams = {
            screename: 'NewProfile',
            actionName: 'Copy Referral Code',
            actionType: 'Button',
            actionObj: { referralCode: stringToCopy }
        };
        logEvent('button_press', actionData);
        Clipboard.setString(stringToCopy); // stringToCopy is guaranteed to be a string
    }

    // Format referral code for display (shorten if long)
    const formatReferralCode = (code?: string) => {
        if (!code) {
            return '';
        }
        if (code.length > 10) {
            return `${code.substring(0, 3)}...${code.substring(code.length - 3)}`;
        }
        return code;
    };

    // --- UI Render ---
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <FlatList
                ListHeaderComponent={
                    <Container style={[]}>
                        {/* Page header with back button */}
                        <PageHeader title={""} onBackPress={handleBackpress} />
                        {error && <ErrorComponent message={error} screen={true} />}
                        <ViewComponent>
                            {/* Profile info section */}
                            {menuTabs?.PROFILE_INFORMATION &&
                                <CommonTouchableOpacity onPress={onPressPersonalInfo} style={[commonStyles.profilebannerbg]}>
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                        <CommonTouchableOpacity onPress={onPressPersonalInfo}>
                                            <ViewComponent style={commonStyles.profileAvatarContainer}>
                                                <Image
                                                    style={commonStyles.profileAvatar}
                                                    source={userInfo?.imageURL ? { uri: userInfo?.imageURL } : require("../../assets/imageAssets/default.png")}
                                                />
                                                <ViewComponent style={userInfo?.isKYC !== true ? commonStyles.orangeDot : commonStyles.greenDot} />
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        <ViewComponent style={commonStyles.profileInfoContainer}>
                                            <ParagraphComponent style={[commonStyles.fs16, commonStyles.fw400, commonStyles.profileUserName, commonStyles.textWhite]} numberOfLines={1} text={getFormattedEmail(userInfo?.nickName || "") || ""} />
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.profileDetailsContainer]}>
                                                {referralDetailsLoading ? (
                                                    <Loadding contenthtml={ProfileUIDSkeleton} />
                                                ) : (
                                                    <>
                                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw400, commonStyles.textGrey]} text={"GLOBAL_CONSTANTS.UID_WITH_COLON"} multiLanguageAllows />
                                                        <ParagraphComponent style={[commonStyles.fs12, commonStyles.fw600, commonStyles.mr10, commonStyles.textGrey]} text={formatReferralCode(referralDetails?.referralCode || '') || ' -------'} />
                                                        {referralDetails?.referralCode &&
                                                            <CopyCard onPress={handleCopyRef} size={s(20)} />}
                                                    </>
                                                )}
                                            </ViewComponent>
                                        </ViewComponent>
                                        <AntDesign name="arrowright" style={[commonStyles.textRight]} color={NEW_COLOR.TEXT_WHITE} size={s(20)} />
                                    </ViewComponent>
                                </CommonTouchableOpacity>
                            }
                            <ProfileMenuItems
                                navigation={navigation}
                                commonStyles={commonStyles}
                                NEW_COLOR={NEW_COLOR}
                                handleKycKybProfile={handleKycKybProfile}
                                securityLevel={securityLevelDetails?.level}
                                securityLevelLoading={securityLevelLoading}
                                setError={setError}
                                setIsLogoutLoading={setIsLogoutLoading}
                                isLogoutLoading={isLogoutLoading}
                            />
                        </ViewComponent>
                    </Container>
                }
                data={[]}
                keyExtractor={(index) => `dummy-${index}`} // Dummy key extractor
                renderItem={() => null} // No list items, only header/footer
                showsVerticalScrollIndicator={false}
            />

        </ViewComponent>
    )
}
export default NewProfile;
