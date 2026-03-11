import React, { useRef, useState, useEffect } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity, StyleProp, TextStyle } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { s } from '../../constants/theme/scale';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // For default draw icon
import { useThemeColors } from '../../hooks/useThemeColors';
import ButtonComponent from '../buttons/button';
import ViewComponent from '../view/view';
import Entypo from '@expo/vector-icons/Entypo';
import { getThemedCommonStyles } from '../../assets/styles/CommonStyles';
import GalleryIcon from '../../assets/mainmenuicons/galleryicon';
import TextMultiLanguage from '../textComponets/multiLanguageText/textMultiLangauge';
import PopupOrSheet from '../models/PopupOrSheet';
interface SignatureDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    onSaveDrawnSignature: (signatureBase64: string) => void;
    onRequestUpload: () => void;
    selectionTitle?: string;
    drawOptionText?: string;
    uploadOptionText?: string;
    drawOptionIcon?: React.ReactNode;
    uploadOptionIcon?: React.ReactNode;
    drawOptionTextStyle?: StyleProp<TextStyle>; // Keep this
    uploadOptionTextStyle?: StyleProp<TextStyle>;
    selectionOverlayBackgroundColor?: string;
    drawingTitle?: string;
    penColor?: string;
    canvasBackgroundColor?: string;
    canvasHeight?: number;
    drawingSaveButtonText?: string;
    drawingCancelButtonText?: string;
}

type SignatureView = 'selection' | 'drawing';

