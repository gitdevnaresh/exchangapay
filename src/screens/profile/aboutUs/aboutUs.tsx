import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Linking, Platform, Alert } from 'react-native';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import RNFS from 'react-native-fs';
import { showAppToast } from '../../../newComponents/ToasterMessages/ShowMessage';
import { PopupOrSheetRef } from '../../../newComponents/models/PopupOrSheet';
import DeviceInfo from 'react-native-device-info';
import AppVersions from '../../../apiServices/versionUpdateServices/appUpdateApis';
import { FeedbackReasonList, VersionInfo } from './interface';
import ProfileService from '../../../services/profile';
import { isErrorDispaly } from '../../../utils/helpers';
import { useSelector } from 'react-redux';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLngTranslation } from '../../../hooks/useLngTranslation';
import ClearCachePopup from './components/ClearCachePopup';
import AppUpdatePopup from './components/AppUpdatePopup';
import RatingSection from './components/RatingSection';
import AboutOptions from './components/AboutOptions';
import AppHeader from './components/AppHeader';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import ImageBackgroundWrapper from '../../../newComponents/imageComponents/ImageBackground';
import { s } from '../../../constants/theme/scale';

// Helper function to recursively calculate the size of a directory.
const getDirectorySize = async (dirPath: string): Promise<number> => {
    try {
        const items = await RNFS.readDir(dirPath);
        let totalSize = 0;
        for (const item of items) {
            if (item.isFile()) {
                totalSize += item.size;
            } else if (item.isDirectory()) {
                totalSize += await getDirectorySize(item.path);
            }
        }
        return totalSize;
    } catch {
        return 0;
    }
};

const isNewerVersion = (currentVersion: string, serverVersion: string): boolean => {
    if (!serverVersion) return false;
    const currentParts = currentVersion.split('.').map(Number);
    const serverParts = serverVersion.split('.').map(Number);
    const len = Math.max(currentParts.length, serverParts.length);

    for (let i = 0; i < len; i++) {
        const current = currentParts[i] || 0;
        const server = serverParts[i] || 0;
        if (server > current) return true;
        if (current > server) return false;
    }
    return false;
};



