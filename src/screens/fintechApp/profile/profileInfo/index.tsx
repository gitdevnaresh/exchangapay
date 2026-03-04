import React, { useCallback, useEffect, useState } from "react";
import Container from "../../../../components/container/container";
import ViewComponent from "../../../../components/view/view";
import { AvatarProfileImage } from "../../../../assets/svg";
import { ms, s, screenHeight } from "../../../../constants/styels/scale";
import CommonTouchableOpacity from "../../../../components/touchableComponents/touchableOpacity";
import { useDispatch, useSelector } from "react-redux";
import TextMultiLangauge from "../../../../components/textComponets/multiLanguageText/textMultiLangauge";
import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { isErrorDispaly } from "../../../../utils/helpers";
import ErrorComponent from "../../../../components/errorDisplay/errorDisplay";
import { Image, StyleSheet, FlatList } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons'; // Keep if used elsewhere, or remove if only for old avatar sheet
import ConfirmLogout from "../../../commonScreens/logout/comfirmLogout";
import { loginAction, setUserProfileDetails } from "../../../../redux/actions/actions";
import AuthService from "../../../../apiServices/onBoarding/auth";
import KycVerifyPopup from "../../../commonScreens/kycVerify";
import { ThunkDispatch } from "redux-thunk";
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Action } from "redux";
import useMemberLogin from "../../../../hooks/userInfoHook"; // Assuming this is the correct path
import useEncryptDecrypt from "../../../../hooks/encDecHook";
import DeviceInfo from "react-native-device-info";
import { useThemeColors } from "../../../../hooks/themedHook/useThemeColors";
import { getThemedCommonStyles } from "../../../../components/CommonStyles";
import { SimpleLineIcons } from "@expo/vector-icons";
import CopyCard from "../../../../components/copyIcon/CopyCard";
import Clipboard from "@react-native-clipboard/clipboard";
import ProfileService from "../../../../apiServices/profile";
import ProfileEditIcon from "../../../../components/svgIcons/mainmenuicons/editicon";
import { ApiResponse } from "apisauce"; // Assuming you use apisauce or similar
import CustomRBSheet from "../../../../components/models/commonBottomSheet"; // Added for avatar sheet
import ButtonComponent from "../../../../components/buttons/button"; // Added for sheet buttons
import ProfileMenuItems from "./profileMenuItems";
import { showAppToast } from "../../../../components/toasterMessages/ShowMessage";
import { getFileExtension } from "../../onboarding/constants"; // Still needed for local asset upload
import { useLngTranslation } from "../../../../hooks/languagesHook/useLngTranslation";
import { AvatarItem, MainStackParamList, NewProfileCustomProps, RootState, UserProfileData } from "./interfaces";
import useNotifications from "../../../../hooks/notifications/useNotification";
import PageHeader from "../../../../components/pageHeader/pageHeader";
import { useHardwareBackHandler } from "../../../../hooks/backHandleHook";
import { referalIDSkelton } from "../../../../skeletons/skeltonViews";
import Loadding from "../../../../components/skelton/skeltons";
import ParagraphComponent from "../../../../components/textComponets/paragraphText/paragraph";
import useLogout from "../../../../hooks/logout/useLogout";
import ScrollViewComponent from "../../../../components/scrollView/scrollView";
import { Logger } from '../../../../utils/Logger';
import { getTabsConfigation } from '../../../../../configuration';

// File-level variable to store previousTab
let cachedPreviousTab: string | undefined;

type NewProfileScreenProps = NativeStackScreenProps<MainStackParamList, 'NewProfile'> & NewProfileCustomProps;

