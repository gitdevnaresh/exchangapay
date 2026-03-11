import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { s } from "../../constants/theme/scale";
import { ActivityIndicator } from "react-native";
import PopupOrSheet from "../models/PopupOrSheet";
import ViewComponent from "../view/view";
import ParagraphComponent from "../textComponets/paragraphText/paragraph";
import { useThemeColors } from "../../hooks/useThemeColors";
import ButtonComponent from "../buttons/button";
import { scanFromURLAsync } from 'expo-camera';
import { getThemedCommonStyles } from "../../assets/styles/CommonStyles";
import TextMultiLanguage from "../textComponets/multiLanguageText/textMultiLangauge";
import { useSelector } from "react-redux";
import useEncryptDecrypt from "../../hooks/encDecHook";
import QrScanLogo from "../../assets/mainmenuicons/qrScanIcon";
import { useLngTranslation } from "../../hooks/useLngTranslation";
import { checkAppPermissions } from "../../services/mediaPermissionService";
import PermissionModel from "../../screens/commonScreens/permissionPopup";

type QrScannerProps = {
  onCaptureCode: (code: string) => void;
  onClose: () => void;
  showReceiveAndAlbum?: boolean;
  handleReceive?: () => void;
  showScannerTittle?: boolean;
};

const QrScanner: React.FC<QrScannerProps> = ({
  onCaptureCode,
  onClose,
  showReceiveAndAlbum = true,
  handleReceive,
  showScannerTittle = false,
}) => {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scanLineAnimation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const REVERSE_NEW_COLOR = useThemeColors(true);
  const reversCommonStyles = getThemedCommonStyles(REVERSE_NEW_COLOR);
  const InvalidQrCodeRef = useRef<any>(null);
  const refernceIdRef = useRef<any>(null);
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const themedStyle = styles(NEW_COLOR);
  const {decryptAES} =useEncryptDecrypt();
  const userInfo = useSelector((state: any) => state.userReducer?.userDetails);  // Animation for scanning line
  const {t} = useLngTranslation();
  const [permissionModel, setPermissionModel] = useState<boolean>(false);
  const [permissionTitle, setPermissionTitle] = useState<string>('');
  const [permissionMessage, setPermissionMessage] = useState<string>('');
  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startAnimation();
  }, [scanLineAnimation]);

  const handleQrCodeClose = () => {
    InvalidQrCodeRef?.current?.close();
  }
  
  const handleCloseRefernceId = () => {
    refernceIdRef?.current?.close();
  };
  const closePermissionModel = () => {
    setPermissionModel(false);
  };

  if (!permission) return <ViewComponent />;
  if (!permission.granted) {
    return (
      <ViewComponent style={[commonStyles.alignCenter, commonStyles.justifyCenter, commonStyles.flex1]}>
        <TextMultiLanguage text={"GLOBAL_CONSTANTS.WE_NEED_YOUR_PERMISSION"} style={[commonStyles.fs14, commonStyles.fw400, commonStyles.textWhite]} />
        <Button title="Grant Permission" onPress={requestPermission} />
      </ViewComponent>
    );
  }
  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };
  const handleScan = ({ data }: any) => {
    if (!scanned) {
      setScanned(true);
      onCaptureCode(data);
      onClose();
      setTimeout(() => setScanned(false), 3000);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const res = await checkAppPermissions('library');
      if (res.showPopup) {
        setPermissionTitle(res.titleKey!);
        setPermissionMessage("GLOBAL_CONSTANTS.UPLOAD_IMAGE_REQUIRED_TO_SCAN_QR");
        setPermissionModel(true);
        return;
      }
      if (!res.allowed) {
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setLoading(true);
        await readQRCodeFromImage(imageUri);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

    }
  };
  const readQRCodeFromImage = async (imageUri: string) => {
    try {
      const results = await scanFromURLAsync(imageUri, ['qr']);
        const scannedDataDecrypted = decryptAES(results[0].data);
        const parsed = JSON.parse(scannedDataDecrypted);
      if (results && results.length > 0 && results[0].data) {
        if (decryptAES(userInfo.depositReference) ===parsed.Value ) {
            setTimeout(() => {
              refernceIdRef.current?.open();
            }, 500);
            return;
          }
         onCaptureCode(results[0].data);     
          onClose();

      } else {
        InvalidQrCodeRef?.current?.open();
      }
    } catch (error) {
      InvalidQrCodeRef?.current?.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ViewComponent style={[commonStyles.screenBg, commonStyles.flex1]}>
      {loading && (                                 // ✅ Loader overlay
        <ViewComponent style={themedStyle.loaderContainer}>
          <ActivityIndicator size="large" color={NEW_COLOR.BG_YELLOW} />
        </ViewComponent>
      )}
      <CameraView
        style={[commonStyles.flex1]}
        facing={facing}
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "code39", "code128"],
        }}
        onBarcodeScanned={handleScan}
      >
        {/* Dark overlay */}
        <ViewComponent style={[commonStyles.flex1]}>
          {/* Top section */}
          <ViewComponent style={commonStyles.p24}>
            <ViewComponent style={[commonStyles.dflex, commonStyles.alignCenter, commonStyles.justifyContent, { paddingTop: s(40) }]}>
              <TouchableOpacity style={[]} onPress={toggleTorch}>
                <Feather
                  name={torchOn ? "zap" : "zap-off"}
                  size={s(24)}
                  color={NEW_COLOR.TEXT_WHITE}
                />
              </TouchableOpacity>
              <TouchableOpacity style={[]} onPress={onClose}>
                <MaterialIcons name="close" size={s(30)} color={NEW_COLOR.TEXT_WHITE}
                />
              </TouchableOpacity>
            </ViewComponent>
          </ViewComponent>

          {/* Center scanning area */}
          <ViewComponent style={[commonStyles.mxAuto, commonStyles.myAuto]}>
            {showScannerTittle && (<TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs16, commonStyles.fw400, commonStyles.sectionGap, commonStyles.textCenter]} text={"GLOBAL_CONSTANTS.SCAN_QR_CODE_TO_TRANSFER"} />)}

            <ViewComponent style={themedStyle.scanArea}>
              {/* Corner brackets */}
              <ViewComponent style={[themedStyle.cornerBracket, themedStyle.topLeft]} />
              <ViewComponent style={[themedStyle.cornerBracket, themedStyle.topRight]} />
              <ViewComponent style={[themedStyle.cornerBracket, themedStyle.bottomLeft]} />
              <ViewComponent style={[themedStyle.cornerBracket, themedStyle.bottomRight]} />

              {/* Scanning line */}
              <Animated.View
                style={[
                  themedStyle.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [s(-115), s(115)],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </ViewComponent>
            <ViewComponent style={[commonStyles.sectionGap]} />
            <ViewComponent style={[commonStyles.titleSectionGap]} />

            {!showReceiveAndAlbum && (
              <ViewComponent style={[commonStyles.dflex, commonStyles.justifyContent, commonStyles.alignCenter]}>
                <TouchableOpacity
                  style={[commonStyles.alignCenter, commonStyles.justifyCenter]}
                  onPress={handleReceive}
                >
                  <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.mb8]}>
            <QrScanLogo
                height={s(20)}
                width={s(20)}
                color={NEW_COLOR.TEXT_WHITE}
              />
                  </ViewComponent>
                  <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.RECEIVE"} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[commonStyles.alignCenter, commonStyles.justifyCenter]}
                  onPress={pickImageFromGallery}
                >
                  <ViewComponent style={[commonStyles.iconbg, commonStyles.dflex, commonStyles.justifyCenter, commonStyles.mb8]}>
                    <MaterialIcons name="photo-library" size={s(20)} color={NEW_COLOR.TEXT_WHITE}
                    />
                  </ViewComponent>
                  <TextMultiLanguage style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw500]} text={"GLOBAL_CONSTANTS.CHOOSE_FROM_ALBUM"} />
                </TouchableOpacity>
              </ViewComponent>
            )}
          </ViewComponent>
          {/* Bottom action buttons */}
        </ViewComponent>
      </CameraView>
      <PopupOrSheet
        ref={InvalidQrCodeRef}
        height={s(300)}
        displayType="bottom-sheet"
        title=""
        showCloseIconAndTittle={false}
      >
        <ViewComponent style={[reversCommonStyles.mt10]}>
          <ViewComponent style={[reversCommonStyles.sectionGap]}>
            <TextMultiLanguage
              text={"GLOBAL_CONSTANTS.INVALID_QR_CODE"}
              style={[
                reversCommonStyles.fw500,
                reversCommonStyles.fs18,
                reversCommonStyles?.textWhite,
                reversCommonStyles?.textCenter,
              ]}
            />
          </ViewComponent>
          <ViewComponent style={[reversCommonStyles.sectionGap]} />
          <ViewComponent>
            <ButtonComponent
              title={"GLOBAL_CONSTANTS.OK"}
              onPress={handleQrCodeClose}
              capitalizeTitle={false}
            />
          </ViewComponent>
        </ViewComponent>
      </PopupOrSheet>


       <PopupOrSheet
          ref={refernceIdRef}
          height={s(300)}
          displayType="bottom-sheet"
          title=""
          showCloseIconAndTittle={false}
        >
          <ViewComponent style={[reversCommonStyles.mt10]}>
            <ViewComponent style={[reversCommonStyles.sectionGap]}>
              <ParagraphComponent
                text="Transfers to your own account are not allowed."
                style={[
                  reversCommonStyles.fw500,
                  reversCommonStyles.fs18,
                  reversCommonStyles?.textWhite,
                  reversCommonStyles?.textCenter,
                ]}
              />
            </ViewComponent>
            <ViewComponent style={[reversCommonStyles.sectionGap]} />
            <ViewComponent>
              <ButtonComponent
                title={"OK"}
                onPress={handleCloseRefernceId}
                capitalizeTitle={false}
              />
            </ViewComponent>
          </ViewComponent>
        </PopupOrSheet>
        <PermissionModel 
          permissionDeniedContent={permissionMessage} 
          permissionTitle={permissionTitle} 
          closeModel={closePermissionModel} 
          addModelVisible={permissionModel} 
        />
    </ViewComponent>
  );
};

export default QrScanner;
const styles = (REVERSE_NEW_COLOR: any) => StyleSheet.create({

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanArea: {
    width: s(250),
    height: s(250),
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerBracket: {
    position: "absolute",
    width: s(30),
    height: s(30),
    borderColor: REVERSE_NEW_COLOR.BG_YELLOW, // Yellow color
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: "absolute",
    width: s(180),
    height: s(2),
    backgroundColor: "white",
    opacity: 0.8,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loaderText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
});
