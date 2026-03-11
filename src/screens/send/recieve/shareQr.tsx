import ViewComponent from "../../../newComponents/view/view"
import Container from "../../../newComponents/container/container"
import PageHeader from "../../../newComponents/pageHeader/pageHeader"
import { useNavigation } from "@react-navigation/native"
import { useLngTranslation } from "../../../hooks/useLngTranslation"
import ImageUri from "../../../newComponents/imageComponents/image"
import ButtonComponent from "../../../newComponents/buttons/button"
import { useThemeColors } from "../../../hooks/useThemeColors"
import { getThemedCommonStyles } from "../../../assets/styles/CommonStyles"
import { s } from "../../../constants/theme/scale"
import { useCallback, useRef, useState } from "react"
import RNFS from "react-native-fs";
import Share from 'react-native-share';
import { ActionLogParams, useActionLogging } from "../../../hooks/loggingHook"
import { useHardwareBackHandler } from "../../../hooks/HardwareBackHandler"
import NoDataComponent from "../../../newComponents/noData/noData"
import ErrorComponent from "../../../newComponents/errorDisplay/errorDisplay"



interface ShareQrCodeProps {
    route: {
        params: {
            capturedImageUri?: string;
            selectedCurrency?: any;
            referralDetails?: any;
            decryptedRefernce?: string;
            qrCodeInfo?: string;
        };
    };
}

const ShareQrCode = ({ route }: ShareQrCodeProps) => {
    const {
        capturedImageUri,
        selectedCurrency,
        referralDetails,
        decryptedRefernce,
        qrCodeInfo
    } = route?.params ?? {};
    const NEW_COLOR = useThemeColors();
    const commonStyles = getThemedCommonStyles(NEW_COLOR);
    const shareSheetRef = useRef<any>(null);
    const navigation = useNavigation<any>();
    const { t } = useLngTranslation();
    const { logEvent } = useActionLogging();
    const [error,setError]=useState<string>("");

    const handleBackpress = () => {
        navigation.goBack();
    }
    useHardwareBackHandler(() => {
        handleBackpress();
    })
    const executeShare = useCallback(async () => {
        if (!capturedImageUri) {
            setError(t("GLOBAL_CONSTANTS.NO_IMAGE_TO_SHARE"));
            return;
        }
        try {
            // Verify file still exists before sharing
            const fileExists = await RNFS.exists(capturedImageUri);
            if (!fileExists) {
                setError(t("GLOBAL_CONSTANTS.IMAGE_FILE_NOT_FOUND"));
                return;
            }

            const shareOptions: any = {
                title: `Receive ${selectedCurrency?.walletCode || 'Crypto'}`,
                message: `${t("GLOBAL_CONSTANTS.UID_WITH_COLON")} ${referralDetails?.referralCode || decryptedRefernce}\n${t("GLOBAL_CONSTANTS.SCAN_MY")} ${selectedCurrency?.walletCode} ${t("GLOBAL_CONSTANTS.QR_CODE_OR_MY_BULLSWIPE_ID_TO_MAKE_THE_PAYMENT_THROUGH_THE_BULLSWIPE_APP_THANK_YOU")}`,
                url: `file://${capturedImageUri.replace('file://', '')}`,
                type: 'image/png',
            };

            // Close sheet first, then share after a delay to prevent UI freezing
            shareSheetRef.current?.close();

            setTimeout(() => {
                Share?.open(shareOptions)
                    .then(() => {
                        const actionData: ActionLogParams = {
                            screename: 'RecieveView',
                            actionName: 'Share Address with QR',
                            actionType: 'Share',
                            actionObj: {
                                postObj: {
                                    address: qrCodeInfo,
                                    coinCode: selectedCurrency?.walletCode,
                                }
                            }
                        };
                        logEvent('share_address_with_qr', actionData);
                    })
                    .catch((error: any) => {
                        if (error.message !== 'User did not share') {
                            setError(t("GLOBAL_CONSTANTS.FAILED_TO_SHARE"));
                        }
                    });
            }, 500);

        } catch {
            setError(t("GLOBAL_CONSTANTS.FAILED_TO_SHARE"));
        }
    }, [capturedImageUri, qrCodeInfo, selectedCurrency, t, logEvent]);

    return (
        <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
            <Container>
                <PageHeader title={"GLOBAL_CONSTANTS.SHARE_QR_CODE"} onBackPress={handleBackpress} />
                 {error&&<ErrorComponent message={error} screen={true}/>}
                {/* Center content vertically */}
                <ViewComponent style={[commonStyles.flex1, commonStyles.alignCenter, commonStyles.justifyCenter]}>

                    {capturedImageUri ? (
                        <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter]}>
                            <ImageUri
                                source={{uri:capturedImageUri}}
                                height={s(400)}
                                width={s(350)}
                                style={{ resizeMode: 'contain' }}
                            />
                        </ViewComponent>
                    ) : <NoDataComponent/>}
                </ViewComponent>

                <ViewComponent style={[commonStyles.sectionGap]}>
                    <ButtonComponent
                        title={"GLOBAL_CONSTANTS.SHARE"}
                        onPress={executeShare}
                        capitalizeTitle={false}
                    />
                </ViewComponent>
            </Container>
        </ViewComponent>
    );
}
export default ShareQrCode;