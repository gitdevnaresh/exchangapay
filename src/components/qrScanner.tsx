import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Linking,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Dimensions,
} from "react-native";

import IonIcon from "react-native-vector-icons/Ionicons";
import { useIsFocused } from "@react-navigation/native";
import {
  Camera,
  CameraRuntimeError,
  useCameraDevices,
  useCodeScanner,
} from "react-native-vision-camera";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { commonStyles } from "./CommonStyles";
import ParagraphComponent from "./Paragraph/Paragraph";
import { NEW_COLOR } from "../constants/theme/variables";
import AntDesign from "react-native-vector-icons/AntDesign";
import DefaultButton from "./DefaultButton";
import { log } from "../utils/logger";

interface QRCodeScannerProps {
  onCaptureCode: (data: string) => void;
  onClose: () => void;
}

type PermissionStatus = "checking" | "granted" | "denied" | "blocked";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FRAME_SIZE = Math.min(SCREEN_WIDTH * 0.68, 300);

// The overlay sits on the live camera feed, so it is fixed light regardless of
// the app theme -- NEW_COLOR.TEXT_WHITE resolves to a dark ink in this palette.
const OVERLAY_ICON_COLOR = "#FFFFFF";

// The capture session is torn down by the OS whenever the app is backgrounded or
// the screen dims, and it does not always come back on its own -- the preview
// returns as a frozen frame that never scans again. These three guards bring it
// back: a watchdog that rebuilds a session the preview never reports as running,
// a periodic pause/resume while nobody is scanning, and a cap so a device that
// genuinely cannot open the camera falls through to a manual retry instead of
// looping forever.
const PREVIEW_WATCHDOG_MS = 4000;
const IDLE_REFRESH_MS = 45000;
const SESSION_PULSE_MS = 150;
const MAX_AUTO_RESTARTS = 4;

