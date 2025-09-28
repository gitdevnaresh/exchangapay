import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Linking,
  TouchableOpacity,
} from "react-native";

import IonIcon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import {
  Camera,
  useCameraDevices,
  useCodeScanner,
} from "react-native-vision-camera";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { commonStyles } from "./CommonStyles";
import ParagraphComponent from "./Paragraph/Paragraph";
import { NEW_COLOR } from "../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
interface QRCodeScannerProps {
  onCaptureCode: (data: string) => void;
  onClose: () => void;
}

const QRCodeScannerComp: React.FC<QRCodeScannerProps> = ({
  onCaptureCode,
  onClose,
}) => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const isFocused = useIsFocused();
  const [torch, setTorch] = useState(false);

  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === "back") || devices[0];

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const code = codes[0];
        if (code.value) {
          onCaptureCode(code.value);
          onClose();
        }
      }
    },
  });

  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === "android") {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result === RESULTS.GRANTED) {
          setHasPermission(true);
        }
      } else if (Platform.OS === "ios") {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        if (result === RESULTS.GRANTED) {
          setHasPermission(true);
        }
      }
    };

    checkPermission();
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <ParagraphComponent
          text={"Camera permission is required"}
          style={[
            commonStyles.fs16,
            commonStyles.fw700,
            commonStyles.textBlack,
            commonStyles.flex1,
          ]}
        />
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <ParagraphComponent
          text={"No camera device found"}
          style={[
            commonStyles.fs16,
            commonStyles.fw700,
            commonStyles.textBlack,
            commonStyles.flex1,
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        codeScanner={codeScanner}
        torch={torch ? "on" : "off"}
        enableZoomGesture={false}
      />

      {/* Top content */}
      <View style={styles.topContent}>
        <ParagraphComponent
          text={"Scan address"}
          style={[
            commonStyles.fs16,
            commonStyles.fw700,
            commonStyles.textBlack,
            commonStyles.flex1,
          ]}
        />
      </View>

      {/* Flash toggle button */}
      <TouchableOpacity
        style={styles.rightButtonRow}
        onPress={() => {
          setTorch(!torch);
        }}
      >
        <IonIcon
          name={torch ? "flash" : "flash-off"}
          color={NEW_COLOR.TEXT_BLACK}
          size={24}
        />
      </TouchableOpacity>

      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (onClose) {
            onClose();
          }
        }}
      >
        <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEW_COLOR.SCREENBG_WHITE,
    ...StyleSheet.absoluteFillObject,
    paddingTop: 30,
  },
  button: {
    marginBottom: 10,
    width: 10,
    height: 10,
    borderRadius: 100 / 2,
    backgroundColor: "rgba(140, 140, 140, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  rightcloseButtonRow: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  rightButtonRow: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  topContent: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  backButton: {
    position: "absolute",
    left: 18,
    top: 36,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777",
  },
  textBold: {
    fontWeight: "500",
    color: "#000",
  },
  buttonText: {
    fontSize: 21,
    color: "rgb(0,122,255)",
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default QRCodeScannerComp;
