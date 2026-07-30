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
import DefaultButton from "./DefaultButton";
interface QRCodeScannerProps {
  onCaptureCode: (data: string) => void;
  onClose: () => void;
}

type PermissionStatus = "checking" | "granted" | "denied" | "blocked";

const QRCodeScannerComp: React.FC<QRCodeScannerProps> = ({
  onCaptureCode,
  onClose,
}) => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("checking");
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
      const permission =
        Platform.OS === "android"
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;
      try {
        const result = await request(permission);
        if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
          setPermissionStatus("granted");
        } else if (result === RESULTS.BLOCKED) {
          setPermissionStatus("blocked");
        } else {
          setPermissionStatus("denied");
        }
      } catch {
        setPermissionStatus("denied");
      }
    };

    checkPermission();
  }, []);

  // Every non-scanning state needs a way out, otherwise the user is stuck
  // on a blank screen with no back gesture available inside the modal.
  const renderFallback = (
    icon: string,
    title: string,
    subtitle: string,
    showSettings?: boolean
  ) => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} />
        </TouchableOpacity>
        <ParagraphComponent
          text={"Scan address"}
          style={[
            commonStyles.fs16,
            commonStyles.fw700,
            commonStyles.textBlack,
          ]}
        />
      </View>

      <View style={styles.fallbackContent}>
        <View style={styles.fallbackIconCircle}>
          <IonIcon name={icon} size={34} color={NEW_COLOR.TEXT_ORANGE} />
        </View>
        <ParagraphComponent
          text={title}
          style={[
            commonStyles.fs18,
            commonStyles.fw700,
            commonStyles.textBlack,
            commonStyles.textCenter,
            styles.fallbackTitle,
          ]}
        />
        <ParagraphComponent
          text={subtitle}
          style={[
            commonStyles.fs14,
            commonStyles.textGrey,
            commonStyles.textCenter,
            styles.fallbackSubtitle,
          ]}
        />
      </View>

      <View style={styles.fallbackActions}>
        {showSettings ? (
          <DefaultButton
            title="Open Settings"
            iconArrowRight={false}
            onPress={() => Linking.openSettings()}
            customContainerStyle={styles.fallbackButton}
          />
        ) : null}
        <DefaultButton
          title="Go Back"
          transparent={!!showSettings}
          iconArrowRight={false}
          onPress={onClose}
          customContainerStyle={styles.fallbackButton}
        />
      </View>
    </View>
  );

  if (permissionStatus === "checking") {
    return renderFallback(
      "camera-outline",
      "Checking camera permission",
      "Just a moment while we confirm access to your camera."
    );
  }

  if (permissionStatus !== "granted") {
    return renderFallback(
      "lock-closed-outline",
      "Camera access needed",
      permissionStatus === "blocked"
        ? "Camera access is turned off. Enable it in Settings to scan a QR code."
        : "We need camera permission to scan a QR code.",
      permissionStatus === "blocked"
    );
  }

  if (device == null) {
    return renderFallback(
      "camera-reverse-outline",
      "No camera available",
      "This device doesn’t have a camera we can use for scanning. Enter the address manually instead."
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

      <View style={[styles.header, styles.cameraHeader]}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <AntDesign name="arrowleft" size={22} color={NEW_COLOR.TEXT_BLACK} />
        </TouchableOpacity>
        <ParagraphComponent
          text={"Scan address"}
          style={[
            commonStyles.fs16,
            commonStyles.fw700,
            commonStyles.textBlack,
            commonStyles.flex1,
          ]}
        />
        <TouchableOpacity
          onPress={() => setTorch(!torch)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <IonIcon
            name={torch ? "flash" : "flash-off"}
            color={NEW_COLOR.TEXT_BLACK}
            size={24}
          />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 8,
  },
  headerBack: {
    padding: 2,
  },
  cameraHeader: {
    zIndex: 2,
  },
  fallbackContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  fallbackIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: NEW_COLOR.SECTION_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackTitle: {
    marginTop: 20,
  },
  fallbackSubtitle: {
    marginTop: 8,
    lineHeight: 20,
  },
  fallbackActions: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  fallbackButton: {
    alignSelf: "stretch",
  },
});

export default QRCodeScannerComp;
