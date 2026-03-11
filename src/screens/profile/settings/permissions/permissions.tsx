import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigation, useIsFocused, useFocusEffect } from "@react-navigation/native";
import { Platform, AppState } from "react-native";
import { useThemeColors } from "../../../../hooks/useThemeColors";
import { s } from "../../../../constants/theme/scale";
import Container from "../../../../newComponents/container/container";
import PageHeader from "../../../../newComponents/pageHeader/pageHeader";
import CommonTouchableOpacity from "../../../../newComponents/touchableComponents/touchableOpacity";
import ScrollViewComponent from "../../../../newComponents/scrollView/scrollView";
import ViewComponent from "../../../../newComponents/view/view";
import { Ionicons } from "@expo/vector-icons";
import TextMultiLangauge from "../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { useHardwareBackHandler } from "../../../../hooks/HardwareBackHandler";
import {
    check,
    request,
    openSettings,
    PERMISSIONS,
    PermissionStatus,
    checkNotifications,
    requestNotifications,
} from 'react-native-permissions';
import { getThemedCommonStyles } from "../../../../assets/styles/CommonStyles";
import { NEW_COLOR } from "../../../../newComponents/theme/variables";
import { SvgUri } from "react-native-svg";
import { PERMISSIONS_SVG_URLS } from "../../../../assets/blobUrls";
import { isErrorDispaly } from "../../../../utils/helpers";
import SwokipayDashboardLoader from "../../../../newComponents/swokipayloader";
import ErrorComponent from "../../../../newComponents/errorDisplay/errorDisplay";
import PopupOrSheet from "../../../../newComponents/models/PopupOrSheet";
import ParagraphComponent from "../../../../newComponents/textComponets/paragraphText/paragraph";
import ButtonComponent from "../../../../newComponents/buttons/button";
import { useLngTranslation } from "../../../../hooks/useLngTranslation";

// --- ENHANCED CONFIGURATION WITH RATIONALE AND MESSAGES ---
const PERMISSIONS_CONFIG = [
    {
        id: 'notifications',
        labelKey: 'GLOBAL_CONSTANTS.PUSH_NOTIFICATIONS',
        icon: <SvgUri width={s(20)} height={s(20)} uri={PERMISSIONS_SVG_URLS?.notifications} />,
        blockedMessage: 'Push notifications access is off. Tap Go to Phone Settings to enable it.',
    },
    {
        id: 'camera',
        labelKey: 'GLOBAL_CONSTANTS.CAMERA',
        icon: <Ionicons name={'camera-outline'} size={s(20)} color={NEW_COLOR.TEXT_WHITE} />,
        permissionName: Platform.select({ ios: PERMISSIONS.IOS.CAMERA, android: PERMISSIONS.ANDROID.CAMERA }),
        blockedMessage: 'Camera access is off. Tap Go to Phone Settings to enable it.',
    },
    {
        id: 'photos',
        labelKey: 'GLOBAL_CONSTANTS.PHOTOS',
        icon: <SvgUri width={s(20)} height={s(20)} uri={PERMISSIONS_SVG_URLS?.photos} />,
        permissionName: Platform.select({ ios: PERMISSIONS.IOS.PHOTO_LIBRARY, android: Platform.Version >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE }),
        blockedMessage: 'Photo access is off. Tap Go to Phone Settings to enable it.',
    },
    // {
    //     id: 'contacts',
    //     labelKey: 'GLOBAL_CONSTANTS.CONTACTS',
    //     icon: <SvgUri width={s(24)} height={s(24)} uri={PERMISSIONS_SVG_URLS?.contacts} />,
    //     permissionName: Platform.select({ ios: PERMISSIONS.IOS.CONTACTS, android: PERMISSIONS.ANDROID.READ_CONTACTS }),
    //     blockedMessage: 'Contacts access is blocked. To use this feature, please enable it in your phone\'s settings.',
    // }
];


