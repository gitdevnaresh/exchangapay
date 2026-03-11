import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { s } from 'react-native-size-matters';
// --- Local Imports ---
import PageHeader from '../../../../newComponents/pageHeader/pageHeader';
import ViewComponent from '../../../../newComponents/view/view';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import { showAppToast } from '../../../../newComponents/ToasterMessages/ShowMessage';
import { isErrorDispaly } from '../../../../utils/helpers';
import ProfileService from '../../../../services/profile';
import { setAutoLockTime } from '../../../../redux/actions/actions';
import { useHardwareBackHandler } from '../../../../hooks/HardwareBackHandler';
import ImageUri from '../../../../newComponents/imageComponents/image';
import { COMMON_SVG_URLS } from '../../../../assets/blobUrls';
import TextMultiLanguage from '../../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import { useLngTranslation } from '../../../../hooks/useLngTranslation';
import ErrorComponent from '../../../../newComponents/errorDisplay/errorDisplay';

const AutoLock = ({ route }: any) => {
    // --- Hooks and Variables ---
    const {
        autoLock: initialAutoLock,
        setAutoLock: setAutoLockInParent,
        options,
        biometricsEnabled,
        patternEnabled,
        patternNo // Assuming patternEnabled is also passed via route.params
    } = route.params;

    const navigation = useNavigation();
    const dispatch = useDispatch();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const [currentAutoLock, setCurrentAutoLock] = useState(initialAutoLock);
    const [loadingItem, setLoadingItem] = useState<number | null>(null);
    const { t } = useLngTranslation();
    const [error, setError] = useState<string>("");
    /**
     * Handles selecting a new auto-lock duration.
     * It optimistically updates the UI, then calls the API.
     * If the API call fails, it reverts the change and shows an error message.
     * @param {number} val The selected time value in minutes.
     */

    useHardwareBackHandler(() => {
        navigation.goBack();
        setError("");
        return true;

    })
    const renderSelectionIndicator = (itemValue: number) => {
        if (loadingItem === itemValue) {
            return <ActivityIndicator color={NEW_COLOR.BG_YELLOW} />;
        }
        if (currentAutoLock === itemValue) {
            return (
                <ViewComponent style={commonStyles.radioDot}>
                    <Ionicons name="checkmark-sharp" size={s(16)} color={NEW_COLOR.TEXT_BLACK} />
                </ViewComponent>
            );
        }
        return <ViewComponent style={[commonStyles.radioOuter]} />;
    };

    const handleSelect = async (val: number) => {
        if (loadingItem !== null || currentAutoLock === val) return;

        setLoadingItem(val);
        const previousValue = currentAutoLock;
        setCurrentAutoLock(val); // Optimistic UI update

        try {
            const payload = {
                isBiometric: biometricsEnabled,
                isPattern: patternEnabled,
                minutes: val,
                patternNo: patternNo
            };

            const response = await ProfileService.updateApplock(payload);

            if (response.status === 200) {
                showAppToast(t("GLOBAL_CONSTANTS.AUTO_LOCK_TIME_UPDATED_SUCCESS"), "success");
                setAutoLockInParent(val); // Update state in the parent component
                dispatch(setAutoLockTime(val)); // Update Redux store
                navigation.goBack();
            }
            else {
                setError(isErrorDispaly(response));
                setCurrentAutoLock(previousValue);
            }

        } catch (error) {
            setError(isErrorDispaly(error));
            setCurrentAutoLock(previousValue); // Rollback UI state
        } finally {
            setLoadingItem(null);
        }
    };

    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            <ViewComponent style={commonStyles.container}>
                <PageHeader title={"GLOBAL_CONSTANTS.APPLOCK"} onBackPress={() => navigation.goBack()} />
                {error && <ErrorComponent message={error} screen={true} />}
                <ViewComponent style={[commonStyles.dflex, commonStyles.mb16, commonStyles.gap10]}>
                    <ImageUri uri={COMMON_SVG_URLS.alertIcon} height={s(24)} width={s(24)} />
                    <TextMultiLanguage text={"GLOBAL_CONSTANTS.FOR_ADDED_SECURITY_BULLSWIPE_PAY_WILL_AUTOMATICALLY_LOCK_AFTER_YOU_RE"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.flex1, commonStyles.textGrey]} />
                </ViewComponent>

                <FlatList
                    data={options}
                    keyExtractor={item => item?.value?.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[commonStyles.flexRow, commonStyles.alignCenter, commonStyles.justifyContent, commonStyles.appLock_14, commonStyles.menuitemspace]}
                            onPress={() => handleSelect(item.value)}
                            disabled={loadingItem !== null} // Disable all items during an update
                        >
                            <ParagraphComponent style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} text={item.label} />
                            {renderSelectionIndicator(item.value)}
                        </TouchableOpacity>
                    )}
                />
            </ViewComponent>
        </SafeAreaView>
    );
};

export default AutoLock;