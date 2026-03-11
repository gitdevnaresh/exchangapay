import React, { useCallback } from "react";
import { Share, Alert, Clipboard, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { s } from "../../../newComponents/theme/scale";
import ViewComponent from "../../../newComponents/view/view";
import TextMultiLangauge from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import { MaterialIcons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ImageUri from "../../../newComponents/imageComponents/image";
import PageHeader from "../../../newComponents/pageHeader/pageHeader";
import useEncryptDecrypt from "../../../hooks/encDecHook";
import { useLngTranslation } from "../../../hooks/useLngTranslation";
import ParagraphComponent from "../../../newComponents/textComponets/paragraphText/paragraph";
import { showAppToast } from "../../../newComponents/ToasterMessages/ShowMessage";
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles";
import CopyCard from "../../../newComponents/copyComponent/CopyCard";
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler";

const ShareScreen = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const {decryptAES}=useEncryptDecrypt()
    const { t } = useLngTranslation();
    // State for referral code and link
   const dycryptedReferralCode = decryptAES(userInfo?.depositReference);


        const generateReferralLink = () => {
        const baseUrl = "https://app.swokipay.com";
        const referralUrl = `${baseUrl}?referralCode=${dycryptedReferralCode}`;
        return referralUrl;
      };
      const referralLink = generateReferralLink();
    // Handle back button press
    const handleBackPress = () => {
        navigation.goBack();
    };
    useHardwareBackHandler(()=>{
        handleBackPress();
    })
    // Copy to clipboard function
    const copyToClipboard = useCallback((text: string) => {
        try {
            Clipboard.setString(text);
            // Show toast or feedback
        } catch (error: any) {
            Alert.alert("Failed to copy", error.message);
        }
    }, []);
    
    // Share functions
    const handleSave = () => {
        navigation.navigate('ComingSoon', {
            customHeader: {
                title: t('GLOBAL_CONSTANTS.SAVE'),
                showBackButton: true,
            },
        });
    };

const handleTelegram = async () => {
    const linkToShare = referralLink;
    const messageText = `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_INVITE_YOU_TO_JOIN")} Swokipay. ${t("GLOBAL_CONSTANTS.USE_MY_REFERRAL_CODE_TO_SIGN_UP")} ${dycryptedReferralCode}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(linkToShare)}&text=${encodeURIComponent(messageText)}`;
    try {
        const supported = await Linking.canOpenURL(telegramUrl);
        if (supported) {
            await Linking.openURL(telegramUrl);
        } else {
           showAppToast(t("GLOBAL_CONSTANTS.TELEGRAM_NOT_INSTALLED_MESSAGE"),"error");
        }
    } catch (error) {
        showAppToast(t("GLOBAL_CONSTANTS.COULD_NOT_OPEN_TELEGRAM"),"error");
    }
};

const handleMore = () => {
    const message = `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_INVITE_YOU_TO_JOIN")} Bullswipe.${t("GLOBAL_CONSTANTS.USE_MY_REFERRAL_CODE_TO_SIGN_UP")} ${dycryptedReferralCode}\n${t("GLOBAL_CONSTANTS.REFERRAL_LINK")}: ${referralLink}`;
    Share.share({
        message: message,
        url: referralLink, // Including the URL here gives a richer share experience on iOS
    });
};

    return (
            <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
                {/* Card Image */}
                    <LinearGradient
                colors={[NEW_COLOR.TEXT_BLACK, '#444444', NEW_COLOR.TEXT_BLACK]}
                locations={[0, 0.4, 1]}
                start={{ x: 0.65, y: 0 }}
                end={{ x: 0.65, y: 1 }}
                style={[commonStyles.flex1]}
            >
                 <PageHeader title="GLOBAL_CONSTANTS.SHARE" onBackPress={handleBackPress} containerStyle={[commonStyles.px24,commonStyles.py20]} />
                <ViewComponent style={[commonStyles.alignCenter, commonStyles.mt32]}>
                 <ImageUri source={require("../../../assets/imageAssets/getStartedCards.png")} style={{ width: s(318), height: s(316) }} />
                    
                </ViewComponent>
                {/* Referral Code Section */}
                <ViewComponent style={[commonStyles.px24]}>
                   <ViewComponent style={[commonStyles.applycardbg, commonStyles.p16, commonStyles.rounded12]}>
                    <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                        <TextMultiLangauge 
                            text="GLOBAL_CONSTANTS.REFERRAL_CODE" 
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} 
                        />
                        <CopyCard onPress={() => copyToClipboard(dycryptedReferralCode)}/>
                            </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt8]}>
                            <ParagraphComponent 
                                text={dycryptedReferralCode} 
                                style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textGrey]} 
                            />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
                
                {/* Referral Link Section */}
                  <ViewComponent style={[commonStyles.px24, commonStyles.mt10]}>
                   <ViewComponent style={[commonStyles.applycardbg, commonStyles.p16, commonStyles.rounded12]}>
                      <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent]}>
                        <TextMultiLangauge 
                            text="GLOBAL_CONSTANTS.REFERRAL_LINK" 
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite]} 
                        />
                        <CopyCard onPress={() => copyToClipboard(referralLink)} />
                            </ViewComponent>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.mt8]}>
                            <ParagraphComponent
                                text={referralLink}
                                style={[commonStyles.fs16, commonStyles.fw600, commonStyles.textGrey]} />
                        </ViewComponent>
                    </ViewComponent>
                </ViewComponent>
                
                {/* Share Buttons */}
                <ViewComponent style={[commonStyles.px24, commonStyles.mt32, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.gap24]}>
                    {/* Save Button */}
                    <ViewComponent style={[commonStyles.alignCenter]}>
                        <CommonTouchableOpacity onPress={handleSave} style={[commonStyles.alignCenter]}>
                            <ViewComponent style={[commonStyles.shareIconBg,commonStyles.dflex, commonStyles.justifyCenter]}>
                                <MaterialCommunityIcons name="arrow-collapse-down" size={18} color={NEW_COLOR.TEXT_GREY}/>
                            </ViewComponent>
                            <TextMultiLangauge 
                                text="GLOBAL_CONSTANTS.SAVE" 
                                style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mt8]} 
                            />
                        </CommonTouchableOpacity>
                    </ViewComponent>
                    
                    {/* Telegram Button */}
                    <ViewComponent style={[commonStyles.alignCenter]}>
                        <CommonTouchableOpacity onPress={handleTelegram} style={[commonStyles.alignCenter]}>
                            <ViewComponent style={[commonStyles.shareIconBg,commonStyles.dflex, commonStyles.justifyCenter]}>
                                <Feather name="send" size={18} color={NEW_COLOR.TEXT_GREY} />
                            </ViewComponent>
                            <TextMultiLangauge 
                                text="GLOBAL_CONSTANTS.TELEGRAM" 
                                style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mt8]} 
                            />
                        </CommonTouchableOpacity>
                    </ViewComponent>
                    
                    {/* More Button */}
                     {/* <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter]}> */}
                    <ViewComponent style={[commonStyles.alignCenter]}>
                        <CommonTouchableOpacity onPress={handleMore} style={[commonStyles.alignCenter]}>
                            <ViewComponent style={[commonStyles.shareIconBg,commonStyles.dflex, commonStyles.justifyCenter]}>
                                <MaterialIcons name="more-horiz" size={18} color={NEW_COLOR.TEXT_GREY} />
                            </ViewComponent>
                            <TextMultiLangauge 
                                text="GLOBAL_CONSTANTS.MORE_INFO" 
                                style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mt8]} 
                            />
                        </CommonTouchableOpacity>
                    </ViewComponent>
                </ViewComponent>
                </LinearGradient>
            
               
        </ViewComponent>
    );
};


export default ShareScreen;