const QRCodeScannerComp: React.FC<QRCodeScannerProps> = ({
  onCaptureCode,
  onClose,
}) => {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("checking");
  const isFocused = useIsFocused();
  const [torch, setTorch] = useState(false);

  // Remount key: bumping it destroys the native session and builds a fresh one.
  const [cameraKey, setCameraKey] = useState(0);
  // Cheap recovery: flip isActive off/on without tearing the surface down.
  const [sessionPaused, setSessionPaused] = useState(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active"
  );
  const [cameraStalled, setCameraStalled] = useState(false);

  const previewRunningRef = useRef(false);
  const missedPreviewTicksRef = useRef(0);
  const restartCountRef = useRef(0);
  const hasScannedRef = useRef(false);

  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === "back") || devices[0];

  const restartCamera = useCallback(() => {
    previewRunningRef.current = false;
    missedPreviewTicksRef.current = 0;
    setCameraKey((key) => key + 1);
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned: (codes) => {
      // A single QR can be reported on several consecutive frames; without the
      // latch the caller is handed the same address twice and onClose fires on
      // an already unmounted modal.
      if (hasScannedRef.current) return;
      const value = codes.find((code) => !!code.value)?.value;
      if (!value) return;
      hasScannedRef.current = true;
      onCaptureCode(value);
      onClose();
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

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const nowActive = nextState === "active";
        setAppActive(nowActive);
        if (nowActive) {
          // Coming back from background: the previous session handle is stale on
          // most Android devices, so rebuild rather than trust it.
          restartCamera();
        } else {
          previewRunningRef.current = false;
        }
      }
    );
    return () => subscription.remove();
  }, [restartCamera]);

  const shouldRun =
    permissionStatus === "granted" &&
    device != null &&
    isFocused &&
    appActive &&
    !cameraStalled;

  // Watchdog: if the preview never reports itself running, rebuild the session.
  useEffect(() => {
    if (!shouldRun) return;
    missedPreviewTicksRef.current = 0;
    const interval = setInterval(() => {
      if (previewRunningRef.current) {
        missedPreviewTicksRef.current = 0;
        return;
      }
      missedPreviewTicksRef.current += 1;
      // One missed tick is normal start-up latency; two means it is not coming.
      if (missedPreviewTicksRef.current < 2) return;
      missedPreviewTicksRef.current = 0;
      if (restartCountRef.current >= MAX_AUTO_RESTARTS) {
        setCameraStalled(true);
        return;
      }
      restartCountRef.current += 1;
      restartCamera();
    }, PREVIEW_WATCHDOG_MS);
    return () => clearInterval(interval);
  }, [shouldRun, cameraKey, restartCamera]);

  // Idle refresh: a frozen preview can still report itself as running, so pulse
  // the session while no code has been scanned yet.
  useEffect(() => {
    if (!shouldRun || sessionPaused) return;
    const timer = setTimeout(() => {
      if (hasScannedRef.current) return;
      setSessionPaused(true);
    }, IDLE_REFRESH_MS);
    return () => clearTimeout(timer);
  }, [shouldRun, sessionPaused, cameraKey]);

  useEffect(() => {
    if (!sessionPaused) return;
    const timer = setTimeout(() => setSessionPaused(false), SESSION_PULSE_MS);
    return () => clearTimeout(timer);
  }, [sessionPaused]);

  const handleCameraError = useCallback(
    (error: CameraRuntimeError) => {
      log.error("QR scanner camera error", error);
      previewRunningRef.current = false;
      if (restartCountRef.current >= MAX_AUTO_RESTARTS) {
        setCameraStalled(true);
        return;
      }
      restartCountRef.current += 1;
      restartCamera();
    },
    [restartCamera]
  );

  const handleManualRestart = useCallback(() => {
    restartCountRef.current = 0;
    setCameraStalled(false);
    setTorch(false);
    restartCamera();
  }, [restartCamera]);

  // Every non-scanning state needs a way out, otherwise the user is stuck
  // on a blank screen with no back gesture available inside the modal.
  const renderFallback = (
    icon: string,
    title: string,
    subtitle: string,
    action?: { label: string; onPress: () => void }
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
        {action ? (
          <DefaultButton
            title={action.label}
            iconArrowRight={false}
            onPress={action.onPress}
            customContainerStyle={styles.fallbackButton}
          />
        ) : null}
        <DefaultButton
          title="Go Back"
          transparent={!!action}
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
        ? { label: "Open Settings", onPress: () => Linking.openSettings() }
        : undefined
    );
  }

  if (device == null) {
    return renderFallback(
      "camera-reverse-outline",
      "No camera available",
      "This device doesn’t have a camera we can use for scanning. Enter the address manually instead."
    );
  }

  if (cameraStalled) {
    return renderFallback(
      "refresh-outline",
      "Scanner stopped",
      "The camera stopped responding. Restart the scanner to try again.",
      { label: "Restart Scanner", onPress: handleManualRestart }
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <Camera
        key={cameraKey}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={shouldRun && !sessionPaused}
        codeScanner={codeScanner}
        torch={torch ? "on" : "off"}
        enableZoomGesture={false}
        onError={handleCameraError}
        onPreviewStarted={() => {
          previewRunningRef.current = true;
          missedPreviewTicksRef.current = 0;
          // A session that came up on its own earns the retry budget back.
          restartCountRef.current = 0;
        }}
        onPreviewStopped={() => {
          previewRunningRef.current = false;
        }}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.controlsRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <IonIcon name="close" size={26} color={OVERLAY_ICON_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setTorch((on) => !on)}
            accessibilityRole="button"
            accessibilityLabel={torch ? "Turn off flash" : "Turn on flash"}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <IonIcon
              name={torch ? "flash" : "flash-off"}
              size={24}
              color={OVERLAY_ICON_COLOR}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.frameArea} pointerEvents="none">
          <View style={styles.frame} />
        </View>

        <View style={styles.overlayFooter} pointerEvents="none" />
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
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 28,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(60, 60, 60, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  frameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  overlayFooter: {
    height: 120,
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
