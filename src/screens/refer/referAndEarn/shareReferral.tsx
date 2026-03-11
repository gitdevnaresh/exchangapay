import React, { useCallback, useRef, useState } from "react";
import { Linking, ImageBackground, Platform, PermissionsAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { s } from "../../../newComponents/theme/scale";
import ViewComponent from "../../../newComponents/view/view";
import TextMultiLangauge from "../../../newComponents/textComponets/multiLanguageText/textMultiLangauge";
import CommonTouchableOpacity from "../../../newComponents/touchableComponents/touchableOpacity";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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
import Clipboard from "@react-native-clipboard/clipboard";
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook";
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import RNShare from 'react-native-share';
import { Bullswipe } from '../../../assets/svg';
import { COMMON_SVG_URLS } from "../../../assets/blobUrls";
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import ScrollViewComponent from "../../../newComponents/scrollView/scrollView";
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay";
import ImageBackgroundWrapper from "../../../newComponents/imageComponents/ImageBackground";
const ShareReferral = () => {
    const navigation = useNavigation<any>();
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const userInfo = useSelector((state: any) => state.userReducer?.userDetails);
    const { decryptAES } = useEncryptDecrypt();
    const { t } = useLngTranslation();
    const { logEvent } = useActionLogging();
    const dycryptedReferralCode = decryptAES(userInfo?.depositReference);
    const [error, setError] = useState<string>('');
    const imageRef = useRef<any>(null);
    const BACKGROUND_IMAGE = 'https://bullswipestorageprd.blob.core.windows.net/images/invitefriends.png';

    const generateReferralLink = () => {
        return `https://app.bullswipe.com?referralCode=${dycryptedReferralCode}`;
    };
    const referralLink = generateReferralLink();
    // Handle back button press
    const handleBackPress = () => {
        navigation.goBack();
    };
    useHardwareBackHandler(() => {
        handleBackPress();
    })
    const copyToClipboard = useCallback(async (text: string) => {
        try {
            Clipboard?.setString(text);
            const actionData: ActionLogParams = {
                screename: 'shareReferral',
                actionName: 'Copy Address',
                actionType: 'Copy',
            };
            logEvent('copy_address', actionData);
        } catch {
            setError(`${t("GLOBAL_CONSTANTS.FAILED_TO_COPY_TEXT_TO_CLIPBOARD")}`);
        }
    }, []);
    // Share functions
    const handleSave = async () => {
        setError("");
        try {
            if (!imageRef.current) {
                setError(t('GLOBAL_CONSTANTS.CAPTURE_NOT_READY'));
                return;
            }

            const uri = await imageRef.current.capture({
                result: 'tmpfile',
                format: 'png',
                quality: 0.95,
            });

            if (!uri) {
                setError(t('GLOBAL_CONSTANTS.CAPTURE_FAILED'));
                return;
            }

            // Android permissions - only for Android 12 and below
            if (Platform.OS === 'android') {
                const androidVersion = Platform.Version as number;
                
                // Android 13+ doesn't need permission for saving to gallery
                if (androidVersion < 33) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
                    );
                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        setError(t('GLOBAL_CONSTANTS.PERMISSION_DENIED') || 'Storage permission denied');
                        return;
                    }
                }
            }

            // Create custom filename
            const timestamp = Date.now();
            const customFileName = `Bullswipe_Referral_${timestamp}.png`;
            const tempPath = `${RNFS.CachesDirectoryPath}/${customFileName}`;
            
            try {
                // Copy file with custom name
                const sourceUri = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
                await RNFS.copyFile(sourceUri, tempPath);
                
                // Save to gallery with custom name
                await CameraRoll.save(`file://${tempPath}`, { 
                    type: 'photo',
                    album: 'Bullswipe'
                });
                
                // Clean up temp file
                await RNFS.unlink(tempPath).catch(() => {});
                showAppToast(t('GLOBAL_CONSTANTS.IMAGE_SAVED_SUCCESSFULLY') || 'Image saved to gallery', 'success');
                logEvent('save_referral_image', {
                    screename: 'ShareReferral',
                    actionName: 'Save Image',
                    actionType: 'Save',
                } as ActionLogParams);
            } catch {
                const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
                await RNShare.open({
                    url: fileUri,
                    title: t('GLOBAL_CONSTANTS.SAVE_IMAGE'),
                    filename: 'Bullswipe_Referral.png'
                });
            }

        } catch  {
        }
    };

const TELEGRAM_ANDROID_STORE = "https://play.google.com/store/apps/details?id=org.telegram.messenger";
const TELEGRAM_IOS_STORE = "https://apps.apple.com/app/telegram-messenger/id686449807";

const isTelegramInstalled = async () => {
  try {
    return await Linking.canOpenURL("tg://");
  } catch {
    return false;
  }
};

