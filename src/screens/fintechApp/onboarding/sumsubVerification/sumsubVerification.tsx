import React, { useEffect, useState } from 'react';
import { SafeAreaView, Modal, Linking } from 'react-native';
import { getThemedCommonStyles } from '../../../../components/CommonStyles';
import Container from '../../../../components/container/container';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import ViewComponent from '../../../../components/view/view';
import ButtonComponent from '../../../../components/buttons/button';
import { useThemeColors } from '../../../../hooks/themedHook/useThemeColors';
import DashboardLoader from '../../../../components/loader';
import { useSumsubSDK } from '../../../../hooks/sumsubHooks/useSumsubSDK';
import TextMultiLanguage from '../../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CardLogoComponent from '../../../../components/arthacardlogo/cardlogo';
import useMemberLogin from '../../../../hooks/userInfoHook';
import ParagraphComponent from '../../../../components/textComponets/paragraphText/paragraph';
import AuthService from '../../../../apiServices/onBoarding/auth';
import WebView from 'react-native-webview';
import ConfirmLogout from '../../../commonScreens/logout/comfirmLogout';
import useLogout from '../../../../hooks/logout/useLogout';
import ScrollViewComponent from '../../../../components/scrollView/scrollView';
import { RootState } from '../interface';

interface WebUrlResponse {
    ok: boolean;
    data?: {
        url?: string;
    };
}

const Sumsub = React.memo(() => {
    const [loading, setLoading] = useState(false);
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const { launchSumsubSDK } = useSumsubSDK()
    const userInfo = useSelector((state: RootState) => state.userReducer?.userDetails);
    const { getMemDetails } = useMemberLogin();
    const [webUrl, setWebUrl] = useState<string | null>(null);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const isFocused = useIsFocused();
    const [isVisible, setIsVisible] = useState(false);
    const { logout } = useLogout();
    const [refresh, setRefresh] = useState<boolean>(false);

    const handleContinue = () => {
        // launchSumsubSDK();
        if ((userInfo?.accountType !== "Personal" && (userInfo?.kycStatus === 'Approved' || userInfo?.kycStatus === 'success'))) {
            getMemDetails();
        } else {
            if (userInfo?.accountType?.toLowerCase() === 'business') {
                getWebUrl();
            } else {
                launchSumsubSDK();

            }
        }

        // Navigate to the next KYC/KYB step (replace 'KycProfile' with your actual route)
    };

    useEffect(() => {
        if (userInfo?.accountType?.toLowerCase() === 'business') {
            getWebUrl();
        }
    }, [isFocused]);

    const handleClose = () => {
        setIsVisible(false)
    }
    const handleConfirm = async () => {
        setIsVisible(false)
        handleLogout();
    }
    const handleLogoutBtn = () => {
        setIsVisible(true)
    }

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
    };
    const onRefresh = () => {
        setRefresh(true);
        getMemDetails(false, "Sumsub");
        setRefresh(false);
    };
    const getWebUrl = async () => {
        try {
            const response = await AuthService.getBusinessWebUrl(userInfo?.id || '') as WebUrlResponse;
            if (response.ok && response?.data?.url) {
                Linking.openURL(response?.data?.url);
            }
        } catch (error) {
            console.error('Failed to get web URL:', error);
        }
    }
    const handleCloseWebView = () => {
        setIsModelOpen(false);
    };
    return (
        <SafeAreaView style={[commonStyles.screenBg, commonStyles.flex1]}>
            {loading && (
                <ViewComponent style={[commonStyles.flex1, commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                    <DashboardLoader />
                </ViewComponent>
            )}
            {!loading && (
                <Container style={[commonStyles.container]}>
                    <ScrollViewComponent
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        refreshing={refresh} onRefresh={onRefresh}
                    >
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter,]}>
                            <ViewComponent style={[commonStyles.mxAuto]}>
                                <CardLogoComponent />
                            </ViewComponent>
                        </ViewComponent>

                        <ViewComponent style={[commonStyles.sectionGap]} />

                        <ViewComponent style={[commonStyles.flex1]}>

                            <ViewComponent style={[commonStyles.sectionGap]} />

                            <ViewComponent style={[commonStyles.myAuto]}>
                                <ViewComponent style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                    <ParagraphComponent
                                        text={userInfo?.accountType == "Business" ? "KYB" : "KYC"}
                                        style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6, { marginHorizontal: 4 }]}
                                    />
                                    <TextMultiLanguage
                                        text={"GLOBAL_CONSTANTS.VERIFICATION"}
                                        style={[commonStyles.sectionTitle, commonStyles.textCenter, commonStyles.mb6]}
                                    />
                                </ViewComponent>


                                <TextMultiLanguage
                                    text={"GLOBAL_CONSTANTS.YOUR_ARE_ABOUT_TO_SUBMIT_SENSITIVE_DATA"}
                                    style={[
                                        commonStyles.sectionsubtitlepara,
                                        commonStyles.textCenter,
                                        commonStyles.sectionGap,
                                    ]}
                                />
                            </ViewComponent>

                        </ViewComponent>
                        <ViewComponent style={[]}>
                            {(userInfo?.accountType !== "Personal" && (userInfo?.kycStatus === 'Approved' || userInfo?.kycStatus === 'success')) && (
                                <ViewComponent>
                                    <ButtonComponent title={"GLOBAL_CONSTANTS.REFRESH"} onPress={handleContinue} />
                                    <ViewComponent style={[commonStyles.sectionGap]} />
                                </ViewComponent>
                            )

                            }
                            <ButtonComponent title={"GLOBAL_CONSTANTS.CONTINUE"} onPress={handleContinue} />
                            <ViewComponent style={[commonStyles.buttongap]} />
                            <ButtonComponent
                                title={"GLOBAL_CONSTANTS.LOGOUT"}
                                onPress={handleLogoutBtn}
                                solidBackground={true}
                            />
                            <ViewComponent style={[commonStyles.sectionGap]} />
                        </ViewComponent>

                        <ConfirmLogout
                            isVisible={isVisible}
                            onClose={handleClose}
                            onConfirm={handleConfirm} />
                    </ScrollViewComponent>
                </Container>

            )}
            {isModelOpen && (
                <Modal
                    visible={isModelOpen}
                    onRequestClose={handleCloseWebView}
                    animationType="slide"
                >
                    <SafeAreaView style={[commonStyles.flex1, commonStyles.screenBg]}>

                        <WebView
                            source={{ uri: webUrl || '' }}
                            style={[commonStyles.flex1, commonStyles.screenBg]}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                        />

                    </SafeAreaView>
                </Modal>
            )
            }
        </SafeAreaView>
    );
});

export default Sumsub;


