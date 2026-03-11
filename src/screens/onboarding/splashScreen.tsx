import React, { useState, useEffect, useMemo } from "react";
import { Image, StyleSheet, useColorScheme, Dimensions, ScrollView } from "react-native";
import ViewComponent from "../../newComponents/view/view";
import { useThemeColors } from "../../hooks/useThemeColors";
import TextMultiLangauge from "../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import { s } from "../../newComponents/theme/scale";
import ButtonComponent from "../../newComponents/buttons/button";
import { Loaders } from "./interfaces";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { SPLASH_CONSTANTS } from "./constants";
import { LinearGradient } from "expo-linear-gradient";
import { store } from "../../redux/reducers";
import useMemberLogin from "../../hooks/userInfoHook";
import { useAuthSession } from "../../hooks/useAuthSession";
import SafeAreaViewComponent from "../../newComponents/safeArea/safeArea";
import SwokipayDashboardLoader from "../../newComponents/swokipayloader";
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import { login, useAuth } from "@frontegg/react-native";
import { storeToken, storeVendorToken } from "../../services/auth0Service";
import { getTabsConfigation } from "../../../configuration";
import { getVendorToken } from "../../apiServices/fronteggApiServices/fronteggServices";

const { height } = Dimensions.get("window");
const isSmallScreen = height < s(750); // e.g., iPhone SE, Mini