const NewProfile = (props: NewProfileScreenProps) => {
    const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const userProfileDetails = useSelector((state: RootState) => state.userReducer?.userProfileDetails);
    const { getMemDetails } = useMemberLogin();
    const [logoutLoader, setLogoutLoader] = useState(false);
    const [isVisible, setIsVisible] = useState(false)
    const isFocused = useIsFocused();
    const { decryptAES } = useEncryptDecrypt();
    const [errormsg, setErrormsg] = useState("");
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const menuTabs = getTabsConfigation('MENU_DRAWER_CONGIGURATION');
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, Action<string>>>();
    const version = DeviceInfo?.getVersion();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { blockFocusEffects } = props;
    const { t } = useLngTranslation();
    const { fcmToken } = useNotifications({ isAuthenticated: true })
    const referalSkelton = referalIDSkelton();
    const { logout } = useLogout();
    interface KpiItem {
        name: string;
        id?: string; // Added for keyExtractor in KpiComponent if needed
        value: string | number;
        isCount?: boolean;
    }
    const avatarSheetRef = React.useRef<any>(null);
    const [selectedAvatarInSheet, setSelectedAvatarInSheet] = useState<string | null>(null);
    const [avatarUpdateLoading, setAvatarUpdateLoading] = useState(false);
    const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false); // Track RB sheet state
    const [kycModelVisible, setKycModelVisible] = useState(false);
    const PREDEFINED_AVATARS: AvatarItem[] = [
        { id: '1', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarb1.png" }, type: 'local_asset' },
        { id: '2', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarg1.png" }, type: 'local_asset' },
        { id: '3', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarb2.jpg" }, type: 'local_asset' },
        { id: '4', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarg2.png" }, type: 'local_asset' },
        { id: '5', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarb5.png" }, type: 'local_asset' },
        { id: '6', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarb4.png" }, type: 'local_asset' },
        { id: '7', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarg7-1.png" }, type: 'local_asset' },
        { id: '8', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarb3.png" }, type: 'local_asset' },
        { id: '9', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarg3.png" }, type: 'local_asset' },
        { id: '10', source: { uri: "https://devtstarthaone.blob.core.windows.net/arthaimages/arthapay-mobile-images/avatarb8.png" }, type: 'local_asset' },
    ];
    const getDecryptedText = useCallback((value: string | undefined | null): string => {
        if (typeof value === 'string') {
            return decryptAES(value) ?? "";
        }
        return "";
    }, [decryptAES]);

    const getNotificationPermission = useCallback(async () => {
        const object = { value: fcmToken }
        try {
            await ProfileService.deletePushNotifications(object)
        } catch (error) {
            Logger.error("Error getting FCM token:", error);
        }
    }, [fcmToken]);

    const handleKycKybProfile = useCallback(() => {
        if (userInfo?.kycStatus !== "Approved") {
            setKycModelVisible(true);
        } else {
            if (userInfo?.metadata?.kycType?.toLocaleLowerCase() == "sumsub") {
                if (userInfo?.accountType == "Business") {
                    props?.navigation.navigate("KybInfoPreview", { navigation: "NewProfile" });
                } else {
                    props?.navigation.navigate("KycProfilePreview", { navigation: "NewProfile" });
                }
            } else {
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
        }
    }, [props?.navigation, userInfo?.accountType, userInfo?.kycLevel, userInfo?.kycStatus, userInfo?.metadata?.kycType]);

    const handleClose = useCallback(() => {
        setIsVisible(false)
    }, []);

    const handleConfirm = useCallback(async () => {
        setIsVisible(false)
        await getNotificationPermission();
        handleLgout();
    }, [getNotificationPermission]);

    const handleLogoutBtn = useCallback(() => {
        setIsVisible(true)
    }, []);

    const handleLgout = useCallback(async () => {
        setLogoutLoader(true);
        await logout()
        setLogoutLoader(false)
    }, [logout]);

    const getCustomerProfileInfo = useCallback(async () => {
        setErrormsg("");
        try {
            const response = await AuthService.getCustomerProfile(userInfo?.accountType) as ApiResponse<UserProfileData, any>;
            if (response.ok && response.data) {
                dispatch(setUserProfileDetails(response.data));
                setErrormsg("");
            } else {
                showAppToast(isErrorDispaly(response), 'error');
            }
        }
        catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    }, [dispatch, userInfo?.accountType]);

    const handleBackpress = useCallback(() => {
        const currentTabTitle = cachedPreviousTab || props?.route?.params?.currentTabTitle;
        if (currentTabTitle) {
            navigation.dispatch(
                CommonActions.navigate({
                    name: 'Dashboard',
                    params: { screen: currentTabTitle, animation: 'slide_from_left' }
                })
            );
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard', params: { animation: 'slide_from_left' } }],
                })
            );
        }
    }, [navigation, props?.route?.params?.currentTabTitle]);

    const handleCopyRef = useCallback(() => {
        const reference = userProfileDetails?.reference;
        let stringToCopy = ""; // Default to empty string

        if (typeof reference === 'string') {
            const decryptedValue = decryptAES(reference);
            stringToCopy = decryptedValue ?? "";
        }
        Clipboard.setString(stringToCopy);
    }, [decryptAES, userProfileDetails?.reference]);

    const openAvatarSheet = useCallback(() => {
        setSelectedAvatarInSheet(userProfileDetails?.image ?? null);
        setIsAvatarSheetOpen(true);
        avatarSheetRef.current?.open();
    }, [userProfileDetails?.image]);

    const closeAvatarSheet = useCallback(() => {
        setIsAvatarSheetOpen(false);
        avatarSheetRef.current?.close();
    }, []);

    const updateUserInfo = useCallback(async () => {
        try {
            const userLoginInfo: any = await AuthService.getMemberInfo();
            if (userLoginInfo.ok && userLoginInfo.data) {
                dispatch(loginAction(userLoginInfo.data)); // This updates Redux userInfo
            } else {
                showAppToast(isErrorDispaly(userLoginInfo), 'error');
            }
        } catch (error) {
            showAppToast(isErrorDispaly(error), 'error');
        }
    }, [dispatch]);

    const handleSelectAvatarInSheet = useCallback((avatarId: string) => {
        setSelectedAvatarInSheet(avatarId);
    }, []);

    const handleConfirmAvatar = useCallback(async (avatarIdToSave?: string) => {
        const currentSelectionId = avatarIdToSave ?? selectedAvatarInSheet;
        if (currentSelectionId) {
            setAvatarUpdateLoading(true);
            const chosenAvatarItem = PREDEFINED_AVATARS.find(avatar => avatar.id === currentSelectionId);
            if (!chosenAvatarItem) {
                showAppToast(t("GLOBAL_CONSTANTS.SELECTED_AVATAR_NOT_FOUND"), 'error');
                setAvatarUpdateLoading(false);
                return;
            }
            try {
                if (chosenAvatarItem.type === 'local_asset') {
                    const assetSource = Image.resolveAssetSource(chosenAvatarItem.source);
                    const localFileUri = assetSource.uri;
                    const timestamp = Date.now();
                    const fileName = `user_${userInfo?.id ?? 'unknown'}_avatar_${timestamp}.${getFileExtension(localFileUri) ?? 'jpg'}`;
                    const fileExtension = getFileExtension(localFileUri);
                    const formData = new FormData();
                    formData.append("document", {
                        uri: localFileUri,
                        type: `image/${fileExtension ?? 'jpeg'}`, // Default to jpeg if extension is tricky
                        name: fileName,
                    } as any);

                    const uploadRes = await ProfileService.uploadProfile(formData);
                    if (uploadRes.ok && Array.isArray(uploadRes.data) && uploadRes.data.length > 0 && typeof uploadRes.data[0] === 'string') {
                        await updateUserInfo();
                        showAppToast(t("GLOBAL_CONSTANTS.AVATAR_UPDATE_SUCCESS"), 'success');
                    } else {
                        showAppToast(isErrorDispaly(uploadRes), 'error');
                    }
                } else {
                    showAppToast(t("GLOBAL_CONSTANTS.INVALID_AVATAR_TYPE"), 'error');
                }
            } catch (error) {
                showAppToast(isErrorDispaly(error), 'error');
            } finally {
                setAvatarUpdateLoading(false);
                closeAvatarSheet();
            }
        }
    }, [PREDEFINED_AVATARS, closeAvatarSheet, selectedAvatarInSheet, t, updateUserInfo, userInfo?.id]);

    const handleNavigatePersonalInfo = useCallback(() => {
        props?.navigation.navigate("EditPersonalInfo");
    }, [props?.navigation]);

    const onPressPersonalInfo = useCallback(() => {
        props?.navigation.navigate("PersonalInfo", { userDetails: userProfileDetails });
    }, [props?.navigation, userProfileDetails]);

    const handleError = useCallback(() => {
        setErrormsg("");
    }, []);

    useEffect(() => {
        if (isFocused) {
            // handleClose();
            const currentTabTitle = props?.route?.params?.currentTabTitle;
            if (currentTabTitle) {
                cachedPreviousTab = currentTabTitle;
            }
            if (!blockFocusEffects && !userProfileDetails) {
                getCustomerProfileInfo();
                getMemDetails(true);
            }
        }
    }, [isFocused, blockFocusEffects, isAvatarSheetOpen, userProfileDetails, getCustomerProfileInfo, getMemDetails, handleClose]);

    useHardwareBackHandler(() => {
        handleBackpress();
        return true;
    })

    const editPropfieIcon = (<CommonTouchableOpacity activeOpacity={0.6} onPress={handleNavigatePersonalInfo}  >
        <ProfileEditIcon width={s(20)} height={s(20)} />
    </CommonTouchableOpacity>);
    const AvatarItemSeparator = () => <ViewComponent style={{ width: s(15) }} />;
    const AvatarSheetContent = (
        <ViewComponent style={[]}>
            <TextMultiLangauge text={"GLOBAL_CONSTANTS.CHOOSE_AVATAR_TITLE"} style={[commonStyles.fs20, commonStyles.fw600, commonStyles.textWhite, commonStyles.mb20]} />
            <FlatList
                data={PREDEFINED_AVATARS}
                renderItem={({ item }) => (
                    <CommonTouchableOpacity onPress={() => handleSelectAvatarInSheet(item.id)} style={[styles.avatarItemContainer, selectedAvatarInSheet === item.id && styles.avatarItemSelected]}>
                        <Image source={item.source} style={styles.avatarItemImage} />
                    </CommonTouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={<ViewComponent style={{ width: s(10) }} />}
                ListFooterComponent={<ViewComponent style={{ width: s(10) }} />}
                ItemSeparatorComponent={AvatarItemSeparator}
            />
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap10]}>
                <ViewComponent style={[commonStyles.flex1]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CANCEL"}
                        onPress={closeAvatarSheet}
                        solidBackground={true}
                    />
                </ViewComponent>
                <ViewComponent style={commonStyles.flex1} >
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.CONFIRM_AVATAR"}
                        onPress={() => handleConfirmAvatar()} // Call without args to use selectedAvatarInSheet
                        loading={avatarUpdateLoading}
                        disable={!selectedAvatarInSheet} // Disable if no avatar is selected
                    />
                </ViewComponent>
            </ViewComponent>
        </ViewComponent>
    );
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <ScrollViewComponent>
                <Container style={[commonStyles.container]}>
                    <PageHeader title={"GLOBAL_CONSTANTS.PROFILE"} onBackPress={handleBackpress} />
                    {Boolean(errormsg) && <ErrorComponent message={errormsg} onClose={handleError} />}
                    <ViewComponent style={[commonStyles.sectionGap]}>
                        {menuTabs?.PROFILE_INFORMATION &&
                            <CommonTouchableOpacity onPress={onPressPersonalInfo} style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                    <Image style={[styles.defaultimg,]} source={userInfo?.image ? { uri: userInfo?.image } : require("../../../../assets/images/banklocal/default.png")} />
                                    <ViewComponent style={{ flex: 1 }}>
                                        <ParagraphComponent style={[commonStyles.fs18, commonStyles.fw600, commonStyles.textWhite, { marginBottom: s(5) }]} numberOfLines={1} text={userProfileDetails?.accountType !== "Business" ? `${userProfileDetails?.fullName ?? userProfileDetails?.userName ?? ""}`.trim() || userInfo?.name : userProfileDetails?.businessName} />
                                        <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw500, { marginBottom: s(5) }, commonStyles.textWhite,]} numberOfLines={1} text={getDecryptedText(userInfo?.email)} />
                                        {(!userProfileDetails?.reference) && (
                                            <Loadding contenthtml={referalSkelton} />
                                        )}
                                        {userProfileDetails?.reference && (<ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter]}>
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey, commonStyles.textWhite]} text={"GLOBAL_CONSTANTS.REF_ID"} />
                                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw600, commonStyles.textWhite, { marginRight: s(4) }]} text={getDecryptedText(userProfileDetails?.reference)} />
                                            <CopyCard onPress={handleCopyRef} copyIconColor={NEW_COLOR.TEXT_PRIMARY} size={s(16)} />
                                        </ViewComponent>)}
                                    </ViewComponent>
                                    <SimpleLineIcons name="arrow-right" style={[commonStyles.textRight]} size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </CommonTouchableOpacity>
                        }
                        {menuTabs?.AVATAR && <ViewComponent style={[commonStyles.sectionGap]} />}
                        {menuTabs?.AVATAR && <CommonTouchableOpacity
                            onPress={openAvatarSheet}
                            style={[
                                commonStyles.bannerbg,
                                commonStyles.p14,
                                commonStyles.rounded10,

                                // make children (avatar + text + arrow) in a row
                                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                            ]}
                        >
                            {/* Left side: avatar + text */}
                            <ViewComponent style={{ flexDirection: 'row', alignItems: 'center', gap: s(16) }}>
                                <AvatarProfileImage height={s(53)} width={s(53)} />

                                {/* Text block */}
                                <ViewComponent>
                                    <ViewComponent style={{ flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
                                        <TextMultiLangauge
                                            text="GLOBAL_CONSTANTS.CREATE_YOUR_AVATAR"
                                            style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw600]}
                                        />
                                        {/* <TextMultiLangauge
                                                text="Beta"
                                                style={[
                                                    commonStyles.bglink,
                                                    commonStyles.fs8,
                                                    commonStyles.fw500,
                                                    commonStyles.textCenter,
                                                    commonStyles.pt4,
                                                    commonStyles.textAlwaysBlack,
                                                    { width: s(40), height: s(17), borderRadius: s(100) / 2 },
                                                ]}
                                            /> */}
                                    </ViewComponent>
                                </ViewComponent>
                            </ViewComponent>

                            {/* Right side: arrow */}
                            <SimpleLineIcons name="arrow-right" size={s(14)} color={NEW_COLOR.TEXT_WHITE} />
                        </CommonTouchableOpacity>}

                        <ProfileMenuItems navigation={navigation} commonStyles={commonStyles} NEW_COLOR={NEW_COLOR} handleKycKybProfile={handleKycKybProfile} userInfo={userInfo} />
                    </ViewComponent>

                    {menuTabs?.LOGOUT &&
                        <ViewComponent>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.LOG_OUT"}
                                onPress={handleLogoutBtn}
                                loading={logoutLoader}
                                solidBackground={true}
                                icon={<Ionicons name="power" color={NEW_COLOR.SHARE_ICON} size={s(20)} />}
                            />
                        </ViewComponent>
                    }
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.mt6]}>
                        <ParagraphComponent style={[commonStyles.fw500, commonStyles.fs12, commonStyles.textlinkgrey]} text={`V - ${version}`} />
                    </ViewComponent>
                    <ViewComponent style={[commonStyles.mb40]} />
                </Container>
            </ScrollViewComponent>
            <ConfirmLogout
                isVisible={isVisible}
                onClose={handleClose}
                onConfirm={handleConfirm} />
            <CustomRBSheet
                refRBSheet={avatarSheetRef}
                title={"GLOBAL_CONSTANTS.CHOOSE_AVATAR_TITLE"}
                height={'Small'} // Adjust height as needed
                onClose={() => setIsAvatarSheetOpen(false)}
            >
                {AvatarSheetContent}
            </CustomRBSheet>
            <ViewComponent>
                {kycModelVisible && <KycVerifyPopup closeModel={() => setKycModelVisible(false)} addModelVisible={kycModelVisible} />}
            </ViewComponent>
        </ViewComponent>
    )
}
const styles = StyleSheet.create({
    wauto: { alignSelf: 'flex-start', },
    defaultimg: {
        width: s(60), height: s(60), borderRadius: s(100 / 2), overflow: "hidden"
    },
    loading: {
        paddingBottom: screenHeight * 0.15,
        paddingTop: ms(30),
    },
    avatarItemContainer: {
        padding: s(5),
        borderRadius: s(50),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarItemImage: {
        width: s(60),
        height: s(60),
        borderRadius: s(30),
    },
    avatarItemSelected: {
        borderColor: "green",
    },


})
export default NewProfile;