const AboutUs = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [rating, setRating] = useState<number | null>(null);
    const [resonsList, setResonsList] = useState<FeedbackReasonList>([])
    const [cacheSize, setCacheSize] = useState('0 MB');
    const popupRef = useRef<PopupOrSheetRef>(null);
    const cacheClearActionRef = useRef<null | (() => Promise<void>)>(null);
    const appVersion = DeviceInfo.getVersion();
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [versionInfo, setVersionInfo] = useState<VersionInfo>();
    const userInfo = useSelector((state: any) => state.userReducer.userDetails);
    const { encryptAES, decryptAES } = useEncryptDecrypt();
    const dycryptUserName = decryptAES(userInfo?.userName);
    const [ratingLoading, setratingLoading] = useState<boolean>(false)
    const [showReasons, setShowReasons] = useState(false);
    const [selectedReason, setSelectedReason] = useState<any | null>(null);
    const [description, setDescription] = useState('');
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [updatePopupType, setUpdatePopupType] = useState<'update' | 'latest'>('latest')
    const updatePopupRef = useRef<PopupOrSheetRef>(null);
    const [error,setError]=useState<string>("");
    const { t } = useLngTranslation();
    // FIX: Updated to include more cache directories for a more accurate calculation
    const getCacheDirPaths = () => {
        const paths = [];
        if (Platform.OS === 'android') {
            paths.push(RNFS.CachesDirectoryPath); // /data/user/0/<bundle_id>/cache
            paths.push(RNFS.ExternalCachesDirectoryPath); // /storage/emulated/0/Android/data/<bundle_id>/cache
            paths.push(`${RNFS.DocumentDirectoryPath}/../code_cache`); // /data/user/0/<bundle_id>/code_cache
        } else {
            // On iOS, CachesDirectoryPath is the primary location and is usually sufficient.
            paths.push(RNFS.CachesDirectoryPath);
        }
        return paths;
    };


    const getCacheSize = useCallback(async () => {
        try {
            const cacheDirPaths = getCacheDirPaths();
            let totalSize = 0;
            // Use Promise.all for concurrent directory size calculation
            const sizes = await Promise.all(
                cacheDirPaths.map(async (path) => {
                    const dirExists = await RNFS.exists(path);
                    if (dirExists) {
                        return getDirectorySize(path);
                    }
                    return 0;
                })
            );
            totalSize = sizes.reduce((acc, size) => acc + size, 0);

            if (totalSize < 1) { setCacheSize('0 KB'); }
            else if (totalSize < 1024 * 1024) { setCacheSize(`${(totalSize / 1024).toFixed(2)} KB`); }
            else { setCacheSize(`${(totalSize / (1024 * 1024)).toFixed(2)} MB`); }
        } catch {
            setError("Failed to get cache size");
            setCacheSize('0 KB');
        }
    }, []);

    useEffect(() => {
        setError("");
        getRaatingLu();
        SelectedRating();
        checkForUpdates(false);
        const unsubscribe = navigation.addListener('focus', () => {
            getCacheSize();
        });
        return unsubscribe;
    }, [navigation, getCacheSize]);

    const checkForUpdates = async (showPopup = false) => {
        if (showPopup && isCheckingUpdate) return;
        if (showPopup) setIsCheckingUpdate(true);
        
        try {
            const res: any = await AppVersions.getAppVersions();
            const serverVersionInfo: VersionInfo = JSON.parse(res?.data?.jsonVersion);
            if (showPopup) setVersionInfo(serverVersionInfo);
            if (!serverVersionInfo) return;
            
            const applicationId = DeviceInfo.getBundleId();
            let versionDetailsInfo: VersionInfo | any = serverVersionInfo;
            if (serverVersionInfo?.Info && Array.isArray(serverVersionInfo.Info) && serverVersionInfo.Info.length > 0) {
                const appSpecificInfo = serverVersionInfo.Info.find(
                    (app: any) => app.applicationId === applicationId
                );
                if (appSpecificInfo && appSpecificInfo.applicationInfo) {
                    versionDetailsInfo = appSpecificInfo.applicationInfo;
                }
            }

            const versionName = DeviceInfo.getBuildNumber();
            const versionNumber = DeviceInfo.getVersion();

            let updateAvailable = false;
            if (Platform.OS === 'ios') {
                let liveVersion = versionDetailsInfo['iosBuildVersion'];
                updateAvailable = liveVersion ? isNewerVersion(versionNumber, liveVersion.toString()) : false;
            } else {
                let liveVersion = versionDetailsInfo['androidBuildVersion'];
                updateAvailable = liveVersion > Number(versionName);
            }
            setUpdateAvailable(updateAvailable);
            
            if (showPopup) {
                setUpdatePopupType(updateAvailable ? 'update' : 'latest');
                updatePopupRef.current?.open();
            }
        } catch (err) {
            if (showPopup) setError(isErrorDispaly(err));
        } finally {
            if (showPopup) setIsCheckingUpdate(false);
        }
    };

    useHardwareBackHandler(() => {
        handleBackPress();
    });

    const handleBackPress = () => {
        navigation.goBack();
    };
    const getRaatingLu = async () => {
        setError("");
        try {
            const response: any = await ProfileService.ratingLu();
            if (response.status === 200) {
                const ratingData = response.data;
                setResonsList(ratingData?.Rating);
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    }
    const SelectedRating = async () => {
        setError("");
        try {
            const response: any = await ProfileService.getRating();
            if (response.status === 200) {
                const ratingData = response.data;
                if (ratingData.status == 200) {
                    setRating(ratingData?.rating);
                    if (ratingData?.rating <= 2) {
                        setShowReasons(true);
                    }
                }
            } else {
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setError(isErrorDispaly(error));
        }
    }

    const handleRatingSubmit = async () => {
        if (rating === null) {
            showAppToast(t("GLOBAL_CONSTANTS.PLEASE_SELECT_A_RATING_BEFORE_SUBMITTING"), 'error');
            return;
        }
        setratingLoading(true)
        try {
            const body = {
                rating: rating,
                reason: selectedReason ? selectedReason.name : "",
                descrption: description || "",
                createdBy: encryptAES(dycryptUserName),
                modifiedBy: encryptAES(dycryptUserName),
                screenAction: "AboutUs"

            };
            const response: any = await ProfileService.postRating(body);
            if (response.status === 200) {
                showAppToast(t("GLOBAL_CONSTANTS.RATING_SUBMITED_SUCCESSFULLY"), 'success');
                setRating(null);
                setSelectedReason("");
                setShowReasons(false);
                setDescription("");
                setratingLoading(false);

            } else {
                setError(isErrorDispaly(response));
                setratingLoading(false)
            }
        } catch (error) {
            setError(isErrorDispaly(error));
            setratingLoading(false)
        }
    };

    const handlePrivecyPolicy = () => {
        Linking.openURL('https://bullswipe.com/privacy-policy/');
    };

    const handleTermsConditions = () => {
        Linking.openURL('https://bullswipe.com/terms-conditions/');
    };

    // FIX: This function now clears all directories identified by getCacheDirPaths
    const handleClearCache = async (showConfirmation = true) => {
        const clearAction = async () => {
            try {
                const cacheDirPaths = getCacheDirPaths();
                await Promise.all(
                    cacheDirPaths.map(async (dirPath) => {
                        try {
                            if (await RNFS.exists(dirPath)) {
                                await RNFS.unlink(dirPath);
                            }
                        } catch (e) {
                            setError(`${t("GLOBAL_CONSTANTS.FAILED_TO_CLEAR_DIRECTORY")} ${e}${dirPath} ${e}`);
                        }
                    })
                );
                showAppToast(t("GLOBAL_CONSTANTS.CACHE_CLEARED_SUCCESSFULLY"), 'success');
                getCacheSize(); // Recalculate size to confirm it's cleared
            } catch {
                setError(t("GLOBAL_CONSTANTS.FAILED_TO_CLEAR_CACHE"));
            }
        };

        if (showConfirmation) {
            // Check based on the number part of the cacheSize string
            if (parseFloat(cacheSize) < 0.01) {
                showAppToast(t("GLOBAL_CONSTANTS.NO_CACHE_TO_CLEAR"), 'info');
                return;
            }
            cacheClearActionRef.current = clearAction;
            popupRef.current?.open();
        } else {
            await clearAction(); // For programmatic clearing without confirmation
        }
    };


    const handleAppUpdateCheck = () => checkForUpdates(true);

    const handleUpdateNow = async () => {
        try {
            if (Platform.OS === 'ios') {
                Alert.alert(
                    t("GLOBAL_CONSTANTS.UPDATE_AVAILABLE"),
                    t("GLOBAL_CONSTANTS.NEW_VERSION_AVAILABLE_TESTFLIGHT"),
                    [{ text: t("GLOBAL_CONSTANTS.OK"), onPress: () => updatePopupRef.current?.close() }]
                );
                return;
            }
            
            const applicationId = DeviceInfo.getBundleId();
            const storeUrl = `market://details?id=${applicationId}`;

            if (await Linking.canOpenURL(storeUrl)) {
                await Linking.openURL(storeUrl);
                updatePopupRef.current?.close();
            } else {
                setError(t("GLOBAL_CONSTANTS.COULD_NOT_OPEN_APP_STORE"));
            }
        } catch {
            setError(t("GLOBAL_CONSTANTS.COULD_NOT_OPEN_APP_STORE"));
        }
    };

    const aboutOptions = [
        { id: 'app_update', iconSet: 'SimpleLineIcons', icon: 'cloud-upload', title: "APP_UPDATE", rightContent: { type: 'version', value: `v${appVersion}` }, onPress: handleAppUpdateCheck },
        { id: 'privacy_policy', iconSet: 'MaterialCommunityIcons', icon: 'shield-check-outline', title: "PRIVACY_POLICY", onPress: handlePrivecyPolicy },
        { id: 'terms_conditions', iconSet: 'MaterialCommunityIcons', icon: 'text-box-minus-outline', title: "TERMS_AND_CONDITIONS", onPress: handleTermsConditions },
        { id: 'clear_cache', iconSet: 'Feather', icon: 'trash-2', title: "CLEAR_CACHE", rightContent: { type: 'text', value: cacheSize }, onPress: () => handleClearCache(true) },
    ];

    const handleRatingSelect = (option: any) => {
        const newRating = option.value;
        setRating(newRating);
        if (newRating === 1) { // Show for ratings 1 and 2
            setShowReasons(true);
        } else {
            setShowReasons(false);
            setSelectedReason(null);
            setDescription('');
        }
    }
    const handleReasonSelect = (reason: any) => {
        if (selectedReason?.name === reason.name) {
            setSelectedReason(null);
        } else {
            setSelectedReason(reason);
        }
    };


    const handleconfirm = async () => {
        if (cacheClearActionRef.current) {
            await cacheClearActionRef.current();
            popupRef.current?.close();
        }
    }
    const handleClose = () => {
        updatePopupRef.current?.close()
    }
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <KeyboardAwareScrollView
                style={commonStyles.flex1}
                contentContainerStyle={{ paddingBottom: s(24) }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
            >
                <ImageBackgroundWrapper
                    source={require("../../../assets/imageAssets/blackBackground.jpg")}
                    style={{ width: "100%", minHeight: s(560) }}
                    resizeMode="cover"
                >
                    <PageHeader title="GLOBAL_CONSTANTS.ABOUT_US" onBackPress={handleBackPress} containerStyle={[commonStyles.px24, commonStyles.pt24]} />
                    <ViewComponent style={[commonStyles.px24]}>
                        {error && <ErrorComponent message={error} screen={true} />}
                    </ViewComponent>
                    <ViewComponent>
                        <AppHeader appVersion={appVersion} />
                        <ViewComponent style={[commonStyles.sectionGap]} />
                        <RatingSection
                            rating={rating}
                            showReasons={showReasons}
                            resonsList={resonsList}
                            selectedReason={selectedReason}
                            description={description}
                            ratingLoading={ratingLoading}
                            onRatingSelect={handleRatingSelect}
                            onReasonSelect={handleReasonSelect}
                            onDescriptionChange={setDescription}
                            onSubmit={handleRatingSubmit}
                        />
                    </ViewComponent>
                </ImageBackgroundWrapper>
                <AboutOptions 
                    options={aboutOptions} 
                    isCheckingUpdate={isCheckingUpdate} 
                    updateAvailable={updateAvailable} 
                />
                <ViewComponent style={[commonStyles.sectionGap]} />
            </KeyboardAwareScrollView>
            <ClearCachePopup popupRef={popupRef} onConfirm={handleconfirm} />
            <AppUpdatePopup 
                popupRef={updatePopupRef} 
                updatePopupType={updatePopupType} 
                onUpdateNow={handleUpdateNow} 
                onClose={handleClose} 
            />
        </ViewComponent>
    );
};

export default AboutUs;