const openTelegramOrStore = async () => {
  const installed = await isTelegramInstalled();
  const storeURL = Platform.select({
    android: TELEGRAM_ANDROID_STORE,
    ios: TELEGRAM_IOS_STORE,
  });
  
  if (installed) {
    await Linking.openURL("tg://");
  } else {
    await Linking.openURL(storeURL!);
    showAppToast(t('GLOBAL_CONSTANTS.TELEGRAM_NOT_INSTALLED_MESSAGE'), 'info');
  }
};

const handleTelegram = async () => {
 setError("");
  try {
    const messageText = `${t('GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_INVITE_YOU_TO_JOIN')} Bullswipe. ${t('GLOBAL_CONSTANTS.USE_MY_REFERRAL_CODE_TO_SIGN_UP')} ${dycryptedReferralCode}\n${referralLink}`;
    // Copy message to clipboard first
    Clipboard.setString(messageText);    
    const installed = await isTelegramInstalled();
    
    if (!installed) {
      await openTelegramOrStore();
      return;
    }
    
    if (imageRef.current) {
      const uri = await imageRef.current.capture({
        result: 'tmpfile',
        format: 'png',
        quality: 0.95,
      });
      const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;

      try {
        await RNShare.shareSingle({
          social: (RNShare as any).Social.TELEGRAM,
          url: fileUri,
          filename: 'Bullswipe_Referral.png',
        });
        logEvent('share_referral_via_telegram', {
          screename: 'ShareReferral',
          actionName: 'Share via Telegram',
          actionType: 'Share'
        });
        return;
      } catch {
        try {
          await RNShare.open({
            url: fileUri,
            title: t('GLOBAL_CONSTANTS.INVITE_FRIENDS'),
            filename: 'Bullswipe_Referral.png',
            type: 'image/png'
          });
          logEvent('share_referral_via_telegram_fallback', {
            screename: 'ShareReferral',
            actionName: 'Share via Telegram (fallback)',
            actionType: 'Share'
          });
          return;
        } catch {
          await Linking.openURL("tg://");
        }
      }
    } else {
      await Linking.openURL("tg://");
    }

  } catch (e) {
    await openTelegramOrStore();
  }
};


    const handleMore = async () => {
         setError("");
        const messageText = `${t("GLOBAL_CONSTANTS.HELLO_I_WOULD_LIKE_TO_INVITE_YOU_TO_JOIN")} Bullswipe. ${t("GLOBAL_CONSTANTS.USE_MY_REFERRAL_CODE_TO_SIGN_UP")} ${dycryptedReferralCode}`;
        try {
            if (imageRef.current) {
                const uri = await imageRef.current.capture({ result: 'tmpfile', format: 'png', quality: 0.95 });
                const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
                try {
                    await RNShare.open({ 
                        url: fileUri, 
                        message: `${messageText}\n${referralLink}`, 
                        title: t('GLOBAL_CONSTANTS.INVITE_FRIENDS'),
                        filename: 'Bullswipe_Referral.png'
                    });
                    logEvent('share_referral_qr', { screename: 'ShareReferral', actionName: 'Share QR Image', actionType: 'Share', actionObj: { referralCode: dycryptedReferralCode } } as ActionLogParams);
                    return;
                } catch {
                }
            }
            // await RNShare.open({ 
            //     message: `${messageText}\n${referralLink}`, 
            //     title: t('GLOBAL_CONSTANTS.INVITE_FRIENDS') 
            // });
        } catch {

        }
    };

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            {/* Hidden ViewShot for sharing image (kept out of visible layout) */}
            <ViewComponent style={{ position: 'absolute', left: -9999, top: 0, opacity: 0 }}>

                <ViewShot ref={imageRef} options={{ format: 'png', quality: 0.98, result: 'tmpfile' }}>
                    <ViewComponent style={[{ backgroundColor: NEW_COLOR.TEXT_BLACK, width: s(400), minHeight: s(450) }]}>
                        <ViewComponent style={[{ marginTop: s(30) },commonStyles.alignCenter]}>
                            <Bullswipe width={s(140)} height={s(36)}  style={[commonStyles.titleSectionGap]}/>
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.INVITE_FRIENDS_AND_EARN_REWARDS"} style={[commonStyles.fs16, commonStyles.textWhite]} />
                            <TextMultiLangauge text={"GLOBAL_CONSTANTS.WHEN_THEY_JOIN_BULLSWIPE"} style={[commonStyles.fs16, commonStyles.mt4, commonStyles.textWhite]} />
                        </ViewComponent>

                        <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={{ width: s(400), height: s(350) }} resizeMode="cover">
                        {/* Top gradient overlay to match design */}
                        <LinearGradient colors={["#000000", "rgba(0,0,0,0.6)", "transparent"]} locations={[0, 0.25, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: s(200) }} />

                        <ViewComponent style={[commonStyles.px24, commonStyles.py20, commonStyles.flex1]}>

                            <ViewComponent style={[commonStyles.alignCenter,]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyCenter]}>
                                    <TextMultiLangauge text={"GLOBAL_CONSTANTS.REFERRAL_ID"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textGrey]} />
                                    <TextMultiLangauge text={dycryptedReferralCode} style={[commonStyles.fw600, commonStyles.fs16, commonStyles.textWhite]} />
                                </ViewComponent>
                                <ViewComponent style={[{ backgroundColor: NEW_COLOR.TEXT_WHITE }, commonStyles.justifyContent, commonStyles.alignCenter, commonStyles.p10, commonStyles.mt16]}>
                                    <QRCode value={referralLink} size={s(180)} logoSVG={COMMON_SVG_URLS.BullswipeQrImage} />
                                </ViewComponent>
                            </ViewComponent>
                        </ViewComponent>
                    </ImageBackground>
                    </ViewComponent>
                </ViewShot>
            </ViewComponent>
            
            <ScrollViewComponent 
                style={commonStyles.flex1}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >

             <ImageBackgroundWrapper
                source={require("../../../assets/imageAssets/blackBackground.jpg")}
             >
                <PageHeader title="GLOBAL_CONSTANTS.REFER_AND_EARN" onBackPress={handleBackPress} containerStyle={[commonStyles.px24,commonStyles.pt24]} />
                <ViewComponent style={[commonStyles.px24]}>
                  {error&&<ErrorComponent message={error} screen={true}/>}
                </ViewComponent>
                <ViewComponent style={[commonStyles.alignCenter,commonStyles.sectionGap]}>
                    <ImageUri source={require("../../../assets/imageAssets/referBullswipeCard.png")} style={{ width: s(240), height: s(308) }} />
                </ViewComponent>
                {/* Referral Code Section */}
                <ViewComponent style={[commonStyles.px24]}>
                    <ViewComponent style={[commonStyles.walletlistbg, commonStyles.menuitemspace]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                            <TextMultiLangauge
                                text="GLOBAL_CONSTANTS.REFERRAL_CODE"
                                style={[commonStyles.listprimarytext]}
                            />
                            <CopyCard onPress={() => copyToClipboard(dycryptedReferralCode)} />
                        </ViewComponent>
                        <ParagraphComponent
                            text={dycryptedReferralCode}
                            style={[commonStyles.listsecondarytext]}
                        />
                    </ViewComponent>
                </ViewComponent>

                {/* Referral Link Section */}
                <ViewComponent style={[commonStyles.px24]}>
                    <ViewComponent style={[commonStyles.walletlistbg, commonStyles.menuitemspace]}>
                        <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent]}>
                            <TextMultiLangauge
                                text="GLOBAL_CONSTANTS.REFERRAL_LINK"
                                style={[commonStyles.listprimarytext]}
                            />
                            <CopyCard onPress={() => copyToClipboard(referralLink)} />
                        </ViewComponent>
                        <ParagraphComponent
                            text={referralLink}
                            style={[commonStyles.listsecondarytext]}
                        />
                    </ViewComponent>
                </ViewComponent>
                </ImageBackgroundWrapper>
                <ViewComponent style={[commonStyles.sectionGap]}/>
            {/* Share Buttons (rendered outside gradient) */}
            <ViewComponent style={[commonStyles.px24, commonStyles.dflex, commonStyles.justifyCenter, { gap: s(48), paddingBottom: s(20) }]}>
                {/* Save Button */}
                <ViewComponent style={[commonStyles.alignCenter]}>
                    <CommonTouchableOpacity onPress={handleSave} style={[commonStyles.alignCenter]}>
                        <ViewComponent style={[commonStyles.shareIconBg, commonStyles.dflex, commonStyles.justifyCenter]}>
                            <MaterialCommunityIcons name="arrow-collapse-down" size={s(24)} color={NEW_COLOR.TEXT_GREY} />
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
                        <ViewComponent style={[commonStyles.shareIconBg, commonStyles.dflex, commonStyles.justifyCenter]}>
                            <Feather name="send" size={s(24)} color={NEW_COLOR.TEXT_GREY} />
                        </ViewComponent>
                        <TextMultiLangauge
                            text="GLOBAL_CONSTANTS.TELEGRAM"
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mt8]}
                        />
                    </CommonTouchableOpacity>
                </ViewComponent>

                {/* More Button */}
                <ViewComponent style={[commonStyles.alignCenter]}>
                    <CommonTouchableOpacity onPress={handleMore} style={[commonStyles.alignCenter]}>
                        <ViewComponent style={[commonStyles.shareIconBg, commonStyles.dflex, commonStyles.justifyCenter]}>
                            <Feather name="more-horizontal" size={s(24)} color={NEW_COLOR.TEXT_GREY} />
                        </ViewComponent>
                        <TextMultiLangauge
                            text="GLOBAL_CONSTANTS.MORE_INFO"
                            style={[commonStyles.fs14, commonStyles.fw500, commonStyles.textWhite, commonStyles.mt8]}
                        />
                    </CommonTouchableOpacity>
                </ViewComponent>
            </ViewComponent>
            </ScrollViewComponent>
        </ViewComponent>
    );
};


export default ShareReferral;