const Permissions = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [permissionStatuses, setPermissionStatuses] = useState<{ [key: string]: PermissionStatus }>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const isFocused = useIsFocused();
    const [error, setError] = useState<string>("");
    const permissionDeniedSheetRef = useRef<any>(null);
    const [deniedPermissionName, setDeniedPermissionName] = useState<string>("");
    const { t } = useLngTranslation();
    const REVERSE_NEW_COLOR = useThemeColors(true);
    const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);

    // Check all permissions on focus
    const checkAllPermissions = useCallback(async () => {
        setError("");
        setIsLoading(true);
        const statuses: { [key: string]: PermissionStatus } = {};
        try {
            const { status: notificationStatus } = await checkNotifications();
            statuses['notifications'] = notificationStatus;

            for (const perm of PERMISSIONS_CONFIG) {
                if (perm.id !== 'notifications' && perm.permissionName) {
                    const status = await check(perm.permissionName);
                    statuses[perm.id] = status;
                }
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        } finally {
            setPermissionStatuses(statuses);
            setIsLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    // Check all permissions on focus
    useFocusEffect(
        useCallback(() => {
            checkAllPermissions();
        }, [checkAllPermissions])
    );

    // Listen for app state changes to refresh permissions when returning from settings
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active' && isFocused) {
                checkAllPermissions();
            }
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [isFocused]);

    useHardwareBackHandler(() => {
        backArrowButtonHandler();
        return true;
    });

    const backArrowButtonHandler = () => {
        navigation.goBack();
    };


    const handlePermissionPress = async (config: typeof PERMISSIONS_CONFIG[0]) => {
        const currentStatus = permissionStatuses[config.id];
        if (!currentStatus) return;

        let newStatus: PermissionStatus = currentStatus;

        // =====================
        // NOTIFICATIONS
        // =====================
        if (config.id === 'notifications') {
            if (currentStatus === 'unavailable' || currentStatus === 'denied') {
                const { status: notifStatus } = await requestNotifications(['alert', 'sound', 'badge']);
                newStatus = notifStatus;
            }
        } else {
            // =====================
            // CAMERA / PHOTOS / OTHER PERMISSIONS
            // =====================
            if (currentStatus === 'unavailable' || currentStatus === 'denied') {
                if (!config.permissionName) return;

                // Request the permission only once
                newStatus = await request(config.permissionName);
            }
        }

        // Update state
        setPermissionStatuses(prev => ({ ...prev, [config.id]: newStatus }));

        // =====================
        // Open App Settings if denied/blocked/limited
        // =====================
        // iOS limited (Photos) or blocked → open settings
        // Android blocked or denied once → open settings
        if (
            newStatus === 'blocked' ||           // permanently denied
            newStatus === 'limited' ||           // iOS photos limited
            (Platform.OS === 'android' && newStatus === 'denied') // Android denied once
        ) {
            setDeniedPermissionName(config.labelKey);
            permissionDeniedSheetRef.current?.open();
            return;
        }
    };


    const handleRefresh = () => {
        checkAllPermissions();
    }

    const openSettingsFromPopup = () => {
        permissionDeniedSheetRef.current?.close?.();
        openSettings();
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {isLoading ? (

                <SwokipayDashboardLoader />

            ) :
                (<Container style={commonStyles.container}>
                    <PageHeader title={"GLOBAL_CONSTANTS.PERMISSIONS"} onBackPress={backArrowButtonHandler} isrefresh={true} onRefresh={handleRefresh} />
                    {error && <ErrorComponent message={error} screen={true} />}
                    <ScrollViewComponent>
                        <ViewComponent>
                            {PERMISSIONS_CONFIG.map((perm, index) => {
                                const status = permissionStatuses[perm.id];
                                const isGranted = status === 'granted' || status === 'limited';

                                return (
                                    <ViewComponent key={perm.id}>
                                        <CommonTouchableOpacity onPress={() => handlePermissionPress(perm)} disabled={isLoading}>
                                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.list, commonStyles.gap16, isLoading && { opacity: 0.5 }]}>
                                                <ViewComponent style={[commonStyles.quicklinks, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.iconcirclebg]}>
                                                    {perm.icon}
                                                </ViewComponent>
                                                <TextMultiLangauge text={perm.labelKey} style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500, commonStyles.flex1]} />
                                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt6]}>
                                                    {!isGranted && !isLoading && (
                                                        <Ionicons name="alert-circle-outline" size={s(20)} color={NEW_COLOR.BG_YELLOW} />
                                                    )}
                                                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                                                </ViewComponent>
                                            </ViewComponent>
                                        </CommonTouchableOpacity>
                                        {index < PERMISSIONS_CONFIG.length - 1 && <ViewComponent style={commonStyles.menuitemspace} />}
                                    </ViewComponent>
                                );
                            })}
                        </ViewComponent>
                    </ScrollViewComponent>
                </Container>)}
            <PopupOrSheet
                displayType="bottom-sheet"
                ref={permissionDeniedSheetRef}
                height={s(270)}
                title={"GLOBAL_CONSTANTS.PERMISIIONS_REQUIRED"}
            >
                <ViewComponent>
                    <ViewComponent style={[reversCommonStyles.alignCenter, reversCommonStyles.px16]}>
                        <ParagraphComponent
                            text={`${t("GLOBAL_CONSTANTS.YOU_HAVE_PREVIOUSLY_DENIED_ACCESS_TO_YOUR")} ${t(deniedPermissionName)} ${t("GLOBAL_CONSTANTS.PLEASE_ENABLE_THIS_PERMISIION_IN_YOUR_PHONE_SETINGS_TO_CONTINUE")}`}
                            style={[reversCommonStyles.textWhite, reversCommonStyles.fs14, reversCommonStyles.fw600, reversCommonStyles.textCenter]}
                        />
                        <ViewComponent style={[reversCommonStyles.mt24]}>
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.OPEN_SETTINGS"}
                                onPress={openSettingsFromPopup}
                            />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
            </PopupOrSheet>
        </ViewComponent>
    );
};

export default Permissions;