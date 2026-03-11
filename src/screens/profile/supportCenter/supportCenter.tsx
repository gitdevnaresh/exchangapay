import React, { useCallback, useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../../hooks/useThemeColors';
import ViewComponent from '../../../newComponents/view/view';
import PageHeader from '../../../newComponents/pageHeader/pageHeader';
import TextMultiLanguage from '../../../newComponents/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../newComponents/touchableComponents/touchableOpacity';
import { s } from '../../../constants/theme/scale';
import { ActionLogParams, useActionLogging } from '../../../hooks/loggingHook';
import ImageBackgroundWrapper from '../../../newComponents/imageComponents/ImageBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { getThemedCommonStyles } from '../../../assets/styles/CommonStyles';
import { useHardwareBackHandler } from '../../../hooks/HardwareBackHandler';
import ProfileService from '../../../services/profile';
import { isErrorDispaly } from '../../../utils/helpers';
import SwokipayDashboardLoader from '../../../newComponents/swokipayloader';
import NoDataComponent from '../../../newComponents/noData/noData';
import { SvgUri } from 'react-native-svg';
import ScrollViewComponent from '../../../newComponents/scrollView/scrollView';
import ErrorComponent from '../../../newComponents/errorDisplay/errorDisplay';
import { zendeskAuth, zendeskOpen } from '../../../hooks/zendesk/zendesk';
import useEncryptDecrypt from '../../../hooks/encDecHook';
import { ActivityIndicator } from 'react-native';
interface SupportChatMenuOption {
    id: string;
    logo: string;
    title: string;
}
const SupportCentre = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { logEvent } = useActionLogging();
    const { decryptAES } = useEncryptDecrypt();
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const [supportOptions, setSupportOptions] = useState<SupportChatMenuOption[]>([]);
    const isFocused = useIsFocused();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [error,setError]=useState<string>("");
 
    const handleBackPress = () => {
        navigation.goBack();
    };
    useHardwareBackHandler(() => {
        handleBackPress();
        return true;
    });

    useEffect(() => {
        if (isFocused) {
            fetchSupportOptions();
        }
    }, [isFocused]);

    const handleNavigate = useCallback((option: any) => {
        const { title } = option;
        let screenName = 'ComingSoon';
        let params: any = { pageHeader: false, customHeader: { title: title, showBackButton: true } };
        const normalizedTitle = title.toLowerCase().trim();

        switch (normalizedTitle) {
            case 'messages':
                screenName = 'SupportTickets';
                params = {};
                break;
            case 'help':
                screenName = 'SearchForHelp';
                params = { chatOption: option.title };
                break;
            case 'send us a message':
                // Open Zendesk chat
                openZendeskChat();
                return;
                break;
            case 'search for help':
                screenName = 'ComingSoon';
                params = {
                    chatOption: option.title
                };

                break;
        }

        const actionData: ActionLogParams = {
            screename: 'SupportCentre',
            actionName: `Navigate to ${title}`,
            actionType: 'Button',
            nextScreenName: screenName,
        };
        logEvent('navigation_action', actionData);
        navigation.navigate(screenName, params);
    }, [navigation, logEvent]);

    const openZendeskChat = useCallback(async () => {
        setIsChatLoading(true);
        try {
            if (userInfo) {
                await zendeskAuth({
                    id: userInfo.id,
                    name: userInfo?.userName ? decryptAES(userInfo.userName) : 'User',
                    email: userInfo?.email ? decryptAES(userInfo.email) : `${userInfo.id}@support.local`,
                });
            }
            await zendeskOpen();
        } catch (e) {
            console.log('Support failed:', e);
        } finally {
            setIsChatLoading(false);
        }
    }, [userInfo, decryptAES]);

    const fetchSupportOptions = async () => {
        setError("");
        setIsLoading(true);
        try {
            const response: any = await ProfileService.getSupportOptions();
            if (response.ok) {
                setSupportOptions(response.data);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                setError(isErrorDispaly(response));
            }
        } catch (error) {
            setIsLoading(false);
            setError(isErrorDispaly(error));
        }
    };
    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {isLoading && (<SwokipayDashboardLoader />)}
            {!isLoading && <ScrollViewComponent>
            <ViewComponent>
                <ImageBackgroundWrapper
                    source={require("../../../assets/imageAssets/supportCenter.png")}
                    style={{
                        height: s(311),
                        width: '100%',
                    }}
                    imageStyle={{
                        resizeMode: 'cover',
                    }}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']} // Fades from light overlay to dark
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={{ flex: 1, paddingHorizontal: s(24), paddingBottom: s(20) }} // This style makes it fill the container
                    >
                        <PageHeader
                            title="GLOBAL_CONSTANTS.SUPPORT_CENTER"
                            onBackPress={handleBackPress}
                            containerStyle={[commonStyles.py20]}
                        />
                        <ViewComponent style={[commonStyles.flex1, commonStyles.justifyCenter, commonStyles.alignCenter]}>
                            <TextMultiLanguage
                                text="GLOBAL_CONSTANTS.HI_THERE"
                                style={[commonStyles.textAlwaysWhite, commonStyles.fs32, commonStyles.fw700]}
                            />
                            <TextMultiLanguage
                                text="GLOBAL_CONSTANTS.HOW_CAN_WE_HELP"
                                style={[commonStyles.textAlwaysWhite, commonStyles.fs32, commonStyles.fw700, commonStyles.mt4]}
                            />
                        </ViewComponent>
                    </LinearGradient>
                </ImageBackgroundWrapper>
                <ViewComponent style={[commonStyles.p24, commonStyles.gap6]}>
                    {error&&<ErrorComponent message={error} screen={true}/>}
                    {(supportOptions && supportOptions?.length > 0) && supportOptions?.map((option) => (
                        <CommonTouchableOpacity
                            key={option.id}
                            style={[{
                                borderWidth: 1,
                                borderColor: NEW_COLOR.INPUT_BORDER,
                            }, commonStyles.rounded12, commonStyles.p8]}
                            onPress={() => handleNavigate(option)}
                            disabled={isChatLoading && option.title.toLowerCase().trim() === 'send us a message'}
                        >
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap16]}>
                                <ViewComponent style={[commonStyles.communityiconbg, commonStyles.dflex, commonStyles.justifyCenter]}>
                                    <SvgUri
                                        width={s(24)}
                                        height={s(24)}
                                        uri={option.logo}
                                    />
                                </ViewComponent>
                                <TextMultiLanguage
                                    text={`${option.title}`}
                                    style={[commonStyles.fs16, commonStyles.fw400, commonStyles.textWhite]}
                                />
                                {isChatLoading && option.title.toLowerCase().trim() === 'send us a message' ? (
                                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap8, { marginLeft: 'auto' }]}>
                                        <ActivityIndicator size="small" color={NEW_COLOR.ICON_YELLOW_LOADER} />
                                        <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} />
                                    </ViewComponent>
                                ) : (
                                    <Ionicons name="chevron-forward" size={s(22)} color={NEW_COLOR.ICON_GREY} style={{ marginLeft: 'auto' }} />
                                )}
                            </ViewComponent>
                        </CommonTouchableOpacity>
                    ))}
                    {!isLoading && supportOptions?.length <= 0 && (
                        <ViewComponent style={[commonStyles.alignCenter, commonStyles.sectionGap]}>

                            <NoDataComponent />
                        </ViewComponent>
                    )}

                </ViewComponent>
            </ViewComponent>
            </ScrollViewComponent>}
        </ViewComponent>
    );
};

export default SupportCentre;