const SignatureDrawer: React.FC<SignatureDrawerProps> = ({
    isVisible,
    onClose,
    onSaveDrawnSignature,
    onRequestUpload,
    selectionTitle = "GLOBAL_CONSTANTS.SELECT_SIGNATURE_OPTION",
    drawOptionText = "GLOBAL_CONSTANTS.DRAW_SIGNATURE",
    uploadOptionText = "GLOBAL_CONSTANTS.UPLOAD_IMAGE",
    drawOptionIcon,
    uploadOptionIcon,
    drawOptionTextStyle,
    uploadOptionTextStyle,
    selectionOverlayBackgroundColor,
    drawingTitle = "GLOBAL_CONSTANTS.DRAW_YOUR_SIGNATURE",
    penColor = "black",
    canvasBackgroundColor = "white",
    canvasHeight = s(250),
    drawingSaveButtonText = "Save",
    drawingCancelButtonText = "Cancel",
}) => {
    const signatureCanvasRef = useRef<SignatureViewRef>(null);
    const selectionSheetRef = useRef<any>(null); // Ref for CustomRBSheet
    const drawingSheetRef = useRef<any>(null); // Ref for drawing CustomRBSheet
    const [currentView, setCurrentView] = useState<SignatureView | null>(null);
    const NEW_COLOR = useThemeColors(true);
    const commonStyles = getThemedCommonStyles(NEW_COLOR);

    useEffect(() => {
        if (isVisible) {
            setCurrentView('selection'); // Set the view to selection when the component becomes visible
        } else {
            setCurrentView(null); // Reset view when component is hidden
        }
    }, [isVisible]);

    const handleSaveSignature = () => {
        signatureCanvasRef.current?.readSignature();
    };

    useEffect(() => {
        if (isVisible && currentView === 'selection') {
            selectionSheetRef.current?.open();
        } else {
            selectionSheetRef.current?.close();
        }
    }, [isVisible, currentView]);

    useEffect(() => {
        if (isVisible && currentView === 'drawing') {
            drawingSheetRef.current?.open();
        } else {
            drawingSheetRef.current?.close();
        }
    }, [isVisible, currentView]);

    // This function is called by SignatureScreen's onOK when readSignature() is successful
    const handleConfirmSignature = (signature: string) => {
        onSaveDrawnSignature(signature);
    };

    const handleDrawOption = () => {
        setCurrentView('drawing');
    };

    const handleUploadOption = () => {
        selectionSheetRef.current?.close(); // Close RBSheet
        onRequestUpload();
    };

    const drawingWebStyle = `
     html, body {
        background-color: ${NEW_COLOR.SHEET_BG}; /* Set full page background early */
        margin: 0;
        padding: 0;
    }
        .m-signature-pad {
            box-shadow: none;
            border: none;
            height: ${canvasHeight}px;
            margin: 0px; /* Ensure no default margins interfere */
             background-color: ${NEW_COLOR.SHEET_BG};
        }
        .m-signature-pad--body {
             border: 1px solid ${NEW_COLOR.SECTION_BORDER}; /* Your custom border color */
            border-radius: ${s(5)}px; /* Consistent border radius */
        }
        .m-signature-pad--footer {
            display: none; /* Hide default footer if you have custom buttons */
        }
    `;

    const defaultDrawIcon =
        <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
            <MaterialCommunityIcons name="draw" size={s(30)} style={[]} color={NEW_COLOR.TEXT_WHITE ?? 'white'} />
        </ViewComponent>
    const defaultUploadIcon =
        <ViewComponent style={[commonStyles.bottomsheeticonbg]}>
            <GalleryIcon width={s(22)} height={s(22)} color={NEW_COLOR.TEXT_WHITE} />

        </ViewComponent>

    if (!isVisible) { // Early exit if the whole component is not visible
        return null;
    }

    if (currentView === 'selection') {
        return (
            <PopupOrSheet
                ref={selectionSheetRef}
                height={s(230)}
                title={selectionTitle}
                onClose={onClose}
                onPressCloseIcon={onClose}
                customStyles={{
                    container: selectionOverlayBackgroundColor ? { backgroundColor: selectionOverlayBackgroundColor } : {},
                }}
            >
                <View>
                    <View style={[]}>
                        <ViewComponent style={[commonStyles.dflex,]}>
                            <TouchableOpacity
                                onPress={handleDrawOption}
                                style={[]}
                                activeOpacity={0.7}
                            >
                                <ViewComponent
                                    style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]}>
                                    <ViewComponent
                                        style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]} >
                                        {drawOptionIcon || defaultDrawIcon}

                                        <TextMultiLanguage text={drawOptionText} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite,]} />
                                    </ViewComponent>
                                    <Entypo name="chevron-small-right" size={s(24)} color={NEW_COLOR.TEXT_WHITE} />
                                </ViewComponent>
                            </TouchableOpacity>
                        </ViewComponent>
                        <ViewComponent style={[commonStyles.listGap]} />
                        <TouchableOpacity
                            onPress={handleUploadOption}
                            activeOpacity={0.7}
                            style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap6]}

                        >
                            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { width: '100%', paddingHorizontal: 2, },]}>
                                <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.gap10]}>
                                    {uploadOptionIcon || defaultUploadIcon}

                                    <TextMultiLanguage
                                        text={uploadOptionText}
                                        style={[
                                            commonStyles.textWhite,
                                            commonStyles.fs14,
                                            commonStyles.fw400,
                                            uploadOptionTextStyle,

                                        ]}
                                    />
                                </ViewComponent>
                                <Entypo
                                    name="chevron-small-right"
                                    size={s(24)}
                                    color={NEW_COLOR.TEXT_WHITE}
                                />
                            </ViewComponent>
                        </TouchableOpacity>

                    </View>
                    <View style={[commonStyles.mb16]} />
                </View>
            </PopupOrSheet>
        );
    }

    if (currentView === 'drawing') {
        return (
            <PopupOrSheet
                ref={drawingSheetRef}
                height={s(420)} // Fixed height as per request
                title={drawingTitle}
                modeltitle={false}
                onClose={onClose}
                onPressCloseIcon={onClose}
            >
                <View>
                    <View style={[commonStyles.sheetbg, { height: canvasHeight }]}>
                        <SignatureScreen
                            ref={signatureCanvasRef}
                            onOK={handleConfirmSignature}
                            onEmpty={() => Alert.alert("Empty Signature", "Please draw your signature before saving.")}
                            webStyle={drawingWebStyle}
                            imageType="image/png"
                            penColor={NEW_COLOR.TEXT_WHITE}
                            backgroundColor={NEW_COLOR.SHEET_BG} // Canvas itself is transparent, sheet provides background
                        />
                    </View>
                    <View style={[commonStyles.sectionGap]} />

                    <View style={[commonStyles.dflex, commonStyles.gap10]}>
                        <View style={[commonStyles.flex1]}>
                            <ButtonComponent
                                solidBackground={true}
                                title={drawingCancelButtonText}
                                onPress={onClose}
                            />
                        </View>
                        <View style={[commonStyles.flex1]}>
                            <ButtonComponent
                                title={drawingSaveButtonText}
                                onPress={handleSaveSignature}
                            />
                        </View>
                        <View style={[commonStyles.sectionGap]} />
                    </View>
                </View>
            </PopupOrSheet>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    container: {
        // This style was for the old CustomOverlay content, might not be fully applicable
        flex: 1,
        justifyContent: 'space-between',
        padding: s(15),
    },
    drawingContentContainer: { // New style for content within the drawing RBSheet
        flex: 1,
        justifyContent: 'space-between',
    },
    canvasContainer: {
    },
    buttonRow: {
        // marginTop: s(15),
    },
});
export default SignatureDrawer;