const SplashScreen = () => {
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const navigation = useNavigation<any>();
    const { checkAuthStatus } = useAuthSession();
    const { getMemDetails } = useMemberLogin();
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const state = useAuth();
    const isFocused = useIsFocused();
    const [loaders, setLoaders] = useState<Loaders>({
        signUpLoader: false,
        loginLoader: false,
        googleLoader: false,
        socialSignupLoader: false
    });
    const Configuration: any = useMemo(
        () => getTabsConfigation("IDENITY_CONFIG"),
        []
    );
    const appThemePreference = store?.getState().userReducer?.appTheme;
    const systemColorScheme = useColorScheme();
    const effectiveTheme =
        appThemePreference === "system" || !appThemePreference
            ? systemColorScheme
            : appThemePreference;

    const handleLinerColors = {
        light: ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
        dark: ["#000000", "#444444", "#000000"],
    };
    useEffect(() => {

        handleGetVendorToken();
    }, [])
    useEffect(() => {
        if (Configuration.FFRONTEGG?.enabled) {
            if (state?.user !== null) {
                setTokens();
            } else {
                setIsAuthLoading(false);
            }
        }
    }, [state?.user, isFocused, Configuration.FFRONTEGG?.enabled, Configuration.FFRONTEGG?.sdk]);
    useEffect(() => {
        if (Configuration.AUTH0 || (Configuration.FFRONTEGG?.enabled && Configuration.FFRONTEGG?.manualForm)) {
            const initialize = async () => {
                const isAuthenticated = await checkAuthStatus();
                if (isAuthenticated) {
                    getMemDetails();
                } else {
                    setIsAuthLoading(false);
                }
            };
            initialize();
        } else {
            setIsAuthLoading(false);
        }
    }, [Configuration.AUTH0]);

    const handleGetVendorToken = async () => {
        try {
            const response = await getVendorToken();
            if (response?.data) {
                storeVendorToken(response.data.token, response.data.expiresIn);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const navigateToSignUp = () => {
        setLoaders({ ...loaders, signUpLoader: true });
        if (Configuration.AUTH0) {
            navigation?.navigate(SPLASH_CONSTANTS?.SIGN_UP);
        } else {
            navigation?.navigate("frontEggSignup");
        }
        setLoaders({ ...loaders, signUpLoader: false });
    };

    const navigateToLogin = () => {
        setLoaders({ ...loaders, loginLoader: true });
        if (Configuration.AUTH0) {
            navigation?.navigate(SPLASH_CONSTANTS?.LOGIN);
        } else {
            navigation?.navigate("FrontEggLogin");
        }
        setLoaders({ ...loaders, loginLoader: false });
    };


    const setTokens = async () => {
        setLoaders({ ...loaders, loginLoader: true });
        try {
            await storeToken(state?.accessToken, state?.refreshToken);
            await getMemDetails();
        } catch (e) {

        } finally {
            setLoaders({ ...loaders, loginLoader: false });

        }

    };
    if (isAuthLoading) {
        return (
            <SafeAreaViewComponent>
                <SwokipayDashboardLoader />
            </SafeAreaViewComponent>
        );
    };

    const handleLogin = async () => {
        setLoaders({ ...loaders, loginLoader: true });
        try {
            await login();
        } catch (error) {
            console.error("Frontegg Login Error:", error);
        } finally {
            setLoaders({ ...loaders, loginLoader: false });
        }
    };

    return (
        <SafeAreaViewComponent style={[commonStyles.flex1]}>
            <LinearGradient
                colors={effectiveTheme === "dark" ? handleLinerColors.dark : handleLinerColors.light}
                locations={[0, 0.4, 1]}
                start={{ x: 0.65, y: 0 }}
                end={{ x: 0.65, y: 1 }}
                style={[commonStyles.flex1]}
            >
                <ScrollView
                    contentContainerStyle={[
                        commonStyles.flexGrow1,
                        commonStyles.myAuto,
                        // { justifyContent: "space-between", flexGrow: 1 }
                    ]}
                    bounces={false}
                >

                    {/* Middle Text & Image */}
                    <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.myAuto]}>
                        <ViewComponent style={[commonStyles.alignCenter, { flexShrink: 1 }]}>
                            <TextMultiLangauge
                                text="GLOBAL_CONSTANTS.CRYPTO_SPENDING_SIMPLIFIED"
                                style={[
                                    commonStyles.fs36,
                                    commonStyles.fw700,
                                    commonStyles.getStartedText,
                                    commonStyles.textCenter,
                                    commonStyles.mb14
                                ]}
                            />
                            <ViewComponent>
                                <Image
                                    source={require("../../assets/imageAssets/getStartedCards.png")}
                                    style={{
                                        width: "90%",
                                        aspectRatio: 318 / 316,
                                        maxWidth: s(350)
                                    }}
                                    resizeMode="contain"
                                />
                            </ViewComponent>
                        </ViewComponent>
                    </ViewComponent>

                    {/* Bottom Buttons */}
                    <ViewComponent
                        style={[
                            commonStyles.alignCenter,
                            commonStyles.gap5,
                            commonStyles.px24,
                            commonStyles.sectionGap,
                            { paddingBottom: s(isSmallScreen ? 20 : 40) }
                        ]}
                    >
                        {(Configuration.AUTH0 || (Configuration.FFRONTEGG?.enabled && Configuration.FFRONTEGG?.manualForm)) && (
                            <ViewComponent style={[commonStyles.flexRow, commonStyles.gap5]}>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title="GLOBAL_CONSTANTS.SIGN_UP"
                                        onPress={navigateToSignUp}
                                        customContainerStyle={[commonStyles.bg_yellow]}
                                        loading={loaders.signUpLoader}
                                        disable={loaders.signUpLoader}
                                    />
                                </ViewComponent>
                                <ViewComponent style={[commonStyles.flex1]}>
                                    <ButtonComponent
                                        title="GLOBAL_CONSTANTS.LOGIN"
                                        onPress={navigateToLogin}
                                        solidBackground
                                        customContainerStyle={[commonStyles.bgBtn]}
                                        customButtonStyle={[{ backgroundColor: NEW_COLOR.LOGIN_BTN }]}
                                        customTitleStyle={[{ color: NEW_COLOR.LOGIN_BTNTEXT }]}
                                        loading={loaders.loginLoader}
                                        disable={loaders.loginLoader}
                                    />
                                </ViewComponent>
                            </ViewComponent>
                        )}

                        {(Configuration.FFRONTEGG?.enabled && Configuration.FFRONTEGG?.sdk) && (
                            <ViewComponent style={[{ width: '100%' }]}>
                                <ButtonComponent
                                    title="GLOBAL_CONSTANTS.GET_STARTED"
                                    onPress={handleLogin}
                                    loading={loaders.loginLoader}
                                    disable={loaders.loginLoader}
                                />
                            </ViewComponent>
                        )}
                    </ViewComponent>
                </ScrollView>
            </LinearGradient>
        </SafeAreaViewComponent>
    );
};

const styles = StyleSheet.create({
    btnStyle: {
        width: s(180),
        height: s(55),
        borderRadius: s(100)
    },
});

export default SplashScreen;